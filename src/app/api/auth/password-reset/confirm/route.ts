import { NextRequest, NextResponse } from 'next/server';
import {
  getPasswordReset,
  deletePasswordReset,
  updateUserPassword,
} from '@/lib/auth';
import { passwordResetSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = passwordResetSchema
      .extend({
        token: passwordResetSchema.shape.password,
      })
      .parse(body);

    // Get password reset record
    const passwordReset = await getPasswordReset(token);
    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (passwordReset.expiresAt < new Date()) {
      await deletePasswordReset(token);
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Update user password
    await updateUserPassword(passwordReset.userId, password);

    // Delete the reset token
    await deletePasswordReset(token);

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }
}
