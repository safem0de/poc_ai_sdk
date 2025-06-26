import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const model = google("gemini-1.5-flash-latest")

export const answerMyQuestion = async(
	prompt: string,
) => {
	const { text } = await generateText({
		model,
		prompt,
	});
	
	return text;
};

async function main() {
  const answer = await answerMyQuestion(
    "what is the chemical formula for dihydrogen monoxide"
  );
  console.log(answer);
}

main();