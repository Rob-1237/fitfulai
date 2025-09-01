import { useState } from "react";
import Modal from "../ui/Modal";

export default function SettingsModal({ open, onClose }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Settings
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="light"
                checked={theme === 'light'}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="mr-2 text-blue-600"
              />
              <span className="text-sm text-gray-700">Light</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="dark"
                checked={theme === 'dark'}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="mr-2 text-blue-600"
              />
              <span className="text-sm text-gray-700">Dark</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}