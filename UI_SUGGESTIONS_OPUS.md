You've got a solid technical foundation with Vite + React + Supabase. The package choices are smart (Radix for accessible components, Framer Motion for animations, Zustand for state). Now let's design a dashboard that makes data input feel effortless.
Dashboard UI Strategy
Based on your flow, the Dashboard needs to serve two distinct modes:
1. Onboarding Mode (New Users)
Instead of traditional wizard steps, consider a single scrollable page with collapsible sections that show progress:
┌─────────────────────────────────────┐
│ Your Fitness Profile     65% Complete│
├─────────────────────────────────────┤
│ ✅ Basic Info                       │
│ ✅ Fitness Goals                    │
│ 🔄 Activity Level                   │
│ ⭕ Dietary Preferences              │
│ ⭕ Schedule Preferences             │
└─────────────────────────────────────┘
Each section expands with smooth Framer Motion animations. Completed sections show a summary. This lets users jump around if needed rather than forcing linear progression.
2. Edit Mode (Returning Users)
A change preview system that shows impacts before committing:
┌─────────────────────────────────────────┐
│         Proposed Changes                │
├─────────────────────────────────────────┤
│ Adding: 3x weekly pushups (30 reps)     │
│                                         │
│ Impact Analysis:                        │
│ • +180 calories burned/week            │
│ • Suggested meal adjustment:           │
│   → Add 1 protein shake on workout days│
│   → Increase lunch portions by 15%     │
│                                         │
│ [Cancel]            [Preview] [Apply]   │
└─────────────────────────────────────────┘
Key UI Components You'll Need
1. Exercise Input Component
Use Radix Select + custom frequency picker:
jsx<div className="exercise-input-card">
  <Select placeholder="Choose exercise...">
    {/* Searchable dropdown with exercise categories */}
  </Select>
  
  <div className="frequency-grid">
    {['M','T','W','T','F','S','S'].map(day => (
      <button className="day-toggle" />
    ))}
  </div>
  
  <Slider 
    label="Sets" 
    min={1} max={10}
  />
  <Slider 
    label="Reps" 
    min={1} max={50}
  />
</div>
2. Visual Impact Indicator
When users make changes, show a diff-style view:
jsx<div className="impact-preview">
  <div className="metric-change">
    <span>Weekly Calories</span>
    <span className="old">2,100</span>
    <span className="arrow">→</span>
    <span className="new text-green-500">2,280</span>
  </div>
</div>
3. Progressive Disclosure for Complex Inputs
For dietary preferences, use a two-tier system:
jsx// First show common options as toggles
<div className="diet-quick-select">
  {['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free'].map(diet => (
    <Toggle key={diet} label={diet} />
  ))}
  <button onClick={showAdvanced}>More options...</button>
</div>

// Advanced opens a sheet with detailed preferences
<Sheet>
  <h3>Specific Restrictions</h3>
  {/* Tag input for allergies */}
  {/* Sliders for macro preferences */}
</Sheet>
4. Smart Defaults & Tooltips
Reduce friction with intelligent defaults:
jsx// Detect patterns and suggest
"We noticed you work out MWF. Should we set this as your default schedule?"

// Contextual help without leaving the flow
<Popover>
  <PopoverTrigger>
    <InfoIcon className="inline ml-1" />
  </PopoverTrigger>
  <PopoverContent>
    <p>Moderate activity = 3-5 workout days/week</p>
  </PopoverContent>
</Popover>
Mobile-First Interaction Patterns
Since this is primarily mobile:

Bottom sheets instead of modals (Radix Dialog with custom styling)
Swipe gestures for day-by-day navigation
Thumb-zone actions - primary buttons at bottom
Accordion sections instead of tabs (better for one-handed use)

Data Input Optimization
To minimize the pain of data entry:

Bulk operations: "Copy Monday's workout to Wednesday and Friday"
Templates: "Start with a beginner strength template"
Quick-add patterns: Recent/frequent exercises at the top
Voice-to-text for food preferences (using browser APIs)
___

Your SQL schemas tell me a lot. The JSONB fields for exercises, meals, and nutrition give you flexibility, while the structured profile data ensures consistency. Let me design a dashboard UI that maps elegantly to these tables.
Dashboard Architecture Based on Your Schema
Onboarding Flow Sections
Map directly to profiles table fields:
jsx// Section 1: Basic Info
const BasicInfoSection = () => (
  <Card className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Select name="age" placeholder="Age">
        {[...Array(82)].map((_, i) => (
          <option key={i+18} value={i+18}>{i+18}</option>
        ))}
      </Select>
      
      <Select name="gender" placeholder="Gender">
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </Select>
    </div>
    
    {/* Smart unit toggle - stores both lbs/kgs */}
    <div className="flex items-center gap-2">
      <Input 
        type="number" 
        placeholder="Weight"
        onChange={(e) => {
          const lbs = e.target.value;
          updateProfile({
            weight_lbs: lbs,
            weight_kgs: Math.round(lbs * 0.453592)
          });
        }}
      />
      <Switch 
        label="lbs/kg"
        onCheckedChange={toggleUnits}
      />
    </div>
  </Card>
);
Workout Builder Component
Since exercises is JSONB, structure it for flexibility:
jsx// exercises JSONB structure
{
  "exercise_id": "bench_press_001",
  "name": "Bench Press",
  "type": "strength",
  "sets": 3,
  "reps": 10,
  "weight": 150,
  "rest_seconds": 90,
  "notes": "Focus on form"
}

// Workout input component
const WorkoutBuilder = () => {
  const [workout, setWorkout] = useState({
    title: "",
    exercises: [],
    scheduled_date: null,
    duration_minutes: 0,
    calories_burned: 0 // AI will calculate this
  });

  return (
    <div className="space-y-4">
      {/* Drag and drop exercise list */}
      <DndContext>
        <SortableContext items={workout.exercises}>
          {workout.exercises.map((exercise) => (
            <ExerciseCard 
              key={exercise.id}
              exercise={exercise}
              onUpdate={updateExercise}
              onDelete={removeExercise}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      <Button 
        variant="outline" 
        onClick={openExerciseLibrary}
        className="w-full border-dashed"
      >
        <Plus className="mr-2" /> Add Exercise
      </Button>
    </div>
  );
};
Meal Planning Interface
Leverage the workout_sync_id for smart suggestions:
jsxconst MealPlanner = ({ workoutId }) => {
  // Structure for ingredients JSONB
  const mealStructure = {
    title: "Post-Workout Protein Bowl",
    meal_type: "lunch",
    ingredients: [
      { name: "Chicken Breast", amount: 6, unit: "oz" },
      { name: "Brown Rice", amount: 1, unit: "cup" },
      { name: "Broccoli", amount: 2, unit: "cups" }
    ],
    nutrition_info: {
      calories: 520,
      protein: 45,
      carbs: 55,
      fat: 12,
      fiber: 8
    },
    workout_sync_id: workoutId, // Links to specific workout
    ai_generated: true
  };

  return (
    <Card className="p-4">
      {/* Visual indicator of workout sync */}
      {meal.workout_sync_id && (
        <Badge className="mb-2 bg-blue-100">
          <Link className="h-3 w-3 mr-1" />
          Synced to {workout.title}
        </Badge>
      )}
      
      {/* Nutrition at a glance */}
      <div className="flex justify-between text-sm mb-4">
        <span>{meal.nutrition_info.calories} cal</span>
        <span>{meal.nutrition_info.protein}g protein</span>
        <span>{meal.nutrition_info.carbs}g carbs</span>
      </div>
      
      {/* Ingredient list with portions */}
      <ul className="space-y-1">
        {meal.ingredients.map((ing, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span>{ing.name}</span>
            <span className="text-gray-500">
              {ing.amount} {ing.unit}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
Change Preview System
Using your ai_cache table to show impacts without re-calling AI:
jsxconst ChangePreview = ({ proposedChanges }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const generatePreview = async () => {
    setLoading(true);
    
    // Check cache first
    const cacheKey = hashChanges(proposedChanges);
    const cached = await checkAICache(cacheKey);
    
    if (cached) {
      setPreview(cached.response_data);
    } else {
      // Call AI for impact analysis
      const impact = await analyzeImpact(proposedChanges);
      
      // Cache the result
      await saveToAICache({
        request_hash: cacheKey,
        response_data: impact,
        prompt_type: 'impact_analysis',
        expires_at: addDays(new Date(), 7)
      });
      
      setPreview(impact);
    }
    setLoading(false);
  };
  
  return (
    <Sheet>
      <SheetContent className="w-full sm:max-w-xl">
        <h3 className="font-semibold mb-4">Impact Analysis</h3>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : preview && (
          <div className="space-y-4">
            {/* Calorie adjustment */}
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Your weekly calorie needs will increase by {preview.calorie_delta}
              </AlertDescription>
            </Alert>
            
            {/* Meal suggestions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommended Meal Adjustments</h4>
              {preview.meal_changes.map((change, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{change.day}</Badge>
                  <span>{change.suggestion}</span>
                </div>
              ))}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={cancel}>
                Cancel
              </Button>
              <Button onClick={applyChanges}>
                Apply Changes
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
Smart Grocery List Aggregation
Using the meal_plan_ids array to aggregate groceries:
jsxconst GroceryListGenerator = ({ mealPlanIds }) => {
  const generateList = () => {
    // Aggregate all ingredients from linked meals
    const aggregated = meals.reduce((acc, meal) => {
      meal.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        if (acc[key]) {
          acc[key].amount += convertToBaseUnit(ing.amount, ing.unit);
        } else {
          acc[key] = { ...ing };
        }
      });
      return acc;
    }, {});
    
    // Group by category
    return {
      proteins: filterByCategory(aggregated, 'protein'),
      grains: filterByCategory(aggregated, 'grain'),
      produce: filterByCategory(aggregated, 'produce'),
      dairy: filterByCategory(aggregated, 'dairy'),
      other: filterByCategory(aggregated, 'other')
    };
  };
};
Profile Completion Indicator
Based on your onboarding_completed flag:
jsxconst ProfileCompleteness = ({ profile }) => {
  const calculateCompleteness = () => {
    const required = ['age', 'weight_lbs', 'height_inches', 'gender', 'fitness_goal'];
    const optional = ['dietary_preferences', 'allergies', 'activity_level'];
    
    const requiredComplete = required.filter(field => profile[field]).length;
    const optionalComplete = optional.filter(field => 
      profile[field] && profile[field].length > 0
    ).length;
    
    return {
      percentage: Math.round(((requiredComplete + optionalComplete * 0.5) / 8) * 100),
      missing: required.filter(field => !profile[field])
    };
  };
  
  const { percentage, missing } = calculateCompleteness();
  
  if (percentage === 100) {
    // Set onboarding_completed = true
    return null;
  }
  
  return (
    <Alert className="mb-4">
      <AlertDescription>
        Complete your profile to get personalized recommendations
        <Progress value={percentage} className="mt-2" />
      </AlertDescription>
    </Alert>
  );
};
Key UI Decisions Based on Your Schema

Store both metric and imperial - Your schema has both weight_lbs/weight_kgs. The UI should show user's preference but store both for AI flexibility.
JSONB for flexibility - Since exercises, ingredients, and nutrition are JSONB, you can evolve the structure without migrations.
AI generation tracking - With ai_generations_used and ai_generations_reset, show users their usage:
jsx<div className="text-sm text-gray-500">
  {profile.ai_generations_used}/10 AI updates this month
</div>

Subscription-aware UI - Hide/show features based on tier and subscription_status.