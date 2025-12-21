# Authentication Module

## Overview

This module provides authentication services for the application, handling user registration, login, session management, and social logins. It's built on top of Supabase Auth and follows the project's established patterns and standards.

## Features

### Core Authentication

- Email/Password authentication
- Social logins (Google, GitHub, etc.)
- Session management with JWT
- Password reset flow
- Email verification
- Account management

### Security

- CSRF protection
- Rate limiting
- Secure token handling
- Input validation with Zod
- Secure password hashing

## Architecture

### File Structure

```
src/
  lib/
    auth/
      actions/          # Authentication actions and services
        index.ts       # Barrel exports for all auth functionality
        client.ts      # Client-side AuthService class
        server.ts      # Server-side auth actions
      README.md        # This file
```

### Key Components

1. **Client Service (`actions/client.ts`)**
   - `AuthService` - Client-side authentication service class
   - Singleton pattern with dependency injection
   - Handles client-side auth state management
   - Provides methods for email/password auth, social auth, and session management

2. **Server Actions (`actions/server.ts`)**
   - `signInWithEmail` - Handle email/password login
   - `signUpWithEmail` - Handle new user registration
   - `signOut` - Handle user sign out
   - `resetPassword` - Handle password reset requests
   - `updatePassword` - Handle password updates
   - Uses standardized error handling and validation

3. **Barrel Exports (`actions/index.ts`)**
   - Centralized exports for both client and server
   - Type exports for shared interfaces
   - Single entry point for all auth functionality

## Usage

### Server Components

```typescript
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  requestPasswordReset,
  updateUserPassword
} from '@/lib/auth/actions'

export default async function ProtectedPage() {
  // Server-side auth logic would go here
  // This is just an example of import usage

  return <div>Protected content</div>
}
```

### Client Components

```typescript
'use client'

import { AuthService } from '@/lib/auth/actions'

export function LoginForm() {
  const authService = AuthService.getInstance()

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await authService.signInWithEmail(email, password, { name: '' })
    if (result.error) {
      // Handle error
      console.error(result.error)
    }
    // Handle success
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional
AUTH_COOKIE_NAME=your-cookie-name
AUTH_COOKIE_DOMAIN=your-domain.com
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_HTTP_ONLY=true
AUTH_COOKIE_SAME_SITE=lax
```

## Error Handling

All auth functions return a consistent response format:

```typescript
interface AuthResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
```

## Testing

### Unit Tests

```typescript
describe('Authentication', () => {
  describe('signInWithEmail', () => {
    it('should authenticate with valid credentials', async () => {
      // Test implementation
    })

    it('should fail with invalid credentials', async () => {
      // Test implementation
    })
  })
})
```

### Integration Tests

```typescript
describe('Auth Flow', () => {
  it('should allow users to register, login, and logout', async () => {
    // Test implementation
  })
})
```

## Best Practices

1. **Security**
   - Always validate input on both client and server
   - Use secure, HTTP-only cookies for session storage
   - Implement rate limiting on auth endpoints
   - Keep dependencies up to date

2. **Performance**
   - Use server components for auth checks when possible
   - Implement proper caching for user sessions
   - Minimize client-side bundle size

3. **Maintainability**
   - Keep business logic separate from UI components
   - Write clear documentation
   - Follow TypeScript best practices

## Troubleshooting

### Common Issues

1. **Session not persisting**
   - Verify cookie settings
   - Check CORS configuration
   - Ensure proper domain settings

2. **Social login errors**
   - Verify provider configuration
   - Check callback URLs
   - Review provider-specific requirements

## Contributing

1. Follow the project's coding standards
2. Write tests for new features
3. Update documentation when making changes
4. Open a pull request for review

## License

MIT License

Copyright (c) 2025 Marcio Merlone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
