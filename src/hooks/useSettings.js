/**
 * useSettings Hook
 *
 * Re-exports the useSettings hook from SettingsContext for backward compatibility.
 * All settings logic has been moved to SettingsContext to enable global state management.
 *
 * For new code, you can import directly from '../contexts/SettingsContext'
 */

export { useSettings } from '../contexts/SettingsContext';
