import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
          {subtitle && <p className='text-muted-foreground mt-2'>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
