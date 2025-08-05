import { cleanupRateLimits, cleanupLoginAttempts } from '@/lib/rate-limit';

export async function runCleanup() {
  try {
    console.log('Starting cleanup...');

    await Promise.all([cleanupRateLimits(), cleanupLoginAttempts()]);

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run cleanup every hour
export function startCleanupScheduler() {
  setInterval(runCleanup, 60 * 60 * 1000); // 1 hour

  // Also run cleanup on startup
  runCleanup();
}
