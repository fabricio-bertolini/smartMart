/** 
 * @type {import('tailwindcss').Config} 
 * Tailwind CSS configuration for SmartMart application
 * This file defines the Tailwind configuration including:
 * - Content paths for Tailwind to scan for class names
 * - Dark mode configuration (using 'class' strategy)
 * - Theme customization options
 */
module.exports = {
  // Define the content sources that Tailwind should analyze
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Configure dark mode to use class-based switching instead of media queries
  darkMode: 'class',
  // Theme customization options
  theme: {
    extend: {},
  },
  // Additional plugins (none used currently)
  plugins: [],
};
