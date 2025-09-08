Authentication System Alignment - Answers to Clarifying Questions

  *1. User Flow & State Expectations

  ```
  Initial Load

  - Local Storage is checked for user history
  - If no user is in storage, "Sign In" button appears in top-right corner
  - If user is in storage, User profile circle appears in top-right corner

  Sign In Process (Success)

  - Click "Sign In" → Modal opens
  - Successful sign in → Toast appears "Welcome back!"
  - Modal closes automatically
  - "Sign In" button disappears
  - User profile circle appears in same top-right position


  Sign In Process (Failure)

  - Click "Sign In" → Modal opens
  - Unsuccessful sign in → Message appears on form "Invalid login credentials"

  Sign Up Process (Success)

  - Click "Sign In" → Modal opens
  - Click "Create Account"
  - Button text switches to "Sign Up" and additional "Name" field appears
  - Upon submission, email verification sent, verification link activated
  - Successful sign up → Toast appears "Welcome [name here]!"
  - Modal closes automatically
  - "Sign In" button disappears
  - User profile circle appears in same top-right position

  Sign Up Process (Failure)

  - Click "Sign In" → Modal opens
  - Click "Create Account"
  - Button text switches to "Sign Up" and additional "Name" field appears
    - Unsuccessful sign up → Message appears on form "Account already exists"

  Authenticated State

  - Profile circle shows user initial or image
  - Click profile → Dropdown menu appears
  - Menu shows 4 elements: user name and email (both non-selectable), Sign Out and Edit (both selectable)

  Sign Out Process

  - Click Profile circle → Click Sign Out
  - "Sign In" button reappears
  ```

  *2. Profile Data & Database Integration

    ```Needs additional testing to ensure auth is properly functional```

    ```Chrome hanging issue appears to be from localStorage conflict```

    ```All fields (columns) for "profiles" table in Supabase appear to be configured correctly and can be viewed at @PROFILES_SCHEMA.md```

  ```"UPDATE Policy:"
  alter policy "Enable update for own profile"
on "public"."profiles"
to authenticated
using ((auth.uid() = id)
with check (auth.ui));```

```"SELECT policy:"
alter policy "Enable users to view their own data only"
on "public"."profiles"
to authenticated
using (( SELECT auth.uid() AS uid) = id);```


  *3. Error Handling & Edge Cases

```User exists in Supabase Auth but has no profile record:"
If by profile record you mean our multi-form onboarding process, the user will receive a toast to inform them they will need to complete the process.```

```"Network failures during sign-in/sign-up:"
Users should receive toast notification on 500 errors. "Invalid login credentials" and "Account already exists" errors are handled by messaging directly on the form.```

```"Email verification required but user tries to sign in before verifying:"
Email verification is used when an account is created, but not on every user sign in. If a user attempts to sign in before creating a verified account, they will receive a "Invalid login credentials" error message directly on the form.```

```"Sign-up with an email that already exists:"
If a user attempts to Sign up (create a new account) with an email that already exists in the Supabase, they will receive a "Account already exists" message directly on the form. They then have the option to either go back to the Sign In form, or select "Forgot Password?" to re-submit and receive another email verification.```

```"Session expiry during app usage:"
We want to do a silent refresh, which we understand is already handled by supabase-js. The user stays signed in while using the app, and the refresh is transparent until something breaks.```

  *4. UI/UX Positioning & Visual Design

```"Should the Sign In button stay fixed:"
The Sign In button is currently fixed at top-4 right-30 because it was interfering with the positioning of the Menu Toggle Button on lines 65-76 in @src/components/nav/SideBarDrawer.jsx. The current layout does not look bad, but we are open to new suggestions.```

  
  ```"User profile circle positioning:"
  Yes, the user profile circle should appear in the exact same position as the Sign In button.```

  ```"Loading states, transitions, and animations:"
  We want all of these to be smooth opacity-translate features. Framer Motion is our primary handler for these matters, but we may have to implement special handling in some instances as we develop.```

  ```"Specific styling/branding requirements for the auth modal and forms:"
  As of now we can simply use the Tailwindcss white, black, and gray as needed. It is acceptable to proceed with Tailwindcss blue on form text, and for success/failure we can use Tailwindcss green-500 and red-500.```

  *5. Testing & Validation Strategy
```I am running the dev server on Chrome, Safari, iOS Simulator, and Android Emulator. We also have some devices on hand for testing, including Chromebook Acer and Lenovo. I will be making regular pushes to the CI/CD repo for this project so we can also test on the Vercel deployment through all of these tools and devices mentioned above.```

```I am the only developer working on this code, and we will *not* be using testing frameworks or implementing test files. We can use simple logging for debugging, and our testing will be done exclusively on the local dev server and live deployment through Vercel.```
  

___

  Supplementary Materials

  *1. Supabase Configuration Details

```Most of these details can be found above in "*2. Profile Data & Database Integration". We do not currently have  functions, but we will at least need a trigger on updated_at. We need sample data and will require assistance in this area.```  
 

  *2. Current Profile Store Implementation
```The implementation for this may be found in the files at @src/stores/ and @src/lib. You will find most of the implementation at @src/stores/userProfileStore.js, and a good listing of the fields can be found at @src/lib/types.js.```

  *3. User Experience Requirements Document
```All details regarding these steps and messages can be found at "*1. User Flow & State Expectations" above. We currently have the file @src/components/ui/LoadingSpinner.jsx for handling loading states on the UI.```
  
  *4. Test Scenarios & Data
```We will use my credentials for testing so that we get real-world email verifications, etc. My email is rchambers1237@gmail.com. We are going to address edge cases as they surface - right now we simply need a working example. Please feel free to use the @src/lib/types file to create a working user data structure example for our use as we develop.```
 
  *5. Design/Branding Guidelines
```We cn use Tailwindcss green-500 and red-500 for success and error states. We will want to use Framer Motion opacity-translate techniques on most elements. The typography can remain primary for now, and we are focused on a mobile-first build. We will not be concerned with desktop layout until out user login flow is functional.
 

 ___

No, that's okay.

At this time I want to regroup on the build itself. At the high-level I know I need to create a UI to handle the user input and user data. This could be a very intricate task for me involving the seamless use of modal/forms. I need to get a rock-solid definition on how user information is received and managed. Below I will share my immediate thoughts on the matter:

*- There are currently 5 pages: Home, Workouts, Meals, Groceries, About. I am considering whether to replace the About page with a page called Dashboard that is not only the place new users would provide detailed information through a series of modal/forms, but also where authenticated users can make updates to their existing plans. I imagine user flows similar to this:
*1. "New users and Authenticated users:" Upon landing at the Home page, they can navigate to any page. The Sign In button will appear on every page. Once a new user signs up or an authenticated user signs in, the Sign In button turns to a user profile circle (this functionality currently appears to be working properly).
*2. "New users who have not signed up:" from Home they can navigate to Workouts, Meals, or Groceries and see general information on what the page content will provide them when they become an authenticated user. There will be CTA buttons on these pages (as well as on Home and About) that takes them to the Dashboard page. The Dashboard page will provide general information about how this is the location where their initial input will be received and later updates will be made. The Dashboard page will strongly encourage them to Sign Up so that they can immediately enter their personal data and see their tailored workout, meal, and grocery plans. Once they successfully sign up (no matter what page they are on), the user will be redirected to the Dashboard page so they can immediately begin the process of entering their data into the series of forms. Once submitted and the AI call has been made to generate the 3 plans, the Workouts, Meals, and Groceries pages will be updated to display the user's custom plans. Any additional changes or updates can be made piecemeal at any time from the Dashboard page.
*3. "Authenticated users after being signed in:" their personalized workout, meal, and grocery plans can be viewed on their respective pages. They can visit the Dashboard page to make updates to various parts of the 3 plans, whereupon the Dashboard will show (prior to Save) the affect their update will have on the other 2 plans, if any. Should the user approve of the changes, they click/press Save and receive a success message from the toast provider, then they are navigated to the Workpouts page.