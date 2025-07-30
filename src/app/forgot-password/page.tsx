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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: PasswordResetRequestInput) => {
    setServerError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Request failed');
      } else {
        setSuccess(
          result.message ||
            'If an account exists, a password reset email has been sent.'
        );
        reset();
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      title='Forgot your password?'
      subtitle='Enter your email address and we will send you a reset link'
    >
      <Card>
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
            {success && <p className='text-sm text-green-600'>{success}</p>}

            <Button type='submit' disabled={isSubmitting} className='w-full'>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex-col space-y-2'>
          <p className='text-sm text-muted-foreground text-center'>
            <Link href='/login' className='text-primary hover:underline'>
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
