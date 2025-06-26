import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import path from "path";

const systempromt = `You are a helpful assistant that describes images in detail.`+
`You will be given an image and you need to provide a detailed description of the image.`+
`Do not pass 100 characters in your response.`+
`Use simple words and short sentences.`

export const describeImage = async (imageUrl: string) => {
    const model = google("gemini-1.5-flash-latest")
    // const imageAsUint8Array = readFileSync(imagePath);

    const { text } = await generateText({
        model: model,
        system: systempromt,
        messages:[
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Describe the image in detail.",
                    },
                    {
                        type: "image",
                        image: new URL(imageUrl),
                    },
                ],
            },
        ],
    });
    return text;
};

async function main() {
  const description = await describeImage(
    "https://cdn.outsideonline.com/wp-content/uploads/2023/03/Funny_Dog_H.jpg?crop=16:9&width=960&enable=upscale&quality=100"
  );

  console.log(description);
}

main();