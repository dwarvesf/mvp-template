import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
