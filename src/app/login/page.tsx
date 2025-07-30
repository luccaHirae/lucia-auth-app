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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.requiresTwoFactor) {
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
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      const result = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setServerError(result.error || '2FA failed');
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      title={step === 'login' ? 'Welcome back' : 'Two-factor authentication'}
      subtitle={
        step === 'login'
          ? 'Enter your credentials to continue'
          : 'Enter the 6-digit code from your authenticator app'
      }
    >
      <Card>
        <CardContent className='pt-6'>
          {step === 'login' && (
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

              <Button
                type='submit'
                disabled={loginForm.formState.isSubmitting}
                className='w-full'
              >
                {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          )}

          {step === '2fa' && (
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
                  inputMode='numeric'
                  maxLength={6}
                  id='code'
                />
              </FormField>

              {serverError && (
                <p className='text-sm text-destructive'>{serverError}</p>
              )}

              <Button
                type='submit'
                disabled={twoFactorForm.formState.isSubmitting}
                className='w-full'
              >
                {twoFactorForm.formState.isSubmitting
                  ? 'Verifying...'
                  : 'Verify 2FA'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className='flex-col space-y-2'>
          <p className='text-sm text-muted-foreground text-center'>
            <Link
              href='/forgot-password'
              className='text-primary hover:underline'
            >
              Forgot password?
            </Link>
          </p>
          <p className='text-sm text-muted-foreground text-center'>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='text-primary hover:underline'>
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
