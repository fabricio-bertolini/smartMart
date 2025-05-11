import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom Document Component
 * 
 * Customizes the application's HTML and body tags.
 * This component is rendered on the server side and sets
 * up the initial document structure.
 * 
 * Features:
 * - Custom HTML attributes (lang)
 * - Meta tags for SEO and accessibility
 * - Font preloading
 * - Theme color settings
 * - Initial dark mode class setup
 * 
 * Note: This component is only rendered on the server
 * and not on client-side navigations.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags for SEO and device compatibility */}
        <meta charSet="utf-8" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111827" />
        
        {/* Font preloading could be added here */}
        {/* <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        /> */}
      </Head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
