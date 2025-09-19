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
npm run lint         # Run ESLint
```

### Testing
Currently no test framework is configured. When adding tests:
- Use Jest or Vitest for unit tests
- Use Playwright for E2E tests
- Add testing scripts to package.json

### Database
- PostgreSQL connection configured in `src/lib/db.ts`
- Database migrations in `better-auth_migrations/` directory
- Use parameterized queries for all database operations

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.5.3, React 19.1.0, TypeScript
- **Styling**: TailwindCSS 4.0, Radix UI, Shadcn/ui components
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Better Auth v1.3.11
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Key Directories
```
src/
├── app/                    # Next.js App Router
│   ├── components/         # Page-specific components
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # Reusable UI components (Shadcn/ui)
└── lib/
    ├── db.ts             # Database connection
    ├── auth.ts           # Authentication utilities
    └── utils.ts          # General utilities
```

### Database Schema
- **User Management**: Better Auth default tables (user, session, account, verification)
- **Business Logic**: `correction_requests` and `submissions` tables
- **Relationships**: User → Correction Requests (one-to-many)
- **Indexes**: Optimized for aadhaar_number, user_id, status, created_at

### Authentication Flow
- Uses Better Auth with email/password authentication
- Session management via cookies
- Custom `useAuth` hook for client-side auth state
- **Missing**: Complete auth API routes (login, session, logout)

## Development Guidelines

### Component Development
- Follow Shadcn/ui patterns for component creation
- Use TailwindCSS with CSS variables for theming
- Implement responsive design with mobile-first approach
- Maintain accessibility standards with Radix UI primitives

### Form Handling
- Use React Hook Form for form state management
- Implement Zod schemas for validation
- Create multi-step forms with proper state management
- Display validation errors clearly

### API Development
- Follow RESTful patterns with Next.js App Router
- Use TypeScript interfaces for type safety
- Implement proper error handling with HTTP status codes
- Use parameterized queries to prevent SQL injection

### Database Operations
- Always use parameterized queries
- Implement proper error handling for database operations
- Use transactions for multi-table operations
- Follow the established naming conventions

## Important Notes

### Current State
- **Authentication**: Better Auth is configured but API routes are incomplete
- **File Upload**: Placeholder implementation, needs proper security
- **Database**: Two similar tables (`correction_requests` and `submissions`) - consolidate
- **Testing**: No test framework currently configured

### Security Considerations
- Better Auth provides session security
- Parameterized queries prevent SQL injection
- **Missing**: CSRF protection, rate limiting, file upload security
- Never commit sensitive data (API keys, database credentials)

### Code Patterns
- Use TypeScript interfaces for all data structures
- Implement proper error handling in all API routes
- Follow established component patterns from existing code
- Maintain separation between UI components and business logic