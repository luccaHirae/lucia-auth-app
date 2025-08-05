import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordReset } from '@/lib/auth';
import { passwordResetRequestSchema } from '@/lib/validations';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIP,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = passwordResetRequestSchema.parse(body);

    const ipAddress = getClientIP(request);

    // Check rate limiting for password reset requests
    const rateLimitKey = `password-reset:${email}:${ipAddress}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not, but still rate limit
      await incrementRateLimit(rateLimitKey);
      return NextResponse.json(
        {
          message: 'If an account exists, a password reset email has been sent',
        },
        { status: 200 }
      );
    }

    // Create password reset token
    const token = await createPasswordReset(user.id);

    // In a real app, you would send an email here
    // For now, we'll just log it to the console
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(
      `Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    );

    return NextResponse.json(
      { message: 'If an account exists, a password reset email has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }
}
