import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../app/(protected)/page';
import { SessionProvider } from 'next-auth/react';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Dashboard', () => {
  it('shows sign in message when not authenticated', () => {
    const { getByText } = render(
      <SessionProvider session={null}>
        <Dashboard />
      </SessionProvider>,
    );
    expect(getByText('Please sign in')).toBeInTheDocument();
  });
});
