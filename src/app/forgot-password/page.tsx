'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  passwordResetRequestSchema,
  PasswordResetRequestInput,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    resetTime?: number;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = async (data: PasswordResetRequestInput) => {
    setServerError('');
    setSuccess('');
    setRateLimitInfo({});

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.status === 429) {
        // Rate limited
        setServerError(result.error || 'Too many password reset requests');
        if (result.resetTime) {
          setRateLimitInfo({ resetTime: result.resetTime });
        }
      } else if (res.ok) {
        setSuccess(
          result.message ||
            'If an account exists, a password reset email has been sent.'
        );
        reset();
      } else {
        setServerError(result.error || 'Request failed');
      }
    } catch (error) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  const formatTimeRemaining = (resetTime: number) => {
    const now = Date.now();
    const remaining = Math.max(0, resetTime - now);
    const minutes = Math.ceil(remaining / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <AuthLayout
      title='Forgot your password?'
      subtitle='Enter your email address and we will send you a reset link'
    >
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <FormField label='Email' id='email' error={errors.email?.message}>
              <Input
                type='email'
                {...register('email')}
                placeholder='Enter your email address'
                autoComplete='email'
                id='email'
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
            {success && <p className='text-sm text-green-600'>{success}</p>}

            <Button type='submit' className='w-full'>
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Link
            href='/login'
            className='text-sm text-muted-foreground hover:text-foreground hover:underline'
          >
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
