import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// In-memory rate limiting for faster access
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000, // 1 hour block after max attempts
};

export function getClientIP(request: NextRequest): string {
  // Check for forwarded headers first (for proxy setups)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback to direct connection
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Last resort
  return 'unknown';
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();

  // Check in-memory first
  const memoryEntry = rateLimitMap.get(key);
  if (memoryEntry && memoryEntry.resetTime > now) {
    if (memoryEntry.count >= config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: memoryEntry.resetTime,
      };
    }
  }

  // Check database
  const dbEntry = await prisma.rateLimit.findUnique({
    where: { key },
  });

  if (dbEntry && dbEntry.expiresAt > new Date(now)) {
    if (dbEntry.count >= config.maxAttempts) {
      // Update in-memory cache
      rateLimitMap.set(key, {
        count: dbEntry.count,
        resetTime: dbEntry.expiresAt.getTime(),
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: dbEntry.expiresAt.getTime(),
      };
    }

    // Update in-memory cache
    rateLimitMap.set(key, {
      count: dbEntry.count,
      resetTime: dbEntry.expiresAt.getTime(),
    });

    return {
      allowed: true,
      remaining: config.maxAttempts - dbEntry.count,
      resetTime: dbEntry.expiresAt.getTime(),
    };
  }

  // No existing entry, create new one
  const resetTime = now + config.windowMs;
  const expiresAt = new Date(resetTime);

  await prisma.rateLimit.upsert({
    where: { key },
    update: {
      count: 1,
      expiresAt,
    },
    create: {
      key,
      count: 1,
      expiresAt,
    },
  });

  // Update in-memory cache
  rateLimitMap.set(key, {
    count: 1,
    resetTime,
  });

  return {
    allowed: true,
    remaining: config.maxAttempts - 1,
    resetTime,
  };
}

export async function incrementRateLimit(key: string): Promise<void> {
  const now = Date.now();
  const windowMs = DEFAULT_CONFIG.windowMs;
  const resetTime = now + windowMs;
  const expiresAt = new Date(resetTime);

  await prisma.rateLimit.upsert({
    where: { key },
    update: {
      count: { increment: 1 },
      expiresAt,
    },
    create: {
      key,
      count: 1,
      expiresAt,
    },
  });

  // Update in-memory cache
  const current = rateLimitMap.get(key);
  rateLimitMap.set(key, {
    count: (current?.count || 0) + 1,
    resetTime,
  });
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  userId?: string
): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress,
      success,
      userId,
    },
  });
}

export async function getLoginAttempts(
  email: string,
  ipAddress: string,
  windowMs: number = 15 * 60 * 1000
): Promise<{ email: number; ip: number }> {
  const since = new Date(Date.now() - windowMs);

  const [emailAttempts, ipAttempts] = await Promise.all([
    prisma.loginAttempt.count({
      where: {
        email,
        createdAt: { gte: since },
      },
    }),
    prisma.loginAttempt.count({
      where: {
        ipAddress,
        createdAt: { gte: since },
      },
    }),
  ]);

  return { email: emailAttempts, ip: ipAttempts };
}

export async function isAccountLocked(
  email: string,
  ipAddress: string
): Promise<{ locked: boolean; reason?: string }> {
  const { email: emailAttempts, ip: ipAttempts } = await getLoginAttempts(
    email,
    ipAddress
  );

  // Check if account is locked due to too many failed attempts
  if (emailAttempts >= 10) {
    return { locked: true, reason: 'Too many failed login attempts' };
  }

  // Check if IP is blocked due to too many failed attempts
  if (ipAttempts >= 20) {
    return {
      locked: true,
      reason: 'IP address blocked due to suspicious activity',
    };
  }

  return { locked: false };
}

// Clean up old rate limit entries
export async function cleanupRateLimits(): Promise<void> {
  const now = new Date();
  await prisma.rateLimit.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  // Clean up in-memory cache
  const nowMs = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime <= nowMs) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up old login attempts
export async function cleanupLoginAttempts(): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: { lt: oneDayAgo },
    },
  });
}
