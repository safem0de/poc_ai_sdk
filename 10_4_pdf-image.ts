import "dotenv/config";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { readFileSync } from "fs";
import path from "path";

const schema = z
    .object({
        to : z
            .string()
            .describe("จดหมายถึงใคร"),
        title : z
            .string()
            .describe("หัวข้อเรื่องของจดหมาย"),
        reason : z
            .string()
            .describe("เหตุผล / การดำเนินการ"),
    })
    .describe("ถอดข้อความจากจดหมาย");

export const extractDataFromLetter = async (invoicePath: string) => {
    const model = google("gemini-1.5-flash-latest")
    const { object } = await generateObject({
        model,
        system: "คุณจะได้รับจดหมายถอดความจากจดหมาย",
        schema,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        data: readFileSync(invoicePath),
                        mimeType: "application/pdf",
                    },
                ],
            },
        ],
    });

    return object;
};

async function main() {
    const result = await extractDataFromLetter(
        path.join(__dirname, "./SMS-cancelation.pdf"),
    );
    console.log(result);
}

main();