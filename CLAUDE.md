# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15 Aadhaar UCL (Update Client) application** designed for Indian Aadhaar card correction requests. It's a full-stack web application with React frontend, PostgreSQL database, and Better Auth authentication.

## Common Development Commands

### Development

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run start:next   # Start Next.js only (no migrations)
npm run lint         # Run ESLint
```

### Database Operations

```bash
npm run migrate                # Run database migrations
npm run create-admin           # Create admin user
npm run reset-admin            # Reset admin user
npm run create-default-users   # Create default users
```


### Production Startup

```bash
npm run start        # Runs migrations + creates users + starts Next.js
```

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 15.5.3, React 19.1.0, TypeScript
- **Styling**: TailwindCSS 4.0, Radix UI, Shadcn/ui components
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Better Auth v1.3.11
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Node Version**: >=20.0.0 required

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── components/         # Page-specific components
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components (Shadcn/ui)
│   ├── admin/             # Admin dashboard components
│   └── [custom components] # Feature-specific components
├── hooks/                 # React hooks (useAuth, useAuthGuard)
├── lib/
│   ├── db.ts             # Database connection
│   ├── auth-client.ts    # Better Auth client
│   ├── auth-server.ts    # Server-side auth utilities
│   └── utils.ts          # General utilities
└── scripts/              # Database and utility scripts
```

### Database Schema

- **User Management**: Better Auth tables (user, session, account, verification)
- **Business Logic**: `correction_requests` table for Aadhaar corrections
- **Financial**: `transactions` table for payment/wallet history
- **Relationships**: User → Correction Requests (one-to-many)
- **Indexes**: Optimized for aadhaar_number, user_id, status, created_at

### Authentication Flow

- **Better Auth**: Custom auth client in `src/lib/auth-client.ts`
- **Session Management**: Via cookies with custom `useAuth` hook
- **Auth Guards**: `useAuthGuard` hook for route protection
- **Admin System**: Role-based access with admin dashboard

## Development Guidelines

### Authentication Patterns

- Use `useAuth()` hook for client-side auth state
- Use `useAuthGuard(required)` for route protection
- Use `authClient` from `@/lib/auth-client` for auth operations
- Session data includes operator-specific fields (operatorUid, machineId, location)

### Component Development

- **UI Components**: Use Shadcn/ui components from `src/components/ui/`
- **Admin Components**: Use admin-specific components from `src/components/admin/`
- **Forms**: React Hook Form with Zod validation
- **State Management**: Local state for forms, context for global state
- **Responsive**: Mobile-first approach with TailwindCSS

### Database Operations

- **Connection Pool**: Use `src/lib/db.ts` query function
- **Migrations**: Store SQL files in `better-auth_migrations/`
- **Parameterized Queries**: Always use parameterized queries to prevent SQL injection
- **Error Handling**: Implement proper error handling for database operations

### API Development

- **Structure**: Follow Next.js App Router patterns
- **Auth**: Use Better Auth middleware where needed
- **Validation**: Use Zod schemas for request validation
- **Error Handling**: Return proper HTTP status codes and error messages

## Database Scripts

### Migration System

- **Location**: `better-auth_migrations/` directory
- **Runner**: `scripts/run-migrations.js` with transaction support
- **Tracking**: `schema_migrations` table tracks executed migrations
- **Auto-recovery**: Handles existing tables/indexes gracefully

### User Management Scripts

- **Admin Creation**: `scripts/create-admin-user.js` (creates <admin@ucl.test>)
- **Default Users**: `scripts/create-default-users.js` (operator/test users)
- **Production Startup**: `scripts/start-with-migrate.js` (migrations + users + Next.js)

## Important Notes

### Current State

- **Authentication**: Better Auth fully configured with custom hooks
- **Admin System**: Complete admin dashboard with user management
- **Database**: Well-structured with migration system
- **Biometric**: RD service and Morpho fingerprint capture components
- **File Upload**: Basic implementation needs security review

### Security Considerations

- **Session Security**: Better Auth provides secure session management
- **Input Validation**: Zod schemas for all form inputs
- **SQL Injection**: Parameterized queries throughout
- **Environment Variables**: Use dotenv for configuration
- **CSRF Protection**: Built into Better Auth

### Code Patterns

- **TypeScript**: Strong typing throughout the application
- **Error Boundaries**: Implement proper error handling
- **Component Structure**: Separation of UI and business logic
- **Database**: All database operations use the query pool
- **Authentication**: Centralized auth system with custom hooks
