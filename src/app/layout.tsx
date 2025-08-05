import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { CleanupProvider } from '@/components/cleanup-provider';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lucia Auth App',
  description: 'A modern authentication system built with Next.js and Lucia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <CleanupProvider />
        {children}
      </body>
    </html>
  );
}
