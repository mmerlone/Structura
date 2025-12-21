# 🏗️ Architecture Guide

## Overview

Structura follows a **clean, layered architecture** that prioritizes clarity and maintainability through explicit dependencies and clear separation of concerns.

## 🎯 **Core Principles**

1. **Layered Architecture** - Clear separation between UI, logic, and data
2. **Explicit Dependencies** - No magic, clear client injection
3. **KISS Principle** - Keep It Simple, Stupid
4. **Clear Boundaries** - Server vs client separation

## 🏛️ **Layer Responsibilities**

### **1. Component Layer**

- **UI Rendering** - JSX, styling, user interactions
- **Event Handling** - User actions, form submissions
- **State Consumption** - Consume data from hooks
- **No Business Logic** - Delegate to hooks

```typescript
// Component example - focuses on UI and composition
function UserProfile({ userId }: { userId: string }) {
  const { profile, updateProfile } = useProfile(userId)

  return (
    <Card>
      <ProfileHeader profile={profile} />
      <ProfileForm
        initialData={profile}
        onSubmit={updateProfile}
      />
    </Card>
  )
}
```

### **2. Hook Layer**

- **State Management** - React Query for caching, optimistic updates
- **Business Logic** - Data transformation, validation
- **Service Coordination** - Call multiple services if needed
- **Error Handling** - Transform errors for UI consumption

```typescript
// Hook example - manages data and state
function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfile(userId),
  })
}
```

### **3. Service Layer**

- **Database Operations** - Direct Supabase client usage
- **Data Validation** - Ensure data integrity
- **Error Transformation** - Convert DB errors to domain errors
- **Logging** - Consistent operation logging

#### **Base Service Architecture**

The service layer uses two base classes depending on the environment:

```typescript
// Server-side service - extends BaseServerService
class ProfileService extends BaseServerService {
  constructor(client: SupabaseClient<Database>) {
    super(client)
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client.from('profiles').select('*').eq('id', userId).single()

      if (error) throw error
      return convertDbProfile(data)
    } catch (error) {
      return this.handleError(error, 'fetch profile', { userId })
    }
  }
}

// Client-side service - extends BaseClientService
class ProfileService extends BaseClientService {
  constructor(client: SupabaseClient<Database>) {
    super(client)
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client.from('profiles').select('*').eq('id', userId).single()

      if (error) throw error
      return convertDbProfile(data)
    } catch (error) {
      return this.handleError(error, 'fetch profile', { userId })
    }
  }
}
```

#### **Database Service Patterns**

Database services handle CRUD operations for specific entities:

```typescript
// src/lib/supabase/services/database/profiles/profile.client.service.ts
export class ProfileService extends BaseClientService {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client.from('profiles').select('*').eq('id', userId).single()

      if (error) throw error
      return convertDbProfile(data)
    } catch (error) {
      return this.handleError(error, 'fetch profile', { userId }))
    }
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const dbData = convertAppProfileForUpdate(updates)

      const { data, error } = await this.client.from('profiles').update(dbData).eq('id', userId).select().single()

      if (error) throw error
      return convertDbProfile(data)
    } catch (error) {
      return this.handleError(error, 'update profile', { userId, updates })
    }
  }

  async createProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    try {
      const dbData = convertAppProfileForInsert(profileData)

      const { data, error } = await this.client
        .from('profiles')
        .insert({ id: userId, ...dbData })
        .select()
        .single()

      if (error) throw error
      return convertDbProfile(data)
    } catch (error) {
      return this.handleError(error, 'create profile', { userId, profileData })
    }
  }
}
```

#### **Authentication Service Patterns**

Authentication services handle user authentication and session management:

```typescript
// src/lib/supabase/services/auth/auth.service.ts
export class AuthService extends BaseClientService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      return this.handleError(error, 'sign in', { email })
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      return this.handleError(error, 'sign up', { email })
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut()
      if (error) throw error
    } catch (error) {
      return this.handleError(error, 'sign out')
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser()

      if (error) throw error
      return user
    } catch (error) {
      return this.handleError(error, 'get current user')
    }
  }
}
```

#### **Service Best Practices**

1. **Always extend the appropriate base service**
   - Use `BaseServerService` for server-side code
   - Use `BaseClientService` for client-side code

2. **Consistent error handling**
   - Use `this.handleError()` for all errors
   - Include operation name and relevant context
   - Never let raw Supabase errors bubble up

3. **Data transformation**
   - Convert database models to app models using utility functions
   - Keep database-specific logic out of the UI layer

4. **Type safety**
   - Always use TypeScript types for parameters and return values
   - Leverage the generated Database type for Supabase operations

## 📊 **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Server     │  │   Client     │  │   Server     │     │
│  │  Component   │  │  Component   │  │   Action     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         │ Direct Service   │ Custom Hook      │ Direct       │
│         │ Usage            │ Usage            │ Service      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
           │                  │                  │
           │                  │                  │
┌──────────┼──────────────────┼──────────────────┼──────────────┐
│          │                  │                  │              │
│          ▼                  ▼                  ▼              │
│    ┌─────────────────────────────────────────────┐           │
│    │            Hook Layer                       │           │
│    │  ┌──────────────────────────────────────┐  │           │
│    │  │  React Query (Caching, State Mgmt)   │  │           │
│    │  │  Business Logic                      │  │           │
│    │  │  Error Transformation                │  │           │
│    │  └──────────────────────────────────────┘  │           │
│    └──────────────────┬─────────────────────────┘           │
│                        │                                       │
│                        │ Service Calls                         │
│                        ▼                                       │
│    ┌─────────────────────────────────────────────┐           │
│    │         Service Layer                      │           │
│    │  ┌──────────────────────────────────────┐  │           │
│    │  │  ProfileService                      │  │           │
│    │  │  AuthService                         │  │           │
│    │  │  ... (other services)                │  │           │
│    │  └──────────────────────────────────────┘  │           │
│    └──────────────────┬─────────────────────────┘           │
│                        │                                       │
│                        │ Supabase Client                       │
│                        ▼                                       │
│    ┌─────────────────────────────────────────────┐           │
│    │         Database Layer                      │           │
│    │         (Supabase/PostgreSQL)               │           │
│    └─────────────────────────────────────────────┘           │
└───────────────────────────────────────────────────────────────┘

Data Flow:
  Server Component → Service → Database
  Client Component → Hook → Service → Database
  Server Action → Service → Database
```

> **💡 Diagram Tools**: This diagram was created using ASCII art. For visual diagrams, consider:
>
> - **[Mermaid](https://mermaid.js.org/)** - Markdown-based diagram syntax (recommended for docs)
> - **[Draw.io](https://app.diagrams.net/)** - Free online diagram tool
> - **[Excalidraw](https://excalidraw.com/)** - Hand-drawn style diagrams
> - **[PlantUML](https://plantuml.com/)** - Text-based UML diagrams

## 🔄 **Data Flow Patterns**

### **Server Components**

Direct service usage for server-side rendering:

```typescript
export default async function ProfileServerComponent({ userId }: { userId: string }) {
  const profileServerService = await ProfileServerService.create()
  const profile = await profileServerService.getProfile(userId)

  return <div>{profile?.display_name}</div>
}
```

### **Client Components**

Use custom hooks for stateful client components (optional pattern):

```typescript
'use client'
import type { JSX } from 'react'

interface ProfileClientComponentProps {
  userId: string
}

export default function ProfileClientComponent({
  userId,
}: ProfileClientComponentProps): JSX.Element {
  const { profile, isLoading, error } = useProfile(userId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{profile?.display_name ?? 'No profile found'}</div>
}
```

### **Server Actions**

Direct service usage for server-side operations:

```typescript
'use server'
import type { Profile, ProfileUpdate } from '@/types/database'

export async function updateProfileAction(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const profileServerService = await ProfileServerService.create()
  return await profileServerService.updateProfile(userId, updates)
}
```

## 🎯 **Usage Guidelines**

### **When to Use Each Pattern**

| **Scenario**         | **Pattern**    | **Why**                                       |
| -------------------- | -------------- | --------------------------------------------- |
| **Server Component** | Direct Service | No state, server-side rendering               |
| **Client Component** | Hook           | State management, caching, optimistic updates |
| **Server Action**    | Direct Service | Server-side operation, no state               |
| **API Route**        | Direct Service | Server endpoint, no state                     |

### **Service Instantiation**

```typescript
// Server-side - await ProfileServerService.create()
const service = await ProfileServerService.create()

// Client-side - new ProfileClientService()
const service = new ProfileClientService()
```

## 🔧 **Client Management**

### **Server Client**

```typescript
// src/lib/supabase/server.ts
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  return createServerClient<Database>(url, key, { cookies })
}
```

### **Client Client**

```typescript
// src/lib/supabase/client.ts
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(url, key)
}
```

### **Key Points**

- **Server**: `await createClient()` - async due to cookies
- **Client**: `createClient()` - sync, no cookies needed
- **Explicit**: Always pass client to service constructor
- **No Magic**: No auto-detection or factory patterns

## 📈 **Benefits**

### **Simplicity**

- **Clear Dependencies** - explicit client injection
- **No Hidden Magic** - everything is obvious

### **Performance**

- **React Query Caching** - built-in optimization
- **Server Components** - zero client-side JS

### **Maintainability**

- **Clear Boundaries** - each layer has single responsibility
- **Type Safety** - explicit dependencies
- **Easy Testing** - direct service mocking

### **Developer Experience**

- **Predictable** - same pattern everywhere
- **Debuggable** - clear call stack
- **Learnable** - simple concepts, no complex abstractions

## 🚀 **Getting Started**

### **1. Create a Service**

```typescript
// src/lib/supabase/services/database/posts/post.service.ts
export class PostService extends BaseService {
  constructor(client: SupabaseClient<Database>) {
    super(client)
  }

  async getPost(id: string): Promise<Post | null> {
    try {
      const { data, error } = await this.client.from('posts').select('*').eq('id', id).single()

      if (error) throw error
      return data
    } catch (error) {
      return this.handleError(error, 'getPost', { id })
    }
  }
}
```

### **2. Create a Hook**

```typescript
// src/hooks/usePost.ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Post } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { PostService } from '@/lib/supabase/services/database/posts/post.service'

export function usePost(id: string): UseQueryResult<Post | null, Error> {
  return useQuery<Post | null, Error>({
    queryKey: ['post', id],
    queryFn: async (): Promise<Post | null> => {
      const client = createClient()
      const service = new PostService(client)
      return await service.getPost(id)
    },
  })
}
```

### **3. Use in Component**

```typescript
// src/components/PostComponent.tsx
import type { JSX } from 'react'
import { usePost } from '@/hooks/usePost'

interface PostComponentProps {
  id: string
}

export default function PostComponent({ id }: PostComponentProps): JSX.Element {
  const { post, isLoading, error } = usePost(id)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{post?.title ?? 'No title'}</div>
}
```

## 🎉 **Conclusion**

This architecture provides:

- **Clarity** - Easy to understand and debug
- **Performance** - No unnecessary overhead
- **Maintainability** - Clear separation of concerns
- **Scalability** - Works for small and large applications

---

**Last Updated**: 2025-11-30  
**Version**: 1.0.0
