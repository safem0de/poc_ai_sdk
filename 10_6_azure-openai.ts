import "dotenv/config";
import { AzureOpenAI } from "openai";

const modelName = process.env.AZURE_MODEL_NAME!;
const deployment = process.env.AZURE_DEPLOYMENT_NAME!;

const endpoint = process.env.AZURE_OPENAI!;
console.log(endpoint);

export async function main() {

  const apiKey = process.env.AZURE_API_KEY!;
  const apiVersion = process.env.API_VERSION!;
  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant." },
      { role:"user", content: "I am going to Paris, what should I see?" }
    ],
    max_tokens: 2048,
      temperature: 1,
      top_p: 1,
      model: modelName
  });

  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});