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
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
      <h1 className='text-2xl font-bold mb-6'>Login</h1>
      {step === 'login' && (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className='space-y-4'>
          <div>
            <label className='block mb-1 font-medium'>Email</label>
            <input
              type='email'
              {...loginForm.register('email')}
              className='w-full border rounded px-3 py-2'
              autoComplete='email'
            />
            {loginForm.formState.errors.email && (
              <p className='text-red-500 text-sm mt-1'>
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className='block mb-1 font-medium'>Password</label>
            <input
              type='password'
              {...loginForm.register('password')}
              className='w-full border rounded px-3 py-2'
              autoComplete='current-password'
            />
            {loginForm.formState.errors.password && (
              <p className='text-red-500 text-sm mt-1'>
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>
          {serverError && <p className='text-red-600'>{serverError}</p>}
          <Button
            type='submit'
            disabled={loginForm.formState.isSubmitting}
            className='w-full'
          >
            {loginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      )}
      {step === '2fa' && (
        <form
          onSubmit={twoFactorForm.handleSubmit(on2FA)}
          className='space-y-4'
        >
          <div>
            <label className='block mb-1 font-medium'>2FA Code</label>
            <input
              type='text'
              {...twoFactorForm.register('code')}
              className='w-full border rounded px-3 py-2'
              autoComplete='one-time-code'
              inputMode='numeric'
              maxLength={6}
            />
            {twoFactorForm.formState.errors.code && (
              <p className='text-red-500 text-sm mt-1'>
                {twoFactorForm.formState.errors.code.message}
              </p>
            )}
          </div>
          {serverError && <p className='text-red-600'>{serverError}</p>}
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
      <p className='mt-4 text-center text-sm'>
        <a href='/forgot-password' className='text-blue-600 hover:underline'>
          Forgot password?
        </a>
      </p>
      <p className='mt-2 text-center text-sm'>
        Don&apos;t have an account?{' '}
        <a href='/register' className='text-blue-600 hover:underline'>
          Register
        </a>
      </p>
    </div>
  );
}
