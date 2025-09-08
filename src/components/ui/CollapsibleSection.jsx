import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faCheck, 
  faCircle,
  faSpinner
} from '@fortawesome/pro-duotone-svg-icons';

/**
 * Collapsible accordion section for Dashboard forms
 * Based on consultant recommendations for mobile-first, one-section-at-a-time UX
 */
const CollapsibleSection = ({
  title,
  icon,
  summary,
  isComplete = false,
  isLoading = false,
  isLocked = false,
  isOpen = false,
  onToggle,
  children,
  completionMessage = "Section completed!",
  lockMessage = "Complete previous sections first",
  className = "",
  // Theme props
  isDark = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const handleToggle = () => {
    if (isLocked) return;
    
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  // Determine section status
  const getStatusIcon = () => {
    if (isLoading) return faSpinner;
    if (isComplete) return faCheck;
    if (isLocked) return faCircle;
    return isExpanded ? faChevronUp : faChevronDown;
  };

  const getStatusColor = () => {
    if (isComplete) return 'text-green-500';
    if (isLocked) return isDark ? 'text-[var(--color-md-gray)]' : 'text-gray-400';
    if (isLoading) return 'text-[var(--color-orange)]';
    return isDark ? 'text-[var(--color-lt-gray)]' : 'text-[var(--color-dk-gray)]';
  };

  const getHeaderBg = () => {
    if (isComplete) {
      return isDark 
        ? 'bg-green-900/20 border-green-600/30' 
        : 'bg-green-50 border-green-200';
    }
    if (isLocked) {
      return isDark 
        ? 'bg-[var(--color-dk-gray)]/20 border-[var(--color-md-gray)]/30' 
        : 'bg-gray-50 border-gray-200';
    }
    if (isExpanded) {
      return isDark 
        ? 'bg-[var(--color-orange)]/10 border-[var(--color-orange)]/30' 
        : 'bg-orange-50 border-orange-200';
    }
    return isDark 
      ? 'bg-[var(--color-black)] border-[var(--color-md-gray)]/30' 
      : 'bg-white border-gray-200';
  };

  return (
    <motion.div
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${getHeaderBg()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.button
        onClick={handleToggle}
        disabled={isLocked}
        className={`w-full p-4 flex items-center justify-between text-left transition-colors duration-200 ${
          isLocked 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-opacity-80 cursor-pointer'
        }`}
        whileHover={!isLocked ? { scale: 1.01 } : {}}
        whileTap={!isLocked ? { scale: 0.99 } : {}}
      >
        <div className="flex items-center gap-4">
          {/* Section Icon */}
          {icon && (
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isComplete 
                ? 'bg-green-500 text-white' 
                : isDark 
                  ? 'bg-[var(--color-md-gray)] text-[var(--color-lt-gray)]'
                  : 'bg-gray-100 text-[var(--color-dk-gray)]'
            }`}>
              <FontAwesomeIcon icon={icon} className="text-lg" />
            </div>
          )}

          {/* Title and Summary */}
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold text-lg ${
              isDark ? 'text-[var(--color-white)]' : 'text-[var(--color-dk-gray)]'
            }`}>
              {title}
            </h3>
            
            {/* Summary or Completion Message */}
            {isComplete && completionMessage ? (
              <p className="text-sm text-green-600 font-medium mt-1">
                ✅ {completionMessage}
              </p>
            ) : isLocked && lockMessage ? (
              <p className={`text-sm mt-1 ${
                isDark ? 'text-[var(--color-md-gray)]' : 'text-gray-500'
              }`}>
                🔒 {lockMessage}
              </p>
            ) : summary ? (
              <p className={`text-sm mt-1 ${
                isDark ? 'text-[var(--color-md-gray)]' : 'text-gray-600'
              }`}>
                {summary}
              </p>
            ) : null}
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0 ml-4">
          <FontAwesomeIcon 
            icon={getStatusIcon()} 
            className={`text-xl ${getStatusColor()} ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
        </div>
      </motion.button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`p-6 border-t ${
              isDark 
                ? 'bg-[var(--color-dk-gray)]/10 border-[var(--color-md-gray)]/20' 
                : 'bg-gray-50/50 border-gray-200'
            }`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Pulse Animation */}
      {isExpanded && !isComplete && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={`absolute inset-0 rounded-xl ${
            isDark ? 'bg-[var(--color-orange)]' : 'bg-orange-200'
          }`} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CollapsibleSection;