import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * useWeekContext Hook
 *
 * Manages week selection with URL persistence
 * Handles navigation between weeks with boundaries:
 * - Past: 4 weeks back maximum
 * - Future: Unlimited browsing
 * - Generation: Only when <=7 days remain in current plan
 */

// Helper: Get Sunday of the week containing the given date
const getWeekStart = (date, weekStartDay = 'sunday') => {
  const d = new Date(date);
  const day = d.getDay();

  // For Sunday start (0 = Sunday)
  const diff = weekStartDay === 'sunday' ? day : (day === 0 ? 6 : day - 1);

  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper: Get Saturday of the week
const getWeekEnd = (weekStart) => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Helper: Format date as YYYY-MM-DD for URL params
const formatDateParam = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Check if two dates are in the same week
const isSameWeek = (date1, date2) => {
  const week1 = getWeekStart(date1);
  const week2 = getWeekStart(date2);
  return week1.getTime() === week2.getTime();
};

export const useWeekContext = (weekStartDay = 'sunday') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialized = useRef(false);

  // Current week (always today's week)
  const currentWeek = useMemo(() => getWeekStart(new Date(), weekStartDay), [weekStartDay]);

  // Initialize selected week from URL or default to current
  const getInitialWeek = () => {
    const weekParam = searchParams.get('week');
    if (weekParam) {
      try {
        const date = new Date(weekParam + 'T00:00:00'); // Add time to ensure local timezone
        if (!isNaN(date.getTime())) {
          return getWeekStart(date, weekStartDay);
        }
      } catch (e) {
        console.warn('Invalid week param:', weekParam);
      }
    }
    return currentWeek;
  };

  const [selectedWeek, setSelectedWeek] = useState(getInitialWeek);

  // Sync selectedWeek to URL (only on user-initiated changes)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    const selectedParam = formatDateParam(selectedWeek);
    const currentParam = searchParams.get('week');

    if (currentParam !== selectedParam) {
      setSearchParams({ week: selectedParam }, { replace: true });
    }
  }, [selectedWeek]);

  // Calculate week boundaries
  const weekEnd = useMemo(() => getWeekEnd(selectedWeek), [selectedWeek]);

  // 4 weeks ago limit
  const oldestAllowedWeek = useMemo(() => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - (7 * 4)); // 4 weeks back
    return d;
  }, [currentWeek]);

  // Week status
  const isCurrentWeek = useMemo(() =>
    isSameWeek(selectedWeek, currentWeek),
    [selectedWeek, currentWeek]
  );

  const isPastWeek = useMemo(() =>
    selectedWeek < currentWeek && !isCurrentWeek,
    [selectedWeek, currentWeek, isCurrentWeek]
  );

  const isFutureWeek = useMemo(() =>
    selectedWeek > currentWeek,
    [selectedWeek, currentWeek]
  );

  // Check if can navigate to previous week (4 week limit)
  const canGoToPrevWeek = useMemo(() =>
    selectedWeek > oldestAllowedWeek,
    [selectedWeek, oldestAllowedWeek]
  );

  // Navigation functions
  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedWeek(getWeekStart(nextWeek, weekStartDay));
  };

  const goToPrevWeek = () => {
    if (!canGoToPrevWeek) return;
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedWeek(getWeekStart(prevWeek, weekStartDay));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(currentWeek);
  };

  const goToWeek = (date) => {
    setSelectedWeek(getWeekStart(date, weekStartDay));
  };

  // Format date range for display
  const weekDisplay = useMemo(() => {
    const start = selectedWeek.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const end = weekEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  }, [selectedWeek, weekEnd]);

  // Helper: Check if a specific date is in the past
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Helper: Check if a specific date is today
  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  };

  // Helper: Get days remaining in current meal plan
  const getDaysRemainingInPlan = (mealPlan) => {
    if (!mealPlan?.weekStartDate) return 0;

    const planStart = new Date(mealPlan.weekStartDate);
    const planEnd = new Date(planStart);
    planEnd.setDate(planEnd.getDate() + 6); // 7 days total

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    planEnd.setHours(23, 59, 59, 999);

    if (today > planEnd) return 0;

    const diffTime = planEnd - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper: Can user generate a plan? (<=7 days remain)
  const canGeneratePlan = (currentMealPlan) => {
    const daysRemaining = getDaysRemainingInPlan(currentMealPlan);
    return daysRemaining <= 3;
  };

  return {
    // Week selection
    selectedWeek,
    currentWeek,
    weekEnd,
    weekDisplay,

    // Week status
    isCurrentWeek,
    isPastWeek,
    isFutureWeek,

    // Navigation
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    goToWeek,
    canGoToPrevWeek,

    // Date helpers
    isDateInPast,
    isToday,
    getWeekStart: (date) => getWeekStart(date, weekStartDay),

    // Plan helpers
    getDaysRemainingInPlan,
    canGeneratePlan
  };
};

export default useWeekContext;
