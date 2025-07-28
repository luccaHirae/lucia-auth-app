import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  getTwoFactorAuth,
} from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Get user
    const user = await getUserByEmail(email);
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.hashedPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
