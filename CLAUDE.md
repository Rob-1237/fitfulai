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