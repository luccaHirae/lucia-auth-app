import { NextRequest, NextResponse } from 'next/server';
import {
  getUserById,
  createTwoFactorAuth,
  enableTwoFactorAuth,
} from '@/lib/auth';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/two-factor';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session (you'll need to implement getSession)
    const { getSession } = await import('@/lib/auth');
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 2FA secret
    const secret = generateTwoFactorSecret(user.email);

    // Create or update 2FA record
    await createTwoFactorAuth(user.id, secret.base32!);

    // Generate QR code
    const qrCode = await generateQRCode(secret);

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getSession } = await import('@/lib/auth');
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enable 2FA
    await enableTwoFactorAuth(session.userId);

    return NextResponse.json({
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
