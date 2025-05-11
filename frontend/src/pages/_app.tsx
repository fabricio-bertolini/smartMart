import '@/styles/tailwind.css';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { DarkModeProvider } from '../context/DarkModeContext'
import { DarkModeToggle } from '../components/DarkModeToggle'

/**
 * SmartMart Application Root Component
 * 
 * This is the top-level component for the SmartMart application.
 * It wraps all pages with common providers and UI elements.
 * 
 * Features:
 * - Global style imports
 * - Dark mode context provider integration
 * - Dark mode toggle accessible across all pages
 * - Page transitions and layouts
 * 
 * @param {AppProps} props - Standard Next.js app props containing Component and pageProps
 * @returns The wrapped application with providers and global UI elements
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    // Wrap the entire application in the DarkModeProvider for theme management
    <DarkModeProvider>
      {/* Global floating dark mode toggle available on all pages */}
      <DarkModeToggle />
      
      {/* Render the current page component with its props */}
      <Component {...pageProps} />
    </DarkModeProvider>
  )
}
