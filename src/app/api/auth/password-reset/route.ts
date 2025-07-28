import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordReset } from '@/lib/auth';
import { passwordResetRequestSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = passwordResetRequestSchema.parse(body);

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
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
