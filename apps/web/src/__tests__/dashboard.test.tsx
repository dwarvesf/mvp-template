import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../app/(protected)/page';
import { SessionProvider } from 'next-auth/react';

// Mock next-auth
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to signin when not authenticated', () => {
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated' 
    });

    render(
      <SessionProvider session={null}>
        <Dashboard />
      </SessionProvider>,
    );

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('shows loading state when session is loading', () => {
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'loading' 
    });

    render(
      <SessionProvider session={null}>
        <Dashboard />
      </SessionProvider>,
    );

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      },
      expires: '2024-12-31T23:59:59.999Z'
    };

    mockUseSession.mockReturnValue({ 
      data: mockSession, 
      status: 'authenticated' 
    });

    render(
      <SessionProvider session={mockSession}>
        <Dashboard />
      </SessionProvider>,
    );

    expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
    expect(screen.getByText('Account Status')).toBeInTheDocument();
    expect(screen.getByText('Email Status')).toBeInTheDocument();
  });
});
