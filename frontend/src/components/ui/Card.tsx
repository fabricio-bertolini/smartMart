import React from 'react';

/**
 * Card Props Interface
 * @param children - Card content
 * @param className - Additional CSS classes
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card Component
 * 
 * A versatile container component that provides consistent styling for content blocks.
 * Used throughout the application for grouping related content with consistent spacing
 * and visual treatment. Fully supports dark mode.
 * 
 * Features:
 * - Consistent padding and spacing
 * - Rounded corners
 * - Shadow effects
 * - Dark mode support
 * - Customizable via className prop
 * - Accessible contrast in both themes
 * 
 * @example
 * ```tsx
 * <Card className="mt-4">
 *   <h2>Card Title</h2>
 *   <p>Card content...</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 
        dark:text-gray-100 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
};
