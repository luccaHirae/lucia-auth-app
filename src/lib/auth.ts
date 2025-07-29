import bcrypt from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import prisma from '@/lib/prisma';

// Session management
export async function createSession(userId: string) {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  return sessionId;
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string) {
  await prisma.session.delete({
    where: { id: sessionId },
  });
}

// User management
export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword,
    },
  });

  return user;
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  return await prisma.user.update({
    where: { id: userId },
    data: { hashedPassword },
  });
}

// 2FA management
export async function createTwoFactorAuth(userId: string, secret: string) {
  return await prisma.twoFactorAuth.create({
    data: {
      userId,
      secret,
    },
  });
}

export async function getTwoFactorAuth(userId: string) {
  return await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });
}

export async function enableTwoFactorAuth(userId: string) {
  return await prisma.twoFactorAuth.update({
    where: { userId },
    data: { enabled: true },
  });
}

// Password reset
export async function createPasswordReset(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function getPasswordReset(token: string) {
  return await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function deletePasswordReset(token: string) {
  await prisma.passwordReset.delete({
    where: { token },
  });
}

// Email verification
export async function createEmailVerification(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerification.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function getEmailVerification(token: string) {
  return await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function verifyEmail(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });
}

export async function deleteEmailVerification(token: string) {
  await prisma.emailVerification.delete({
    where: { token },
  });
}
