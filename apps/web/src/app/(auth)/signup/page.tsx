'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GalleryVerticalEnd, CheckCircle } from 'lucide-react';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmittedEmail(data.email);
        setIsSuccess(true);
      } else {
        setError(responseData.message || 'An error occurred. Please try again.');
      }
    } catch {
      setError('Failed to create account. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            MVP-TEMPLATE
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Account created successfully!</CardTitle>
              <CardDescription>
                We've sent a verification email to <strong>{submittedEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please check your email and click the verification link to activate your account.
              </p>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/signin">Go to sign in</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false);
                    setSubmittedEmail('');
                  }}
                >
                  Create another account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          MVP-TEMPLATE
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Enter your information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                {error && (
                  <div className="bg-destructive/15 border border-destructive/50 text-destructive px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/signin" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          By creating an account, you agree to our <Link href="#">Terms of Service</Link> and{' '}
          <Link href="#">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
