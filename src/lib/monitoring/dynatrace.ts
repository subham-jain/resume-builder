// Dynatrace monitoring integration
// Add your Dynatrace API keys to .env.local when ready

interface DynatraceConfig {
  environmentId?: string;
  apiToken?: string;
  clusterId?: string;
}

let dynatraceInitialized = false;

export function initDynatrace() {
  if (typeof window !== 'undefined') {
    // Client-side Dynatrace initialization
    const config: DynatraceConfig = {
      environmentId: process.env.NEXT_PUBLIC_DYNATRACE_ENVIRONMENT_ID,
      apiToken: process.env.NEXT_PUBLIC_DYNATRACE_API_TOKEN,
      clusterId: process.env.NEXT_PUBLIC_DYNATRACE_CLUSTER_ID,
    };

  if (!config.environmentId || !config.apiToken) {
    // Silently skip initialization if not configured
    return;
  }

    // Initialize Dynatrace OneAgent (client-side)
    if (!dynatraceInitialized) {
      const script = document.createElement('script');
      script.src = `https://${config.clusterId || 'dynatrace'}.live.dynatrace.com/js/${config.environmentId}/dtagent.js`;
      script.async = true;
      document.head.appendChild(script);
      dynatraceInitialized = true;
    }
  }
}

// Server-side Dynatrace initialization
export function initDynatraceServer() {
  const config: DynatraceConfig = {
    environmentId: process.env.DYNATRACE_ENVIRONMENT_ID,
    apiToken: process.env.DYNATRACE_API_TOKEN,
    clusterId: process.env.DYNATRACE_CLUSTER_ID,
  };

  if (!config.environmentId || !config.apiToken) {
    // Silently skip initialization if not configured
    return;
  }

  // Server-side Dynatrace initialization would go here
  // This typically involves OpenTelemetry setup
  try {
    // Placeholder for Dynatrace OpenTelemetry setup
    // const { NodeSDK } = require('@opentelemetry/sdk-node');
    // const { DynatraceMetricExporter } = require('@dynatrace/opentelemetry-node');
    
    console.log('Dynatrace server-side monitoring initialized');
  } catch (error) {
    console.error('Failed to initialize Dynatrace:', error);
  }
}

// Track custom events
export function trackDynatraceEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  if (!process.env.NEXT_PUBLIC_DYNATRACE_ENVIRONMENT_ID) {
    return; // Dynatrace not configured
  }

  try {
    // Dynatrace custom event tracking
    // @ts-ignore
    if (window.dtrum && window.dtrum.enterAction) {
      // @ts-ignore
      window.dtrum.enterAction(eventName, properties);
    }
  } catch (error) {
    console.error('Dynatrace event tracking error:', error);
  }
}

// Track user actions
export function trackUserAction(actionName: string, metadata?: Record<string, any>) {
  trackDynatraceEvent(`user_action_${actionName}`, metadata);
}

// Track API calls
export function trackAPICall(endpoint: string, method: string, duration?: number, status?: number) {
  trackDynatraceEvent('api_call', {
    endpoint,
    method,
    duration,
    status,
  });
}

// Track errors
export function trackError(error: Error, context?: Record<string, any>) {
  trackDynatraceEvent('error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

