// facebook\facebook.ts

import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const schema = z.object({
    modelNumber: z
        .string()
        .describe("Battery model number."),
    serialNumber: z
        .string()
        .describe("Battery serial number."),
});

type FacebookPost = {
  message: string;
  created_time: string;
  images: string[];
};

type CleanedPost = Omit<FacebookPost, "images"> & {
    images: {
        url: string;
        serialNumber: string;
        modelNumber: string;
    }[];
};

export const extractSerialFromImage = async (imageUrl: string) => {
    const model = google("gemini-1.5-flash-latest");

    const { object } = await generateObject({
        model,
        system:
            "You will receive a photo of a battery. " +
            "Extract the model and serial number from AMARON label. " +
            "First one below barcode is serial and below is model.",
        schema,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        image: new URL(imageUrl),
                    },
                ],
            },
        ],
    });

    return object;
};

export function normalizeFacebookFeed(data: any): FacebookPost[] {
  return data.data.map((post: any) => {
    const images: string[] = [];

    // ภาพหลัก (ถ้ามี)
    if (post.full_picture) {
      images.push(post.full_picture);
    }

    // attachments -> data -> subattachments -> data -> media.image.src
    const subImages = post.attachments?.data?.flatMap((attachment: any) =>
      attachment.subattachments?.data?.map((sub: any) =>
        sub.media?.image?.src
      ) || []
    );

    if (subImages?.length > 0) {
      images.push(...subImages);
    }

    return {
      message: post.message || "",
      created_time: post.created_time,
      images: images.filter(Boolean),
    };
  });
}

export async function cleanPosts(posts: FacebookPost[]): Promise<CleanedPost[]> {
    const cleaned: CleanedPost[] = [];

    for (const post of posts) {
        if (!post.images || post.images.length === 0) continue;

        const validImages: CleanedPost["images"] = [];

        for (const img of post.images) {
            const result = await extractSerialFromImage(img);

            if (result?.serialNumber || result?.modelNumber) {
                validImages.push({
                    url: img,
                    serialNumber: result.serialNumber,
                    modelNumber: result.modelNumber,
                });
            }
        }

        if (validImages.length > 0) {
            cleaned.push({
                ...post,
                images: validImages,
            });
        }
    }

    return cleaned;
}