/* SEE NOTES BELOW*/

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const run = async () => {
  const response = await client.chat.completions.create({
    model: "gpt-4.1",   // replace with gpt-4.1-mini if you want cheaper
    messages: [{ role: "user", content: "Hello, can you confirm you're working?" }],
  });
  console.log(response.choices[0].message);
};

run();


/* ============================================================================
  /openai-tools/test-openai.js — Quick Connectivity + Key Sanity Check
  ----------------------------------------------------------------------------
  PURPOSE
  - Verify your OpenAI API key, network connectivity, and SDK wiring.
  - Confirms the model replies and the SDK returns a well-formed `response`.

  PREREQUISITES
  - Node ≥ 18 (built-in fetch). Check with: `node -v`
  - Install deps: `npm i openai dotenv`
  - Create `.env` at project root (DO NOT COMMIT):
      OPENAI_API_KEY=sk-...your real key...
    Ensure `.gitignore` includes `.env`.

  HOW TO RUN
  - From project root:
      node openai-tools/test-openai.js
    (Or run with a one-off key: `OPENAI_API_KEY=sk-... node openai-tools/test-openai.js`)

  WHAT "SUCCESS" LOOKS LIKE
  - A printed assistant message, e.g. response.choices[0].message.content.
  - You can also log `response.model` to see which model actually served it.

  COMMON SWITCHES
  - Change the `model` string to try `gpt-4.1-mini` (cheaper) or `gpt-4.1` (stronger).
  - Set `n: 2` to return multiple candidate answers (see `response.choices`).

  TROUBLESHOOTING
  - 401 / "invalid_api_key": Check .env is loaded and key is correct.
  - 403 / "insufficient_quota": Check billing/credits on the OpenAI dashboard.
  - 429 / "rate_limit": Retry with backoff; lower request frequency/size.
  - ERR_MODULE_NOT_FOUND 'openai': `npm i openai` in this project.
  - No output / hangs: Add `console.log` before/after the request; check network/VPN.
  - Accidentally committed `.env`: Immediately rotate the key in the dashboard.

  SAFETY
  - Never hardcode keys. Never include `.env` in commits. Rotate keys periodically.
============================================================================ */
