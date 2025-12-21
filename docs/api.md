# API Documentation

This document provides comprehensive documentation for all API endpoints in the Structura application.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Most API endpoints require authentication via Supabase Auth. Authentication is handled through:

- **Session Cookies**: Automatically managed by Supabase Auth
- **JWT Tokens**: Included in Authorization header when needed

## Error Handling

All API endpoints use centralized error handling with consistent response formats:

```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400,
    "context": {
      "operation": "operation-name",
      "additional": "context"
    }
  }
}
```

## Security Headers

All API responses include comprehensive security headers:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`

## Endpoints

### Authentication

#### Email Verification

Handles email verification for user registration and password reset flows.

**Endpoint:** `GET /api/auth/confirm`

**Parameters:**

- `token_hash` (string, required): The verification token from the email
- `type` (string, required): The type of verification (`signup`, `recovery`, `email_change`)
- `next` (string, optional): Redirect URL after successful verification (default: `/profile`)

**Response:**

- **Success**: Redirects to the specified `next` URL with `verified=true` parameter
- **Error**: Redirects to `/auth/auth-code-error` with error code

**Example Request:**

```
GET /api/auth/confirm?token_hash=abc123&type=signup&next=/dashboard
```

**Security Features:**

- Comprehensive request logging with IP and User-Agent tracking
- Token hash is removed from redirect URLs for security
- Rate limiting and abuse prevention
- Structured error logging for monitoring

**Error Codes:**

- `invalid_verification_link`: Missing or invalid token/type parameters
- Supabase auth errors are passed through with proper context

---

### Development & Testing

#### Sentry Error Testing

Test endpoint for Sentry error monitoring integration.

**Endpoint:** `GET /api/sentry-example-api`

**Purpose:** Intentionally throws an error to test Sentry error tracking and monitoring.

**Response:**

- Always throws `SentryExampleAPIError`
- Used for testing error monitoring and alerting systems

**Example Request:**

```
GET /api/sentry-example-api
```

**Note:** This endpoint is for development and testing purposes only.

---

## API Development Guidelines

### Adding New Endpoints

When creating new API endpoints, follow these patterns:

1. **Use the centralized error handler:**

   ```typescript
   import { withApiErrorHandler } from '@/lib/error/server'

   export const GET = withApiErrorHandler(async (request: NextRequest) => {
     // Your endpoint logic
   })
   ```

2. **Include proper logging:**

   ```typescript
   import { buildLogger } from '@/lib/logger/server'

   const logger = buildLogger('endpoint-name')

   logger.info({ context }, 'Operation description')
   ```

3. **Apply security headers:**

   ```typescript
   const response = NextResponse.json(data)
   // Security headers are applied automatically by the error handler
   return response
   ```

4. **Use proper TypeScript types:**

   ```typescript
   interface RequestBody {
     field: string
   }

   interface ResponseData {
     result: string
   }
   ```

### Error Handling Best Practices

- Use `withApiErrorHandler` wrapper for all endpoints
- Log all operations with appropriate context
- Return structured error responses
- Include operation context for debugging
- Use appropriate HTTP status codes

### Security Considerations

- All endpoints include security headers automatically
- Validate all input parameters
- Log security-relevant events (auth attempts, failures)
- Use rate limiting for sensitive endpoints
- Sanitize all user inputs

### Testing API Endpoints

1. **Unit Tests**: Test endpoint logic in isolation
2. **Integration Tests**: Test with real database connections
3. **Security Tests**: Verify security headers and input validation
4. **Error Scenarios**: Test all error conditions

Example test structure:

```typescript
describe('/api/endpoint', () => {
  it('should handle valid requests', async () => {
    // Test implementation
  })

  it('should handle invalid input', async () => {
    // Test error scenarios
  })

  it('should include security headers', async () => {
    // Test security headers
  })
})
```

## Related Documentation

- [Authentication System](../src/lib/auth/README.md) - Authentication implementation details
- [Error Handling](../src/lib/error/README.md) - Centralized error handling system
- [Logging](../src/lib/logger/README.md) - Logging patterns and configuration
- [Supabase Integration](../src/lib/supabase/README.md) - Database and auth integration

## Monitoring and Observability

All API endpoints include:

- **Structured Logging**: JSON-formatted logs with context
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Request timing and performance metrics
- **Security Logging**: Authentication attempts and security events

For monitoring setup and configuration, see the [Architecture Documentation](./architecture.md).
