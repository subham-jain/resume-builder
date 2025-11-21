// Kibana/Elasticsearch monitoring integration
// Add your Elasticsearch/Kibana credentials to .env.local when ready

interface KibanaConfig {
  elasticsearchUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  index?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
  userId?: string;
  metadata?: Record<string, any>;
}

let logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 5000; // 5 seconds

// Initialize Kibana/Elasticsearch connection
export function initKibana() {
  const config: KibanaConfig = {
    elasticsearchUrl: process.env.ELASTICSEARCH_URL,
    apiKey: process.env.ELASTICSEARCH_API_KEY,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
    index: process.env.ELASTICSEARCH_INDEX || 'resume-builder-logs',
  };

  if (!config.elasticsearchUrl) {
    // Silently skip initialization if not configured
    return;
  }

  // Start periodic flush
  setInterval(() => {
    flushLogs(config);
  }, FLUSH_INTERVAL);

  console.log('Kibana monitoring initialized');
}

// Log entry to Kibana
export async function logToKibana(entry: LogEntry) {
  const config: KibanaConfig = {
    elasticsearchUrl: process.env.ELASTICSEARCH_URL,
    apiKey: process.env.ELASTICSEARCH_API_KEY,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
    index: process.env.ELASTICSEARCH_INDEX || 'resume-builder-logs',
  };

  if (!config.elasticsearchUrl) {
    // Silently buffer logs if Kibana not configured (will be sent when configured)
    logBuffer.push(entry);
    if (logBuffer.length > MAX_BUFFER_SIZE) {
      logBuffer.shift(); // Remove oldest entry
    }
    return;
  }

  try {
    // Add to buffer for batch sending
    logBuffer.push(entry);
    
    // Flush if buffer is full
    if (logBuffer.length >= MAX_BUFFER_SIZE) {
      await flushLogs(config);
    }
  } catch (error) {
    console.error('Failed to log to Kibana:', error);
  }
}

// Flush buffered logs to Elasticsearch
async function flushLogs(config: KibanaConfig) {
  if (logBuffer.length === 0 || !config.elasticsearchUrl) {
    return;
  }

  const logsToSend = [...logBuffer];
  logBuffer = [];

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `ApiKey ${config.apiKey}`;
    } else if (config.username && config.password) {
      const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    // Send logs in batch
    const bulkBody = logsToSend
      .map(log => {
        const action = { index: { _index: config.index } };
        return `${JSON.stringify(action)}\n${JSON.stringify(log)}`;
      })
      .join('\n') + '\n';

    const response = await fetch(`${config.elasticsearchUrl}/_bulk`, {
      method: 'POST',
      headers,
      body: bulkBody,
    });

    if (!response.ok) {
      console.error('Failed to send logs to Elasticsearch:', await response.text());
      // Re-add logs to buffer if send failed
      logBuffer.unshift(...logsToSend);
    }
  } catch (error) {
    console.error('Error flushing logs to Kibana:', error);
    // Re-add logs to buffer if send failed
    logBuffer.unshift(...logsToSend);
  }
}

// Helper functions for different log levels
export function logInfo(message: string, metadata?: Record<string, any>, userId?: string) {
  logToKibana({
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    service: 'resume-builder',
    userId,
    metadata,
  });
}

export function logWarn(message: string, metadata?: Record<string, any>, userId?: string) {
  logToKibana({
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    service: 'resume-builder',
    userId,
    metadata,
  });
}

export function logError(message: string, error?: Error, metadata?: Record<string, any>, userId?: string) {
  logToKibana({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error ? `${message}: ${error.message}` : message,
    service: 'resume-builder',
    userId,
    metadata: {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    },
  });
}

export function logDebug(message: string, metadata?: Record<string, any>, userId?: string) {
  if (process.env.NODE_ENV === 'development') {
    logToKibana({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      service: 'resume-builder',
      userId,
      metadata,
    });
  }
}

// Track performance metrics
export function logPerformance(metricName: string, duration: number, metadata?: Record<string, any>) {
  logToKibana({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Performance: ${metricName}`,
    service: 'resume-builder',
    metadata: {
      ...metadata,
      metric: metricName,
      duration,
      type: 'performance',
    },
  });
}

// Track user actions
export function logUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
  logToKibana({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `User Action: ${action}`,
    service: 'resume-builder',
    userId,
    metadata: {
      ...metadata,
      action,
      type: 'user_action',
    },
  });
}
export function logAPICall(endpoint: string, method: string, duration: number, statusCode: number, metadata?: Record<string, any>) {
  logToKibana({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `API Call: ${endpoint}`,
    service: 'resume-builder',
    metadata: {
      ...(metadata || {}),
      endpoint,
      method,
      duration,
      statusCode,
      type: 'api_call',
    },
  });
}

