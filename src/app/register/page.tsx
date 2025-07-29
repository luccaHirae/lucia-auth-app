'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
    <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
      <h1 className='text-2xl font-bold mb-6'>Register</h1>
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
        <div>
          <label className='block mb-1 font-medium'>Password</label>
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
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <p className='mt-4 text-center text-sm'>
        Already have an account?{' '}
        <a href='/login' className='text-blue-600 hover:underline'>
          Login
        </a>
      </p>
    </div>
  );
}
