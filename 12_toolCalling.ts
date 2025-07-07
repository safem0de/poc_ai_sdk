import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";

const model = google("gemini-1.5-flash-latest")

export const useAITool = async (
    prompt: string,
) => {
    const results = await generateText({
        model,
        prompt,
        tools: {
            addNumber: tool({
                description : "Add two numbers together",
                parameters : z.object({
                    num1: z.number(),
                    num2: z.number(),
                }),
                execute: async ({ num1, num2 }) => {
                    return num1 + num2
                }
            }),
        },
    });

    console.log(results.toolResults);
    const stepCount = results.steps.length - 1;
    const totalToken = results.steps[stepCount].usage.totalTokens;
    console.log("TokenUsed : ", totalToken);
};

async function main() {

    await useAITool(
        "What is 5 + 10 ?"
    );

}

main();