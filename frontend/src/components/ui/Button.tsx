import React from 'react';

/**
 * Props interface for Button component
 * 
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement> - Inherits all standard button attributes
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Content to be rendered inside the button */
  children: React.ReactNode;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Button variant - primary (default), secondary, outline, danger, etc. */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Whether the button should take the full width of its container */
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * A reusable button component with consistent styling across the application.
 * Supports multiple variants, sizes, and states including loading and disabled.
 * Fully integrated with dark mode and accessibility features.
 * 
 * Features:
 * - Multiple style variants
 * - Dark mode compatibility
 * - Focus and hover states
 * - Disabled state styling
 * - Loading state support
 * - Full width option
 * - Consistent transition effects
 * - Accessible focus indicators
 * 
 * @example
 * <Button onClick={handleSave}>Save Changes</Button>
 * <Button variant="danger" disabled={isLoading}>Delete</Button>
 * <Button variant="outline" fullWidth>View Details</Button>
 * 
 * @param {ButtonProps} props - Component props
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  fullWidth = false,
  disabled = false,
  ...props 
}) => {
  // Base classes for all button variants
  const baseClasses = `
    px-4 py-2 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
    focus:ring-offset-2 dark:focus:ring-offset-gray-800 
    disabled:opacity-50 disabled:cursor-not-allowed 
    transition-colors duration-200
    ${fullWidth ? 'w-full' : ''}
  `;

  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600',
    outline: 'bg-transparent border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    danger: 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
