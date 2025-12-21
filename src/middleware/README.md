# Middleware Library

Application-specific middleware for Next.js applications.

## 🚀 **Quick Start**

```typescript
// middleware.ts (root level)
import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders } from '@/lib/security/headers'
import { rateLimiters } from '@/lib/security/rate-limit'
import { requestLoggerMiddleware } from '@/middleware/request-logger'
import { requireVerifiedEmail } from '@/middleware/require-verified-email'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next()

  // Apply centralized security headers
  response = applySecurityHeaders(response, {
    generateNonce: true,
    strictCSP: process.env.NODE_ENV === 'production',
  })

  // Apply rate limiting for auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    response = await rateLimiters.auth(request, response)
  }

  // Update Supabase session
  response = await updateSession(request, response)

  // Apply email verification for protected routes
  response = await requireVerifiedEmail(request, response)

  // Apply request logging (non-blocking)
  requestLoggerMiddleware(request, response).catch(console.error)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## 📚 **Available Middleware**

### Centralized Security System

Security middleware is provided by `src/lib/security/`:

- **Security Headers** (`@/lib/security/headers`) - Security header management
- **Rate Limiting** (`@/lib/security/rate-limit`) - Configurable rate limiting
- **CSRF Protection** (`@/lib/security/csrf`) - Cross-site request forgery protection
- **Input Sanitization** (`@/lib/security/sanitize`) - XSS prevention and validation
- **Security Audit** (`@/lib/security/audit`) - Security event logging

See `src/lib/security/README.md` for detailed documentation.

### Application Middleware (src/middleware/)

The following middleware files provide application-specific functionality:

- `request-logger.ts` - Request logging middleware
- `require-verified-email.ts` - Email verification enforcement middleware

## 🔧 **Application Middleware Details**

### Request Logger (`request-logger.ts`)

Logs HTTP requests with metadata for monitoring and debugging.

```typescript
import { requestLoggerMiddleware } from '@/middleware/request-logger'

// Apply to all requests (non-blocking)
requestLoggerMiddleware(request, response).catch(console.error)
```

**Features:**

- Logs request method, URL, IP, and user agent
- Non-blocking operation
- Structured logging with context

### Email Verification (`require-verified-email.ts`)

Enforces email verification for protected routes.

```typescript
import { requireVerifiedEmail } from '@/middleware/require-verified-email'

const response = await requireVerifiedEmail(request, NextResponse.next())
```

**Protected Routes:**

- `/dashboard`
- `/account`
- `/profile`
- `/settings`

**Behavior:**

- Checks user authentication status
- Verifies email confirmation
- Redirects unverified users with message
- Skips non-protected routes automatically

## 📖 **Documentation**

For detailed documentation on the security system, see:

- `src/lib/security/README.md` - Complete security utilities documentation
- `docs/security.md` - Security architecture and best practices
- `src/config/security.ts` - Security configuration

## 🧪 **Testing**

```typescript
// __tests__/middleware.test.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireVerifiedEmail } from '@/middleware/require-verified-email'

describe('Email Verification Middleware', () => {
  it('should allow access to non-protected routes', async () => {
    const request = new NextRequest('http://localhost:3000/')
    const response = NextResponse.next()

    const result = await requireVerifiedEmail(request, response)
    expect(result).toBe(response) // No redirect
  })
})
```

## 🤝 **Contributing**

When adding new application-specific middleware:

1. **Focus on application logic** - Use `src/lib/security/` for security features
2. **Type safety** - Use proper TypeScript types
3. **Error handling** - Handle errors gracefully
4. **Testing** - Include comprehensive tests
5. **Documentation** - Add clear examples and JSDoc comments

---

**Last Updated**: December 2025  
**Version**: 1.0.0
