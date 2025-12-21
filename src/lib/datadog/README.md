# Datadog Integration

Comprehensive Datadog RUM integration for the Structura application, providing real user monitoring, error tracking, and performance insights.

## 🚀 **Quick Start**

The Datadog integration is automatically initialized when you include the required environment variables:

```bash
# .env.local
NEXT_PUBLIC_DATADOG_APPLICATION_ID=your_application_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_client_token
NEXT_PUBLIC_DATADOG_SITE=us5.datadoghq.com
```

## Architecture

```
src/lib/datadog/
├── index.ts           # Main exports
├── config.ts          # Configuration management
├── client.ts          # RUM initialization
├── utils.ts           # Logging and error utilities
├── types.ts           # TypeScript definitions
└── README.md          # This documentation
```

## Features

- **Automatic Initialization**: Integrated into the app layout
- **User Context Tracking**: Automatically tracks authenticated users
- **Error Boundary Integration**: Captures React errors
- **Enhanced Logging**: Extends existing logger with Datadog integration
- **Performance Monitoring**: Tracks user interactions and performance
- **Privacy Controls**: Configurable privacy levels and data masking

## Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_DATADOG_APPLICATION_ID=your_application_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_client_token

# Optional
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com          # Default: datadoghq.com
NEXT_PUBLIC_DATADOG_SERVICE=structura           # Default: structura
NEXT_PUBLIC_DATADOG_ENV=production              # Default: based on NODE_ENV
NEXT_PUBLIC_APP_VERSION=1.0.0                   # Default: 1.0.0
```

### Sample Rates

The integration uses environment-specific sample rates:

- **Development**: 100% session sampling, 100% replay sampling
- **Production**: 10% session sampling, 5% replay sampling

## Usage Patterns

### Basic Component Logging

```typescript
// src/components/UserProfile.tsx
'use client'

import { buildEnhancedClientLogger } from '@/lib/logger/datadog'
import { trackDatadogEvent } from '@/lib/datadog/utils'

const logger = buildEnhancedClientLogger('user-profile')

export function UserProfile({ userId }: { userId: string }) {
  const handleSave = async () => {
    // This log goes to both console and Datadog
    logger.info({ userId, action: 'save' }, 'User initiated profile save')

    // Track custom business event
    trackDatadogEvent('profile_save_initiated', { userId })

    try {
      await saveProfile(userId)
      logger.info({ userId }, 'Profile saved successfully')
      trackDatadogEvent('profile_save_success', { userId })
    } catch (error) {
      // Error automatically captured by enhanced logger
      logger.error({ userId, error }, 'Failed to save profile')
    }
  }

  return <button onClick={handleSave}>Save Profile</button>
}
```

### Manual Error Capture

```typescript
import { captureErrorToDatadog } from '@/lib/datadog/utils'

try {
  await riskyOperation()
} catch (error) {
  // Capture with additional context
  captureErrorToDatadog(error, {
    operation: 'riskyOperation',
    userId: user.id,
    component: 'PaymentForm',
  })
  throw error
}
```

### Performance Tracking

```typescript
import { addDatadogTiming, startDatadogAction } from '@/lib/datadog'

// Track custom timing
const startTime = Date.now()
await performOperation()
const duration = Date.now() - startTime
addDatadogTiming('custom_operation', duration, { operationType: 'data_processing' })

// Track user actions
startDatadogAction('checkout_process', { cartValue: 99.99 })
```

### User Context Management

```typescript
// Automatically handled by AuthProvider, but can be used manually:
import { useDatadogUser } from '@/components/providers/DatadogProvider'

function CustomAuthComponent() {
  const { setUserContext, clearUserContext } = useDatadogUser()

  const handleLogin = async (user) => {
    // Set user context for all subsequent events
    setUserContext({
      id: user.id,
      email: user.email,
      plan: user.subscription?.plan,
      company: user.company?.name,
    })
  }

  const handleLogout = () => {
    clearUserContext()
  }
}
```

## Integration Points

### Error Boundary

The `GlobalErrorBoundary` automatically captures React errors to Datadog:

```typescript
// Automatically captures errors with context
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  captureErrorToDatadog(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
    component: 'GlobalErrorBoundary',
  })
}
```

### Authentication

User context is automatically set/cleared when users sign in/out via the enhanced `AuthProvider`.

### Enhanced Logger

Use the Datadog-enhanced logger for automatic log forwarding:

```typescript
// Instead of regular logger
import { buildLogger } from '@/lib/logger/client'

// Use enhanced logger for Datadog integration
import { buildEnhancedClientLogger } from '@/lib/logger/datadog'

const logger = buildEnhancedClientLogger('my-component')
// All logs now go to both console and Datadog
```

## Privacy and Security

### Data Masking

The integration uses `mask-user-input` privacy level by default, which:

- Masks all user inputs in session replays
- Preserves click and navigation events
- Protects sensitive form data

### PII Handling

User context is carefully managed:

- Only includes necessary identification data
- Excludes sensitive information like passwords
- Follows the same PII sanitization patterns as the audit system

## Configuration Validation

The system validates configuration on startup:

```typescript
import { validateDatadogConfig } from '@/lib/datadog/config'

const validation = validateDatadogConfig()
if (!validation.isValid) {
  console.error('Datadog configuration errors:', validation.errors)
}
```

## Development vs Production

### Development

- 100% sampling rates for comprehensive debugging
- Console logs forwarded to Datadog
- Detailed error information
- Configuration warnings displayed

### Production

- Conservative sampling rates (10%/5%)
- Only error-level console logs forwarded
- Optimized for performance
- Silent configuration failures

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Error Rate**: Track application errors and crashes
2. **Performance**: Page load times, user interactions
3. **User Journey**: Authentication flows, key user actions
4. **Business Events**: Profile updates, form submissions

### Recommended Dashboards

1. **Application Overview**: Error rates, performance metrics
2. **User Experience**: Session replays, user flows
3. **Business Metrics**: Custom events, conversion tracking
4. **Error Analysis**: Error trends, affected users

## Troubleshooting

### Common Issues

1. **Datadog not initializing**
   - Check environment variables are set
   - Verify application ID and client token
   - Check browser console for initialization errors

2. **No user context**
   - Ensure DatadogProvider wraps AuthProvider
   - Check user authentication flow
   - Verify user data structure

3. **Missing logs**
   - Confirm using enhanced logger
   - Check sampling rates
   - Verify Datadog RUM is initialized

### Debug Mode

Enable debug logging in development:

```typescript
// Check initialization status
import { isDatadogInitialized } from '@/lib/datadog/client'
console.log('Datadog initialized:', isDatadogInitialized())
```

## Best Practices

1. **Use Enhanced Logger**: Always use `buildEnhancedClientLogger` for automatic Datadog integration
2. **Track Business Events**: Use custom events for important user actions
3. **Meaningful Context**: Include relevant context in logs and events
4. **Privacy First**: Be mindful of PII in custom context
5. **Performance**: Use appropriate sampling rates for your traffic volume

## Migration from Console Logging

```typescript
// Before
console.log('User action:', { userId, action })
console.error('Operation failed:', error)

// After
import { buildEnhancedClientLogger } from '@/lib/logger/datadog'
const logger = buildEnhancedClientLogger('component-name')

logger.info({ userId, action }, 'User action')
logger.error({ error }, 'Operation failed')
```

---

**Last Updated**: December 21, 2025  
**Version**: 1.0.0  
**Dependencies**: @datadog/browser-rum ^6.25.1, @datadog/browser-rum-react ^6.25.1
