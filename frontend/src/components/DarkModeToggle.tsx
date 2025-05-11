import React, { useEffect, useState } from "react";
import { useDarkMode } from "../context/DarkModeContext";

/**
 * DarkModeToggle Component
 * 
 * A floating button component that toggles between light and dark mode.
 * Uses the DarkModeContext to manage theme state and persistence.
 * 
 * Features:
 * - Fixed position in the top-right corner
 * - Accessible button with proper ARIA attributes
 * - Visual indicators for current mode
 * - Smooth transition effects
 * - Z-index to ensure visibility across the application
 * 
 * @returns React component with toggle button
 */
export const DarkModeToggle: React.FC = () => {
  // Handle mounting state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  /**
   * Effect to handle component mounting
   * Prevents hydration mismatch by delaying render
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <button
      // Position and styling for the toggle button
      className="fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg 
        bg-white dark:bg-gray-800 
        text-gray-800 dark:text-gray-100 
        hover:bg-gray-100 dark:hover:bg-gray-700 
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
        border border-gray-200 dark:border-gray-600
        transition-all duration-200"
      onClick={toggleDarkMode}
      // Accessibility attributes
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        // Sun icon for dark mode (clicking will switch to light mode)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        // Moon icon for light mode (clicking will switch to dark mode)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};
