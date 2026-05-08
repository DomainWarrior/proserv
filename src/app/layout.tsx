import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ProServ — Professional Local Services',
    template: '%s | ProServ',
  },
  description:
    'ProServ delivers professional lawn care, cleaning, handyman, and outdoor services. Book online, track your appointment, and pay securely.',
  keywords: ['lawn care', 'house cleaning', 'local service', 'handyman', 'snow removal'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ProServ',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-off-white text-navy-DEFAULT">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0a1628',
                color: '#fff',
                borderLeft: '4px solid #c9a84c',
                borderRadius: '10px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
