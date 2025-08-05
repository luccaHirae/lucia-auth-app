'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  twoFactorSchema,
  LoginInput,
  TwoFactorInput,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [userId, setUserId] = useState('');
  const [serverError, setServerError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    resetTime?: number;
    remaining?: number;
  }>({});

  // Step 1: Email/password
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Step 2: 2FA
  const twoFactorForm = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onLogin = async (data: LoginInput) => {
    setServerError('');
    setRateLimitInfo({});
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.status === 429) {
        // Rate limited
        setServerError(result.error || 'Too many login attempts');
        if (result.resetTime) {
          setRateLimitInfo({ resetTime: result.resetTime });
        }
      } else if (result.requiresTwoFactor) {
        setUserId(result.userId);
        setStep('2fa');
      } else if (res.ok) {
        router.push('/dashboard');
      } else {
        setServerError(result.error || 'Login failed');
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  const on2FA = async (data: TwoFactorInput) => {
    setServerError('');
    setRateLimitInfo({});
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      const result = await res.json();

      if (res.status === 429) {
        // Rate limited
        setServerError(result.error || 'Too many 2FA attempts');
        if (result.resetTime) {
          setRateLimitInfo({ resetTime: result.resetTime });
        }
      } else if (res.ok) {
        router.push('/dashboard');
      } else {
        setServerError(result.error || '2FA verification failed');
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  const formatTimeRemaining = (resetTime: number) => {
    const now = Date.now();
    const remaining = Math.max(0, resetTime - now);
    const minutes = Math.ceil(remaining / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (step === '2fa') {
    return (
      <AuthLayout
        title='Two-Factor Authentication'
        subtitle='Enter the 6-digit code from your authenticator app'
      >
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <h1 className='text-2xl font-bold text-center mb-6'>
              Two-Factor Authentication
            </h1>
            <p className='text-sm text-muted-foreground text-center mb-6'>
              Enter the 6-digit code from your authenticator app
            </p>
            <form
              onSubmit={twoFactorForm.handleSubmit(on2FA)}
              className='space-y-4'
            >
              <FormField
                label='2FA Code'
                id='code'
                error={twoFactorForm.formState.errors.code?.message}
              >
                <Input
                  type='text'
                  {...twoFactorForm.register('code')}
                  placeholder='Enter 6-digit code'
                  autoComplete='one-time-code'
                  id='code'
                  maxLength={6}
                />
              </FormField>

              {serverError && (
                <p className='text-sm text-destructive'>{serverError}</p>
              )}
              {rateLimitInfo.resetTime && (
                <p className='text-sm text-muted-foreground'>
                  Try again in {formatTimeRemaining(rateLimitInfo.resetTime)}
                </p>
              )}

              <Button
                type='submit'
                className='w-full'
                disabled={twoFactorForm.formState.isSubmitting}
              >
                {twoFactorForm.formState.isSubmitting
                  ? 'Verifying...'
                  : 'Verify'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Button
              variant='ghost'
              onClick={() => setStep('login')}
              className='text-sm'
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title='Welcome back'
      subtitle='Enter your credentials to continue'
    >
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className='space-y-4'
          >
            <FormField
              label='Email'
              id='email'
              error={loginForm.formState.errors.email?.message}
            >
              <Input
                type='email'
                {...loginForm.register('email')}
                placeholder='Enter your email'
                autoComplete='email'
                id='email'
              />
            </FormField>

            <FormField
              label='Password'
              id='password'
              error={loginForm.formState.errors.password?.message}
            >
              <Input
                type='password'
                {...loginForm.register('password')}
                placeholder='Enter your password'
                autoComplete='current-password'
                id='password'
              />
            </FormField>

            {serverError && (
              <p className='text-sm text-destructive'>{serverError}</p>
            )}
            {rateLimitInfo.resetTime && (
              <p className='text-sm text-muted-foreground'>
                Try again in {formatTimeRemaining(rateLimitInfo.resetTime)}
              </p>
            )}

            <Button
              type='submit'
              className='w-full'
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-2'>
          <Link
            href='/forgot-password'
            className='text-sm text-muted-foreground hover:text-foreground hover:underline'
          >
            Forgot your password?
          </Link>
          <p className='text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Link href='/register' className='text-foreground hover:underline'>
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
