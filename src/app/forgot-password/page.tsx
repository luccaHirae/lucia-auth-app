'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  passwordResetRequestSchema,
  PasswordResetRequestInput,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
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
    <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
      <h1 className='text-2xl font-bold mb-6'>Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <label className='block mb-1 font-medium'>Email</label>
          <input
            type='email'
            {...register('email')}
            className='w-full border rounded px-3 py-2'
            autoComplete='email'
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
          )}
        </div>
        {serverError && <p className='text-red-600'>{serverError}</p>}
        {success && <p className='text-green-600'>{success}</p>}
        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <p className='mt-4 text-center text-sm'>
        <Link href='/login' className='text-blue-600 hover:underline'>
          Back to login
        </Link>
      </p>
    </div>
  );
}
