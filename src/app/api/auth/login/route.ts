import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  getTwoFactorAuth,
} from '@/lib/auth';
import {
  checkRateLimit,
  incrementRateLimit,
  recordLoginAttempt,
  isAccountLocked,
  getClientIP,
} from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const ipAddress = getClientIP(request);

    // Check if account is locked
    const lockStatus = await isAccountLocked(email, ipAddress);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: lockStatus.reason || 'Account temporarily locked' },
        { status: 429 }
      );
    }

    // Check rate limiting for this IP
    const rateLimitKey = `login:ip:${ipAddress}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    // Check rate limiting for this email
    const emailRateLimitKey = `login:email:${email}`;
    const emailRateLimitResult = await checkRateLimit(emailRateLimitKey);

    if (!emailRateLimitResult.allowed) {
      return NextResponse.json(
        {
          error:
            'Too many login attempts for this email. Please try again later.',
          resetTime: emailRateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user || !user.hashedPassword) {
      // Record failed attempt
      await recordLoginAttempt(email, ipAddress, false);
      await incrementRateLimit(rateLimitKey);
      await incrementRateLimit(emailRateLimitKey);

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.hashedPassword);
    if (!isValidPassword) {
      // Record failed attempt
      await recordLoginAttempt(email, ipAddress, false, user.id);
      await incrementRateLimit(rateLimitKey);
      await incrementRateLimit(emailRateLimitKey);

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Record successful attempt
    await recordLoginAttempt(email, ipAddress, true, user.id);

    // Check if 2FA is enabled
    const twoFactorAuth = await getTwoFactorAuth(user.id);
    if (twoFactorAuth?.enabled) {
      return NextResponse.json(
        {
          requiresTwoFactor: true,
          userId: user.id,
          message: '2FA required',
        },
        { status: 200 }
      );
    }

    // Create session
    const sessionId = await createSession(user.id);

    // Set session cookie
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }
}
