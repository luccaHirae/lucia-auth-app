import { NextRequest, NextResponse } from 'next/server';
import { getUserById, createSession, getTwoFactorAuth } from '@/lib/auth';
import { verifyTwoFactorToken } from '@/lib/two-factor';
import { twoFactorSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = twoFactorSchema
      .extend({
        userId: twoFactorSchema.shape.code,
      })
      .parse(body);

    // Get user
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get 2FA secret
    const twoFactorAuth = await getTwoFactorAuth(userId);
    if (!twoFactorAuth?.enabled) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 });
    }

    // Verify 2FA token
    const isValidToken = verifyTwoFactorToken(code, twoFactorAuth.secret);
    if (!isValidToken) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
    }

    // Create session
    const sessionId = await createSession(userId);

    // Set session cookie
    const response = NextResponse.json(
      { message: '2FA verification successful' },
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
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }
}
