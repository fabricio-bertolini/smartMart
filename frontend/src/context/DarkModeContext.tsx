import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Interface defining the shape of the DarkMode context value
 */
interface DarkModeContextValue {
  /**
   * Boolean indicating if dark mode is currently active
   */
  isDarkMode: boolean;
  
  /**
   * Function to toggle between light and dark mode
   */
  toggleDarkMode: () => void;
}

/**
 * Interface for the DarkModeProvider props
 */
interface DarkModeProviderProps {
  /**
   * Child components that will have access to the dark mode context
   */
  children: ReactNode;
}

/**
 * Create the DarkMode context with default values
 * 
 * Default values are set but will be overridden by the provider
 */
const DarkModeContext = createContext<DarkModeContextValue>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

/**
 * DarkModeProvider Component
 * 
 * Context provider that manages dark mode state and persistence.
 * Automatically syncs with system preferences and local storage.
 * 
 * Features:
 * - Local storage persistence
 * - System preference detection
 * - Body class management for global styling
 * - Smooth transitions between themes
 * 
 * @param {DarkModeProviderProps} props - Component properties
 * @returns Provider component that makes dark mode state available to children
 */
export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  // Initialize state from local storage or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check for saved preference in localStorage
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      
      // If no saved preference, use system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Default to light mode if running on server
    return false;
  });

  /**
   * Toggle between light and dark mode
   * Updates state and persists to localStorage
   */
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  /**
   * Effect that handles theme changes in the DOM
   * Updates body class and stores preference in localStorage
   */
  useEffect(() => {
    // Exit early if running on server
    if (typeof window === 'undefined') return;
    
    // Update body class for global styling
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Apply/remove dark background color
    document.body.style.backgroundColor = isDarkMode ? '#1a202c' : '#f7fafc';
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);
  
  /**
   * Effect for handling system preference changes
   * Listens for changes to system color scheme preference
   */
  useEffect(() => {
    // Exit early if running on server or system doesn't support preference
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Handler for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      // Only change mode if user hasn't explicitly set a preference
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Add event listener for preference changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up event listener on component unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Provide dark mode context to children
  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

/**
 * Custom hook for consuming the DarkMode context
 * 
 * Provides convenient access to dark mode state and toggle function
 * 
 * @returns DarkModeContextValue containing isDarkMode state and toggleDarkMode function
 * @throws Error if used outside of a DarkModeProvider
 * 
 * @example
 * const { isDarkMode, toggleDarkMode } = useDarkMode();
 * 
 * return (
 *   <button onClick={toggleDarkMode}>
 *     {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
 *   </button>
 * );
 */
export const useDarkMode = (): DarkModeContextValue => {
  const context = useContext(DarkModeContext);
  
  // Ensure the hook is used within a provider
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  
  return context;
};
