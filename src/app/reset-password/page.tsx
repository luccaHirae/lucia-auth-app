'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetSchema, PasswordResetInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
    <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
      <h1 className='text-2xl font-bold mb-6'>Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <input type='hidden' {...register('token')} value={token} />
        <div>
          <label className='block mb-1 font-medium'>New Password</label>
          <input
            type='password'
            {...register('password')}
            className='w-full border rounded px-3 py-2'
            autoComplete='new-password'
          />
          {errors.password && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <label className='block mb-1 font-medium'>Confirm Password</label>
          <input
            type='password'
            {...register('confirmPassword')}
            className='w-full border rounded px-3 py-2'
            autoComplete='new-password'
          />
          {errors.confirmPassword && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        {serverError && <p className='text-red-600'>{serverError}</p>}
        {success && <p className='text-green-600'>{success}</p>}
        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
      <p className='mt-4 text-center text-sm'>
        <a href='/login' className='text-blue-600 hover:underline'>
          Back to login
        </a>
      </p>
    </div>
  );
}
