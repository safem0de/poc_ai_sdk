import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

const schema = z.object({
    modelNumber: z
        .string()
        .describe("Battery model number."),
    serialNumber: z
        .string()
        .describe("Battery serial number."),
});

export const extractSerialFromImage = async (imagePath: string) => {
    const model = google("gemini-1.5-flash-latest");

    const { object } = await generateObject({
        model,
        system:
            "You will receive a photo of a battery. " +
            "Extract the model and serial number from AMARON label," +
            "First one below barcode is serial and below is model.",
        schema,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        image: readFileSync(imagePath),
                    },
                ],
            },
        ],
    });

    return object;
};

async function main() {
    const result = await extractSerialFromImage(
        path.join(__dirname, "./fireworks.jpg")
    );
    console.log(result);
}

main();