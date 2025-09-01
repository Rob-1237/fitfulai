Answers to the 5 Clarifying Questions
1) User Flow & State Expectations

On successful sign-in: stay on the same page, close the AuthModal, show a success toast (“Signed in”).

On successful sign-up: keep user on the same page, show “Check your email to verify” toast, modal stays open only if we need to communicate anything else; otherwise close.

First login after email verification: if profiles.onboarding_completed === false, open the onboarding flow (modal or dedicated /onboarding) without hard-redirecting away from current context; otherwise just load profile and continue.

Returning users: no redirect; just hydrate profile → show avatar button.

Global rule: never navigate on auth unless we must (e.g., user explicitly clicks “Go to dashboard”).

2) Profile Data & Database Integration

Table: public.profiles with primary key id (uuid) matching auth.uid().

Columns (present): id, created_at, updated_at, email, name, image, tier, onboarding_completed, age, weight_lbs, weight_kgs, height_inches, height_centimeters, gender, fitness_goal, activity_level, dietary_preferences (text[]), allergies (text[]), bmr, tdee, calorie_target, macros (jsonb), subscription_id, subscription_status, subscription_end_date, ai_generations_used, ai_generations_reset.

RLS (active) suggested policies:

SELECT: auth.uid() = id

INSERT: auth.uid() = id

UPDATE: auth.uid() = id

Initialize/create:

On SIGNED_IN, call initializeProfile(user.id) → if no row, createProfile({ id: user.id, email: user.email, name: user.user_metadata?.name ?? '' , tier: 'free', onboarding_completed: false }).

Chrome “hang” risks: avoid any loops where auth listener calls initializeProfile, which writes, which retriggers state; ensure idempotence and guard flags.

3) Error Handling & Edge Cases

Auth user without profile: auto-create minimal profile once; if creation fails, show toast “Profile setup failed—please retry” and keep user signed in.

Network failures: show toast “Network error. Check connection and retry.” Keep form enabled with Retry button; never clear email, clear password only on Supabase auth errors.

Email not verified (attempted sign-in): if Supabase returns “email not confirmed”, show inline hint + “Resend verification email” action.

Sign-up with existing email: show “Account already exists—try Sign in or Reset password.”

Session expiry during use: rely on Supabase silent refresh; if SIGNED_OUT is emitted, clear profile and open AuthModal in signin mode with “Your session expired, please sign in again.”

4) UI/UX Positioning & Visual Design

Placement: Sign In button (or user avatar) fixed top-4 right-4 on mobile and desktop.

Avatar replaces Sign In: yes, same position.

Loading states:

While auth/profile initializing: show subtle spinner in the button location.

Buttons show disabled + spinner during requests.

Modal mechanics:

Backdrop click and top-right “×” close.

ESC closes.

Close on successful sign-in; on sign-up show verification toast then close.

Form styling: Tailwind + @tailwindcss/forms, clear focus ring (focus:ring), visible caret, no odd persistent styles, consistent spacing.

Toasts: small top-right toasts via your preferred lib or a minimal custom component.

5) Testing & Validation Strategy

Test accounts: create at least 2: verified_user@… (verified) and pending_user@… (not verified).

Browsers: test fresh (no session), cached (existing session), private windows, and at least Chrome + Safari.

Scenarios:

Sign-up → verification email → first login → profile auto-create → onboarding gate.

Wrong password, existing email on sign-up, unverified sign-in, network offline mid-request, session expiry.

Logging: console.info for auth events in dev; in prod keep minimal logging, surface user-friendly errors only.

Telemetry (optional): if we add later, log auth funnel events (opened modal, submit, success/failure reasons).

Materials to Provide Next

Supabase Configuration

Current profiles schema export (SQL).

Exact RLS policies (SQL).

Any triggers (e.g., updated_at auto-update).

Confirm email confirmations enabled in Supabase auth settings.

Profile Store Code

useProfileStore (entire file).

initializeProfile + createProfile implementations.

Any selectors/helpers (e.g., canUseAI, getRemainingAI).

Auth UI

Current AuthModal and AuthForm code (as they exist now).

The component that toggles the modal (UserProfileButton or equivalent).

Env & Client Setup

lib/supabaseClient.js (with anon key redacted).

Current VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel/Vite env (just confirm they’re present—don’t paste keys).

Design/UX Preferences

Any brand colors/typography choices (even rough).

Whether we use a toast library and which one (or roll a tiny custom).

Animation tolerance (subtle vs lively).