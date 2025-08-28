import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpPage from '../app/(auth)/signup/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful' }),
    } as Response);
  });

  it('renders the sign up form', () => {
    render(<SignUpPage />);
    
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Enter your information to get started')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<SignUpPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters long')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<SignUpPage />);
    
    const emailInput = screen.getByLabelText('Email address');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error for short full name', async () => {
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters long')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(<SignUpPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    render(<SignUpPage />);
    
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        }
      );
    });
  });

  it('shows success message after successful registration', async () => {
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
      expect(screen.getByText('We\'ve sent a verification email to')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Please check your email and click the verification link to activate your account.')).toBeInTheDocument();
    });
  });

  it('shows error message when registration fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Email already exists' }),
    } as Response);
    
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create account. Please try again later.')).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    let resolveFetch: (value: Response | PromiseLike<Response>) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    mockFetch.mockReturnValue(fetchPromise);
    
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await act(async () => {
      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      } as Response);
    });

    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });
  });

  it('has correct navigation links in form view', () => {
    render(<SignUpPage />);
    
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin');
    expect(screen.getByRole('link', { name: 'MVP Template' })).toHaveAttribute('href', '/');
  });

  it('has correct navigation links in success view', async () => {
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Go to sign in' })).toHaveAttribute('href', '/signin');
      expect(screen.getByRole('link', { name: 'MVP Template' })).toHaveAttribute('href', '/');
    });
  });

  it('allows creating another account from success view', async () => {
    render(<SignUpPage />);
    
    // Complete registration first
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
    });

    // Click "Create another account"
    const createAnotherButton = screen.getByRole('button', { name: 'Create another account' });
    fireEvent.click(createAnotherButton);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.queryByText('Account created successfully!')).not.toBeInTheDocument();
  });

  it('shows generic error message when no specific error message is provided', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);
    
    render(<SignUpPage />);
    
    const fullNameInput = screen.getByLabelText('Full name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });
});