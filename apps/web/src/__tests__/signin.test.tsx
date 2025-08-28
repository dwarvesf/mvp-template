import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signIn, type SignInResponse } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import SignInPage from '../app/(auth)/signin/page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

const mockSignIn = vi.mocked(signIn);
const mockUseSearchParams = vi.mocked(useSearchParams);

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null),
    } as unknown as ReturnType<typeof useSearchParams>);
  });

  it('renders the sign in form', () => {
    render(<SignInPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<SignInPage />);

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    mockSignIn.mockResolvedValue({ error: null } as SignInResponse);

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('shows error message when sign in fails', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' } as SignInResponse);

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('redirects to callback URL on successful sign in', async () => {
    const callbackUrl = '/';
    mockUseSearchParams.mockReturnValue({
      get: vi.fn((key) => (key === 'callbackUrl' ? callbackUrl : null)),
    } as unknown as ReturnType<typeof useSearchParams>);
    mockSignIn.mockResolvedValue({ error: null } as SignInResponse);

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toBe(callbackUrl);
    });
  });

  it('redirects to root when no callback URL is provided', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null), // No callbackUrl in search params
    } as unknown as ReturnType<typeof useSearchParams>);
    mockSignIn.mockResolvedValue({ error: null } as SignInResponse);

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });

  it('handles GitHub sign in', () => {
    render(<SignInPage />);

    const githubButton = screen.getByRole('button', { name: 'Continue with GitHub' });
    fireEvent.click(githubButton);

    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/' });
  });

  it('uses custom callback URL for GitHub sign in', () => {
    const callbackUrl = '/profile';
    mockUseSearchParams.mockReturnValue({
      get: vi.fn((key) => (key === 'callbackUrl' ? callbackUrl : null)),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<SignInPage />);

    const githubButton = screen.getByRole('button', { name: 'Continue with GitHub' });
    fireEvent.click(githubButton);

    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl });
  });

  it('shows loading state during form submission', async () => {
    let resolveSignIn: (value: SignInResponse) => void;
    const signInPromise = new Promise<SignInResponse>((resolve) => {
      resolveSignIn = resolve;
    });
    mockSignIn.mockReturnValue(signInPromise);

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await act(async () => {
      resolveSignIn!({ error: null, status: 200, ok: true, url: null });
    });

    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  it('disables GitHub button during loading', async () => {
    let resolveSignIn: (value: SignInResponse) => void;
    const signInPromise = new Promise<SignInResponse>((resolve) => {
      resolveSignIn = resolve;
    });
    mockSignIn.mockReturnValue(signInPromise);

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    const githubButton = screen.getByRole('button', { name: 'Continue with GitHub' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(githubButton).toBeDisabled();

    await act(async () => {
      resolveSignIn!({ error: null, status: 200, ok: true, url: null });
    });

    await waitFor(() => {
      expect(githubButton).not.toBeDisabled();
    });
  });

  it('handles network errors gracefully', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));

    render(<SignInPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  it('has correct navigation links', () => {
    render(<SignInPage />);

    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: 'MVP Template' })).toHaveAttribute('href', '/');
  });
});
