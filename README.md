# MVP-TEMPLATE

A modern, full-stack application template built with Next.js, NestJS, and TypeScript. Perfect for rapidly building MVPs and production-ready applications with enterprise-grade authentication and type-safe APIs.

## 🚀 Features

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, React Query
- **Backend**: NestJS with Swagger/OpenAPI documentation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with GitHub OAuth, email/password, and password recovery
- **Type Safety**: Auto-generated TypeScript client from OpenAPI specs
- **Email**: Resend integration with React Email templates
- **Testing**: Vitest (frontend) + Jest (backend)
- **Code Quality**: ESLint, Prettier, Husky, Commitlint
- **Development**: Hot reload, Docker Compose, pnpm workspaces

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

## 🛠️ Quick Start

### Option 1: One-Command Setup (Recommended)

```bash
git clone <your-repo-url>
cd mvp-template
make setup
make dev  # Start development servers
```

The `make setup` command will:
- ✅ Install all dependencies
- ✅ Copy environment files with working defaults
- ✅ Start PostgreSQL database in Docker
- ✅ Run database migrations
- ✅ Seed with default user
- ✅ Ready to develop immediately!

### Option 2: Manual Setup

#### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mvp-template
pnpm install
```

#### 2. Environment Setup

Copy environment files and configure:

```bash
# API environment
cp apps/api/.env.example apps/api/.env
# Web environment
cp apps/web/.env.example apps/web/.env.local
```

**Environment variables (with working defaults):**

#### API (.env)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:35434/mvp_template
JWT_SECRET=mvp-template-dev-secret-key-change-in-production  # ✅ Default provided
PORT=4000
RESEND_API_KEY=  # Optional - for email functionality
EMAIL_FROM=noreply@mvp-template.local  # ✅ Default provided
```

#### Web (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000  # ✅ Default provided
NEXTAUTH_SECRET=mvp-template-nextauth-dev-secret-change-in-production  # ✅ Default provided
NEXTAUTH_URL=http://localhost:3000  # ✅ Default provided
GITHUB_ID=  # Optional - for GitHub OAuth
GITHUB_SECRET=  # Optional - for GitHub OAuth
RESEND_API_KEY=  # Optional - for email functionality
EMAIL_FROM=noreply@mvp-template.local  # ✅ Default provided
```

> 💡 **Ready to code!** All required values have defaults. Optional secrets can be added later.

#### 3. Database Setup

```bash
# Start PostgreSQL
make db-up

# Run migrations
make db-migrate

# Seed with default user
make db-seed
```

#### 4. Start Development

```bash
# Start both frontend and backend
make dev
```

> 💡 **Tip**: Use `make setup` instead of steps 1-4 for automatic setup!

Your applications will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/docs

### 5. Default Login

Use the pre-seeded user to test authentication:

- **Email**: mvp@example.com
- **Password**: Pwd123!

## ⚙️ Optional Configuration

The template works out-of-the-box, but you can enhance it by adding these optional services:

### GitHub OAuth (Optional)
1. Create GitHub OAuth App at https://github.com/settings/applications/new
2. Set callback URL: `http://localhost:3000/api/auth/callback/github`
3. Add to `apps/web/.env.local`:
   ```env
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   ```

### Email Service (Optional)
1. Sign up at https://resend.com
2. Get your API key
3. Add to both `.env` files:
   ```env
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=your-verified@domain.com
   ```

### Production Secrets
Before deploying to production, update these in your `.env` files:
```env
# API
JWT_SECRET=your-secure-jwt-secret-here

# Web  
NEXTAUTH_SECRET=your-secure-nextauth-secret-here
```

## 📁 Project Structure

```
mvp-template/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   ├── prisma/
│   │   └── docker-compose.yml
│   └── web/              # Next.js frontend
│       ├── src/
│       └── public/
├── packages/
│   ├── api-client/       # Generated API client
│   ├── shared/           # Shared types, constants, utilities
│   └── config/           # Shared configurations
├── tools/
│   └── codegen/          # Code generation configs
├── Makefile              # Development commands
└── pnpm-workspace.yaml   # Workspace configuration
```

## 🛠️ Available Commands

```bash
# Setup
make setup          # Complete initial setup (recommended for new projects)

# Development
make dev            # Run both apps in parallel

# Building
make build          # Build all apps for production
pnpm --filter api build     # Build API only  
pnpm --filter web build     # Build web app only

# Testing & Quality
make test           # Run all tests
make lint           # Run ESLint
make format         # Format code with Prettier
pnpm typecheck      # TypeScript type checking

# Database
make db-up          # Start PostgreSQL container
make db-migrate     # Run Prisma migrations
make db-seed        # Seed with default data

# Code Generation
make codegen        # Generate API client from OpenAPI

# Individual Development
pnpm --filter api dev       # Run API only
pnpm --filter web dev       # Run web only
pnpm --filter api prisma:migrate  # Run migrations
```

## 🔧 GitHub OAuth Setup

1. Create GitHub OAuth App at https://github.com/settings/applications/new
2. Set callback URL: `http://localhost:3000/api/auth/callback/github`
3. Add `GITHUB_ID` and `GITHUB_SECRET` to your `.env.local`

## 📧 Email Setup (Optional)

1. Sign up at https://resend.com
2. Get your API key
3. Add `RESEND_API_KEY` to both `.env` files
4. Configure `EMAIL_FROM` with your verified domain

## 🏗️ Architecture

### Shared Package System

The `@mvp-template/shared` package provides common utilities, types, and constants shared between frontend and backend:

```typescript
// Types and validation schemas
import { User, LoginRequest, CreateUserSchema } from '@mvp-template/shared';

// Constants (API endpoints, validation rules, error messages)
import { API_ENDPOINTS, VALIDATION_RULES, ERROR_MESSAGES } from '@mvp-template/shared';

// Utilities (validation, formatting, common helpers)
import { isValidEmail, formatDate, debounce } from '@mvp-template/shared';
```

**Benefits:**

- **Type Safety**: API and frontend stay in sync automatically
- **DRY Code**: Shared validation logic, constants, and utilities
- **Consistency**: Same error messages and formats across the stack
- **Developer Experience**: IntelliSense works across all packages

### API Client Generation

The project uses [Orval](https://orval.dev/) to generate type-safe React Query hooks from the NestJS OpenAPI specification:

1. Start the API server
2. Run `make codegen`
3. Import generated hooks: `import { useAuthMe } from '@mvp-template/api-client'`

### Authentication Flow

The template provides a complete authentication system with multiple flows:

#### Available Authentication Methods
- **GitHub OAuth**: One-click social login via NextAuth
- **Email/Password**: Traditional credentials with registration and login
- **Password Recovery**: Complete forgot/reset password flow

#### Authentication Pages
- `/auth/signin` - Login with GitHub OAuth or email/password
- `/auth/signup` - User registration with email verification
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Set new password with token
- `/dashboard` - Protected dashboard page

#### Password Reset Flow
1. User enters email on forgot password page
2. Backend generates secure reset token (1 hour expiry)
3. Reset link logged to console (dev mode) or sent via email (production)
4. User clicks reset link to set new password
5. Token validated and password updated securely

#### Technical Implementation
- **JWT Tokens**: Stored in NextAuth session, automatically added to API requests
- **Password Hashing**: bcrypt with salt rounds for secure storage
- **Token Security**: Cryptographically secure random tokens for password reset
- **Session Management**: NextAuth handles session persistence and refresh

### Database

- **ORM**: Prisma with PostgreSQL
- **Migrations**: Version controlled with Prisma Migrate
- **Seeding**: Default user and sample data

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suites
pnpm --filter web test     # Frontend tests (Vitest)
pnpm --filter api test     # Backend tests (Jest)
```

## 🔨 Building for Production

### Build All Applications

```bash
# Build everything (API + Web)
make build

# Or use pnpm directly
pnpm build
```

### Build Individual Applications

```bash
# Build API only
pnpm --filter api build

# Build web app only
pnpm --filter web build

# Build shared package
pnpm --filter @mvp-template/shared build
```

### Build Output

- **API**: Compiled JavaScript in `apps/api/dist/`
- **Web**: Static files and server bundle in `apps/web/.next/`
- **Shared**: Compiled types and declarations in `packages/shared/dist/`

### Production Environment Setup

1. **Environment Variables**: Update `.env` files with production values
2. **Database**: Run migrations on production database
3. **Build**: Run `make build` to compile all applications
4. **Deploy**: Upload build artifacts to your hosting platform

## 📝 Code Generation Workflow

1. Make changes to NestJS controllers/DTOs
2. Ensure API is running (`pnpm --filter api dev`)
3. Generate client: `make codegen`
4. Use new hooks in frontend components

## 🔄 Working with Shared Code

### Adding New Shared Types

1. **Define types**: Add to `packages/shared/src/types/`
2. **Add constants**: Update `packages/shared/src/constants/`
3. **Create utilities**: Add to `packages/shared/src/utils/`
4. **Export**: Update index files to make them available
5. **Use**: Import in both web and API apps

### Example: Adding a Post Feature

```typescript
// 1. Add types (packages/shared/src/types/post.ts)
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
});

// 2. Add API endpoints (packages/shared/src/constants/index.ts)
export const API_ENDPOINTS = {
  // ... existing endpoints
  POSTS: {
    BASE: '/posts',
    CREATE: '/posts',
    BY_ID: '/posts/:id',
  },
} as const;

// 3. Use in API (apps/api/src/posts/posts.dto.ts)
import { CreatePostSchema } from '@mvp-template/shared';

export class CreatePostDto implements z.infer<typeof CreatePostSchema> {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;
}

// 4. Use in web (apps/web/src/lib/api/posts.ts)
import { CreatePostSchema, API_ENDPOINTS } from '@mvp-template/shared';

export const validatePost = (data: unknown) => {
  return CreatePostSchema.safeParse(data);
};
```

### Benefits of This Approach

- **Refactoring Safety**: Change a type once, get compile errors everywhere it's used
- **Team Productivity**: New developers learn patterns once
- **API Consistency**: Frontend and backend can't drift apart
- **Testing**: Shared validation logic can be tested once

## 🚀 Deployment

The template is ready for deployment on platforms like:

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, AWS
- **Database**: Supabase, PlanetScale, AWS RDS

Update environment variables for production and modify OAuth callback URLs accordingly.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 💡 Built With

- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://prisma.io/) - Database ORM
- [NextAuth](https://next-auth.js.org/) - Authentication
- [React Query](https://tanstack.com/query) - Server state management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Orval](https://orval.dev/) - API client generation
- [Resend](https://resend.com/) - Email delivery
