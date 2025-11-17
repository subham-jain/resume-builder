// Centralized monitoring exports
// Combines Dynatrace and Kibana monitoring

export * from './dynatrace';
export * from './kibana';

// Unified monitoring functions
import { trackDynatraceEvent, trackError as dtTrackError } from './dynatrace';
import { 
  logError as kibanaLogError, 
  logInfo as kibanaLogInfo, 
  logWarn as kibanaLogWarn, 
  logUserAction as kibanaLogUserAction 
} from './kibana';

// Combined error tracking
export function trackError(error: Error, context?: Record<string, any>, userId?: string) {
  // Track in Dynatrace
  dtTrackError(error, context);
  
  // Log to Kibana
  kibanaLogError('Application Error', error, context, userId);
}

// Combined user action tracking
export function trackUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
  // Track in Dynatrace
  trackDynatraceEvent(`user_action_${action}`, { userId, ...metadata });
  
  // Log to Kibana
  kibanaLogUserAction(action, userId, metadata);
}

// Re-export Kibana logging functions with unified interface
export { 
  kibanaLogInfo as logInfo,
  kibanaLogWarn as logWarn,
  kibanaLogError as logError,
  logDebug,
  logPerformance,
  logUserAction as logUserActionToKibana,
} from './kibana';

