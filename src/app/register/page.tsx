'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: RegisterInput) => {
    setServerError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Registration failed');
      } else {
        setSuccess('Registration successful! You can now log in.');
        reset();
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      title='Create an account'
      subtitle='Enter your details to get started'
    >
      <Card>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <FormField label='Email' id='email' error={errors.email?.message}>
              <Input
                type='email'
                {...register('email')}
                placeholder='Enter your email'
                autoComplete='email'
                id='email'
              />
            </FormField>

            <FormField
              label='Password'
              id='password'
              error={errors.password?.message}
            >
              <Input
                type='password'
                {...register('password')}
                placeholder='Create a password'
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
                placeholder='Confirm your password'
                autoComplete='new-password'
                id='confirm-password'
              />
            </FormField>

            {serverError && (
              <p className='text-sm text-destructive'>{serverError}</p>
            )}
            {success && <p className='text-sm text-green-600'>{success}</p>}

            <Button type='submit' disabled={isSubmitting} className='w-full'>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex-col space-y-2'>
          <p className='text-sm text-muted-foreground text-center'>
            Already have an account?{' '}
            <Link href='/login' className='hover:underline text-foreground'>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
