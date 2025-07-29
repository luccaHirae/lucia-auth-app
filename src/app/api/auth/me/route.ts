import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById, getTwoFactorAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const twoFA = await getTwoFactorAuth(user.id);
  return NextResponse.json({
    email: user.email,
    emailVerified: user.emailVerified,
    twoFactorEnabled: !!twoFA?.enabled,
  });
}
