import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * WeekSelector Component
 *
 * Provides UI for navigating between weeks
 * - Previous/Next week buttons
 * - Current week date range display
 * - "Today" button to jump back to current week
 * - Status badge (Current/Past/Future)
 */

interface WeekSelectorProps {
  weekDisplay: string;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
  isFutureWeek: boolean;
  canGoToPrevWeek: boolean;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToCurrentWeek: () => void;
  isDark: boolean;
}

export default function WeekSelector({
  weekDisplay,
  isCurrentWeek,
  isPastWeek,
  isFutureWeek,
  canGoToPrevWeek,
  goToNextWeek,
  goToPrevWeek,
  goToCurrentWeek,
  isDark
}: WeekSelectorProps) {
  // Determine badge color and text
  const getBadge = () => {
    if (isCurrentWeek) {
      return {
        text: 'Current Week',
        classes: 'bg-green-100 text-green-800'
      };
    }
    if (isPastWeek) {
      return {
        text: 'Past Week',
        classes: 'bg-gray-100 text-gray-700'
      };
    }
    if (isFutureWeek) {
      return {
        text: 'Future Week',
        classes: 'bg-blue-100 text-blue-800'
      };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm mb-4`}
    >
      {/* Left: Week navigation */}
      <div className="flex items-center space-x-3">
        {/* Previous Week Button */}
        <button
          onClick={goToPrevWeek}
          disabled={!canGoToPrevWeek}
          className={`p-2 rounded-lg transition-colors ${
            canGoToPrevWeek
              ? isDark
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
          aria-label="Previous week"
          title={!canGoToPrevWeek ? 'Cannot view more than 4 weeks back' : 'Previous week'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Date Range Display */}
        <div className="flex items-center space-x-2">
          <Calendar
            className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          />
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {weekDisplay}
          </span>
        </div>

        {/* Next Week Button */}
        <button
          onClick={goToNextWeek}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          aria-label="Next week"
          title="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Status badge and "Today" button */}
      <div className="flex items-center space-x-3">
        {/* Status Badge */}
        {badge && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${badge.classes}`}>
            {badge.text}
          </span>
        )}

        {/* "Today" Button - only show if not viewing current week */}
        {!isCurrentWeek && (
          <button
            onClick={goToCurrentWeek}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Jump to current week"
          >
            Today
          </button>
        )}
      </div>
    </motion.div>
  );
}
