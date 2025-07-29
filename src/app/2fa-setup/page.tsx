'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { twoFactorSchema, TwoFactorInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TwoFASetupPage() {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [otpauthUrl, setOtpauthUrl] = useState<string>('');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  useEffect(() => {
    const fetchQr = async () => {
      setLoading(true);
      setServerError('');
      try {
        const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          setServerError(data.error || 'Failed to load 2FA setup');
        } else {
          setQrCode(data.qrCode);
          setSecret(data.secret);
          setOtpauthUrl(data.otpauthUrl);
        }
      } catch (e) {
        setServerError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, []);

  const onSubmit = async (data: TwoFactorInput) => {
    setServerError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || 'Verification failed');
      } else {
        setSuccess('2FA enabled successfully!');
        reset();
      }
    } catch (e) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
      <h1 className='text-2xl font-bold mb-6'>
        Set up Two-Factor Authentication
      </h1>
      {loading ? (
        <p>Loading...</p>
      ) : serverError ? (
        <p className='text-red-600 mb-4'>{serverError}</p>
      ) : (
        <>
          <div className='mb-6 text-center'>
            <p className='mb-2'>
              Scan this QR code with your authenticator app:
            </p>
            {qrCode && (
              <img src={qrCode} alt='2FA QR Code' className='mx-auto' />
            )}
            <p className='mt-2 text-sm'>Or enter this secret manually:</p>
            <div className='font-mono text-lg select-all break-all'>
              {secret}
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block mb-1 font-medium'>
                Enter 6-digit code from your app
              </label>
              <input
                type='text'
                {...register('code')}
                className='w-full border rounded px-3 py-2'
                inputMode='numeric'
                maxLength={6}
                autoComplete='one-time-code'
              />
              {errors.code && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.code.message}
                </p>
              )}
            </div>
            {serverError && <p className='text-red-600'>{serverError}</p>}
            {success && <p className='text-green-600'>{success}</p>}
            <Button type='submit' disabled={isSubmitting} className='w-full'>
              {isSubmitting ? 'Verifying...' : 'Enable 2FA'}
            </Button>
          </form>
        </>
      )}
      <p className='mt-4 text-center text-sm'>
        <Link href='/dashboard' className='text-blue-600 hover:underline'>
          Go to dashboard
        </Link>
      </p>
    </div>
  );
}
