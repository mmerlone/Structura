import { NextResponse, type NextRequest } from 'next/server'

import { buildLogger } from '@/lib/logger/server'
import { createClient } from '@/lib/supabase/server'

const logger = buildLogger('auth-middleware')

// List of routes that require verified email
const VERIFIED_EMAIL_REQUIRED_PATHS = [
  '/dashboard',
  '/account',
  '/profile',
  '/settings',
  // Add more protected routes as needed
]

export async function requireVerifiedEmail(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const supabase = await createClient()
  const { pathname } = request.nextUrl

  // Skip if the current path doesn't require verification
  if (!VERIFIED_EMAIL_REQUIRED_PATHS.some((path) => pathname.startsWith(path))) {
    return response
  }

  try {
    // Get the user session using the Supabase client
    const { data, error } = await supabase.auth.getUser()

    // Handle error case first
    if (error) {
      logger.warn({ err: error, path: pathname }, 'Error fetching user in requireVerifiedEmail')
      return response
    }

    const { user } = data

    // If no user, let the auth flow handle redirection
    if (user === null) {
      return response
    }

    // If email is not verified, redirect to home with a message
    if (user.confirmed_at === null) {
      logger.info({ userId: user.id }, 'Redirecting unverified user from protected route')
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('message', 'Please verify your email to access this page')
      return NextResponse.redirect(redirectUrl)
    }

    // If we get here, the user is verified
    return response
  } catch (error) {
    logger.error({ err: error, path: pathname }, 'Error in requireVerifiedEmail middleware')
    return response
  }
}
