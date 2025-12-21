import { Box, Container, Grid, Paper, Skeleton, Typography } from '@mui/material'

export default function ProfileLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page header */}
      <Typography variant="h4" component="h1" gutterBottom>
        <Skeleton width="40%" />
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        <Skeleton width="60%" />
      </Typography>

      {/* Grid layout matching ProfileForm */}
      <Box sx={{ mt: 1, width: '100%' }}>
        <Grid container spacing={3}>
          {/* Left Column - Avatar Section (md: 4 columns) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={120} height={120} />
                <Skeleton variant="text" width={140} height={24} />
                <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Form Sections (md: 8 columns) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Account Details Section */}
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Box>
              </Paper>

              {/* Personal Info Section */}
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                </Box>
              </Paper>

              {/* Contact Info Section */}
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width={160} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Box>
              </Paper>

              {/* Location Info Section */}
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width={170} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Box>
              </Paper>

              {/* Professional Info Section */}
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Box>
              </Paper>

              {/* Form action buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                <Skeleton variant="rectangular" width="100%" height={42} sx={{ borderRadius: 1, maxWidth: 200 }} />
                <Skeleton variant="rectangular" width="100%" height={42} sx={{ borderRadius: 1, maxWidth: 200 }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}
