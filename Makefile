.PHONY: setup dev build test lint format codegen db-up db-migrate db-seed

setup:          ## Complete initial setup (install deps, copy env files, start db, migrate, seed)
	@echo "🚀 Setting up MVP Template..."
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "📄 Copying environment files..."
	@if [ ! -f apps/api/.env ]; then \
		cp apps/api/.env.example apps/api/.env && \
		echo "✅ Created apps/api/.env from example"; \
	else \
		echo "⚠️  apps/api/.env already exists, skipping"; \
	fi
	@if [ ! -f apps/web/.env.local ]; then \
		cp apps/web/.env.example apps/web/.env.local && \
		echo "✅ Created apps/web/.env.local from example"; \
	else \
		echo "⚠️  apps/web/.env.local already exists, skipping"; \
	fi
	@echo "🐳 Starting PostgreSQL database..."
	docker compose -f apps/api/docker-compose.yml up -d
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5
	@echo "🗄️  Running database migrations..."
	cd apps/api && pnpm prisma migrate dev --name init
	@echo "🌱 Seeding database with default user..."
	cd apps/api && pnpm prisma db seed
	@echo "✨ Setup complete!"
	@echo ""
	@echo "🎉 Ready to develop! Run 'make dev' to start development servers"
	@echo ""
	@echo "📍 Your applications:"
	@echo "   🌐 Web: http://localhost:3000"
	@echo "   📡 API: http://localhost:4000"
	@echo "   📚 API Docs: http://localhost:4000/docs"
	@echo ""
	@echo "🔑 Default login: mvp@example.com / Pwd123!"
	@echo ""
	@echo "🔧 Optional configuration (edit .env files if needed):"
	@echo "   • GitHub OAuth: Add GITHUB_ID & GITHUB_SECRET to apps/web/.env.local"
	@echo "   • Email service: Add RESEND_API_KEY to both .env files"
	@echo "   • Production: Change JWT_SECRET & NEXTAUTH_SECRET for production use"
	@echo ""
	@echo "▶️  Next step: make dev"

dev d:            ## Run web+api in parallel
	pnpm dev

build b:          ## Build all apps
	pnpm build

test t:           ## Run all tests
	pnpm test

lint l:           ## Lint
	pnpm lint

format f:         ## Prettier write
	pnpm format

codegen gen:        ## Generate API client from Swagger JSON
	pnpm codegen

db-up:          ## Start local Postgres via Docker
	docker compose -f apps/api/docker-compose.yml up -d

db-migrate:     ## Run prisma migrations
	cd apps/api && pnpm prisma migrate dev

db-seed:        ## Seed database with default user
	cd apps/api && pnpm prisma db seed
