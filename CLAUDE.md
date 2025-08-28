# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MVP Template monorepo with:

- **Backend**: NestJS API with Swagger, PostgreSQL/Prisma, JWT auth, Resend emails
- **Frontend**: Next.js 14 app router, NextAuth, Tailwind, React Query
- **API Client**: Auto-generated from OpenAPI spec using Orval

## Essential Commands

```bash
# Quick Setup (Recommended)
make setup          # Complete setup: install deps, copy env files, start db, migrate, seed

# Development
make dev            # Run both apps (web:3000, api:4000) via Turbo
pnpm codegen        # Generate API client from Swagger (api must be running)

# Database
make db-up          # Start PostgreSQL container (port 35434)
make db-migrate     # Run Prisma migrations
make db-seed        # Seed with default user (mvp@example.com / Pwd123!)

# Testing & Quality
pnpm test           # Run all tests via Turbo (Vitest for web, Jest for api)
pnpm lint           # ESLint check via Turbo
pnpm format         # Prettier format via Turbo
pnpm typecheck      # TypeScript check via Turbo

# Alternative test commands
pnpm --filter web test    # Run web tests only (Vitest)
pnpm --filter api test    # Run API tests only (Jest)

# Individual app commands
pnpm --filter api dev       # Run API only
pnpm --filter web dev       # Run web only
pnpm --filter api prisma:migrate  # Run migrations
pnpm --filter api prisma:generate # Generate Prisma client

# Building
pnpm build          # Build all apps via Turbo
pnpm --filter api build     # Build API only
pnpm --filter web build     # Build web only
```

## Architecture

### Monorepo Structure

- **Build System**: Turbo + pnpm workspaces for task orchestration and caching
- **Workspace Structure**: `apps/*`, `packages/*`, `tools/*`
- **Shared TypeScript config** with strict mode enabled
- **Shared Package**: `@mvp-template/shared` for types, constants, utilities
- **API Client Package**: `@mvp-template/api-client` for generated React Query hooks
- Path aliases: `@mvp-template/api-client`, `@mvp-template/shared`

### Package Dependencies

- `api` → depends on `@mvp-template/shared`
- `web` → depends on `@mvp-template/shared` + `@mvp-template/api-client`
- `api-client` → generated from API's OpenAPI spec via Orval

### API (NestJS)

- Port 4000 with Swagger at `/docs` and `/docs-json`
- Prisma ORM with PostgreSQL
- JWT authentication with passport-jwt
- DTOs validated with class-validator
- Email service using Resend

### Web (Next.js)

- Port 3000, App Router with route groups: `(auth)`, `(protected)`
- NextAuth with GitHub OAuth and Credentials providers
- React Query for server state (via @mvp-template/api-client)
- Tailwind CSS + shadcn/ui components for styling
- React Email for email templates (verification, password reset)

### API Client Generation

- Orval reads from `http://localhost:4000/docs-json`
- Generates typed React Query hooks in `packages/api-client/src/generated.ts`
- Uses custom axios instance with NextAuth token injection

## Database

PostgreSQL runs in Docker on port 35434 (mapped from 5432).
Database URL format: `postgresql://postgres:postgres@localhost:35434/mvp_template`

Prisma schema defines:

- User model with authentication fields
- PasswordResetToken for password recovery

**Default seeded user**: `mvp@example.com` / `Pwd123!` (created via `make db-seed`)

## Authentication Flow

1. **Registration**: POST `/auth/register` → creates user, sends verification email
2. **Login**: POST `/auth/login` → returns JWT access token
3. **Password Reset**: POST `/auth/forgot-password` → generates token, logs reset link to console (dev)
4. **Reset Password**: POST `/auth/reset-password` → validates token, updates password
5. **NextAuth Integration**: Credentials provider calls API login endpoint
6. **Token Management**: Access token stored in NextAuth JWT, added to API requests via axios interceptor

### Available Auth Pages

- `/auth/signin` - Login with GitHub OAuth or email/password
- `/auth/signup` - User registration (if implemented)
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password?token=...` - Set new password with token
- `/dashboard` - Protected dashboard page

## Environment Variables

### API (.env)

- `DATABASE_URL`: PostgreSQL connection (use port 35434 for Docker)
- `JWT_SECRET`: Secret for JWT signing
- `RESEND_API_KEY`: Resend API key for emails
- `EMAIL_FROM`: Sender email address

### Web (.env)

- `NEXT_PUBLIC_API_URL`: API base URL (http://localhost:4000)
- `API_URL`: Server-side API URL (for NextAuth, same as NEXT_PUBLIC_API_URL)
- `NEXTAUTH_SECRET`: NextAuth encryption secret
- `NEXTAUTH_URL`: NextAuth canonical URL (http://localhost:3000)
- `GITHUB_ID/SECRET`: GitHub OAuth credentials
- `RESEND_API_KEY`: For sending emails from Next.js
- `EMAIL_FROM`: Sender email address

## Testing Strategy

- **API**: Jest with e2e tests for auth endpoints
- **Web**: Vitest with React Testing Library
- Run `pnpm test` to execute all tests

## Code Generation Workflow

1. Ensure API is running: `pnpm --filter api dev`
2. Run codegen: `pnpm codegen`
3. Use generated hooks in web app: `import { useAuthMe } from '@mvp-template/api-client/src/generated'`

## Shared Package Usage

The `@mvp-template/shared` package provides common utilities, types, and constants:

### Types & Schemas

```typescript
import { User, LoginRequest, CreateUserRequest } from '@mvp-template/shared';
import { LoginSchema, CreateUserSchema } from '@mvp-template/shared';
```

### Constants

```typescript
import { API_ENDPOINTS, HTTP_STATUS, VALIDATION_RULES, ERROR_MESSAGES } from '@mvp-template/shared';
```

### Utilities

```typescript
import {
  isValidEmail,
  isStrongPassword,
  formatDate,
  truncateText,
  debounce,
  sleep,
} from '@mvp-template/shared';
```

## TypeScript Configuration

Strict mode enabled with:

- `noUncheckedIndexedAccess`
- `noImplicitOverride`
- `exactOptionalPropertyTypes`

## Git Hooks & Quality Gates

Husky configured with:

- **commit-msg**: Enforces conventional commits via commitlint
- **pre-commit**: Runs lint, typecheck, and tests

Conventional commit types: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

## Turbo Configuration

Key task dependencies configured in `turbo.json`:

- **build**: depends on `^build` (dependencies first) + `prisma:generate`
- **dev**: depends on `^build` + `prisma:generate`
- **codegen**: depends on `@mvp-template/api#dev` (API must be running)

Cache outputs configured for build artifacts, test coverage, and generated files.
