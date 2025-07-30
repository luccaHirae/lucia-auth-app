'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-muted-foreground'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <p className='text-destructive mb-4'>{error}</p>
            <Link href='/login'>
              <Button className='w-full'>Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Manage your account and security settings
          </p>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center py-2 border-b border-border'>
                <span className='font-medium'>Email</span>
                <span className='text-muted-foreground'>{user.email}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-border'>
                <span className='font-medium'>Email Verified</span>
                <span
                  className={
                    user.emailVerified ? 'text-green-600' : 'text-destructive'
                  }
                >
                  {user.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className='flex justify-between items-center py-2'>
                <span className='font-medium'>Two-Factor Authentication</span>
                <span
                  className={
                    user.twoFactorEnabled
                      ? 'text-green-600'
                      : 'text-destructive'
                  }
                >
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {!user.twoFactorEnabled ? (
                <div className='space-y-4'>
                  <p className='text-sm text-muted-foreground'>
                    Enhance your account security by enabling two-factor
                    authentication.
                  </p>
                  <Link href='/2fa-setup'>
                    <Button className='w-full'>Enable 2FA</Button>
                  </Link>
                </div>
              ) : (
                <div className='space-y-4'>
                  <p className='text-sm text-green-600'>
                    ✓ Two-factor authentication is enabled on your account.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant='destructive'
                className='w-full'
              >
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
