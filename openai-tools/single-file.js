/* SEE NOTES BELOW*/

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeFile(filePath, question) {
    const absPath = path.resolve(filePath);
    const content = fs.readFileSync(absPath, "utf8");

    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0,
        max_tokens: 800,
        messages: [
            { role: "system", content: "You are a careful code reviewer." },
            { role: "user", content: `Here is the file: ${path.basename(filePath)}\n\n${content}` },
            { role: "user", content: question }
        ]
    });

    return response.choices[0].message.content;
    // choices is always an array, because the API can return more than one candidate response (if you set n > 1).
}

// Example run
const fileToCheck = "src/main.jsx";

// Use cases: “What does this file do?” or “Are there performance issues here?”
analyzeFile(fileToCheck, "Explain what this file does.")
    .then(output => console.info("\n=== File Analysis ===\n", output))
    .catch(err => console.error(err));


/* ============================================================================
  /openai-tools/single-file.js — Deep-Dive One File at a Time
  ----------------------------------------------------------------------------
  PURPOSE
  - Ask focused questions about a single source file (explain code, find bugs,
    propose refactors, add docs, improve performance, etc.).

  HOW TO USE
  - Point `fileToCheck` at the target file.
  - Provide a clear `question` (e.g., "Identify race conditions and propose fixes").
  - Run: `node openai-tools/single-file.js`

  TUNING KNOBS (pick per task)
  - model:
      gpt-4.1-mini  → cheap, fast triage
      gpt-4.1       → deeper reasoning for tricky bugs/architecture
  - temperature (0.0–2.0):
      0.0–0.2 → deterministic, precise diffs/fixes
      0.5–0.8 → creative alternatives / API design ideas
  - max_tokens:
      Cap output length (e.g., 600–1200) to control cost and verbosity.
  - n:
      Return multiple options (e.g., n: 3) and compare `response.choices`.

  PROMPTING TIPS
  - Use a strict system role to shape outputs:
      "You are a senior engineer. Respond ONLY with a unified diff patch."
  - Ask for STRUCTURED output when useful:
      "Return JSON with keys: issues[], risk, fixes[]."
  - Be explicit about constraints:
      Node LTS only, no external deps, TypeScript-safe, avoid breaking API.
  - For large files:
      Consider trimming unrelated sections or ask for a high-level summary first,
      then follow up with targeted requests (saves tokens/cost).

  SAFETY & COST
  - Avoid sending secrets or .env contents.
  - Keep temperature low for production-critical edits.
  - If output gets cut (finish_reason === "length"), increase `max_tokens` or ask
    for chunked/stepwise results.

  EXPECTED OUTPUT
  - Readable explanation, a diff, or a JSON plan—according to your system prompt.

  SIMPLEST EXAMPLE
    import fs from "fs";
    import OpenAI from "openai";

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const code = fs.readFileSync("src/index.js", "utf8");

    const response = await client.chat.completions.create({
        model: "gpt-4.1",
        messages: [
            { role: "system", content: "You are a code assistant." },
            { role: "user", content: "Here is my file:\n\n" + code },
            { role: "user", content: "Please review it for bugs." }
        ]
    });

    console.log(response.choices[0].message);

============================================================================ */
