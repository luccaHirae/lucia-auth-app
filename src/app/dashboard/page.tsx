'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserInfo = {
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          setError('Not authenticated. Please log in.');
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        setError('Failed to load user info.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div className='max-w-md mx-auto mt-16'>Loading...</div>;
  }
  if (error) {
    return (
      <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
        <p className='text-red-600 mb-4'>{error}</p>
        <Link href='/login' className='text-blue-600 hover:underline'>
          Go to login
        </Link>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className='max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
      <div className='mb-4'>
        <div className='mb-2'>
          <span className='font-medium'>Email:</span> {user.email}
        </div>
        <div className='mb-2'>
          <span className='font-medium'>Email Verified:</span>{' '}
          {user.emailVerified ? 'Yes' : 'No'}
        </div>
        <div className='mb-2'>
          <span className='font-medium'>2FA Enabled:</span>{' '}
          {user.twoFactorEnabled ? 'Yes' : 'No'}
        </div>
      </div>
      {!user.twoFactorEnabled ? (
        <Link href='/2fa-setup'>
          <Button className='w-full mb-4'>Enable 2FA</Button>
        </Link>
      ) : (
        <div className='mb-4 text-green-600'>
          2FA is enabled on your account.
        </div>
      )}
      <Button onClick={handleLogout} variant='destructive' className='w-full'>
        Logout
      </Button>
    </div>
  );
}
