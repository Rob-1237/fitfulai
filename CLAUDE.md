# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Project Architecture

This is a React application built with Vite that integrates with Firebase/Firestore as the backend service.

### Tech Stack
- **Frontend**: React 19.1.1 with JSX
- **Build Tool**: Vite 7.1.2 with HMR
- **Backend**: Firebase (authentication and Firestore database)
- **Routing**: React Router DOM v6
- **Linting**: ESLint with React Hooks and React Refresh plugins

### Project Structure
- `src/main.jsx` - Application entry point using React 19's createRoot
- `src/App.jsx` - Main application component with routing and authentication
- `src/lib/firebase.js` - Firebase client configuration
- `src/components/auth/` - Authentication components
- `vite.config.js` - Vite configuration with React plugin
- `eslint.config.js` - ESLint configuration using flat config format

### Firebase Integration
The application uses Firebase as its backend service with:
- **Firebase Auth** - User authentication and management
- **Firestore** - NoSQL database for user data, workouts, meals, and grocery lists
- **Environment variables** - Firebase configuration stored in `.env`

### Data Structure (Migrated from Supabase)
**Firestore Collections:**
```
/users/{uid} - User profiles and settings
├── workouts/ - User's workout plans (subcollection)
├── meals/ - User's meal plans (subcollection)
└── groceryLists/ - User's grocery lists (subcollection)
/aiCache/{cacheId} - Global AI response cache with TTL
```

**Key Data Fields:**
- User profiles include physical stats, fitness goals, dietary preferences
- Complex JSON structures for exercises, ingredients, nutrition data
- AI usage tracking and generation limits per user
- Cross-plan relationships (meals sync with workouts, grocery lists link to meal plans)

### Authentication Flow
- Email/password signup with Firebase Auth
- Automatic user document creation in Firestore on first login
- Dashboard-centric onboarding (5-step wizard for new users)
- Conditional dashboard view based on `onboarding_completed` flag

### Environment Setup
Firebase configuration stored in `.env` file (not tracked in git):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Code Style Notes
- Uses modern React patterns with hooks (useState, useEffect)
- ESLint configured with React-specific rules and unused variable checking
- Uses ES modules throughout the codebase


___

Complex Data Requirements:
  - 5 interconnected tables with rich JSON structures
  - User profiles with calculated metrics (BMR, TDEE, macros)
  - AI usage tracking and response caching
  - Cross-plan relationships between workouts, meals, and grocery lists

  Firebase Architecture Recommendations:
  - User-centric subcollections for data isolation
  - Firestore's document structure handles existing JSON fields well
  - Security rules replace Supabase RLS policies
  - Cloud Functions for AI usage tracking and cache cleanup

  Critical Migration Priorities:
  1. Complete React Router implementation first
  2. Set up Firebase Auth with user document creation
  3. Implement dashboard-based onboarding flow
  4. Migrate complex profile data structure with calculations
  5. Build AI generation and caching system

  Good idea for calculated metrics, mixed for interconnected data.

  Client-Side Calculations (Good ✅)

  BMR/TDEE/Macros calculations:
  - Simple formulas based on age, weight, height, activity level
  - No server resources needed
  - Instant updates when user changes profile data
  - Easier to maintain and debug

  Benefits:
  - Reduced Firestore reads/writes
  - Better performance (no API calls for calculations)
  - Real-time preview during onboarding
  - Simpler Firebase Functions setup

⏺ Interconnected Data (Mixed 🟡)

  Handle in app:
  - Cross-referencing workout/meal sync IDs
  - Generating grocery lists from meal plans
  - Real-time UI updates

  Keep in Firestore:
  - Data relationships for querying (meal dates, workout schedules)
  - AI usage tracking (needs persistence)
  - User progress history

  Recommended approach:
  - Store raw data in Firestore (exercises, ingredients, preferences)
  - Calculate derived values client-side (BMR, macro ratios, grocery aggregation)
  - Use Zustand/React state for real-time interconnections
  - Sync calculated results back to Firestore only when needed

⏺ This approach will significantly simplify your Firebase setup and reduce costs while maintaining the rich functionality you had with Supabase.

Looking at your current state, I'd recommend perfecting the login first. Here's why:

  Current Priority: Complete Authentication Flow

  You already have:
  - src/lib/firebase.js - Firebase config
  - src/components/auth/SimpleAuthForm.jsx - Basic auth form
  - src/hooks/useAuth.js - Modified auth hook

  Missing pieces:
  - Firebase Auth integration in useAuth hook
  - User document creation on signup
  - Proper authentication state management
  - Route protection

  Why Login First > Schemas

  1. Foundation dependency - Everything else depends on working auth
  2. User testing - You need auth working to test the app flow
  3. Schema iteration - You'll refine schemas as you build features

  Recommended next steps:
  1. Complete Firebase Auth integration in useAuth.js
  2. Test signup/signin flow
  3. Add user document creation
  4. Then move to React Router migration
  5. Finally build schemas as you implement features

  ___

  Pending Tasks:
     - Create content for pre-onboarded pages (marketing/preview content)
     - Create content for post-onboarded pages (actual user data displays)
     - Connect AI API for plan generation
     - Implement AI calculations and display logic
     - Build Edit Profile and Settings functionality in user dropdown

  

  9. Optional Next Step:
     Based on my analysis of the user's roadmap, the logical next step would be to define the data structures for workouts, meals, and groceries before creating content. The user stated: "I will share my todo thoughts. Please highlight any gaps, sequence issues, or missing pieces as you 
  analyze and make suggestions for moving forward" and I identified that "Data Structure Planning" was a critical missing piece that should come before content creation. However, since this was just an analysis request and the user hasn't explicitly chosen to proceed with any specific task, 
  I should wait for their direction on which recommendation to implement first..
  Please continue the conversation from where we left it off without asking the user any further questions. Continue with the last task that you were asked to work on.

  ___

  ## CrewAI vs. Parallel Generator code

  Looking at your parallelGenerator.js, here's how it compares to CrewAI's multi-agent approach:

  Similarities ✓

  Orchestration Pattern: Both coordinate multiple specialized tasks toward a single goal
  - Your code: Orchestrates meal plan + grocery list generation
  - CrewAI: Coordinates multiple AI agents with defined roles

  Task Dependencies: Both handle sequential and parallel execution
  - Your code: Grocery list waits for meal plan (line 62: await mealPlanPromise)
  - CrewAI: Agents can work sequentially or pass context between tasks

  Error Handling: Both implement retry logic and graceful degradation
  - Your code: retryFailedGenerations() with configurable attempts
  - CrewAI: Agents can retry or delegate tasks when they fail

  Key Differences ✗

  Intelligence Level:
  - Your code: "Dumb" orchestration - just manages async calls and retries
  - CrewAI: Agents actively reason, delegate, and adjust strategies

  Communication:
  - Your code: One-way data flow (meal plan → grocery list)
  - CrewAI: Agents collaborate bidirectionally, share context

  Autonomy:
  - Your code: Fixed workflow defined in code
  - CrewAI: Agents can change approach based on results

  Your Pattern: Parallel Task Orchestrator (like Promise.all with smart retry logic)
  CrewAI Pattern: Autonomous Agent Collaboration (like a team of specialists problem-solving together)

  Your approach is simpler and more predictable - perfect for well-defined workflows like "generate meal plan, then
  groceries." CrewAI shines when you need adaptive reasoning and complex inter-agent collaboration.


  ## CrewAI would be overkill for this project. Here's why:

  Your Current Needs Are Simple

  What you're doing:
  - User profile → AI generates meal plan
  - Meal plan → AI generates grocery list
  - Both are single-shot generations with clear inputs/outputs

  What you already have:
  - Parallel orchestration ✓
  - Progress tracking ✓
  - Retry logic ✓
  - Error handling ✓

  When CrewAI Would Make Sense

  You'd need CrewAI if you were doing things like:

  ❌ "Research Agent" + "Meal Planner Agent" + "Nutritionist Agent"
  → Where agents debate and refine meal plans through multiple rounds

  ❌ Adaptive workflows
  → "If nutrition check fails, delegate to macro calculator agent"

  ❌ Complex user requests
  → "Plan meals that work with my schedule, budget, and local grocery stores"

  Your Workflow is Linear

  User Profile → Meal Plan → Grocery List
       ↓             ↓            ↓
    (one call)   (one call)   (done)

  No back-and-forth needed. No strategic decisions between steps.

  Cost & Complexity Trade-off

  - Your approach: 2 API calls, predictable cost, easy to debug
  - CrewAI approach: Multiple agent calls, higher token usage, harder to trace

  Bottom line: Stick with your current pattern. It's efficient, maintainable, and fits your use case perfectly.
  You'd only consider CrewAI if you were building something like "AI fitness coach that adapts training based on
  workout feedback and injury history" - where you need real agent collaboration.


  ## Here are three website projects where CrewAI actually makes sense:

  1. AI Content Marketing Studio

  What it does: User provides a topic → generates full content strategy

  The Agents:
  - Research Agent: Analyzes trending topics, competitor content, SEO keywords
  - Strategy Agent: Reviews research, decides content angles and formats
  - Writer Agent: Creates articles based on strategy
  - Editor Agent: Reviews for tone, accuracy, suggests improvements

  Why CrewAI?
  - Editor can send content back to Writer for revisions
  - Strategy Agent adapts based on what Research Agent finds
  - Agents collaborate on final approval

  Your current approach: Would just call 4 APIs in sequence (no real collaboration)

  ---
  2. Smart Job Application Assistant

  What it does: User uploads resume + job posting → tailored application package

  The Agents:
  - Job Analyzer: Extracts key requirements, company culture, must-have skills
  - Gap Analyst: Compares resume to job, identifies weaknesses/strengths
  - Resume Optimizer: Rewrites bullet points to match job keywords
  - Cover Letter Writer: Creates personalized letter highlighting matches

  Why CrewAI?
  - Gap Analyst tells Resume Optimizer which sections to emphasize
  - Cover Letter Writer asks Job Analyzer for company-specific details
  - Resume Optimizer can query Gap Analyst: "Should I highlight X or Y skill more?"

  Your current approach: Would miss the nuanced back-and-forth optimization

  ---
  3. Technical Documentation Generator

  What it does: Analyzes codebase → creates comprehensive docs

  The Agents:
  - Code Explorer: Scans repo structure, identifies key files/patterns
  - API Documenter: Generates API reference from code
  - Tutorial Writer: Creates getting-started guides
  - QA Reviewer: Tests examples, flags errors, requests clarification

  Why CrewAI?
  - QA finds broken example → Tutorial Writer fixes it → QA re-checks
  - Tutorial Writer asks Code Explorer: "Is there a simpler example of auth?"
  - API Documenter delegates complex sections to Tutorial Writer for elaboration

  Your current approach: Would generate docs without verification loop

  ---
  The Pattern You'll Notice

  All three have feedback loops and agent-to-agent questions:
  - "Is this good enough or should I revise?"
  - "What did you find that I should know about?"
  - "Can you elaborate on this part I'm working on?"

  Your meal planner doesn't need this - it's just "make meal plan" → "make grocery list" → done. No revision, no
  questions, no adaptive collaboration.
