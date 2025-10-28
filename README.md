# FitfulAI

A modern React application with Vite and Firebase, featuring AI-powered personalized meal planning, workout generation, and smart grocery list management.

## Features

- **Modern React Stack**: Built with React 19 and Vite for lightning-fast development
- **Firebase Integration**: Authentication and Firestore database for secure, scalable data management
- **AI-Powered Planning**: OpenAI integration with parallel generation for intelligent meal and workout suggestions
- **Personalized Onboarding**: 5-step wizard collecting fitness goals, dietary preferences, and physical stats
- **Responsive Design**: Mobile-first approach with Tailwind CSS and adaptive navigation
- **State Management**: Zustand for predictable and scalable state handling

## Tech Stack

- **Frontend**: React 19.1.1 with Vite 7.1.2
- **Database & Auth**: Firebase 12.2.1 (Auth + Firestore)
- **Routing**: React Router DOM 7.8.2
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4.1.12 + Radix UI + FontAwesome Pro
- **AI Integration**: OpenAI API 5.16.0 with parallel generation and intelligent caching
- **Animation**: Framer Motion 12.23.12
- **Icons**: Lucide React + FontAwesome Pro Duotone
- **Linting**: ESLint 9.33.0

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (with Firestore enabled)
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd fitfulai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory with your Firebase and OpenAI configurations:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/             # React components
│   ├── ui/                # Base UI components (Modal, Button, LoadingSpinner, etc.)
│   ├── nav/               # Navigation components (TopNav, Sidebar, BottomTabBar)
│   ├── auth/              # Authentication components (AuthModal, SimpleAuthForm)
│   ├── onboarding/        # 5-step onboarding wizard and steps
│   ├── content/           # Page content components (Workouts, Meals, Groceries)
│   └── generation/        # AI generation progress modals
├── pages/                 # Page-level components
│   ├── dashboard/         # Dashboard page with pre/post-onboarding states
│   ├── workouts/          # Workouts page
│   ├── meals/             # Meals page
│   ├── groceries/         # Groceries page
│   └── home/              # Home/landing page
├── lib/                   # Core utilities and configurations
│   ├── firebase.js        # Firebase configuration (Auth + Firestore)
│   ├── openai.js          # OpenAI API integration
│   ├── parallelGenerator.js # Parallel AI generation orchestrator
│   ├── workoutGenerator.js  # Workout plan AI generation
│   ├── mealGenerator.js     # Meal plan AI generation
│   ├── groceryGenerator.js  # Grocery list AI generation
│   ├── firestoreQueries.js  # Firestore CRUD operations
│   └── aiCache.js         # AI response caching system
├── stores/                # Zustand stores
│   └── useUIStore.js      # UI state management (theme, modals, mobile)
├── hooks/                 # Custom React hooks
│   └── useAuth.js         # Authentication hook with Firebase integration
├── styles/                # Global styles and themes
│   └── App.css            # Main application styles
└── assets/                # Static assets (images, fonts, etc.)
```

## Key Features Implementation

### Authentication Flow
- Firebase Auth with email/password authentication
- Automatic user document creation in Firestore on signup
- Persistent sessions with automatic token refresh
- Protected routes based on onboarding completion status
- User profile dropdown with logout functionality

### AI Integration
- **Parallel Generation**: Workouts and meals generate simultaneously for faster UX
- **Intelligent Caching**: Multi-layer caching system to minimize OpenAI API costs
- **Progress Tracking**: Real-time generation progress with step-by-step updates
- **Smart Prompts**: Optimized prompt engineering for workout plans, meal plans, and grocery lists
- **User Context**: Personalized generation based on onboarding data (age, weight, goals, dietary preferences)
- **Cost Tracking**: AI usage monitoring per user with generation limits

### Onboarding System
- 5-step wizard with progress tracking
- Auto-save to localStorage (prevents data loss)
- Client-side BMR/TDEE/macro calculations (Mifflin-St Jeor formula)
- Imperial/metric unit conversion support
- Validation and error handling per step
- Review step shows calculated metrics before AI generation

### State Management
- Zustand stores for UI state (theme, modals, mobile detection)
- Custom useAuth hook for authentication state
- Firebase onAuthStateChanged for persistent sessions
- Firestore real-time listeners for data updates

## Environment Setup

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

## Development Workflow

1. **Feature Development**: Create feature branches for new functionality
2. **State Management**: Use Zustand stores for UI state, useAuth hook for auth state
3. **Component Development**: Follow the established component patterns (see Project Structure)
4. **Firebase Integration**: Use `firestoreQueries.js` for all Firestore operations
5. **AI Generation**: Use generator functions in `lib/` for AI features
6. **Linting**: Run `npm run lint` before commits
7. **Testing**: Manual testing in dev mode (automated tests to be implemented)

## Deployment

The application is built for static deployment and can be hosted on:
- Vercel (recommended for React + Vite)
- Netlify
- Firebase Hosting (integrates well with Firebase backend)
- Any static hosting service

**Build Configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

**Required Environment Variables** (set in hosting platform):
- All `VITE_FIREBASE_*` variables from `.env`
- `VITE_OPENAI_API_KEY`

**Firebase Setup:**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password provider)
3. Enable Firestore Database
4. Add web app to get configuration values
5. Set up Firestore security rules (see Firebase console)

___________________



  🧹 How to Reset Your User Data for Fresh Onboarding Testing

  Option A: Reset via Firebase Console (Recommended)

  1. Go to https://console.firebase.google.com/
  2. Select your FitfulAI project
  3. Navigate to Firestore Database
  4. Find your user profile in the profiles collection
  5. Click on your profile document (your uid)
  6. Change onboardingCompleted: true → onboardingCompleted: false
  7. Optional: Clear all onboarding fields to test from scratch:
    - Set age, weightLbs, heightInches, gender, fitnessGoal, activityLevel to null
    - Clear dietaryPreferences and allergies arrays
  8. Delete existing generated data (optional for clean test):
    - Go to workouts collection → delete documents with your userId
    - Go to meals collection → delete documents with your userId
    - Go to groceries collection → delete documents with your userId

  Option B: Clear via Browser Console (Quick Method)

  1. Open your app in the browser
  2. Open browser console (F12 or Cmd+Option+I)
  3. Run this command:
  // This will clear localStorage draft and you can manually update Firestore
  localStorage.removeItem('onboarding_draft');
  console.log('Onboarding draft cleared');
  4. Then manually update your Firestore profile onboardingCompleted to false via Firebase Console (Option A, steps 1-6)

  Option C: Clear localStorage Only (Test Auto-Recovery)

  If you want to test the localStorage recovery feature specifically:
  1. Open browser console
  2. Run: localStorage.clear() or localStorage.removeItem('onboarding_draft')
  3. Refresh the page
  4. Your Firestore profile will still have data, but localStorage draft will be gone

  ---
  📋 Day 6-7: Onboarding End-to-End Testing Instructions

  Pre-Test Setup:

  1. ✅ Reset your user data using Option A above
  2. ✅ Clear localStorage: Run localStorage.clear() in console
  3. ✅ Open Firebase Console in another tab to monitor Firestore updates in real-time
  4. ✅ Keep browser console open to watch for errors and calculation logs
  5. ✅ Have a notepad ready to record test results

  ---
  🧪 Test Suite

  TEST 1: All 5 Steps with Various Data Inputs

  Goal: Verify all form fields work, validation triggers, navigation functions

  Step 1 - Basic Info Test

  Navigate to app → Click "Get Started"

  Test Inputs:
  - Age: Try invalid (e.g., "15", "-5", "150") → should show error
  - Age: Valid (e.g., "30")
  - Gender: Select each option (Male, Female, Other)
  - Units Preference: Toggle between Imperial/Metric
    - Watch form fields change units dynamically

  Expected Results:
  - ✅ Age validation prevents out-of-range values
  - ✅ Gender radio buttons selectable
  - ✅ Units toggle switches between lbs/kg and ft/cm
  - ✅ "Next" button enabled only when all required fields filled
  - ✅ Console logs: 💾 Auto-saving onboarding data to localStorage

  Verify localStorage:
  JSON.parse(localStorage.getItem('onboarding_draft'))
  // Should show: { age: 30, gender: 'male', unitsPreference: 'imperial', currentStep: 1 }

  ---
  Step 2 - Physical Stats Test

  Click "Next"

  Test Inputs (Imperial):
  - Height: "5 feet 10 inches"
  - Weight: "180 lbs"

  Test Inputs (Metric - toggle units):
  - Height: "178 cm"
  - Weight: "82 kg"

  Test Unit Conversion:
  - Enter height in Imperial → Toggle to Metric → Verify conversion accuracy
  - Enter weight in Metric → Toggle to Imperial → Verify conversion accuracy

  Expected Results:
  - ✅ Unit conversion is accurate (1 inch = 2.54 cm, 1 lb = 0.453592 kg)
  - ✅ Form updates dynamically when toggling units
  - ✅ Negative numbers rejected
  - ✅ "Next" button enabled when fields valid
  - ✅ Console: localStorage auto-save triggered

  Verify localStorage:
  JSON.parse(localStorage.getItem('onboarding_draft'))
  // Should include: heightFeet, heightInches, weightLbs OR heightCm, weightKg

  ---
  Step 3 - Fitness Goals Test

  Click "Next"

  Test Inputs:
  - Fitness Goal: Try each option:
    - Weight Loss
    - Muscle Gain
    - Maintenance
    - Athletic Performance
  - Activity Level: Try each option:
    - Sedentary
    - Lightly Active
    - Moderately Active
    - Very Active
    - Extremely Active

  Expected Results:
  - ✅ Radio buttons work for all options
  - ✅ Descriptions display correctly for each selection
  - ✅ "Next" button enabled when both selected
  - ✅ localStorage auto-saves selections

  ---
  Step 4 - Dietary Preferences Test

  Click "Next"

  Test Inputs:
  - Dietary Preferences: Select multiple (e.g., "Vegetarian", "High Protein", "Low Carb")
  - Allergies: Add multiple (e.g., "Peanuts", "Shellfish", "Dairy")
  - Meal Preferences: Select preferences (e.g., "Quick Meals", "Batch Cooking")

  Test Multi-Select:
  - Select and deselect items
  - Verify visual feedback (checkboxes/pills)

  Expected Results:
  - ✅ Multiple selections allowed
  - ✅ Can deselect items
  - ✅ Arrays stored correctly in localStorage
  - ✅ "Next" button enabled (not required to select anything)

  Verify localStorage:
  JSON.parse(localStorage.getItem('onboarding_draft'))
  // Should show arrays: dietaryPreferences: ['vegetarian', 'high-protein'], allergies: ['peanuts']

  ---
  Step 5 - Review & Generate Test

  Click "Next"

  Review Screen Should Display:
  - ✅ Summary card showing all entered data
  - ✅ BMR calculation displayed
  - ✅ TDEE calculation displayed
  - ✅ Calorie target displayed
  - ✅ Macro breakdown (Protein/Carbs/Fat grams & percentages)

  Expected on this screen:
  - ✅ All previous data visible
  - ✅ "Edit" buttons for each section to go back
  - ✅ "Generate My Plans" button enabled

  ---
  TEST 2: BMR/TDEE/Macro Calculations Accuracy

  Manual Calculation Verification:

  Using the data from Test 1, manually calculate and compare:

  BMR Calculation (Mifflin-St Jeor Equation)

  For Males:
  BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5

  For Females:
  BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

  Example Test Case:
  - Age: 30, Male, 180 lbs (81.65 kg), 5'10" (177.8 cm)
  - Expected BMR: (10 × 81.65) + (6.25 × 177.8) - (5 × 30) + 5 = 816.5 + 1111.25 - 150 + 5 = 1782.75

  TDEE Calculation (BMR × Activity Multiplier)

  | Activity Level    | Multiplier |
  |-------------------|------------|
  | Sedentary         | 1.2        |
  | Lightly Active    | 1.375      |
  | Moderately Active | 1.55       |
  | Very Active       | 1.725      |
  | Extremely Active  | 1.9        |

  Example: BMR 1783 × Moderately Active (1.55) = TDEE: 2763

  Calorie Target (Based on Fitness Goal)

  | Goal                 | Adjustment |
  |----------------------|------------|
  | Weight Loss          | TDEE - 500 |
  | Muscle Gain          | TDEE + 300 |
  | Maintenance          | TDEE       |
  | Athletic Performance | TDEE + 200 |

  Example: Weight Loss = 2763 - 500 = Target: 2263 cal

  Macro Breakdown

  Default ratios (should vary by goal):
  - Protein: 30% → (2263 × 0.30) / 4 = 169g
  - Carbs: 40% → (2263 × 0.40) / 4 = 226g
  - Fat: 30% → (2263 × 0.30) / 9 = 75g

  Testing Instructions:
  1. ✅ Compare your manual calculations with app display
  2. ✅ Check console for calculation logs (should show formulas)
  3. ✅ Verify rounding is reasonable (no weird decimals like 1782.7543234)
  4. ✅ Test with different combinations:
    - Female + Weight Loss + Sedentary
    - Male + Muscle Gain + Very Active
    - Other + Maintenance + Lightly Active

  Expected Results:
  - ✅ Calculations match manual formulas within ±5 calories (rounding acceptable)
  - ✅ Macros add up to calorie target (allow ±10 cal for rounding)

  ---
  TEST 3: localStorage Auto-Save and Recovery

  Test Auto-Save (Debounced):

  1. Start onboarding from Step 1
  2. Enter age "25"
  3. Wait 1 second (750ms debounce)
  4. Check console: Should see 💾 Auto-saving onboarding data to localStorage
  5. Check localStorage:
  JSON.parse(localStorage.getItem('onboarding_draft'))
  // Should show: { age: 25, lastSaved: [timestamp], currentStep: 1 }
  6. Change age to "30"
  7. Wait 1 second → Check localStorage again → Should update

  Expected Results:
  - ✅ Auto-save triggers 750ms after input stops
  - ✅ lastSaved timestamp updates
  - ✅ No save on initial load (only after user input)

  Test Recovery:

  1. Fill out Steps 1-3 completely (age, gender, units, height, weight, goals, activity)
  2. Verify localStorage has all data:
  const draft = JSON.parse(localStorage.getItem('onboarding_draft'));
  console.log('Saved step:', draft.currentStep); // Should be 3 or 4
  3. Close the onboarding modal (X button or close)
  4. Refresh the browser page (Cmd+R or F5)
  5. Click "Get Started" again

  Expected Results:
  - ✅ Modal shows prompt: "We found a saved draft. Would you like to continue where you left off?"
  - ✅ If you click "Continue" → Jumps to saved currentStep
  - ✅ All form fields pre-populated with saved data
  - ✅ If you click "Start Over" → Clears localStorage, starts at Step 1

  Test Draft Expiration:

  1. Fill out some steps
  2. Manually set lastSaved to old timestamp:
  const draft = JSON.parse(localStorage.getItem('onboarding_draft'));
  draft.lastSaved = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
  localStorage.setItem('onboarding_draft', JSON.stringify(draft));
  3. Refresh page → Open onboarding

  Expected Results:
  - ✅ Draft older than 7 days should be ignored/cleared
  - ✅ Starts fresh from Step 1

  ---
  TEST 4: AI Generation Trigger from Review Step

  Pre-Test Check:
  - Verify OpenAI API key is set in .env file
  - Check Firebase Console → Your profile → aiGenerationsUsed count

  Test Flow:
  1. Complete Steps 1-5 with valid data
  2. On Review Step, verify all data displayed correctly
  3. Click "Generate My Plans" button

  Watch for:
  - ✅ Button shows loading state: "Generating..."
  - ✅ Button disabled during generation
  - ✅ GenerationProgressModal opens immediately
  - ✅ Modal shows progress indicators:
    - "Generating workout plan..."
    - "Generating meal plan..."
    - "Generating grocery list..."
  - ✅ Console logs show API calls:
  🤖 Starting AI generation...
  📊 User profile data: {...}
  🏋️ Generating workout plan...
  🍽️ Generating meal plan...
  🛒 Generating grocery list...

  Expected Results:
  - ✅ Generation completes without errors (may take 30-60 seconds)
  - ✅ Progress modal shows completion: "Your plans are ready!"
  - ✅ Modal auto-closes after 2 seconds
  - ✅ Onboarding modal closes
  - ✅ User redirected to Dashboard page
  - ✅ Toast notification: "Onboarding complete! Your plans are ready."

  Check Console for Errors:
  - ❌ If API key missing: "OpenAI API key not configured"
  - ❌ If API quota exceeded: "API quota exceeded"
  - ❌ If network error: Check Firebase/OpenAI connection

  ---
  TEST 5: Profile Data Saves to /profiles/{uid} Correctly

  During Generation (Real-Time Monitoring):
  1. Open Firebase Console → Firestore → profiles collection → Your user document
  2. Keep this tab visible while testing
  3. When you click "Generate My Plans", watch Firestore update live

  Expected Firestore Updates:
  // Profile document should update with:
  {
    // Basic info
    age: 30,
    gender: 'male',
    unitsPreference: 'imperial',

    // Physical stats
    heightInches: 70,
    heightCentimeters: 177.8,
    weightLbs: 180,
    weightKgs: 81.65,

    // Fitness goals
    fitnessGoal: 'weight_loss',
    activityLevel: 'moderately_active',

    // Dietary preferences
    dietaryPreferences: ['vegetarian', 'high-protein'],
    allergies: ['peanuts'],
    mealPreferences: ['quick-meals'],

    // Calculations (should be present)
    bmr: 1783,
    tdee: 2763,
    calorieTarget: 2263,
    macros: {
      protein: { grams: 169, percentage: 30 },
      carbs: { grams: 226, percentage: 40 },
      fat: { grams: 75, percentage: 30 }
    },

    // Status
    onboardingCompleted: true,  // ⭐ KEY FIELD
    updatedAt: [Firebase Timestamp],

    // AI tracking
    aiGenerationsUsed: 1  // Should increment
  }

  Verification Steps:
  1. ✅ All onboarding fields saved correctly
  2. ✅ Unit conversions stored (both imperial AND metric values)
  3. ✅ onboardingCompleted changed from false → true
  4. ✅ updatedAt timestamp is recent
  5. ✅ aiGenerationsUsed incremented by 1
  6. ✅ No null values for required fields

  Check Generated Data Collections:

  Workouts Collection:
  // Query: workouts where userId == your_uid
  {
    userId: 'your_uid',
    name: 'Weight Loss Workout Program',
    type: 'generated',
    weeks: [...],  // Should have 4-12 weeks
    createdAt: [timestamp]
  }

  Meals Collection:
  // Query: meals where userId == your_uid
  {
    userId: 'your_uid',
    name: 'Week 1 Meal Plan',
    type: 'generated',
    days: [...],  // Should have 7 days
    calorieTarget: 2263,
    createdAt: [timestamp]
  }

  Groceries Collection:
  // Query: groceries where userId == your_uid
  {
    userId: 'your_uid',
    name: 'Week 1 Grocery List',
    type: 'generated',
    items: [...],  // Should have grocery items
    mealPlanId: 'meal_plan_id',
    createdAt: [timestamp]
  }

  Expected Results:
  - ✅ 1 workout plan document created
  - ✅ 1+ meal plan documents created
  - ✅ 1+ grocery list documents created
  - ✅ All documents have correct userId
  - ✅ Timestamps are recent and match

  ---
  🐛 Known Issues to Watch For (Report if Found)

  1. Calculation Errors: BMR/TDEE/Macros don't match manual calculation
  2. Unit Conversion Bugs: Toggling units produces incorrect conversions
  3. localStorage Not Saving: Auto-save doesn't trigger after 750ms
  4. Draft Recovery Fails: Refresh doesn't restore saved data
  5. Validation Issues: Can proceed with invalid data
  6. Generation Hangs: Progress modal stuck on one step
  7. Firestore Write Fails: Profile not updating in Firebase
  8. Missing Data: Some fields null after onboarding completes
  9. Navigation Bugs: Can't go back to previous steps to edit
  10. UI Glitches: Modal doesn't close after completion

  ---
  📊 Test Results Template

  Copy this to your notepad and fill in as you test:

  DAY 6-7 ONBOARDING TESTING RESULTS
  Date: [DATE]
  Tester: [YOUR NAME]

  ---

  TEST 1: All 5 Steps with Various Data Inputs
  Step 1 - Basic Info: ✅ PASS / ❌ FAIL
    Notes:

  Step 2 - Physical Stats: ✅ PASS / ❌ FAIL
    Notes:

  Step 3 - Fitness Goals: ✅ PASS / ❌ FAIL
    Notes:

  Step 4 - Dietary Preferences: ✅ PASS / ❌ FAIL
    Notes:

  Step 5 - Review & Generate: ✅ PASS / ❌ FAIL
    Notes:

  ---

  TEST 2: BMR/TDEE/Macro Calculations
  App BMR: [VALUE] | Manual BMR: [VALUE] | Match: ✅ / ❌
  App TDEE: [VALUE] | Manual TDEE: [VALUE] | Match: ✅ / ❌
  App Calorie Target: [VALUE] | Manual Target: [VALUE] | Match: ✅ / ❌
  Macros Accurate: ✅ PASS / ❌ FAIL
    Notes:

  ---

  TEST 3: localStorage Auto-Save and Recovery
  Auto-save triggers: ✅ PASS / ❌ FAIL
  Draft recovery works: ✅ PASS / ❌ FAIL
  Draft expiration works: ✅ PASS / ❌ FAIL
    Notes:

  ---

  TEST 4: AI Generation Trigger
  Generation started: ✅ PASS / ❌ FAIL
  Progress modal displayed: ✅ PASS / ❌ FAIL
  Generation completed: ✅ PASS / ❌ FAIL
  Redirect to dashboard: ✅ PASS / ❌ FAIL
    Time to complete: [XX seconds]
    Notes:

  ---

  TEST 5: Profile Data Saves to Firestore
  All fields saved correctly: ✅ PASS / ❌ FAIL
  onboardingCompleted = true: ✅ PASS / ❌ FAIL
  Workout plan created: ✅ PASS / ❌ FAIL
  Meal plans created: ✅ PASS / ❌ FAIL
  Grocery lists created: ✅ PASS / ❌ FAIL
    Notes:

  ---

  CRITICAL BUGS FOUND:
  1.
  2.
  3.

  MINOR ISSUES:
  1.
  2.

  OVERALL RESULT: ✅ PASS / ❌ FAIL

  ---
  Once you complete testing, share your results and I'll help fix any issues discovered. Good luck! 🚀