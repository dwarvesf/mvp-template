# Contributing to MVP-TEMPLATE

We welcome contributions to MVP-TEMPLATE! This guide will help you get started.

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Git

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**

   ```bash
   git clone https://github.com/yourusername/mvp-template.git
   cd mvp-template
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Set up environment**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

5. **Start development environment**
   ```bash
   make db-up
   make db-migrate
   make db-seed
   make dev
   ```

## 🏗️ Project Structure

- `apps/api/` - NestJS backend application
- `apps/web/` - Next.js frontend application
- `packages/api-client/` - Generated API client
- `packages/shared-types/` - Shared TypeScript types
- `tools/codegen/` - Code generation configuration

## 📝 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow existing code patterns
- Write tests for new functionality
- Update documentation as needed

### 3. Code Quality

```bash
# Format code
make format

# Lint code
make lint

# Type check
pnpm typecheck

# Run tests
make test
```

### 4. API Changes

If modifying the API:

```bash
# Regenerate client after API changes
make codegen
```

### 5. Commit Your Changes

We use [Conventional Commits](https://conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add user profile management"
git commit -m "fix: resolve authentication issue"
git commit -m "docs: update API documentation"
```

**Commit Types:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a Pull Request with:

- Clear title and description
- Link to related issues
- Screenshots/videos if UI changes
- Test instructions

## 🧪 Testing Guidelines

### Frontend (Vitest + React Testing Library)

```bash
pnpm --filter web test
```

- Write unit tests for utilities and hooks
- Write component tests for complex components
- Place tests in `__tests__` directories or `.test.tsx` files

### Backend (Jest)

```bash
pnpm --filter api test
```

- Write unit tests for services and utilities
- Write integration tests for controllers
- Place tests next to source files with `.spec.ts` extension

## 🎨 Code Style

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use meaningful variable and function names

### React/Next.js

- Use functional components with hooks
- Prefer composition over inheritance
- Follow React best practices

### NestJS

- Use DTOs for request/response validation
- Implement proper error handling
- Follow NestJS conventions

### General

- Use 2 spaces for indentation
- Use meaningful commit messages
- Keep functions small and focused
- Write self-documenting code

## 📚 Documentation

- Update README.md for significant changes
- Document new environment variables
- Add JSDoc comments for complex functions
- Update API documentation (Swagger annotations)

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed reproduction steps
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, Node version, browser, etc.
6. **Screenshots** - If applicable

## 💡 Feature Requests

For feature requests, please include:

1. **Use Case** - Why is this feature needed?
2. **Description** - Detailed description of the feature
3. **Acceptance Criteria** - How to know when it's complete
4. **Alternatives** - Other solutions you've considered

## 🚀 Deployment

The project is designed to be deployed on:

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, AWS
- **Database**: Supabase, PlanetScale, AWS RDS

## ⚡ Quick Commands Reference

```bash
# Development
make dev              # Start both apps
make build            # Build all apps
make test             # Run all tests

# Database
make db-up            # Start PostgreSQL
make db-migrate       # Run migrations
make db-seed          # Seed database

# Code Quality
make lint             # Lint all code
make format           # Format all code
make codegen          # Generate API client

# Individual apps
pnpm --filter api dev     # API only
pnpm --filter web dev     # Web only
```

## 🤝 Code Review Process

1. All changes require a Pull Request
2. At least one approval required
3. All CI checks must pass
4. No merge conflicts
5. Up-to-date with main branch

## 📞 Getting Help

- Create an issue for bugs or questions
- Check existing issues first
- Be respectful and constructive

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.
