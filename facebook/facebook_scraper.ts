import puppeteer, { Page } from "puppeteer";
import fs from "fs";

const COOKIE_FILE = "cookies.json";

async function saveCookies(page: Page) {
    const context = page.browserContext();
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
    console.log("Cookies saved.");
}

async function loadCookies(page: Page) {
    const context = page.browserContext();
    if (fs.existsSync(COOKIE_FILE)) {
        const cookiesString = fs.readFileSync(COOKIE_FILE, "utf-8");
        const cookies = JSON.parse(cookiesString);
        await context.setCookie(...cookies);
        console.log("Cookies loaded.");
    }
}

async function scrapeFacebookPage(pageUrl: string, maxPosts = 10) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    // ลองโหลด cookies ก่อน
    await loadCookies(page);

    // เข้า facebook.com เพื่อเช็คว่า login อยู่แล้วรึยัง
    await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2" });

    // รอให้ user login manual แล้วค่อย save cookies (ถ้ายังไม่ login)
    if (await page.$("input#email")) {
        console.log("กรุณาล็อกอิน Facebook ด้วยมือ และแก้ captcha ด้วยตัวเองให้เรียบร้อย แล้วค่อยกด Enter...");
        await new Promise((res) => process.stdin.once("data", res));
        await saveCookies(page);
        console.log("Login and cookies saved. จะ scrape รอบถัดไปไม่ต้อง login ใหม่ (ถ้าไม่โดนบังคับ)");
    } else {
        console.log("Login session already active.");
    }

    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    const posts = await page.evaluate((max) => {
        const results: any[] = [];
        // 1. หา div ข้อความโพสต์
        const postNodes = document.querySelectorAll('div[data-ad-preview="message"]');

        for (let i = 0; i < postNodes.length && results.length < max; i++) {
            const messageElement = postNodes[i];
            const message = messageElement?.textContent || "";
            // หา parent สำหรับรูปภาพ, เวลาสร้าง ฯลฯ
            // 2. หา parent ที่เป็นโพสต์
            const parent = messageElement.closest('[role="article"]');

            // 3. หาเวลา (createdTime)
            let createdTime = "";

            // 4. หา images ในโพสต์
            let imageUrls: string[] = [];
            if (parent) {
                imageUrls = Array.from(parent.querySelectorAll("img"))
                    .map(img => img.src)
                    // filter รูป profile/emoji/โลโก้ออก (จะเห็นว่ารูปโพสต์ปกติ url มักมี _n.jpg)
                    .filter(url => url.includes("_n.jpg") || url.includes(".jpg?"));
            }
            results.push({ message, createdTime, imageUrls });
        }
        return results;
    }, maxPosts);

    await browser.close();
    return posts;
}

(async () => {
    const url = "https://www.facebook.com/hashtag/amaronlastslongreallylong";
    const posts = await scrapeFacebookPage(url, 10);
    console.log(JSON.stringify(posts, null, 2));
})();
