import { startCleanupScheduler } from '@/lib/cleanup';

// This component runs on the server and starts the cleanup scheduler
export async function CleanupProvider() {
  // Start the cleanup scheduler
  startCleanupScheduler();

  // This component doesn't render anything
  return null;
}
