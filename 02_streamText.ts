import "dotenv/config";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

const model = google("gemini-1.5-flash-latest")

export const answerMyQuestion = async(
	prompt: string,
) => {
	const { textStream } = await streamText({
		model,
		prompt,
	});
	
	for await (const text of textStream)
	{
		process.stdout.write(text);
	}

	return textStream;
};

async function main() {
  const answer = await answerMyQuestion(
    "what is color of the sun"
  );
  console.log(answer);
}

main();