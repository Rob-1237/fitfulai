/* SEE NOTES BELOW*/

/* FEATURES: */
// Recursively scans your project.
// Ignores node_modules.
// Only includes whitelisted file types (.js, .ts, etc.).
// Skips files larger than a size limit (default 200 KB) to save tokens.
// Uses gpt-4.1-mini by default (cheap for big scans).

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Recursively collect files from a directory, filtering by extension and size.
 * @param {string} dir - directory to scan
 * @param {string[]} exts - allowed file extensions (e.g. ['.js','.ts'])
 * @param {number} maxSizeKB - max file size in KB to include
 * @returns {string[]} file paths
 */
function collectFiles(dir, exts, maxSizeKB = 200) {
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && entry !== "node_modules") {
      results = results.concat(collectFiles(fullPath, exts, maxSizeKB));
    } else if (
      exts.includes(path.extname(entry)) &&
      stat.size / 1024 <= maxSizeKB
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

async function analyzeProject(rootDir, userQuestion) {
  // Gather candidate files
  const files = collectFiles(rootDir, [".js", ".ts", ".jsx", ".tsx"]);
  console.log(`Including ${files.length} files.`);

  // Build content string
  const filesContent = files
    .map(file => {
      const content = fs.readFileSync(file, "utf8");
      return `\n\n--- FILE: ${path.relative(rootDir, file)} ---\n${content}`;
    })
    .join("\n");

  // Send to OpenAI
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini", // cheaper, switch to gpt-4.1 for deeper reasoning
    temperature: 0,
    max_tokens: 800,
    messages: [
      { role: "system", content: "You are a precise code reviewer." },
      { role: "user", content: `Here are my project files: ${filesContent}` },
      { role: "user", content: userQuestion }
    ]
  });

  return response.choices[0].message.content;
}

// Example run
const projectRoot = path.resolve("./src"); // adjust if needed

analyzeProject(projectRoot, "Summarize the purpose of this codebase and flag any obvious issues.")
  .then(output => console.log("\n=== AI Analysis ===\n", output))
  .catch(err => console.error(err));

  /* ============================================================================
  /openai-tools/project-scanner.js — Repo Recon & Hotspot Triage
  ----------------------------------------------------------------------------
  PURPOSE
  - High-level scan to understand structure, surface hotspots, and create a
    prioritized to-do list. Best for orientation, not giant refactors in one go.

  WHEN TO USE
  - New codebase onboarding
  - Before major refactors
  - Pre-migration audits (Node→TS, framework upgrades)
  - Periodic hygiene checks

  WHAT IT DOES (SAFE DEFAULTS)
  - Recursively collects candidate files by extension (e.g., .js/.ts/.jsx/.tsx)
  - Skips heavy dirs like node_modules
  - Excludes files above a size threshold (protects token budget)
  - Sends a single summarized request (use a cheaper model by default)

  ROLE / PROMPT SUGGESTIONS
  - system:
      "You are a precise codebase auditor. First produce a repo map (key modules,
       responsibilities, external deps). Then list the top 10 risks with paths,
       severity, and recommended fixes. Keep answers concise and actionable."
  - user (context):
      Mention runtime, frameworks, style rules, CI constraints, deployment env.
  - user (task):
      e.g., "Deliver: (1) Repo map, (2) Risks table, (3) 7-day action plan,
            (4) Minimal diffs for the top 2 risks."

  COST & SCOPE MANAGEMENT
  - Start with `gpt-4.1-mini`, low temperature, tight `max_tokens` (e.g., 800–1200).
  - Narrow the file filters (extensions) and keep max file size conservative.
  - If you need more depth, run focused follow-ups with /single-file or /multi-file.

  PRACTICAL TIPS
  - Print which files were included (count & list a few) so scans are reproducible.
  - Consider a "dry run" flag that only lists candidate files without calling the API.
  - For very large repos, scan by subfolder (src/, server/, packages/*) and merge notes.
  - Ask for outputs that are easy to act on (tables, checklists, diffs, or JSON).

  SAFETY
  - Exclude secrets, private keys, or large vendor bundles.
  - Keep an eye on token usage; chunk if the candidate set grows too large.

  NEXT STEP PATTERN
  - Use scanner → identify hotspots → drill down with /single-file or /multi-file.
============================================================================ */
