import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">MVP-TEMPLATE</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-sm font-medium hover:text-gray-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Welcome to MVP-TEMPLATE
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern full-stack application built with Next.js, NestJS, and TypeScript. Start
            building your next project with enterprise-grade authentication and APIs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-300 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Go to Dashboard
            </Link>
            <a
              href="http://localhost:4000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              API Documentation
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Authentication</h3>
              <p className="text-gray-600">
                JWT-based auth with NextAuth supporting GitHub OAuth and email/password
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Type-Safe APIs</h3>
              <p className="text-gray-600">
                Auto-generated TypeScript client from OpenAPI specs with React Query hooks
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Production Ready</h3>
              <p className="text-gray-600">
                Built with best practices, testing, linting, and CI/CD ready
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2025 MVP-TEMPLATE. Built with Next.js and NestJS.
            </p>
            <div className="flex gap-6">
              <a
                href="http://localhost:4000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                API Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
