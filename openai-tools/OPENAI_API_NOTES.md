/* ADDITIONS FOR RECEIVING MULTIPLE COMPLETIONS */

Add this property to the request object to ask for 3 alternative responses (this is optional, as the default is 1)
n: 3, 


const response = await client.chat.completions.create({
  model: "gpt-4.1",
  n: 3,  // ask for 3 alternative responses
  messages: [
    { role: "user", content: "Give me three approaches to handling errors in Node.js" }
  ]
});

response.choices.forEach((choice, i) => {
  console.log(`Option ${i + 1}:`, choice.message.content);
});

// Each choice is an object with a message property that contains the content of the response.


// ================================



// ================================

// Other advanced response settings & roles

// a. Roles

// system: Sets behavior or persona. Example:
//      { role: "system", content: "You are a strict TypeScript code reviewer. Only respond with code diffs." }
// user: Your actual request.
// assistant: Can be used to inject prior answers if you’re replaying a conversation.

// (There’s also tool in some newer APIs, but that’s for advanced tool-calling workflows.)

// b. Advanced response settings

// temperature (0.0–2.0): Controls creativity.
//      0 = deterministic, reliable.
//      1 = balanced.
//      >1 = more random/creative.

// max_tokens: Cap the size of the output so you don’t get a book when you wanted a snippet.
// top_p: Another way to control randomness (usually leave at default).
// presence_penalty & frequency_penalty: Influence how repetitive vs. novel the output is.

// c. Developer-friendly tricks
// Use low temperature (0–0.2) when you want exact code (like fixing bugs).
// Use higher temperature (0.7–1.0) when you want ideas (like multiple architectures).
// Use a system role to enforce format: JSON, markdown tables, or just raw code blocks.

