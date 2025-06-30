import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const model = google("gemini-1.5-flash-latest")

export const summarizeText = async(
	input: string,
) => {
	const { text } = await generateText({
		model,
		messages : [
			{
				role: "system",
				content:
				`You are a text sumarizer. ` +
				`Summarize the text you receive. ` +
				`Be concise. ` +
				`Return only the summary. ` +
				`Do not use the phrase "here is a summary". ` +
				`Highlight relevant phrases in bold. ` +
				`The summary should be two sentences long. `
			},
			{
				role: "user",
				content: input
			}
		]
	});
	
	return text;
};

async function main() {
  const answer = await summarizeText(
    "ประเทศไทยเป็นประเทศในภูมิภาคเอเชียตะวันออกเฉียงใต้ มีประวัติศาสตร์และวัฒนธรรมอันยาวนาน จุดเด่นหนึ่งของประเทศไทยคือความหลากหลายทางวัฒนธรรม ซึ่งเกิดจากการผสมผสานของเชื้อชาติ ศาสนา และประเพณีที่แตกต่างกันในแต่ละภูมิภาค ไม่ว่าจะเป็นภาคเหนือที่มีประเพณียี่เป็งและอาหารพื้นเมืองอย่างข้าวซอย ภาคอีสานที่มีเทศกาลบุญบั้งไฟและอาหารขึ้นชื่ออย่างส้มตำ ภาคใต้ที่มีประเพณีชักพระและอาหารทะเลสดใหม่ หรือภาคกลางที่มีประเพณีลอยกระทงและอาหารไทยแท้อย่างต้มยำกุ้ง" +
	"นอกจากนี้ ประเทศไทยยังขึ้นชื่อในเรื่องการท่องเที่ยว โดยมีสถานที่ท่องเที่ยวทางธรรมชาติ เช่น ทะเลอันดามัน ภูเขาที่เชียงใหม่ และแม่น้ำเจ้าพระยาในกรุงเทพฯ อีกทั้งยังมีแหล่งโบราณสถานสำคัญ เช่น วัดพระแก้ว พระบรมมหาราชวัง และอุทยานประวัติศาสตร์สุโขทัย การท่องเที่ยวเหล่านี้สร้างรายได้มหาศาลให้กับประเทศ" +
	"อย่างไรก็ตาม ประเทศไทยก็ยังเผชิญกับความท้าทายในหลายด้าน ไม่ว่าจะเป็นปัญหาสิ่งแวดล้อม เช่น มลพิษทางอากาศและน้ำท่วม รวมถึงความเหลื่อมล้ำทางเศรษฐกิจและการเข้าถึงการศึกษา ซึ่งรัฐบาลและภาคเอกชนต้องร่วมมือกันในการแก้ไขเพื่อสร้างความยั่งยืนให้กับประเทศในอนาคต"
  );
  console.log(answer);
}

main();