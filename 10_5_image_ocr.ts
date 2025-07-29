import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

const schema = z.object({
    serialNumber: z
        .string()
        .describe("The serial number from the battery image."),
});

export const extractSerialFromImage = async (imagePath: string) => {
    const model = google("gemini-1.5-flash-latest");

    const { object } = await generateObject({
        model,
        system:
            "You will receive a photo of a battery. Extract the serial number from any labels or imprints.",
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
        path.join(__dirname, "./test_battery.jpg")
    );
    console.log(result);
}

main();