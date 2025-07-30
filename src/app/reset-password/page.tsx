'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetSchema, PasswordResetInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordResetInput & { token: string }>({
    resolver: zodResolver(
      passwordResetSchema.extend({ token: passwordResetSchema.shape.password })
    ),
    defaultValues: { token },
  });
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: PasswordResetInput & { token: string }) => {
    setServerError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Reset failed');
      } else {
        setSuccess('Password reset successful! You can now log in.');
        setTimeout(() => router.push('/login'), 2000);
        reset();
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      title='Reset your password'
      subtitle='Enter your new password below'
    >
      <Card>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <input type='hidden' {...register('token')} value={token} />

            <FormField
              label='New Password'
              id='password'
              error={errors.password?.message}
            >
              <Input
                type='password'
                {...register('password')}
                placeholder='Enter your new password'
                autoComplete='new-password'
                id='password'
              />
            </FormField>

            <FormField
              label='Confirm Password'
              id='confirm-password'
              error={errors.confirmPassword?.message}
            >
              <Input
                type='password'
                {...register('confirmPassword')}
                placeholder='Confirm your new password'
                autoComplete='new-password'
                id='confirm-password'
              />
            </FormField>

            {serverError && (
              <p className='text-sm text-destructive'>{serverError}</p>
            )}
            {success && <p className='text-sm text-green-600'>{success}</p>}

            <Button type='submit' disabled={isSubmitting} className='w-full'>
              {isSubmitting ? 'Resetting...' : 'Reset password'}
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
