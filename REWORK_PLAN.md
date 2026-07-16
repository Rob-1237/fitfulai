# FitfulAI Rework — Execution Plan

**Goal:** Rework FitfulAI into a pinned-repo-worthy portfolio project that demonstrates a hand-rolled agent architecture, focused on AI meal planning + grocery lists (workouts removed). Budget: one focused week.

**Positioning:** Keep the FitfulAI name. Tagline: "AI meal planning & grocery agent." README and app footer state plainly that this is a portfolio project demonstrating agent architecture, not a commercial product.

**Demo access:** Live Vercel URL + demo credentials in the README + hero screenshot/GIF. Seeded `demo@fitful.ai` account with pre-generated plans. Open signup stays on, but the server enforces a hard generation cap (3 per account).

## Target architecture

```
Browser (React 19 + TS + Tailwind, Firebase Auth)
   │
   │  fetch('/api/...', { Authorization: Bearer <Firebase ID token> })
   ▼
Vercel Serverless Functions (api/*.ts)
   ├─ verify ID token (firebase-admin)
   ├─ enforce generation cap (Firestore transaction)
   ├─ AGENT LOOP: generate → validate (deterministic) → critique → revise
   │      └─ OpenAI structured outputs (zod schema-enforced JSON)
   ├─ write results to Firestore (Admin SDK)
   └─ return { plan, agentTrace }
   │
   ▼
Firestore (users/, meals/, groceries/) ── client reads via security rules
```

Key properties a reviewer should notice: no API key in the browser, schema-enforced AI output (zod as single source of truth for TS types, runtime validation, and the OpenAI response format), a bounded self-correcting agent loop with an inspectable trace, deterministic validation instead of LLM-judges-LLM, and server-side enforcement of limits.

---

## Day 1 — Cleanup & repo hygiene

1. **Remove dead dependencies** (verified unused via import grep): `stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, all 7 `@radix-ui/*`, `@dnd-kit/core|sortable|utilities`, `@tanstack/react-query`, `date-fns`, `clsx`, `tailwind-merge`, `dotenv`, `tailwindcss-animate`.
2. **FontAwesome → Lucide** in the 15 files that import `@fortawesome/*` (Lucide is already used in 7 files; this consolidates on one free icon set so `npm install` works for everyone). Then remove the 3 `@fortawesome/*` packages.
3. **Purge workout leftovers:** `useUIStore.js` pages array, `ReviewStep.jsx` workoutDays defaults, `FitnessGoalsStep.jsx` copy, `initializeCollections.js` workout fields/requestType, `pages/dashboard/index.jsx` workout feature bullets.
4. **"Nutrition goal" reframing (copy only):** UI labels change from fitness to nutrition framing. The Firestore field stays `fitnessGoal` — renaming it would require a data migration for zero reviewer-visible benefit; a code comment will note this.
5. **Rewrite CLAUDE.md** to describe the actual current codebase (and target architecture).
6. **Verify:** fresh `npm install` (lockfile regenerates), `npm run lint`, `npm run build`.

Note: `framer-motion` (26 files) is **not** removed on Day 1 — it comes out during the Day 6 UI pass, replaced by Headless UI's `Transition` for modal/drawer enter/exit animations (already a dependency, already used in 7 files).

## Day 2 — TypeScript: foundations

1. Tooling: `typescript`, `tsconfig.json` (`strict: true`), typed ESLint (`typescript-eslint`), rename `vite.config.js` → `.ts`. `allowJs: true` during migration so the app builds at every step.
2. **Domain schemas first, in `src/shared/schemas.ts`** using zod: `MealPlanSchema`, `MealSchema`, `GroceryListSchema`, `GroceryItemSchema`, plus `UserProfile`, `AgentTrace`, `Violation` types. These zod schemas are deliberately triple-duty: TS types (`z.infer`), runtime validation of AI output, and the OpenAI structured-output format on Day 4. Lives under `src/shared/` so both the client and the `api/` functions import it.
3. Migrate `lib/`, `hooks/`, `stores/`, `contexts/` to `.ts`.

## Day 3 — TypeScript: components

1. Migrate all pages/components to `.tsx`. Bar: typed props and state everywhere, no `any` in the domain layer; don't gold-plate presentational code.
2. Split `MealsContent` (~1,100 lines) and `GroceriesContent` (~850) only where the migration makes it natural (e.g., extract card/list-item subcomponents). Deeper decomposition is below the cut line.
3. End state: zero `.jsx` files, `tsc --noEmit` clean, `allowJs` off.

## Day 4 — Serverless backend (detailed)

### Vercel function anatomy
- Functions live in **`api/` at the repo root** (sibling of `src/`), one file per route: `api/generate-meals.ts`, `api/generate-groceries.ts`. Vercel auto-detects them alongside the Vite build — no framework change, no `express`.
- Each file exports a default handler `(req: VercelRequest, res: VercelResponse)` from `@vercel/node`.
- **Local dev changes:** `vercel dev` (via Vercel CLI) runs Vite + the functions together at one origin. `npm run dev` alone will no longer exercise generation. We'll add `"dev:full": "vercel dev"` to scripts and document it.
- **Timeout:** generation with up to 2 revision passes can exceed the 10s default, so each function exports `export const config = { maxDuration: 60 }` (supported on the Hobby plan).

### Request flow (both endpoints)
1. Client calls `await user.getIdToken()` and sends it as `Authorization: Bearer <token>` with a typed JSON body.
2. Function verifies the token with `firebase-admin`'s `verifyIdToken()` → gives us a trusted `uid`. 401 on failure.
3. Function reads `users/{uid}` via the **Admin SDK** (bypasses security rules — this is why the service account stays server-side only) and runs a **Firestore transaction**: read `aiGenerationsUsed`, reject with 429 if ≥ 3, else increment. Doing this in a transaction (not client-side, as `regenerationLimits.js` does today) makes the cap unforgeable.
4. Run generation (Day 5's agent loop lives here).
5. Write the resulting plan document to Firestore server-side, return `{ plan, agentTrace, usage }` to the client.

### OpenAI modernization
- The `openai` package moves out of client dependencies into the functions. `src/lib/openai.js` (with `dangerouslyAllowBrowser`, the JSON-repair hacks, and pricing tables) is deleted entirely.
- Calls use **structured outputs**: pass the zod schema from `src/shared/schemas.ts` via the SDK's zod helper so the API *guarantees* schema-conformant JSON. All hand-rolled JSON parsing/recovery code becomes unnecessary — `parse` returns typed data or throws.
- Model: a current mini-tier model (e.g. `gpt-5-mini`); we verify the exact current name/pricing against OpenAI's model list on this day, since names churn. One model constant in one file.
- Env var is `OPENAI_API_KEY` — **no `VITE_` prefix**, which is exactly what keeps it out of the client bundle (Vite only inlines `VITE_*`).

### Environment variables (Vercel dashboard + local `.env`)
| Variable | Where used | Notes |
|---|---|---|
| `OPENAI_API_KEY` | api/ only | fresh key; old one assumed dead |
| `FIREBASE_SERVICE_ACCOUNT_B64` | api/ only | service-account JSON, base64-encoded to survive env-var newline mangling |
| `VITE_FIREBASE_*` (existing 7) | client | these are public-by-design Firebase config values — fine in the bundle |

### Firestore adjustments
- **Rules:** `aiCache` client access removed entirely (`allow read, write: if false`) — the current rules let any authenticated user read everyone's cache entries, which embed profile data. If caching survives at all it happens server-side via the Admin SDK (which ignores rules); with a 3-generation cap it may simply be deleted along with `initializeCollections.js`'s cache plumbing.
- `users/`, `meals/`, `groceries/` owner-only rules stay as-is (client still reads plans directly and can edit/check off grocery items; only *generation* goes through the server).
- **Deploying rules:** `firestore.rules` is already in the repo; we'll deploy via `npx firebase-tools deploy --only firestore:rules` (one-time `firebase login` from you) or paste into the console — your choice on the day.

## Day 5 — The agent loop (detailed)

All server-side, inside `api/generate-meals.ts` (groceries reuses the pattern with lighter validation).

```ts
// shapes (defined Day 2)
type Violation = { rule: 'calories' | 'macros' | 'allergen' | 'diet'; severity: 'error' | 'warn'; detail: string };
type AgentStep = { attempt: number; action: 'generate' | 'validate' | 'revise'; violations: Violation[]; durationMs: number };
type AgentTrace = { steps: AgentStep[]; attempts: number; outcome: 'clean' | 'best-effort' };
```

```
attempt = 1
plan = generate(profile)                        // OpenAI structured output
loop (max 2 revisions):
  violations = validate(plan, profile)          // deterministic TS, no AI:
                                                //  • Σ calories within ±10% of calorieTarget
                                                //  • protein/carbs/fat grams within ±15% of macro targets
                                                //  • no profile.allergies term appears in any ingredient (normalized match)
                                                //  • dietary preferences respected (e.g. vegetarian ⇒ no meat ingredients)
  if no errors → outcome 'clean', break
  critique = renderCritique(violations)         // "Day 3 totals 2,910 kcal vs target 2,263 (+29%). Remove or lighten…"
  plan = revise(plan, critique)                 // second OpenAI call: prior plan + critique + same schema
  attempt++
return best-scoring attempt + full trace
```

Design points a reviewer should see (and the README will say): the validator is deterministic code because checking arithmetic and allergen membership is not a job for an LLM; iterations are bounded (runaway-loop awareness); every step is recorded in a structured trace; if revisions never fully pass, the best attempt ships with `outcome: 'best-effort'` and its remaining warnings — honest degradation, not silent failure. The client's `parallelGenerator` orchestration survives (meals endpoint → groceries endpoint) and the `GenerationProgressModal` upgrades to render trace steps ("Attempt 1: 2 violations — revising…").

## Day 6 — Tests, CI, UI pass

1. **Vitest** (15–20 tests): BMR/TDEE/macro calculations against hand-computed cases; the validator (the most test-worthy code — feed it plans that violate calories/allergens/diet and assert the exact violations); grocery aggregation; zod schema accept/reject cases.
2. **GitHub Actions:** one workflow running `lint` + `tsc --noEmit` + `vitest run` on push/PR; badge in README.
3. **UI pass:** remove `framer-motion` (26 files), using Headless UI `Transition` for modal/drawer enter-exit UX; responsive audit with plain Tailwind (mobile nav, meal cards, grocery list); consistent spacing/type scale; portfolio-demo footer note.

## Day 7 — README, seed, ship

1. **README from scratch:** hero screenshot/GIF → live demo link + demo credentials → "what this demonstrates" → architecture diagram → agent-loop diagram with a real trace example → tech stack → local setup (verified against a fresh clone + `npm install`) → honest limitations section.
2. **Seed the demo account** (`demo@fitful.ai`): sign up normally, generate real plans, then set its `aiGenerationsUsed` to the cap so reviewers can't burn your credits from it.
3. **Deploy:** Vercel env vars set, `firestore.rules` deployed, end-to-end test with a real key: fresh signup → onboarding → generation with agent trace → meals/groceries pages → demo account login.

## Cut line (drop in this order if the week runs short)

1. Component decomposition beyond what TS forces
2. UI polish beyond "responsive and consistent"
3. Test count (10 good tests beat 20 rushed ones)

**Never cut:** key server-side, agent loop, README.

## Needed from you (before Day 4)

- Fresh OpenAI API key
- Firebase service-account JSON: Firebase Console → Project Settings → Service Accounts → Generate new private key (goes only into Vercel env vars + local `.env`, never the repo)

## Progress log

- [x] Day 1 — cleanup, deps, FA→Lucide, workout purge, CLAUDE.md ✅ (2026-07-16)
  - Extras found & fixed along the way: `.npmrc` with the FontAwesome Pro auth token was committed to the repo — removed and gitignored, but **the token must be revoked** (it lives in git history); ESLint config was missing `react/jsx-uses-vars`, hiding ~50 real errors behind false positives — fixed, and `npm run lint` now passes with 0 errors; deleted 7 dead files (Logo, LoadingSpinner, Button, Modal, CollapsibleSection, QuickOnboardingModal, hooks/useSettings) plus a dead 84-line duplicate of the onboarding-completion handler in ReviewStep; fixed a real bug lint exposed in `parallelGenerator.js` (retry path referenced an undefined `forceRefresh`).
- [x] Day 2 — TS tooling, zod domain schemas, lib/hooks/stores/contexts ✅ (2026-07-16)
  - `tsconfig` project-references layout (strict, `allowJs` during migration), `typescript-eslint` wired into the flat config, `build` now runs `tsc -b` first, new `npm run typecheck` script. `src/shared/schemas.ts` holds the zod schemas (MealPlan/GroceryList/Meal/GroceryItem) + UserProfile/AgentTrace/Violation/GenerationResult types, with a `TimestampLike` structural type so the module works under both the client SDK and firebase-admin later. All of lib/, hooks/, stores/, contexts/ are now .ts/.tsx with strict typing; generator validation is intentionally still loose (documented) until structured outputs land on Day 4. Bonus fixes: `updateSetting` no longer mutates nested state objects (structuredClone), and 4 of the 8 lingering exhaustive-deps warnings were resolved.
- [x] Day 3 — components to .tsx, tsc clean ✅ (2026-07-16)
  - All 27 remaining files are .tsx (zero .jsx left, `allowJs` removed); every component has typed props/state; `index.html` points at `main.tsx`. New `src/components/onboarding/types.ts` defines `OnboardingData` + `StepProps` shared by the wizard and all 5 steps. Schemas gained legacy-tolerant `StoredMeal`/`StoredDayPlan` types because the Firestore data has two generations of document shapes (the strict zod schemas stay clean for Day 4's structured outputs). Strict mode surfaced one real latent bug: MealsContent's `selectedMealPlan` modal read state that was never set correctly, and several unguarded `user`/`userProfile` null paths now have explicit guards. Deferred to Day 6 (UI pass): deeper decomposition of MealsContent/GroceriesContent — the migration typed them but they remain large.
- [ ] Day 4 — Vercel functions, auth verification, caps, structured outputs, rules
- [ ] Day 5 — validator, critique, revision loop, trace UI
- [ ] Day 6 — Vitest suite, GitHub Actions, UI pass (framer-motion → Transition)
- [ ] Day 7 — README, demo seed, deploy, end-to-end verify
