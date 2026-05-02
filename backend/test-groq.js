const axios = require('axios');

async function test() {
  try {
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
          Authorization: `Bearer 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`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Success:", response.data.choices[0].message);
  } catch (err) {
    console.error("Failed:", err.response ? err.response.data : err.message);
  }
}

test();
