import { Box, CircularProgress } from '@mui/material'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ConfirmEmailView } from '@/components/auth/ConfirmEmailView'

export const metadata: Metadata = {
  title: 'Confirm Email',
  description: 'Confirm your email address to complete registration',
}

export default function ConfirmPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      }>
      <ConfirmEmailView />
    </Suspense>
  )
}
