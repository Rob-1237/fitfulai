-- Create test profile for rchambers1237@gmail.com
-- User ID from your auth logs: 840fc951-adf8-41fc-9a42-20028c342e93

INSERT INTO profiles (
  id,
  created_at,
  updated_at,
  email,
  name,
  image,
  tier,
  onboarding_completed,
  
  -- Physical characteristics
  age,
  weight_lbs,
  weight_kgs,
  height_inches,
  height_centimeters,
  gender,
  
  -- Fitness & nutrition preferences
  fitness_goal,
  activity_level,
  dietary_preferences,
  allergies,
  
  -- Calculated metrics
  bmr,
  tdee,
  calorie_target,
  macros,
  
  -- Subscription & usage
  subscription_id,
  subscription_status,
  subscription_end_date,
  ai_generations_used,
  ai_generations_reset
) VALUES (
  '840fc951-adf8-41fc-9a42-20028c342e93',
  NOW(),
  NOW(),
  'rchambers1237@gmail.com',
  'Rob Chambers',
  NULL,
  'free',
  true,
  
  -- Physical characteristics (example data)
  35,
  180,
  81.6,
  72,
  183,
  'male',
  
  -- Fitness preferences
  'general_fitness',
  'moderate',
  ARRAY['vegetarian'],
  ARRAY['nuts'],
  
  -- Calculated metrics (will be auto-calculated)
  1800,
  2400,
  2200,
  '{"protein": 140, "carbs": 275, "fat": 87}'::json,
  
  -- Subscription
  NULL,
  'active',
  NULL,
  5,
  NOW()
);