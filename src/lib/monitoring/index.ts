// Centralized monitoring exports
// Combines Dynatrace and Kibana monitoring

export * from './dynatrace';
export * from './kibana';

// Unified monitoring functions
import { trackDynatraceEvent, trackError as dtTrackError } from './dynatrace';
import { 
  logError as kibanaLogError, 
  logUserAction as kibanaLogUserAction,
  logAPICall as kibanaLogAPICall
} from './kibana';

// Combined error tracking
export function trackError(error: Error, context?: Record<string, unknown>, userId?: string) {
  // Track in Dynatrace
  dtTrackError(error, context);
  
  // Log to Kibana
  kibanaLogError('Application Error', error, context, userId);
}

// Combined user action tracking
export function trackUserAction(action: string, userId?: string, metadata?: Record<string, unknown>) {
  // Track in Dynatrace
  trackDynatraceEvent(`user_action_${action}`, { userId, ...metadata });
  
  // Log to Kibana
  kibanaLogUserAction(action, userId, metadata);
}
export function trackAPICall(endpoint: string, method: string, duration: number, statusCode: number) {
  // Track in Dynatrace
  trackDynatraceEvent(`api_call_${endpoint}`, { method, duration, statusCode });
  
  // Log to Kibana
  kibanaLogAPICall(endpoint, method, duration, statusCode);
}

// Re-export Kibana logging functions directly
export { 
  logInfo,
  logWarn,
  logError,
  logDebug,
  logPerformance,
  logUserAction,
} from './kibana';


