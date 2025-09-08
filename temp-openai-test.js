import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // or the key you pasted in Cursor settings
});

(async () => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello from my OpenAI key!" }],
    });
    console.log(response.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
