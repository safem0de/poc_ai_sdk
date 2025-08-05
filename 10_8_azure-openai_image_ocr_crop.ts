import "dotenv/config";
import { createAzure } from '@ai-sdk/azure';
import { generateObject } from "ai";
import path from "path";
import { z } from "zod";
import sharp from "sharp";

const deployment = process.env.AZURE_DEPLOYMENT_NAME!;
const apiKey = process.env.AZURE_API_KEY!;

async function preprocessImage(imagePath: string, pixelCrop:number, outputPath: string, rotate: number) {
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();
  const left = pixelCrop;
  const top = pixelCrop;
  const cropWidth = width - (left*2);   // ตัดซ้าย+ขวา เช่น 200+200 รวม 400px
  const cropHeight = height - (top*2); // ตัดบน+ล่าง เช่น 200 + 200 รวม 400px

  const processedImage = sharp(imagePath)
    .extract({ left: left, top: top, width: cropWidth, height: cropHeight })
    .rotate(rotate);

  if (outputPath) {
    await processedImage.toFile(outputPath);
  }
  const croppedBuffer = await processedImage.toBuffer();
  return croppedBuffer;
}

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

  const now = Date.now();
  const outputPath = `./output_cropped_${now}.jpg`;

  const imageBuffer = await preprocessImage(imagePath, 0, outputPath, 180);
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
            image: imageBuffer,
          },
        ],
      },
    ],
  });

  return object;
};

async function main() {
  const result = await extractSerialFromImage(
    path.join(__dirname, "./test-real-data2.jpg")
  );
  console.log(result);
}

main();