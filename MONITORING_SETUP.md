# 📊 Monitoring Setup Guide (Dynatrace & Kibana)

This guide explains how to set up Dynatrace and Kibana monitoring for the Resume Builder application.

## 🔧 Dynatrace Setup

### Step 1: Create Dynatrace Account

1. Go to [Dynatrace](https://www.dynatrace.com/)
2. Sign up for a free trial or account
3. Create a new environment
4. Get your **Environment ID** and **API Token**

### Step 2: Get Dynatrace Credentials

1. Go to **Settings** → **Integration** → **Platform as a Service**
2. Copy your **Environment ID** (format: `xxxxx`)
3. Go to **Settings** → **Integration** → **Dynatrace API**
4. Create an API token with:
   - **Access problem and event feed, metrics, and topology**
   - **Write events**
   - **Write logs**

### Step 3: Add Environment Variables

Add to `.env.local`:

```env
# Dynatrace Configuration
NEXT_PUBLIC_DYNATRACE_ENVIRONMENT_ID=your_environment_id
NEXT_PUBLIC_DYNATRACE_API_TOKEN=your_api_token
NEXT_PUBLIC_DYNATRACE_CLUSTER_ID=your_cluster_id  # Optional, defaults to 'dynatrace'

# Server-side Dynatrace (for API routes)
DYNATRACE_ENVIRONMENT_ID=your_environment_id
DYNATRACE_API_TOKEN=your_api_token
DYNATRACE_CLUSTER_ID=your_cluster_id  # Optional
```

### Step 4: Verify Dynatrace Integration

1. Start your dev server: `npm run dev`
2. Navigate to your application
3. Check Dynatrace dashboard → **User sessions** → Should see your session
4. Check **Custom events** → Should see tracked events

## 📈 Kibana/Elasticsearch Setup

### Step 1: Set Up Elasticsearch

**Option A: Elastic Cloud (Recommended)**
1. Go to [Elastic Cloud](https://cloud.elastic.co/)
2. Sign up for free trial
3. Create a deployment
4. Get your **Elasticsearch endpoint** and **API key**

**Option B: Self-Hosted**
1. Install Elasticsearch locally or on server
2. Configure Kibana
3. Get endpoint URL and credentials

### Step 2: Create API Key

1. Go to **Management** → **Security** → **API Keys**
2. Create a new API key with appropriate permissions:
   - `write` permission for logs index
   - `read` permission for monitoring

### Step 3: Add Environment Variables

Add to `.env.local`:

```env
# Elasticsearch/Kibana Configuration
ELASTICSEARCH_URL=https://your-cluster.es.region.cloud.es.io:9243
ELASTICSEARCH_API_KEY=your_api_key

# OR use username/password
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# Optional: Custom index name
ELASTICSEARCH_INDEX=resume-builder-logs
```

### Step 4: Create Index Pattern in Kibana

1. Go to Kibana dashboard
2. Navigate to **Stack Management** → **Index Patterns**
3. Create index pattern: `resume-builder-logs*`
4. Select timestamp field: `timestamp`
5. Create index pattern

### Step 5: Verify Kibana Integration

1. Start your dev server: `npm run dev`
2. Perform some actions (generate resume, download, etc.)
3. Go to Kibana → **Discover**
4. Filter by index: `resume-builder-logs`
5. You should see log entries

## 🎯 What's Being Monitored

### Dynatrace Tracking

**Automatic:**
- Page load times
- User sessions
- JavaScript errors
- Network requests
- API response times

**Custom Events:**
- Resume generation
- Resume downloads
- User actions
- API calls
- Errors

### Kibana Logging

**Log Levels:**
- **Info**: General application events
- **Warn**: Warnings and non-critical issues
- **Error**: Errors and exceptions
- **Debug**: Debug information (development only)

**Tracked Events:**
- API requests/responses
- Performance metrics
- User actions
- Errors and exceptions
- Authentication events
- Resume generation/download

## 📊 Monitoring Dashboard

### Dynatrace Dashboard

Access your Dynatrace dashboard to view:
- **User sessions**: Real-time user activity
- **Custom events**: Tracked application events
- **Performance**: Page load times, API response times
- **Errors**: JavaScript errors and exceptions
- **User actions**: Custom tracked actions

### Kibana Dashboard

Create dashboards in Kibana to visualize:
- **Log volume**: Number of logs over time
- **Error rate**: Error frequency
- **Performance metrics**: API response times
- **User activity**: User action patterns
- **Service health**: Application health metrics

## 🔍 Example Queries

### Kibana Queries

**All errors:**
```
level: error
```

**Resume generation events:**
```
metadata.action: resume_generation
```

**Performance issues:**
```
metadata.type: performance AND metadata.duration: >1000
```

**User-specific logs:**
```
userId: "user-id-here"
```

### Dynatrace Queries

**Custom events:**
```
event.type == "CUSTOM"
```

**API performance:**
```
service.name == "resume-builder-api"
```

## 🛠️ Usage in Code

### Track Custom Events

```typescript
import { trackUserAction, trackError, logInfo } from '@/lib/monitoring';

// Track user action
trackUserAction('resume_generated', userId, { template: 'classic' });

// Track error
trackError(new Error('Something went wrong'), { context: 'resume_generation' }, userId);

// Log info
logInfo('User signed up', { method: 'email' }, userId);
```

### Track Performance

```typescript
import { logPerformance } from '@/lib/monitoring';

const startTime = Date.now();
// ... your code ...
const duration = Date.now() - startTime;
logPerformance('operation_name', duration, { metadata });
```

## 🔒 Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all credentials
3. **Rotate API keys** regularly
4. **Restrict API key permissions** to minimum required
5. **Use HTTPS** for all Elasticsearch connections

## 🐛 Troubleshooting

### Dynatrace Not Working?

1. **Check Environment Variables**:
   ```bash
   echo $NEXT_PUBLIC_DYNATRACE_ENVIRONMENT_ID
   ```

2. **Check Browser Console**:
   - Look for Dynatrace script loading errors
   - Check Network tab for Dynatrace requests

3. **Verify API Token**:
   - Ensure token has correct permissions
   - Check token hasn't expired

### Kibana Not Receiving Logs?

1. **Check Elasticsearch Connection**:
   ```bash
   curl -X GET "$ELASTICSEARCH_URL/_cluster/health" \
     -H "Authorization: ApiKey $ELASTICSEARCH_API_KEY"
   ```

2. **Check Index Exists**:
   ```bash
   curl -X GET "$ELASTICSEARCH_URL/resume-builder-logs" \
     -H "Authorization: ApiKey $ELASTICSEARCH_API_KEY"
   ```

3. **Check Log Buffer**:
   - Logs are buffered and sent in batches
   - Check if buffer is flushing (every 5 seconds or 100 logs)

4. **Check Kibana Index Pattern**:
   - Ensure index pattern matches your index name
   - Check timestamp field is correctly mapped

## 📚 Resources

- [Dynatrace Documentation](https://www.dynatrace.com/support/help/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

---

**Note**: Monitoring is configured but inactive until you add the API keys. The application will continue to work normally without monitoring configured.

