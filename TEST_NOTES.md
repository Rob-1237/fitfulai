Now Let's Continue the Discussion

  We're safely on the new branch. Now let's shape the direction of this meals + groceries-focused app.

  Key questions to explore:

  1. User profile data: What do we keep from the current onboarding?
    - Age, weight, height, gender (for portion sizing)
    - Dietary preferences (vegetarian, keto, allergies)
    - Household size (cooking for 1, 2, 4 people?)
    - Budget constraints?
  2. Meal planning frequency:
    - Weekly meal plans (7 days)?
    - Or more flexible (plan 3-5 days at a time)?
  3. Grocery list intelligence:
    - Start simple (categorized list by grocery section)?
    - Or build toward store location features from day one?
  4. The AI differentiation:
    - What makes this "AI-powered" vs. a manual meal planner?
    - Budget optimization? Pantry awareness? Recipe adaptation?

  What aspect should we tackle first? Or do you have a specific vision forming?


  _____________


  Start with:
  - Meal planning based on dietary preferences + budget
  - Smart grocery list generation (grouped by category)
  - Simple manual store location notes ("Where did you find this?")
  - Add AI store intelligence later as differentiation grows

_______________

"Critical Scope Answers:"

  1. All 3 meals (breakfast, lunch, dinner) = 21 meals/week
  
  2. I like your recommendations, but we would need to gather Age, Height, Weight, etc. for each family member. Does that flow seem alright?

  3. We can do a quick setup modal → Generate first plan → Show meal calendar. Then there could be an option to add more people later.
  
  4. When user clicks "Swap This Meal" on a recipe card, show modal with 3-5 AI alternative recipes, user picks one.

  5. We should keep only ONE active meal plan per user (simpler)
  
I'm just trying to ensure we don't build an app that can only be useful to poeple who live alone and/or cook for one person. We should strongly consider getting rid of personal info like Age, weight, and height,, because then we can focus on servings, calories, prices, and ounces.


______________

Once I signed up, I again got the error in the console saying "User document does not exist in Firestore."
When I completed the onboarding fields and clicked "Generate my Meal PLan", the following error displayed:
```No document to update: projects/fitfulai-994f6/databases/(default)/documents/users/gzr92u4jgbZaQqos4NJgQ5RGDOp1```