import "dotenv/config";
import { createAzure } from '@ai-sdk/azure';
import { generateObject } from "ai";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

const endpoint = process.env.AZURE_ENDPOINT!;
const modelName = process.env.AZURE_MODEL_NAME!;
const deployment = process.env.AZURE_DEPLOYMENT_NAME!;
const apiKey = process.env.AZURE_API_KEY!;
const apiVersion = process.env.API_VERSION!;

const schema = z.object({
  modelNumber: z
    .string()
    .describe("Battery model number."),
  serialNumber: z
    .string()
    .describe("Battery serial number."),
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
      "You will receive a photo of a battery. " +
      "Extract the model and serial number from AMARON label," +
      "First one below barcode/QR Code is serial and below is model.",
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
    path.join(__dirname, "./test_battery3.jpg")
  );
  console.log(result);
}

main();