// Next.js instrumentation file for server-side monitoring
// This file runs once when the server starts

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Initialize server-side monitoring (silently skips if not configured)
      const { initDynatraceServer } = await import('./lib/monitoring/dynatrace');
      const { initKibana } = await import('./lib/monitoring/kibana');
      
      initDynatraceServer();
      initKibana();
    } catch (error) {
      // Silently handle any initialization errors
      // Monitoring will work once environment variables are configured
    }
  }
}

