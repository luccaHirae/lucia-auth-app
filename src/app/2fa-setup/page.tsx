'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { twoFactorSchema, TwoFactorInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
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
    <AuthLayout
      title='Set up Two-Factor Authentication'
      subtitle='Scan the QR code with your authenticator app'
    >
      <Card>
        <CardContent className='pt-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>Loading...</div>
            </div>
          ) : serverError ? (
            <div className='text-center py-8'>
              <p className='text-destructive mb-4'>{serverError}</p>
            </div>
          ) : (
            <>
              <div className='mb-6 text-center space-y-4'>
                <div className='bg-white p-4 rounded-lg inline-block'>
                  {qrCode && (
                    <img src={qrCode} alt='2FA QR Code' className='w-48 h-48' />
                  )}
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground'>
                    Or enter this secret manually in your authenticator app:
                  </p>
                  <div className='font-mono text-sm bg-muted p-3 rounded select-all break-all'>
                    {secret}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  label='Enter 6-digit code from your app'
                  error={errors.code?.message}
                >
                  <Input
                    type='text'
                    {...register('code')}
                    placeholder='000000'
                    inputMode='numeric'
                    maxLength={6}
                    autoComplete='one-time-code'
                  />
                </FormField>

                {serverError && (
                  <p className='text-sm text-destructive'>{serverError}</p>
                )}
                {success && <p className='text-sm text-green-600'>{success}</p>}

                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full'
                >
                  {isSubmitting ? 'Verifying...' : 'Enable 2FA'}
                </Button>
              </form>
            </>
          )}
        </CardContent>

        <CardFooter className='flex-col space-y-2'>
          <p className='text-sm text-muted-foreground text-center'>
            <Link href='/dashboard' className='text-primary hover:underline'>
              Back to dashboard
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
