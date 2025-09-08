/* SEE NOTES BELOW*/

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Reads multiple files and sends them to OpenAI in one request.
 * @param {string[]} filePaths - List of file paths to include.
 * @param {string} userQuestion - Your query to the model.
 */

async function analyzeFiles(files, question) {
  const filesContent = files.map(file => {
    const absPath = path.resolve(file);
    const content = fs.readFileSync(absPath, "utf8");
    return `\n\n--- FILE: ${path.basename(file)} ---\n${content}`;
  }).join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini", // cheaper, switch to gpt-4.1 for deeper reasoning
    temperature: 0,
    max_tokens: 1200,
    messages: [
      { role: "system", content: "You are a code analysis assistant." },
      { role: "user", content: `Here are some files: ${filesContent}` },
      { role: "user", content: question }
    ]
  });

  return response.choices[0].message.content;
}

// Example run
const filesToCheck = ["./src/App.js", "./src/components/Header.js"];

// Use cases: “Show me how App.js and Header.js connect” or “Spot inconsistencies across these three files.”
analyzeFiles(filesToCheck, "How do these files interact?")
  .then(output => console.log("\n=== Multi-File Analysis ===\n", output))
  .catch(err => console.error(err));


/* ============================================================================
  /openai-tools/multi-file.js — Analyze a Small Set of Related Files
  ----------------------------------------------------------------------------
  PURPOSE
  - Compare/trace logic across 2–10 files: data flow, interface contracts,
    cross-file bugs, cohesion, duplication, naming consistency, etc.

  HOW TO USE
  - List the files you want (keep it selective).
  - Ask a cross-cutting question, e.g.:
      "Trace how request X flows from router → controller → service → DB and
       identify error-handling gaps."

  RECOMMENDED MESSAGE SHAPING
  - system:
      "You are a staff engineer. Identify cross-file issues first, then propose a
       minimal, safe fix plan. Prefer diffs grouped per file."
  - user (context block 1):
      Concise repo context or constraints (runtime, libraries, patterns).
  - user (context block 2):
      The file bundle (clearly delimited like `--- FILE: path ---`).
  - user (task):
      The specific outcome you want (table of issues, diffs, test plan, etc.).

  USEFUL OPTIONS
  - model: `gpt-4.1-mini` for broad sweeps; `gpt-4.1` for precise refactors.
  - temperature: 0–0.3 for accuracy; higher for alternative designs.
  - n: 2–3 to compare different refactor strategies.
  - max_tokens: Set a cap (e.g., 1200–2000). For big results, ask for phased output.

  QUALITY HINTS
  - Ask for a summary first (top 5 cross-file risks) *then* diffs.
  - Request a "change plan" before code edits; it reduces churn.
  - Ask for tests: unit cases per file + integration test covering the data path.

  COST CONTROL
  - Keep the file list small and relevant.
  - Prefer mini model for reconnaissance; escalate only when needed.

  OUTPUT FORMATS THAT WORK WELL
  - A table: file → issue → severity → fix approach.
  - Batched diffs grouped by file (ready to paste).
  - A JSON migration plan you can script against later.
============================================================================ */
