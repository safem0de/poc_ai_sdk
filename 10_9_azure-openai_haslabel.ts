import "dotenv/config";
import { createAzure } from '@ai-sdk/azure';
import { generateObject } from "ai";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

const deployment = process.env.AZURE_DEPLOYMENT_NAME!;
const apiKey = process.env.AZURE_API_KEY!;

// schema เพิ่ม hasLabel
const schema = z.object({
    hasLabel: z.boolean().describe("Is there a white Barcode or QRCode in the image?"),
    reason: z.string().describe("Tell the reason why you found/ not found.")
});

export const extractSerialFromImage = async (imagePath: string) => {
    const azure = createAzure({
        resourceName: "admin-mdqxs5ct-japaneast",
        apiKey: apiKey,
    });

    const model = azure(deployment);

    const { object } = await generateObject({
        model,
        system:
            "Forgot all about last Q&A You will receive a photo " +
            "First, Answer only if you are confident there is a clear Barcode or QRCode label in the image. " +
            "If you are unsure or the image is not relevant, answer 'false'." +
            "Second, explain why you say so in a field called 'reason'."
        ,
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
        path.join(__dirname, "./test_battery2.jpg")
    );
    console.log(result);
}

main();
