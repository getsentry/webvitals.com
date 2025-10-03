# Environment Variables

Comprehensive reference for configuring WebVitals.com in different environments.

## 🔧 Required Variables

These environment variables are required for the application to function properly.

### Google PageSpeed Insights API

```bash
GOOGLE_API_KEY=your_google_pagespeed_api_key
```

**Purpose**: Fetch real user performance data from Chrome User Experience Report (CrUX)  
**How to Get**: 
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable PageSpeed Insights API
4. Create API Key credentials
5. Copy the key

**Usage**: Real-world performance analysis via CrUX data  
**Rate Limits**: 25,000 requests/day (default), can be increased  
**Security**: Restrict key to PageSpeed Insights API only

### Cloudflare API

```bash
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

**Purpose**: Technology detection using Cloudflare URL Scanner  
**How to Get**:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "My Profile" → "API Tokens"
3. Create custom token with these permissions:
   - `Account:Cloudflare Tunnel:Read`
   - `Zone:Zone:Read`
4. Get Account ID from dashboard sidebar

**Usage**: Detect frameworks, CMS, hosting platforms, and technologies  
**Rate Limits**: Varies by plan, typically 1,200 requests/5 minutes  
**Security**: Token should have minimal required permissions

### OpenAI API

```bash
OPENAI_API_KEY=your_openai_api_key
```

**Purpose**: AI-powered analysis and follow-up generation  
**How to Get**:
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create new secret key
4. Copy the key

**Usage**: GPT-4o for contextual analysis and recommendations  
**Rate Limits**: Varies by account tier and usage  
**Model**: Currently uses `gpt-4o` model  
**Security**: Keep secret, monitor usage for cost control

## 🎯 Optional Variables

These variables enhance functionality but are not required for basic operation.

### Sentry Monitoring

```bash
# Public DSN (client-side monitoring)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Private token (server-side operations)
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Organization and project (for source maps)
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
```

**Purpose**: Error tracking, performance monitoring, and observability  
**Benefits**:
- **Error Tracking**: Catch and track frontend/backend errors
- **Performance Monitoring**: Monitor Core Web Vitals and API performance
- **Session Replay**: Debug user issues with session recordings
- **AI Agent Monitoring**: Track AI tool execution and success rates

**How to Get**:
1. Create account at [Sentry.io](https://sentry.io/)
2. Create new project (Next.js type)
3. Copy DSN from project settings
4. Generate auth token for source maps upload

**Configuration**:
```typescript
// Optional Sentry configuration
{
  tracesSampleRate: 1.0,           // 100% performance monitoring
  replaysSessionSampleRate: 0.1,   // 10% session replay
  replaysOnErrorSampleRate: 1.0,   // 100% replay on errors
}
```

## ⚙️ System Variables

These variables control application behavior and should be set appropriately for each environment.

### Environment Type

```bash
NODE_ENV=production|development|test
```

**Purpose**: Control application behavior based on environment  
**Values**:
- `production`: Optimized builds, error reporting, analytics
- `development`: Hot reloading, verbose logging, dev tools
- `test`: Testing configuration, mocked APIs

**Auto-set**: Usually set automatically by hosting platform

### Next.js Configuration

```bash
# Disable Next.js telemetry (optional)
NEXT_TELEMETRY_DISABLED=1

# Custom build directory (optional)
NEXT_BUILD_DIR=.next

# Output type for deployment (optional)
NEXT_OUTPUT=standalone
```

**Purpose**: Control Next.js behavior and telemetry  
**Telemetry**: Anonymous usage data sent to Next.js team  
**Output**: `standalone` for Docker deployments

## 📁 Environment Files

### Development (`.env.local`)

```bash
# Required APIs
GOOGLE_API_KEY=your_dev_google_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
OPENAI_API_KEY=your_dev_openai_api_key

# Optional monitoring
NEXT_PUBLIC_SENTRY_DSN=your_dev_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Development settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### Production (Vercel/Platform)

```bash
# Required APIs (production keys)
GOOGLE_API_KEY=your_prod_google_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
OPENAI_API_KEY=your_prod_openai_api_key

# Monitoring (production project)
NEXT_PUBLIC_SENTRY_DSN=your_prod_sentry_dsn
SENTRY_AUTH_TOKEN=your_prod_sentry_auth_token
SENTRY_ORG=your-organization
SENTRY_PROJECT=webvitals-prod

# Production settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Testing (`.env.test`)

```bash
# Mock APIs or test keys
GOOGLE_API_KEY=test_google_api_key
CLOUDFLARE_ACCOUNT_ID=test_account_id
CLOUDFLARE_API_TOKEN=test_token
OPENAI_API_KEY=test_openai_key

# Test environment
NODE_ENV=test
NEXT_TELEMETRY_DISABLED=1
```

## 🔒 Security Best Practices

### API Key Management

**Never Commit Keys**:
```bash
# Add to .gitignore
.env.local
.env.production
.env.staging
```

**Use Different Keys per Environment**:
- **Development**: Separate keys with relaxed rate limits
- **Production**: Production keys with appropriate restrictions
- **Testing**: Mock keys or dedicated test environment keys

**Key Rotation**:
- Rotate keys quarterly or after suspected compromise
- Update all environments simultaneously
- Monitor for unauthorized usage

### Platform Security

**Vercel Environment Variables**:
- Store sensitive variables in Vercel dashboard
- Use different values for preview vs production
- Enable environment-specific access controls

**Docker/Container Security**:
```dockerfile
# Use secrets management for API keys
RUN --mount=type=secret,id=google_api_key \
    echo "GOOGLE_API_KEY=$(cat /run/secrets/google_api_key)" >> .env
```

## 📊 Monitoring & Validation

### Environment Validation

**Startup Checks**:
```typescript
// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_API_KEY',
  'CLOUDFLARE_ACCOUNT_ID', 
  'CLOUDFLARE_API_TOKEN',
  'OPENAI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

**Health Check Endpoint**:
```typescript
// GET /api/health
{
  status: 'ok',
  services: {
    google: 'connected',
    cloudflare: 'connected', 
    openai: 'connected',
    sentry: 'optional'
  }
}
```

### Usage Monitoring

**API Quota Tracking**:
- Monitor Google PageSpeed API usage vs quotas
- Track Cloudflare rate limit consumption
- Monitor OpenAI token usage and costs
- Set up alerts for approaching limits

**Cost Management**:
- Set OpenAI usage limits to prevent runaway costs
- Monitor Sentry event quotas
- Track overall API costs monthly

## 🚨 Troubleshooting

### Common Issues

**"API Key not found" Errors**:
```bash
# Check if variable is set
echo $GOOGLE_API_KEY

# Restart server after changing .env.local
pnpm dev
```

**"Invalid API Key" Errors**:
- Verify key is copied correctly (no extra spaces)
- Check API key permissions and restrictions
- Ensure key is enabled for the correct API
- Verify account billing is active

**Rate Limit Errors**:
- Check current usage in API console
- Implement exponential backoff in application
- Consider upgrading API quotas
- Cache responses to reduce API calls

### Environment Debugging

**Production Debugging**:
```bash
# Check Vercel environment variables
vercel env ls

# View deployment logs
vercel logs
```

## 📋 Environment Checklist

### Pre-Deployment

- [ ] All required environment variables configured
- [ ] API keys tested and working
- [ ] Different keys for each environment
- [ ] Sentry monitoring configured (optional)
- [ ] Health check endpoint returns success
- [ ] No sensitive data in version control

### Post-Deployment

- [ ] Application starts successfully
- [ ] All APIs return expected data
- [ ] Error tracking working (if enabled)
- [ ] Performance monitoring active (if enabled)
- [ ] Rate limits not being exceeded
- [ ] Costs within expected range

### Regular Maintenance

- [ ] Review API usage monthly
- [ ] Rotate API keys quarterly
- [ ] Monitor for security advisories
- [ ] Update dependencies with security patches
- [ ] Review and optimize API costs

