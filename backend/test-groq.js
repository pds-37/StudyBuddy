import axios from "axios";
import "dotenv/config";

async function test() {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 2000,
        messages: [{ role: "user", content: "Test" }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Success:", response.data.choices[0].message);
  } catch (err) {
    const detail = err.response
      ? { status: err.response.status, data: err.response.data }
      : { code: err.code, name: err.name, message: err.message, cause: err.cause?.message };
    console.error("Failed:", JSON.stringify(detail));
  }
}

test();
