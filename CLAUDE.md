# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

FitfulAI is a portfolio project demonstrating a hand-rolled AI agent architecture: it generates personalized weekly meal plans and grocery lists from a user's nutrition profile (calorie/macro targets computed client-side from age, height, weight, activity level, and nutrition goal).

The project is mid-rework — see `REWORK_PLAN.md` for the current execution plan (TypeScript migration, Vercel serverless backend, agent validation loop, tests). Keep changes consistent with that plan.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Tech Stack

- **Frontend**: React 19 + Vite 7, JSX (TypeScript migration planned — see REWORK_PLAN.md)
- **Styling**: Tailwind CSS 4, Headless UI, Lucide icons (do not add icon libraries; framer-motion is being phased out in favor of Headless UI `Transition`)
- **Backend**: Firebase Auth + Firestore
- **AI**: OpenAI (currently called client-side from `src/lib/openai.js`; moving to Vercel serverless functions per the rework plan — never add new client-side OpenAI calls)
- **Routing**: React Router DOM v7 (routes defined in `src/App.jsx`: `/`, `/meals`, `/groceries`, `/dashboard`)
- **State**: Zustand (`src/stores/useUIStore.js`) for UI state; `useAuth` hook + `SettingsContext` for auth/settings

## Project Structure

```
src/
├── App.jsx                    # Routes + top-level layout
├── lib/
│   ├── firebase.js            # Firebase client init
│   ├── openai.js              # OpenAI client (scheduled for removal → serverless)
│   ├── parallelGenerator.js   # Orchestrates meal-plan → grocery-list generation
│   ├── mealGenerator.js       # Meal plan prompt + Firestore persistence
│   ├── groceryGenerator.js    # Grocery list prompt + Firestore persistence
│   ├── firestoreQueries.js    # Firestore CRUD + AI cache reads
│   ├── initializeCollections.js # First-run user document creation
│   └── regenerationLimits.js  # Weekly regeneration caps (client-side)
├── components/
│   ├── auth/                  # AuthModal, SimpleAuthForm
│   ├── content/               # MealsContent, GroceriesContent (page bodies)
│   ├── dashboard/             # ProfileEditor (dietary prefs, allergies, servings)
│   ├── generation/            # GenerationProgressModal (drives parallelGenerator)
│   ├── modals/                # RecipeDetail, Settings, EditAccount
│   ├── nav/                   # TopNavigation, SideBarDrawer, BottomTabBar
│   ├── onboarding/            # OnboardingWizard + steps/ (5-step wizard)
│   └── ui/                    # WeekSelector, ToastProvider
├── contexts/                  # AuthContext, SettingsContext
├── hooks/                     # useAuth, useWeekContext
├── pages/                     # home, meals, groceries, dashboard
└── stores/                    # useUIStore (Zustand)
```

## Data Model (Firestore)

- `users/{uid}` — profile: physical stats, `fitnessGoal` (legacy field name; UI says "nutrition goal" — do not rename the field, existing data depends on it), `activityLevel`, `dietaryPreferences[]`, `allergies[]`, calculated `bmr`/`tdee`/`calorieTarget`/`macros`, `onboardingCompleted`, regeneration counters
- `meals/{id}` — generated meal plans, flat collection keyed by `userId` field, one per week (`weekStartDate`)
- `groceries/{id}` — generated grocery lists, linked to meal plans via `mealPlanId`
- `aiCache/{id}` — cached AI responses (being restricted/removed in the rework)

Security rules live in `firestore.rules` (owner-only access on users/meals/groceries).

## Conventions & Constraints

- BMR/TDEE/macros are calculated client-side (Mifflin-St Jeor); keep these deterministic and testable — they are a planned unit-test target
- The workout feature was removed; do not reintroduce workout concepts
- Icons: Lucide only, sized with Tailwind `w-* h-*` classes (not font-size classes)
- Env vars: `VITE_*` values are client-visible by design (Firebase config only). Secrets (OpenAI key, service accounts) must never get a `VITE_` prefix
- `.npmrc` must never be committed (a FontAwesome Pro token was previously leaked this way and removed)
- Run `npm run lint` and `npm run build` before considering a change done
