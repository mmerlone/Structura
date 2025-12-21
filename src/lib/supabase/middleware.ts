import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { buildLogger } from '@/lib/logger/server'

const logger = buildLogger('supabase-middleware')

export async function updateSession(request: NextRequest, incomingResponse?: NextResponse): Promise<NextResponse> {
  // Use incoming response if provided, otherwise create a new one
  const response = incomingResponse || NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, ...options }) => {
              // Skip if this is an error response (status >= 400)
              if (response.status >= 400) {
                return
              }

              // Update request cookies for current request
              request.cookies.set(name, value)

              // Set secure, httpOnly, and sameSite defaults for auth cookies
              const secure = process.env.NODE_ENV === 'production'
              const cookieOptions = {
                ...options,
                httpOnly: true,
                secure,
                sameSite: 'lax' as const,
                path: '/',
              }

              // Set response cookies with secure options
              response.cookies.set(name, value, cookieOptions)
            })
          },
        },
      }
    )

    // Skip auth check if this is already an error response
    if (response.status >= 400) {
      return response
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      logger.error({ error: error.message }, 'Failed to verify user')
      // Don't override existing error responses
      return response.status >= 400 ? response : response
    }

    if (user) {
      logger.debug({ userId: user.id }, 'User verified in middleware')
      // Add user info to request headers for server components
      const newHeaders = new Headers(response.headers)
      newHeaders.set('x-user-id', user.id)
      newHeaders.set('x-user-email', user.email ?? '')

      // Create a new response with updated headers
      const newResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })

      // Copy cookies from the original response
      response.cookies.getAll().forEach((cookie) => {
        newResponse.cookies.set(cookie)
      })

      return newResponse
    }

    return response
  } catch (error) {
    logger.error({ error }, 'Unexpected error in session management')
    // Preserve existing error responses
    return response.status >= 400 ? response : response
  }
}
