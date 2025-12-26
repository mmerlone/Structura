'use client'

import { Box } from '@mui/material'
import { ReactNode } from 'react'

import { CookieBanner } from '@/components/cookie/CookieBanner'
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { DatadogProvider } from '@/components/providers/DatadogProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SnackbarProvider } from '@/contexts/SnackbarContext'

export function LayoutClient({ children }: { children: ReactNode }): JSX.Element {
  return (
    <DatadogProvider>
      <QueryProvider>
        <AuthProvider>
          <GlobalErrorBoundary>
            <ThemeProvider>
              <SnackbarProvider>
                <Box id="layout-client-container">
                  <Header />
                  <Box component="main">{children}</Box>
                  <Footer />
                  <CookieBanner />
                </Box>
              </SnackbarProvider>
            </ThemeProvider>
          </GlobalErrorBoundary>
        </AuthProvider>
      </QueryProvider>
    </DatadogProvider>
  )
}
