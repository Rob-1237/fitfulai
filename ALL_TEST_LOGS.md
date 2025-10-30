"Logs on load:"

```
react-dom_client.js?v=18891b23:17995 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
App.jsx:24 🚀 App state: {isInitialized: false, isDark: false, isMobile: false, modals: {…}}
App.jsx:43 ⏳ App not initialized yet, showing loading screen
AuthContext.jsx:202 🚀 AuthProvider: Setting up auth state listener...
App.jsx:24 🚀 App state: {isInitialized: false, isDark: false, isMobile: false, modals: {…}}
App.jsx:43 ⏳ App not initialized yet, showing loading screen
firebase.js:19  POST https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCs0V39lJUsUMi2oelxJnoxAVLcm2vyQwc 400 (Bad Request)
(anonymous) @ firebase_auth.js?v=18891b23:1104
await in (anonymous)
_performFetchWithErrorHandling @ firebase_auth.js?v=18891b23:1113
_performApiRequest @ firebase_auth.js?v=18891b23:1066
getAccountInfo @ firebase_auth.js?v=18891b23:1289
_reloadWithoutSaving @ firebase_auth.js?v=18891b23:1475
await in _reloadWithoutSaving
reloadAndSetCurrentUserOrClear @ firebase_auth.js?v=18891b23:2492
initializeCurrentUser @ firebase_auth.js?v=18891b23:2464
await in initializeCurrentUser
(anonymous) @ firebase_auth.js?v=18891b23:2386
Promise.then
queue @ firebase_auth.js?v=18891b23:2783
_initializeWithPersistence @ firebase_auth.js?v=18891b23:2371
_initializeAuthInstance @ firebase_auth.js?v=18891b23:3287
(anonymous) @ firebase_auth.js?v=18891b23:8026
getOrInitializeService @ chunk-O4IFIHIT.js?v=18891b23:1085
initialize @ chunk-O4IFIHIT.js?v=18891b23:1033
initializeAuth @ firebase_auth.js?v=18891b23:3278
getAuth @ firebase_auth.js?v=18891b23:8085
(anonymous) @ firebase.js:19
AuthContext.jsx:205 🔄 AuthProvider: Auth state changed: {userExists: false, uid: undefined, email: undefined, displayName: undefined, emailVerified: undefined}
AuthContext.jsx:233 🚫 AuthProvider: User not authenticated, clearing profile
AuthContext.jsx:238 🔄 AuthProvider: Auth state processing complete, loading set to false
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:16 isMobile value:  false

```

"Logs after sign up:"
```
SimpleAuthForm.jsx:15 📋 FORM SUBMISSION STARTED
SimpleAuthForm.jsx:16 📋 Form mode: signup
SimpleAuthForm.jsx:17 📋 Form data: {email: 'rchambers1237@gmail.com', emailValid: true, passwordLength: 11, name: 'rob', nameLength: 3}
SimpleAuthForm.jsx:30 ✅ Running form validation...
SimpleAuthForm.jsx:54 📝 Processing signup...
SimpleAuthForm.jsx:68 📝 All validation passed, calling signUp function...
AuthContext.jsx:256 📝 SIGNUP ATTEMPT STARTED
AuthContext.jsx:257 📝 signUp called with: {email: 'rchambers1237@gmail.com', emailLength: 23, passwordLength: 11, name: 'rob', nameLength: 3}
AuthContext.jsx:272 📝 Creating Firebase Auth user...
AuthContext.jsx:205 🔄 AuthProvider: Auth state changed: {userExists: true, uid: 'IBW1icNV71OLTSFyOQXk0wyLLC62', email: 'rchambers1237@gmail.com', displayName: null, emailVerified: false}
AuthContext.jsx:216 👤 AuthProvider: User is authenticated, fetching profile...
AuthContext.jsx:220 🔍 AuthProvider: Fetching user profile...
AuthContext.jsx:117 🔍 fetchUserProfile called for uid: IBW1icNV71OLTSFyOQXk0wyLLC62
AuthContext.jsx:126 🔍 Fetching user document from Firestore...
AuthContext.jsx:274 ✅ Firebase Auth user created successfully: {uid: 'IBW1icNV71OLTSFyOQXk0wyLLC62', email: 'rchambers1237@gmail.com', emailVerified: false}
AuthContext.jsx:282 📝 Updating display name...
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:16 isMobile value:  false
TopNavigation.jsx:139 👤 UserProfileCircle: Profile updated {userName: 'rchambers1237', userInitials: 'R', profileName: undefined}
AuthContext.jsx:284 ✅ Display name updated to: rob
AuthContext.jsx:290 📝 Creating Firestore user document...
AuthContext.jsx:41 🔥 createUserDocument called: {userId: 'IBW1icNV71OLTSFyOQXk0wyLLC62', email: 'rchambers1237@gmail.com', displayName: 'rob', additionalData: {…}}
AuthContext.jsx:55 🔥 Checking if user document exists: IBW1icNV71OLTSFyOQXk0wyLLC62
AuthContext.jsx:129 🔍 User document fetch result: {exists: false, id: 'IBW1icNV71OLTSFyOQXk0wyLLC62'}
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
AuthContext.jsx:96 🔥 Creating user document with data: {email: 'rchambers1237@gmail.com', name: 'rob', createdAt: ___PRIVATE_ServerTimestampFieldValueImpl, updatedAt: ___PRIVATE_ServerTimestampFieldValueImpl, onboardingCompleted: false, …}
AuthContext.jsx:98 ✅ User document created successfully
AuthContext.jsx:292 ✅ Firestore user document created
AuthContext.jsx:294 🎉 SIGNUP COMPLETED SUCCESSFULLY
SimpleAuthForm.jsx:70 📝 SignUp result: {success: true, error: null}
SimpleAuthForm.jsx:73 ✅ SignUp successful, showing success toast
SimpleAuthForm.jsx:97 📋 Form submission complete, loading set to false
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:16 isMobile value:  false
TopNavigation.jsx:139 👤 UserProfileCircle: Profile updated {userName: 'rob', userInitials: 'R', profileName: undefined}

```

"Logs after attempted onboarding:"
```
TopNavigation.jsx:26 🔝 Opening quick onboarding modal
TopNavigation.jsx:16 isMobile value:  false
QuickOnboardingModal.jsx:74 ✅ Onboarding completed successfully
TopNavigation.jsx:31 🔝 Onboarding completed with data: {dietaryRestrictions: Array(1), allergies: Array(0), defaultServingSize: 2}
AuthContext.jsx:393 🔄 refreshUserProfile called
AuthContext.jsx:399 🔄 Fetching fresh user profile from Firestore...
AuthContext.jsx:117 🔍 fetchUserProfile called for uid: IBW1icNV71OLTSFyOQXk0wyLLC62
AuthContext.jsx:126 🔍 Fetching user document from Firestore...
AuthContext.jsx:129 🔍 User document fetch result: {exists: true, id: 'IBW1icNV71OLTSFyOQXk0wyLLC62'}
AuthContext.jsx:136 ✅ User profile fetched successfully: {id: 'IBW1icNV71OLTSFyOQXk0wyLLC62', email: 'rchambers1237@gmail.com', name: 'rob', onboardingCompleted: true, tier: 'free'}
AuthContext.jsx:402 ✅ UserProfile refreshed in AuthContext: {id: 'IBW1icNV71OLTSFyOQXk0wyLLC62', email: 'rchambers1237@gmail.com', name: 'rob', onboardingCompleted: true, dietaryRestrictions: Array(1), …}
TopNavigation.jsx:39 TODO: Generate initial meal plan based on: {dietaryRestrictions: Array(1), allergies: Array(0), defaultServingSize: 2}
App.jsx:24 🚀 App state: {isInitialized: true, isDark: false, isMobile: false, modals: {…}}
TopNavigation.jsx:16 isMobile value:  false
index.jsx:19 📊 Dashboard page - userState: onboarded {hasUser: true, hasProfile: true, onboardingCompleted: true}
TopNavigation.jsx:139 👤 UserProfileCircle: Profile updated {userName: 'rob', userInitials: 'R', profileName: 'rob'}
firestoreQueries.js:42 🍽️ Found 0 meal plans for user IBW1icNV71OLTSFyOQXk0wyLLC62
firestoreQueries.js:95 🛒 Found 0 grocery lists for user IBW1icNV71OLTSFyOQXk0wyLLC62

```