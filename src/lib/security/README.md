# Security Utilities

## Overview

The security utilities provide a consistent interface for implementing security measures across the application:

```
src/lib/security/
├── README.md              # This documentation
├── headers.ts             # Security headers management
├── sanitize.ts            # Input sanitization utilities
├── rate-limit.ts          # Rate limiting middleware
├── csrf.ts                # CSRF protection
└── audit.ts               # Security audit logging
```

## Quick Start

```typescript
import { applySecurityHeaders } from '@/lib/security/headers'
import { sanitizeInput } from '@/lib/security/sanitize'
import { rateLimiter } from '@/lib/security/rate-limit'
import { validateCsrfToken } from '@/lib/security/csrf'
import { logSecurityEvent } from '@/lib/security/audit'

// Apply security headers to response
const secureResponse = applySecurityHeaders(response)

// Sanitize user input
const cleanInput = sanitizeInput(userInput)

// Apply rate limiting
const rateLimitResult = await rateLimiter(request, 'api')

// Validate CSRF token
const isValidCsrf = validateCsrfToken(request)

// Log security event
logSecurityEvent('login_attempt', { userId, ip })
```

## Type Safety

All security utilities use comprehensive TypeScript types from `@/types/security.types`:

```typescript
import type {
  SecurityEventType,
  SecurityEventContext,
  RateLimitResult,
  FileValidationResult,
  SecurityHeadersOptions,
} from '@/types/security.types'
```

## Modules

### headers.ts

Security headers management using configuration from `src/config/security.ts`.

**Key Functions:**

- `applySecurityHeaders()` - Apply all security headers to response
- `generateCSPNonce()` - Generate CSP nonce for inline scripts
- `setSecureCookie()` - Set cookies with security configuration

### sanitize.ts

Input sanitization utilities to prevent XSS and injection attacks.

**Key Functions:**

- `sanitizeHtml()` - Clean HTML content
- `sanitizeInput()` - General input sanitization
- `validateAndSanitizeFile()` - File upload validation and sanitization

### rate-limit.ts

Rate limiting middleware with configurable limits per endpoint type.

**Key Functions:**

- `rateLimiter()` - Apply rate limiting based on endpoint type
- `createRateLimiter()` - Create custom rate limiter
- `getRateLimitStatus()` - Check current rate limit status

### csrf.ts

CSRF protection utilities for form submissions and API calls.

**Key Functions:**

- `generateCsrfToken()` - Generate CSRF token
- `validateCsrfToken()` - Validate CSRF token
- `csrfMiddleware()` - CSRF protection middleware

### audit.ts

Security audit logging with PII sanitization and event categorization.

**Key Functions:**

- `logSecurityEvent()` - Log security events with proper sanitization
- `auditUserAction()` - Audit user actions
- `createAuditTrail()` - Create comprehensive audit trail

## Integration with Middleware

```typescript
// src/middleware.ts
import { applySecurityHeaders } from '@/lib/security/headers'
import { rateLimiter } from '@/lib/security/rate-limit'
import { csrfMiddleware } from '@/lib/security/csrf'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  // Apply security layers
  response = applySecurityHeaders(response)
  response = await rateLimiter(request, response)
  response = await csrfMiddleware(request, response)

  return response
}
```

## Configuration

All security utilities use the configuration from `src/config/security.ts`:

```typescript
import { SECURITY_CONFIG } from '@/config/security'

// Access configuration
const headers = SECURITY_CONFIG.headers
const rateLimit = SECURITY_CONFIG.rateLimit
const validation = SECURITY_CONFIG.validation
```

## Testing

Each utility module includes comprehensive tests:

```bash
# Run security utility tests
npm test src/lib/security/

# Run specific module tests
npm test src/lib/security/headers.test.ts
npm test src/lib/security/sanitize.test.ts
```

## Best Practices

1. **Always use configuration** from `src/config/security.ts`
2. **Log security events** using the audit utilities
3. **Validate inputs** before processing
4. **Apply rate limiting** to all public endpoints
5. **Use CSRF protection** for state-changing operations
6. **Sanitize all user inputs** before storage or display

## Related Documentation

- [Security Documentation](../../docs/security.md) - Comprehensive security guide
- [Security Configuration](../config/security.ts) - Security config
- [Security Types](../../types/security.types.ts) - TypeScript type definitions
- [API Documentation](../../docs/api.md) - API security implementation
