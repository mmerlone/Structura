import { Container, Typography, Box } from '@mui/material'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ProfileForm } from '@/components/profile/ProfileForm'
import { AuthService } from '@/lib/auth/actions/client'
import { createClient } from '@/lib/supabase/server'
import { ProfileServerService } from '@/lib/supabase/services/database/profiles/profile.server'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile settings and preferences',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const authService = AuthService.create(supabase)

  const user = await authService.getUser()

  if (!user) {
    redirect('/auth')
  }

  const profileService = await ProfileServerService.create()
  const profile = await profileService.getProfile(user.id)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Manage your profile settings and preferences
      </Typography>

      <Box sx={{ width: '100%' }}>
        <ProfileForm user={user} profile={profile} />
      </Box>
    </Container>
  )
}
