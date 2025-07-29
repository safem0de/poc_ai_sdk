import feedData from "./facebook_feed.json";
import { normalizeFacebookFeed, cleanPosts } from "./facebook";

async function main() {
    // แปลงข้อมูล feed จาก Facebook ให้อยู่ในรูปแบบมาตรฐาน
    const posts = normalizeFacebookFeed(feedData);

    // ใช้ cleanPosts เพื่อตรวจสอบภาพและดึง serial/model ออกมา
    const cleanedPosts = await cleanPosts(posts);

    console.log(JSON.stringify(cleanedPosts, null, 2));
}

main();
