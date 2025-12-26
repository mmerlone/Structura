import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { LayoutClient } from './LayoutClient'

import { getSiteMetadata } from '@/config/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = getSiteMetadata()

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <InitColorSchemeScript attribute="class" />
          <LayoutClient>{children}</LayoutClient>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
