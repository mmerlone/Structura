'use client'

import { Box, CircularProgress, Typography } from '@mui/material'

export default function Loading(): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
      }}>
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  )
}
