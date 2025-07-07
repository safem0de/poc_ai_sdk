import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const model = google("gemini-1.5-flash-latest", { useSearchGrounding: true })

export const searchMyQuestion = async (
	prompt: string,
) => {
	const results = await generateText({
		model,
		prompt,
	});

	console.log(results.text);
	console.log(results.sources);

};

async function main() {

	await searchMyQuestion(
		"Thailand Priministor Latest news" // ปัจจุบันรองรับเฉพาะภาษาอังกฤษ
	);

}

main();