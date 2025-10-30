"Logs on load:"
```
react-dom_client.js?v=18891b23:17995 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
App.jsx:24 🚀 App state: {isInitialized: false, isDark: false, isMobile: false, modals: {…}}
App.jsx:43 ⏳ App not initialized yet, showing loading screen
AuthContext.jsx:202 🚀 AuthProvider: Setting up auth state listener...
App.jsx:24 🚀 App state: {isInitialized: false, isDark: false, isMobile: false, modals: {…}}
App.jsx:43 ⏳ App not initialized yet, showing loading screen
AuthContext.jsx:205 🔄 AuthProvider: Auth state changed: {userExists: false, uid: undefined, email: undefined, displayName: undefined, emailVerified: undefined}
AuthContext.jsx:233 🚫 AuthProvider: User not authenticated, clearing profile
AuthContext.jsx:238 🔄 AuthProvider: Auth state processing complete, loading set to false
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false

```

"Logs after sign up:"
```
TopNavigation.jsx:23 🔝 Opening auth modal
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false
SimpleAuthForm.jsx:15 📋 FORM SUBMISSION STARTED
SimpleAuthForm.jsx:16 📋 Form mode: signup
SimpleAuthForm.jsx:17 📋 Form data: {email: 'rchambers1237@gmail.com', emailValid: true, passwordLength: 11, name: 'rov', nameLength: 3}
SimpleAuthForm.jsx:30 ✅ Running form validation...
SimpleAuthForm.jsx:54 📝 Processing signup...
SimpleAuthForm.jsx:68 📝 All validation passed, calling signUp function...
AuthContext.jsx:256 📝 SIGNUP ATTEMPT STARTED
AuthContext.jsx:257 📝 signUp called with: {email: 'rchambers1237@gmail.com', emailLength: 23, passwordLength: 11, name: 'rov', nameLength: 3}
AuthContext.jsx:272 📝 Creating Firebase Auth user...
AuthContext.jsx:205 🔄 AuthProvider: Auth state changed: {userExists: true, uid: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', displayName: null, emailVerified: false}
AuthContext.jsx:216 👤 AuthProvider: User is authenticated, fetching profile...
AuthContext.jsx:220 🔍 AuthProvider: Fetching user profile...
AuthContext.jsx:117 🔍 fetchUserProfile called for uid: dpOouzW1Q4VcLh2k1ojH0nSIekk1
AuthContext.jsx:126 🔍 Fetching user document from Firestore...
AuthContext.jsx:274 ✅ Firebase Auth user created successfully: {uid: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', emailVerified: false}
AuthContext.jsx:282 📝 Updating display name...
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false
TopNavigation.jsx:159 👤 UserProfileCircle: Profile updated {userName: 'rchambers1237', userInitials: 'R', profileName: undefined}
AuthContext.jsx:284 ✅ Display name updated to: rov
AuthContext.jsx:290 📝 Creating Firestore user document...
AuthContext.jsx:41 🔥 createUserDocument called: {userId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', displayName: 'rov', additionalData: {…}}
AuthContext.jsx:55 🔥 Checking if user document exists: dpOouzW1Q4VcLh2k1ojH0nSIekk1
AuthContext.jsx:129 🔍 User document fetch result: {exists: false, id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1'}
AuthContext.jsx:145 ⚠️ User document does not exist in Firestore
fetchUserProfile @ AuthContext.jsx:145
await in fetchUserProfile
(anonymous) @ AuthContext.jsx:221
(anonymous) @ chunk-O4IFIHIT.js?v=18891b23:742
(anonymous) @ chunk-O4IFIHIT.js?v=18891b23:834
Promise.then
sendOne @ chunk-O4IFIHIT.js?v=18891b23:831
forEachObserver @ chunk-O4IFIHIT.js?v=18891b23:824
next @ chunk-O4IFIHIT.js?v=18891b23:741
notifyAuthListeners @ firebase_auth.js?v=18891b23:2726
(anonymous) @ firebase_auth.js?v=18891b23:2538
Promise.then
queue @ firebase_auth.js?v=18891b23:2783
_updateCurrentUser @ firebase_auth.js?v=18891b23:2536
await in _updateCurrentUser
createUserWithEmailAndPassword @ firebase_auth.js?v=18891b23:4866
await in createUserWithEmailAndPassword
signUp @ AuthContext.jsx:273
handleSubmit @ SimpleAuthForm.jsx:69
executeDispatch @ react-dom_client.js?v=18891b23:11736
runWithFiberInDEV @ react-dom_client.js?v=18891b23:1485
processDispatchQueue @ react-dom_client.js?v=18891b23:11772
(anonymous) @ react-dom_client.js?v=18891b23:12182
batchedUpdates$1 @ react-dom_client.js?v=18891b23:2628
dispatchEventForPluginEventSystem @ react-dom_client.js?v=18891b23:11877
dispatchEvent @ react-dom_client.js?v=18891b23:14792
dispatchDiscreteEvent @ react-dom_client.js?v=18891b23:14773
<form>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=18891b23:250
SimpleAuthForm @ SimpleAuthForm.jsx:116
react_stack_bottom_frame @ react-dom_client.js?v=18891b23:17424
renderWithHooks @ react-dom_client.js?v=18891b23:4206
updateFunctionComponent @ react-dom_client.js?v=18891b23:6619
beginWork @ react-dom_client.js?v=18891b23:7654
runWithFiberInDEV @ react-dom_client.js?v=18891b23:1485
performUnitOfWork @ react-dom_client.js?v=18891b23:10868
workLoopSync @ react-dom_client.js?v=18891b23:10728
renderRootSync @ react-dom_client.js?v=18891b23:10711
performWorkOnRoot @ react-dom_client.js?v=18891b23:10330
performSyncWorkOnRoot @ react-dom_client.js?v=18891b23:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=18891b23:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=18891b23:11558
(anonymous) @ react-dom_client.js?v=18891b23:11649
<SimpleAuthForm>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=18891b23:250
AuthModal @ AuthModal.jsx:35
react_stack_bottom_frame @ react-dom_client.js?v=18891b23:17424
renderWithHooks @ react-dom_client.js?v=18891b23:4206
updateFunctionComponent @ react-dom_client.js?v=18891b23:6619
beginWork @ react-dom_client.js?v=18891b23:7654
runWithFiberInDEV @ react-dom_client.js?v=18891b23:1485
performUnitOfWork @ react-dom_client.js?v=18891b23:10868
workLoopSync @ react-dom_client.js?v=18891b23:10728
renderRootSync @ react-dom_client.js?v=18891b23:10711
performWorkOnRoot @ react-dom_client.js?v=18891b23:10330
performSyncWorkOnRoot @ react-dom_client.js?v=18891b23:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=18891b23:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=18891b23:11558
(anonymous) @ react-dom_client.js?v=18891b23:11649
<AuthModal>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=18891b23:250
App @ App.jsx:68
react_stack_bottom_frame @ react-dom_client.js?v=18891b23:17424
renderWithHooks @ react-dom_client.js?v=18891b23:4206
updateFunctionComponent @ react-dom_client.js?v=18891b23:6619
beginWork @ react-dom_client.js?v=18891b23:7654
runWithFiberInDEV @ react-dom_client.js?v=18891b23:1485
performUnitOfWork @ react-dom_client.js?v=18891b23:10868
workLoopSync @ react-dom_client.js?v=18891b23:10728
renderRootSync @ react-dom_client.js?v=18891b23:10711
performWorkOnRoot @ react-dom_client.js?v=18891b23:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=18891b23:11623
performWorkUntilDeadline @ react-dom_client.js?v=18891b23:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=18891b23:250
(anonymous) @ main.jsx:13
AuthContext.jsx:224 ✅ AuthProvider: User setup complete: {hasProfile: false, onboardingCompleted: undefined}
AuthContext.jsx:238 🔄 AuthProvider: Auth state processing complete, loading set to false
AuthContext.jsx:58 🔥 User document exists: false
AuthContext.jsx:96 🔥 Creating user document with data: {email: 'rchambers1237@gmail.com', name: 'rov', createdAt: ___PRIVATE_ServerTimestampFieldValueImpl, updatedAt: ___PRIVATE_ServerTimestampFieldValueImpl, onboardingCompleted: false, …}
AuthContext.jsx:98 ✅ User document created successfully
AuthContext.jsx:292 ✅ Firestore user document created
AuthContext.jsx:294 🎉 SIGNUP COMPLETED SUCCESSFULLY
SimpleAuthForm.jsx:70 📝 SignUp result: {success: true, error: null}
SimpleAuthForm.jsx:73 ✅ SignUp successful, showing success toast
SimpleAuthForm.jsx:97 📋 Form submission complete, loading set to false
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false
TopNavigation.jsx:159 👤 UserProfileCircle: Profile updated {userName: 'rov', userInitials: 'R', profileName: undefined}

```

"Logs after onboarding:"
```
TopNavigation.jsx:28 🔝 Opening quick onboarding modal
TopNavigation.jsx:18 isMobile value:  false
QuickOnboardingModal.jsx:74 ✅ Onboarding completed successfully
TopNavigation.jsx:33 🔝 Onboarding completed with data: {dietaryRestrictions: Array(1), allergies: Array(0), defaultServingSize: 4}
AuthContext.jsx:393 🔄 refreshUserProfile called
AuthContext.jsx:399 🔄 Fetching fresh user profile from Firestore...
AuthContext.jsx:117 🔍 fetchUserProfile called for uid: dpOouzW1Q4VcLh2k1ojH0nSIekk1
AuthContext.jsx:126 🔍 Fetching user document from Firestore...
TopNavigation.jsx:18 isMobile value:  false
AuthContext.jsx:129 🔍 User document fetch result: {exists: true, id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1'}
AuthContext.jsx:136 ✅ User profile fetched successfully: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', name: 'rov', onboardingCompleted: true, tier: 'free'}
AuthContext.jsx:402 ✅ UserProfile refreshed in AuthContext: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', name: 'rov', onboardingCompleted: true, dietaryRestrictions: Array(1), …}
TopNavigation.jsx:44 🚀 Triggering automatic plan generation based on: {dietaryRestrictions: Array(1), allergies: Array(0), defaultServingSize: 4}
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false
TopNavigation.jsx:159 👤 UserProfileCircle: Profile updated {userName: 'rov', userInitials: 'R', profileName: 'rov'}
GenerationProgressModal.jsx:64 🚀 Starting complete plan generation...
parallelGenerator.js:6 🚀 Starting complete plan generation for user: dpOouzW1Q4VcLh2k1ojH0nSIekk1
parallelGenerator.js:24 📊 Progress Update: {step: 'meals', status: 'pending', data: null, timestamp: '2025-10-30T21:45:12.865Z'}
parallelGenerator.js:24 📊 Progress Update: {step: 'groceries', status: 'pending', data: null, timestamp: '2025-10-30T21:45:12.865Z'}
parallelGenerator.js:36 🔄 Starting parallel AI generations...
parallelGenerator.js:24 📊 Progress Update: {step: 'meals', status: 'in_progress', data: null, timestamp: '2025-10-30T21:45:12.865Z'}
mealGenerator.js:17 <} Starting meal plan generation for user: dpOouzW1Q4VcLh2k1ojH0nSIekk1
mealGenerator.js:37 🍽️ MealGenerator: promptContext for hashing: {userId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', type: 'meal_plan', userData: {…}, planType: 'weekly'}
mealGenerator.js:39 🍽️ MealGenerator: Generated promptHash: meal_eyJ1c2VySWQiOiJkcE9vdXpXMVE0
mealGenerator.js:42 Checking AI cache for existing meal plan...
parallelGenerator.js:24 📊 Progress Update: {step: 'groceries', status: 'in_progress', data: null, timestamp: '2025-10-30T21:45:12.866Z'}
firestoreQueries.js:156 ❌ Cache miss for prompt: meal_eyJ
mealGenerator.js:47 Cache check completed: false
mealGenerator.js:75 ❌ 🍽️ CACHE MISS! Generating new meal plan with OpenAI...
mealGenerator.js:82 =� Estimated cost: $0.0038
mealGenerator.js:85 > Generating new meal plan with AI...
openai.js:48 🤖 AI Request Started: {model: 'gpt-4o-mini', promptLength: 4035, estimatedInputTokens: 1009, sessionCalls: 1}
openai.js:84 ✅ AI Response Success: {model: 'gpt-4o-mini', duration: '107920ms', usage: {…}, cost: '$0.0032', sessionTotal: '$0.0032', …}
mealGenerator.js:359 � Failed to cache AI response: FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined (found in field userContext.userData.age in document aiCache/wVPXz7cxZg8uWFMlavc9)
cacheAIResponse @ mealGenerator.js:359
generateMealPlan @ mealGenerator.js:104
mealGenerator.js:299 ✅ 🍽️ Meal plan saved to Firestore with ID: dpOouzW1Q4VcLh2k1ojH0nSIekk1_meals_2025_10_30_1761860820903
mealGenerator.js:331 9 No placeholder meal plan to remove (this is fine)
mealGenerator.js:304 =� Meal plan saved to Firestore: dpOouzW1Q4VcLh2k1ojH0nSIekk1_meals_2025_10_30_1761860820903
mealGenerator.js:109  Meal plan generation completed successfully
parallelGenerator.js:24 📊 Progress Update: {step: 'meals', status: 'completed', data: {…}, timestamp: '2025-10-30T21:47:01.293Z'}
groceryGenerator.js:17 🛒 Starting grocery list generation for user: dpOouzW1Q4VcLh2k1ojH0nSIekk1
groceryGenerator.js:32 🛒 GroceryGenerator: promptContext for hashing: {userId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', type: 'grocery_list', userData: {…}, mealPlanId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1_meals_2025_10_30_1761860820903'}
groceryGenerator.js:34 🛒 GroceryGenerator: Generated promptHash: grocery_eyJ1c2VySWQiOiJkcE9vdXpXMV
groceryGenerator.js:37 🔍 Checking AI cache for existing grocery list...
mealGenerator.js:298  POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?VER=8&database=projects%2Ffitfulai-994f6%2Fdatabases%2F(default)&gsessionid=xZOddEAGkGbbOtrF99Iw2nVFeDgqi381UXFTz1e2MIU&SID=QUCwqWjucxlqhd_ZOuW5Pg&RID=61131&TYPE=terminate&zx=fcplgvt6ljzy 400 (Bad Request)
gc @ firebase_firestore.js?v=18891b23:2147
Y2.close @ firebase_firestore.js?v=18891b23:2491
(anonymous) @ firebase_firestore.js?v=18891b23:12686
(anonymous) @ firebase_firestore.js?v=18891b23:12651
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Z2.ta @ firebase_firestore.js?v=18891b23:2540
Rb @ firebase_firestore.js?v=18891b23:1419
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1208
fd @ firebase_firestore.js?v=18891b23:2341
h.Fa @ firebase_firestore.js?v=18891b23:2308
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
ec @ firebase_firestore.js?v=18891b23:2294
Rb @ firebase_firestore.js?v=18891b23:1416
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1203
Hb @ firebase_firestore.js?v=18891b23:1178
h.Ga @ firebase_firestore.js?v=18891b23:2228
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
fc @ firebase_firestore.js?v=18891b23:2172
h.connect @ firebase_firestore.js?v=18891b23:2132
Y2.m @ firebase_firestore.js?v=18891b23:2488
Yo @ firebase_firestore.js?v=18891b23:12645
send @ firebase_firestore.js?v=18891b23:12536
q_ @ firebase_firestore.js?v=18891b23:12852
ra @ firebase_firestore.js?v=18891b23:13055
__PRIVATE_onWriteStreamOpen @ firebase_firestore.js?v=18891b23:13407
(anonymous) @ firebase_firestore.js?v=18891b23:12930
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:12930
__ @ firebase_firestore.js?v=18891b23:12542
(anonymous) @ firebase_firestore.js?v=18891b23:12692
setTimeout
T_ @ firebase_firestore.js?v=18891b23:12691
j_ @ firebase_firestore.js?v=18891b23:13034
G_ @ firebase_firestore.js?v=18891b23:12927
(anonymous) @ firebase_firestore.js?v=18891b23:12917
Promise.then
auth @ firebase_firestore.js?v=18891b23:12913
start @ firebase_firestore.js?v=18891b23:12812
start @ firebase_firestore.js?v=18891b23:13028
__PRIVATE_startWriteStream @ firebase_firestore.js?v=18891b23:13404
__PRIVATE_fillWritePipeline @ firebase_firestore.js?v=18891b23:13390
await in __PRIVATE_fillWritePipeline
__PRIVATE_syncEngineWrite @ firebase_firestore.js?v=18891b23:14408
await in __PRIVATE_syncEngineWrite
(anonymous) @ firebase_firestore.js?v=18891b23:18051
await in (anonymous)
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
__PRIVATE_firestoreClientWrite @ firebase_firestore.js?v=18891b23:18051
executeWrite @ firebase_firestore.js?v=18891b23:18052
setDoc @ firebase_firestore.js?v=18891b23:17885
saveMealPlanToFirestore @ mealGenerator.js:298
generateMealPlan @ mealGenerator.js:107
firestoreQueries.js:156 ❌ Cache miss for prompt: grocery_
groceryGenerator.js:42 📋 Cache check completed: false
groceryGenerator.js:71 ❌ 🛒 CACHE MISS! Generating new grocery list with OpenAI...
groceryGenerator.js:77 💰 Estimated cost: $0.0025
groceryGenerator.js:80 🤖 Generating new grocery list with AI...
openai.js:48 🤖 AI Request Started: {model: 'gpt-4o-mini', promptLength: 3637, estimatedInputTokens: 910, sessionCalls: 2}
openai.js:84 ✅ AI Response Success: {model: 'gpt-4o-mini', duration: '23126ms', usage: {…}, cost: '$0.0009', sessionTotal: '$0.0042', …}
groceryGenerator.js:363 ⚠️ Failed to cache AI response: FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined (found in field userContext.userData.dietaryPreferences in document aiCache/nuF6qzXPMWhWrpuuhrT2)
cacheAIResponse @ groceryGenerator.js:363
generateGroceryList @ groceryGenerator.js:99
await in generateGroceryList
(anonymous) @ parallelGenerator.js:65
groceryGenerator.js:303 ✅ 🛒 Grocery list saved to Firestore with ID: dpOouzW1Q4VcLh2k1ojH0nSIekk1_groceries_2025_10_30_1761860844515
groceryGenerator.js:335 ℹ️ No placeholder grocery list to remove (this is fine)
groceryGenerator.js:308 💾 Grocery list saved to Firestore: dpOouzW1Q4VcLh2k1ojH0nSIekk1_groceries_2025_10_30_1761860844515
groceryGenerator.js:104 ✅ Grocery list generation completed successfully
parallelGenerator.js:24 📊 Progress Update: {step: 'groceries', status: 'completed', data: {…}, timestamp: '2025-10-30T21:47:24.764Z'}
parallelGenerator.js:93 ✅ Completed 2/2 generations
parallelGenerator.js:94 ❌ Failed 0/2 generations
parallelGenerator.js:119 🎉 Complete plan generation finished: {successful: 2, failed: 0, totalCost: 0.00417435, totalDuration: 131900, completedAt: '2025-10-30T21:47:24.765Z'}
GenerationProgressModal.jsx:73 result check: {success: true, results: {…}, summary: {…}}
GenerationProgressModal.jsx:75 🎉 All generations completed successfully
groceryGenerator.js:302  POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?VER=8&database=projects%2Ffitfulai-994f6%2Fdatabases%2F(default)&gsessionid=MIL9VWUepLklKqKmvw0WheCuiZHi5AaJMWUMVPCn9pw&SID=ewby3DXNiY3XqvXaYFyGxw&RID=56448&TYPE=terminate&zx=a75hwatn6hr7 400 (Bad Request)
gc @ firebase_firestore.js?v=18891b23:2147
Y2.close @ firebase_firestore.js?v=18891b23:2491
(anonymous) @ firebase_firestore.js?v=18891b23:12686
(anonymous) @ firebase_firestore.js?v=18891b23:12651
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Z2.ta @ firebase_firestore.js?v=18891b23:2540
Rb @ firebase_firestore.js?v=18891b23:1419
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1208
fd @ firebase_firestore.js?v=18891b23:2341
h.Fa @ firebase_firestore.js?v=18891b23:2308
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
ec @ firebase_firestore.js?v=18891b23:2294
Rb @ firebase_firestore.js?v=18891b23:1416
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1203
Hb @ firebase_firestore.js?v=18891b23:1178
h.Ga @ firebase_firestore.js?v=18891b23:2228
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
fc @ firebase_firestore.js?v=18891b23:2172
h.connect @ firebase_firestore.js?v=18891b23:2132
Y2.m @ firebase_firestore.js?v=18891b23:2488
Yo @ firebase_firestore.js?v=18891b23:12645
send @ firebase_firestore.js?v=18891b23:12536
q_ @ firebase_firestore.js?v=18891b23:12852
ra @ firebase_firestore.js?v=18891b23:13055
__PRIVATE_onWriteStreamOpen @ firebase_firestore.js?v=18891b23:13407
(anonymous) @ firebase_firestore.js?v=18891b23:12930
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:12930
__ @ firebase_firestore.js?v=18891b23:12542
(anonymous) @ firebase_firestore.js?v=18891b23:12692
setTimeout
T_ @ firebase_firestore.js?v=18891b23:12691
j_ @ firebase_firestore.js?v=18891b23:13034
G_ @ firebase_firestore.js?v=18891b23:12927
(anonymous) @ firebase_firestore.js?v=18891b23:12917
Promise.then
auth @ firebase_firestore.js?v=18891b23:12913
start @ firebase_firestore.js?v=18891b23:12812
start @ firebase_firestore.js?v=18891b23:13028
__PRIVATE_startWriteStream @ firebase_firestore.js?v=18891b23:13404
__PRIVATE_fillWritePipeline @ firebase_firestore.js?v=18891b23:13390
await in __PRIVATE_fillWritePipeline
__PRIVATE_syncEngineWrite @ firebase_firestore.js?v=18891b23:14408
await in __PRIVATE_syncEngineWrite
(anonymous) @ firebase_firestore.js?v=18891b23:18051
await in (anonymous)
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
__PRIVATE_firestoreClientWrite @ firebase_firestore.js?v=18891b23:18051
executeWrite @ firebase_firestore.js?v=18891b23:18052
setDoc @ firebase_firestore.js?v=18891b23:17885
saveGroceryListToFirestore @ groceryGenerator.js:302
generateGroceryList @ groceryGenerator.js:102
await in generateGroceryList
(anonymous) @ parallelGenerator.js:65
TopNavigation.jsx:49 🎉 TopNavigation: Generation completed with results: {success: true, results: {…}, summary: {…}}
TopNavigation.jsx:18 isMobile value:  false
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}
firestoreQueries.js:42 🍽️ Found 1 meal plans for user dpOouzW1Q4VcLh2k1ojH0nSIekk1
firestoreQueries.js:95 🛒 Found 1 grocery lists for user dpOouzW1Q4VcLh2k1ojH0nSIekk1
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}

```

"Dashboard UI after 1st generation:"
```
Last Plan Generation

October 30, 2025 at 5:47 PM

0 days ago
Profile Settings
Update your profile to regenerate your personalized plans

Edit Profile
Basic Information
Age
Not set

Gender
Not set

Physical Stats
Weight (lbs)
Not set lbs

Height
Not set

Fitness Goals
Fitness Goal
Not set

Activity Level
Not set

Dietary Preferences
Diet Type
None

Allergies / Restrictions
None
```

"Dashboard UI after 2nd generation:"
```
Last Plan Generation

October 30, 2025 at 5:52 PM

0 days ago
Profile Settings
Update your profile to regenerate your personalized plans

Edit Profile
Basic Information
Age
53

Gender
Not set

Physical Stats
Weight (lbs)
150 lbs

Height
5'0"

Fitness Goals
Fitness Goal
Not set

Activity Level
Not set

Dietary Preferences
Diet Type
None

Allergies / Restrictions
None
```

"Logs after 2nd generation:"
```
ProfileEditor.jsx:125 🔄 ProfileEditor: Regenerate clicked, checking for unsaved changes... {isEditing: true, hasUnsavedChanges: true}
ProfileEditor.jsx:132 💾 ProfileEditor: Unsaved changes detected, saving first...
ProfileEditor.jsx:36 💾 ProfileEditor: Starting save with edited data: {age: '53', gender: '', weightLbs: '150', heightInches: 60, activityLevel: '', …}
ProfileEditor.jsx:103 💾 ProfileEditor: Saving to Firestore: {age: 53, gender: '', weightLbs: 150, weightKgs: 68.0388, heightInches: 60, …}
ProfileEditor.jsx:105 ✅ ProfileEditor: Saved successfully to Firestore
ProfileEditor.jsx:108 🔄 ProfileEditor: Refreshing userProfile in context...
AuthContext.jsx:393 🔄 refreshUserProfile called
AuthContext.jsx:399 🔄 Fetching fresh user profile from Firestore...
AuthContext.jsx:117 🔍 fetchUserProfile called for uid: dpOouzW1Q4VcLh2k1ojH0nSIekk1
AuthContext.jsx:126 🔍 Fetching user document from Firestore...
AuthContext.jsx:129 🔍 User document fetch result: {exists: true, id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1'}
AuthContext.jsx:136 ✅ User profile fetched successfully: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', name: 'rov', onboardingCompleted: true, tier: 'free'}
AuthContext.jsx:402 ✅ UserProfile refreshed in AuthContext: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', onboardingCompleted: true, subscriptionEndDate: null, tier: 'free', aiGenerationsUsed: 0, …}
ProfileEditor.jsx:110 ✅ ProfileEditor: userProfile refreshed
ProfileEditor.jsx:134 ✅ ProfileEditor: Changes saved, now triggering regeneration
index.jsx:305 🔄 Dashboard: Regenerate clicked! Current userProfile: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', name: 'rov', onboardingCompleted: true, dietaryRestrictions: Array(1), …}
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}
GenerationProgressModal.jsx:64 🚀 Starting complete plan generation...
parallelGenerator.js:6 🚀 Starting complete plan generation for user: dpOouzW1Q4VcLh2k1ojH0nSIekk1
parallelGenerator.js:24 📊 Progress Update: {step: 'meals', status: 'pending', data: null, timestamp: '2025-10-30T21:50:32.023Z'}
parallelGenerator.js:24 📊 Progress Update: {step: 'groceries', status: 'pending', data: null, timestamp: '2025-10-30T21:50:32.023Z'}
parallelGenerator.js:36 🔄 Starting parallel AI generations...
parallelGenerator.js:24 📊 Progress Update: {step: 'meals', status: 'in_progress', data: null, timestamp: '2025-10-30T21:50:32.023Z'}
mealGenerator.js:17 <} Starting meal plan generation for user: dpOouzW1Q4VcLh2k1ojH0nSIekk1
mealGenerator.js:37 🍽️ MealGenerator: promptContext for hashing: {userId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', type: 'meal_plan', userData: {…}, planType: 'weekly'}
mealGenerator.js:39 🍽️ MealGenerator: Generated promptHash: meal_eyJ1c2VySWQiOiJkcE9vdXpXMVE0
mealGenerator.js:42 Checking AI cache for existing meal plan...
parallelGenerator.js:24 📊 Progress Update: {step: 'groceries', status: 'in_progress', data: null, timestamp: '2025-10-30T21:50:32.024Z'}
firestoreQueries.js:156 ❌ Cache miss for prompt: meal_eyJ
mealGenerator.js:47 Cache check completed: false
mealGenerator.js:75 ❌ 🍽️ CACHE MISS! Generating new meal plan with OpenAI...
mealGenerator.js:82 =� Estimated cost: $0.0037
mealGenerator.js:85 > Generating new meal plan with AI...
openai.js:48 🤖 AI Request Started: {model: 'gpt-4o-mini', promptLength: 3989, estimatedInputTokens: 998, sessionCalls: 3}
openai.js:84 ✅ AI Response Success: {model: 'gpt-4o-mini', duration: '114580ms', usage: {…}, cost: '$0.0033', sessionTotal: '$0.0075', …}
mealGenerator.js:356 =� AI response cached for future use
mealGenerator.js:299 ✅ 🍽️ Meal plan saved to Firestore with ID: dpOouzW1Q4VcLh2k1ojH0nSIekk1_meals_2025_10_30_1761861147175
mealGenerator.js:331 9 No placeholder meal plan to remove (this is fine)
mealGenerator.js:304 =� Meal plan saved to Firestore: dpOouzW1Q4VcLh2k1ojH0nSIekk1_meals_2025_10_30_1761861147175
mealGenerator.js:109  Meal plan generation completed successfully
parallelGenerator.js:24 📊 Progress Update: {step: 'meals', status: 'completed', data: {…}, timestamp: '2025-10-30T21:52:27.548Z'}
groceryGenerator.js:17 🛒 Starting grocery list generation for user: dpOouzW1Q4VcLh2k1ojH0nSIekk1
groceryGenerator.js:32 🛒 GroceryGenerator: promptContext for hashing: {userId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', type: 'grocery_list', userData: {…}, mealPlanId: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1_meals_2025_10_30_1761861147175'}
groceryGenerator.js:34 🛒 GroceryGenerator: Generated promptHash: grocery_eyJ1c2VySWQiOiJkcE9vdXpXMV
groceryGenerator.js:37 🔍 Checking AI cache for existing grocery list...
mealGenerator.js:355  POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?VER=8&database=projects%2Ffitfulai-994f6%2Fdatabases%2F(default)&gsessionid=3qGDSJkq5fbeaZFwPPAvOofxWO9FcAcUhJsqX_xj4Ik&SID=QL3J3zYKw4CuL0i_1kRIDQ&RID=84229&TYPE=terminate&zx=uogbgvucqtvk 400 (Bad Request)
gc @ firebase_firestore.js?v=18891b23:2147
Y2.close @ firebase_firestore.js?v=18891b23:2491
(anonymous) @ firebase_firestore.js?v=18891b23:12686
(anonymous) @ firebase_firestore.js?v=18891b23:12651
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Z2.ta @ firebase_firestore.js?v=18891b23:2540
Rb @ firebase_firestore.js?v=18891b23:1419
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1208
fd @ firebase_firestore.js?v=18891b23:2341
h.Fa @ firebase_firestore.js?v=18891b23:2308
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
ec @ firebase_firestore.js?v=18891b23:2294
Rb @ firebase_firestore.js?v=18891b23:1416
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1203
Hb @ firebase_firestore.js?v=18891b23:1178
h.Ga @ firebase_firestore.js?v=18891b23:2228
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
fc @ firebase_firestore.js?v=18891b23:2172
h.connect @ firebase_firestore.js?v=18891b23:2132
Y2.m @ firebase_firestore.js?v=18891b23:2488
Yo @ firebase_firestore.js?v=18891b23:12645
send @ firebase_firestore.js?v=18891b23:12536
q_ @ firebase_firestore.js?v=18891b23:12852
ra @ firebase_firestore.js?v=18891b23:13055
__PRIVATE_onWriteStreamOpen @ firebase_firestore.js?v=18891b23:13407
(anonymous) @ firebase_firestore.js?v=18891b23:12930
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:12930
__ @ firebase_firestore.js?v=18891b23:12542
(anonymous) @ firebase_firestore.js?v=18891b23:12692
setTimeout
T_ @ firebase_firestore.js?v=18891b23:12691
j_ @ firebase_firestore.js?v=18891b23:13034
G_ @ firebase_firestore.js?v=18891b23:12927
(anonymous) @ firebase_firestore.js?v=18891b23:12917
Promise.then
auth @ firebase_firestore.js?v=18891b23:12913
start @ firebase_firestore.js?v=18891b23:12812
start @ firebase_firestore.js?v=18891b23:13028
__PRIVATE_startWriteStream @ firebase_firestore.js?v=18891b23:13404
__PRIVATE_fillWritePipeline @ firebase_firestore.js?v=18891b23:13390
await in __PRIVATE_fillWritePipeline
__PRIVATE_syncEngineWrite @ firebase_firestore.js?v=18891b23:14408
await in __PRIVATE_syncEngineWrite
(anonymous) @ firebase_firestore.js?v=18891b23:18051
await in (anonymous)
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
__PRIVATE_firestoreClientWrite @ firebase_firestore.js?v=18891b23:18051
executeWrite @ firebase_firestore.js?v=18891b23:18052
addDoc @ firebase_firestore.js?v=18891b23:17901
cacheAIResponse @ mealGenerator.js:355
generateMealPlan @ mealGenerator.js:104
await in generateMealPlan
(anonymous) @ parallelGenerator.js:41
generateCompleteUserPlan @ parallelGenerator.js:55
startGeneration @ GenerationProgressModal.jsx:70
firestoreQueries.js:156 ❌ Cache miss for prompt: grocery_
groceryGenerator.js:42 📋 Cache check completed: false
groceryGenerator.js:71 ❌ 🛒 CACHE MISS! Generating new grocery list with OpenAI...
groceryGenerator.js:77 💰 Estimated cost: $0.0025
groceryGenerator.js:80 🤖 Generating new grocery list with AI...
openai.js:48 🤖 AI Request Started: {model: 'gpt-4o-mini', promptLength: 3709, estimatedInputTokens: 928, sessionCalls: 4}
openai.js:84 ✅ AI Response Success: {model: 'gpt-4o-mini', duration: '29486ms', usage: {…}, cost: '$0.0011', sessionTotal: '$0.0086', …}
groceryGenerator.js:360 💾 AI response cached for future use
groceryGenerator.js:303 ✅ 🛒 Grocery list saved to Firestore with ID: dpOouzW1Q4VcLh2k1ojH0nSIekk1_groceries_2025_10_30_1761861177348
groceryGenerator.js:335 ℹ️ No placeholder grocery list to remove (this is fine)
groceryGenerator.js:308 💾 Grocery list saved to Firestore: dpOouzW1Q4VcLh2k1ojH0nSIekk1_groceries_2025_10_30_1761861177348
groceryGenerator.js:104 ✅ Grocery list generation completed successfully
parallelGenerator.js:24 📊 Progress Update: {step: 'groceries', status: 'completed', data: {…}, timestamp: '2025-10-30T21:52:57.529Z'}
parallelGenerator.js:93 ✅ Completed 2/2 generations
parallelGenerator.js:94 ❌ Failed 0/2 generations
parallelGenerator.js:119 🎉 Complete plan generation finished: {successful: 2, failed: 0, totalCost: 0.00441585, totalDuration: 145507, completedAt: '2025-10-30T21:52:57.530Z'}
GenerationProgressModal.jsx:73 result check: {success: true, results: {…}, summary: {…}}
GenerationProgressModal.jsx:75 🎉 All generations completed successfully
groceryGenerator.js:359  POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?VER=8&database=projects%2Ffitfulai-994f6%2Fdatabases%2F(default)&gsessionid=Fz2tTEN5r7toHtlTXaJn6Jtuok23HY3orpFuq_h5s5Q&SID=EvNBdwUmEtMzb7YfqwsZUQ&RID=92247&TYPE=terminate&zx=pjsm4h35s8zj 400 (Bad Request)
gc @ firebase_firestore.js?v=18891b23:2147
Y2.close @ firebase_firestore.js?v=18891b23:2491
(anonymous) @ firebase_firestore.js?v=18891b23:12686
(anonymous) @ firebase_firestore.js?v=18891b23:12651
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Z2.ta @ firebase_firestore.js?v=18891b23:2540
Rb @ firebase_firestore.js?v=18891b23:1419
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Pa @ firebase_firestore.js?v=18891b23:1814
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1208
fd @ firebase_firestore.js?v=18891b23:2341
h.Fa @ firebase_firestore.js?v=18891b23:2308
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
ec @ firebase_firestore.js?v=18891b23:2294
Rb @ firebase_firestore.js?v=18891b23:1416
M2.Y @ firebase_firestore.js?v=18891b23:1284
M2.ca @ firebase_firestore.js?v=18891b23:1215
ab @ firebase_firestore.js?v=18891b23:950
F2 @ firebase_firestore.js?v=18891b23:920
Wc @ firebase_firestore.js?v=18891b23:1954
h.bb @ firebase_firestore.js?v=18891b23:1949
h.Ea @ firebase_firestore.js?v=18891b23:1946
Lc @ firebase_firestore.js?v=18891b23:1846
h.Pa @ firebase_firestore.js?v=18891b23:1813
Promise.then
Nc @ firebase_firestore.js?v=18891b23:1804
h.Sa @ firebase_firestore.js?v=18891b23:1800
Promise.then
h.send @ firebase_firestore.js?v=18891b23:1781
h.ea @ firebase_firestore.js?v=18891b23:1922
Jb @ firebase_firestore.js?v=18891b23:1203
Hb @ firebase_firestore.js?v=18891b23:1178
h.Ga @ firebase_firestore.js?v=18891b23:2228
Da @ firebase_firestore.js?v=18891b23:669
Promise.then
x2 @ firebase_firestore.js?v=18891b23:663
fc @ firebase_firestore.js?v=18891b23:2172
h.connect @ firebase_firestore.js?v=18891b23:2132
Y2.m @ firebase_firestore.js?v=18891b23:2488
Yo @ firebase_firestore.js?v=18891b23:12645
send @ firebase_firestore.js?v=18891b23:12536
q_ @ firebase_firestore.js?v=18891b23:12852
ra @ firebase_firestore.js?v=18891b23:13055
__PRIVATE_onWriteStreamOpen @ firebase_firestore.js?v=18891b23:13407
(anonymous) @ firebase_firestore.js?v=18891b23:12930
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
(anonymous) @ firebase_firestore.js?v=18891b23:12954
(anonymous) @ firebase_firestore.js?v=18891b23:12930
__ @ firebase_firestore.js?v=18891b23:12542
(anonymous) @ firebase_firestore.js?v=18891b23:12692
setTimeout
T_ @ firebase_firestore.js?v=18891b23:12691
j_ @ firebase_firestore.js?v=18891b23:13034
G_ @ firebase_firestore.js?v=18891b23:12927
(anonymous) @ firebase_firestore.js?v=18891b23:12917
Promise.then
auth @ firebase_firestore.js?v=18891b23:12913
start @ firebase_firestore.js?v=18891b23:12812
start @ firebase_firestore.js?v=18891b23:13028
__PRIVATE_startWriteStream @ firebase_firestore.js?v=18891b23:13404
__PRIVATE_fillWritePipeline @ firebase_firestore.js?v=18891b23:13390
await in __PRIVATE_fillWritePipeline
__PRIVATE_syncEngineWrite @ firebase_firestore.js?v=18891b23:14408
await in __PRIVATE_syncEngineWrite
(anonymous) @ firebase_firestore.js?v=18891b23:18051
await in (anonymous)
(anonymous) @ firebase_firestore.js?v=18891b23:16040
(anonymous) @ firebase_firestore.js?v=18891b23:16071
Promise.then
cc @ firebase_firestore.js?v=18891b23:16071
enqueue @ firebase_firestore.js?v=18891b23:16040
enqueueAndForget @ firebase_firestore.js?v=18891b23:16022
__PRIVATE_firestoreClientWrite @ firebase_firestore.js?v=18891b23:18051
executeWrite @ firebase_firestore.js?v=18891b23:18052
addDoc @ firebase_firestore.js?v=18891b23:17901
cacheAIResponse @ groceryGenerator.js:359
generateGroceryList @ groceryGenerator.js:99
await in generateGroceryList
(anonymous) @ parallelGenerator.js:65
index.jsx:318 🎉 Plan regeneration completed: {success: true, results: {…}, summary: {…}}
AuthContext.jsx:393 🔄 refreshUserProfile called
AuthContext.jsx:399 🔄 Fetching fresh user profile from Firestore...
AuthContext.jsx:117 🔍 fetchUserProfile called for uid: dpOouzW1Q4VcLh2k1ojH0nSIekk1
AuthContext.jsx:126 🔍 Fetching user document from Firestore...
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}
AuthContext.jsx:129 🔍 User document fetch result: {exists: true, id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1'}
AuthContext.jsx:136 ✅ User profile fetched successfully: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', email: 'rchambers1237@gmail.com', name: 'rov', onboardingCompleted: true, tier: 'free'}
AuthContext.jsx:402 ✅ UserProfile refreshed in AuthContext: {id: 'dpOouzW1Q4VcLh2k1ojH0nSIekk1', macros: {…}, preferences: {…}, dietaryPreferences: Array(0), age: 53, …}
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:18 isMobile value:  false
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}
firestoreQueries.js:42 🍽️ Found 2 meal plans for user dpOouzW1Q4VcLh2k1ojH0nSIekk1
firestoreQueries.js:95 🛒 Found 2 grocery lists for user dpOouzW1Q4VcLh2k1ojH0nSIekk1
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}

```