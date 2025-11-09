# CRMFlow Deployment Guide

This guide covers deploying CRMFlow to Vercel with serverless API routes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Webhook Configuration](#webhook-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - [Sign up at vercel.com](https://vercel.com)
2. **API Keys** - All required service API keys (see `.env.local.example`)
3. **Git Repository** - Code pushed to GitHub/GitLab/Bitbucket
4. **Node.js 20+** - For local testing before deployment

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Select the `frontend` directory as the root
   - Framework Preset: **Next.js**

3. **Configure Project**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from your `.env.local` file
   - **IMPORTANT**: Add to Production, Preview, and Development environments

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd frontend
vercel --prod

# Follow prompts to configure project
```

## Environment Variables

### Required Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

#### Google Gemini AI
```env
GEMINI_API_KEY=your_gemini_api_key
```

#### Twilio (Voice & Messaging)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

#### ElevenLabs (Text-to-Speech)
```env
ELEVENLABS_API_KEY=your_elevenlabs_key
```

#### SAP Business One
```env
SAP_SERVICE_LAYER_URL=https://your-sap-server:50000/b1s/v1
SAP_USERNAME=your_sap_username
SAP_PASSWORD=your_sap_password
SAP_COMPANY_DB=your_company_database
```

#### Google Calendar & Sheets
```env
GOOGLE_CALENDAR_ACCESS_TOKEN=your_oauth_token
GOOGLE_CALENDAR_ID=primary
GOOGLE_SHEETS_ACCESS_TOKEN=your_oauth_token
```

#### Qlay API
```env
QLAY_API_KEY=your_qlay_api_key
QLAY_API_URL=https://api.qlay.ai/v1
```

#### App Configuration
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use Vercel's encrypted storage** for environment variables
3. **Rotate API keys** regularly
4. **Use different keys** for preview vs production environments
5. **Enable 2FA** on all service accounts

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Application loads at deployment URL
- [ ] Landing page shows "Open Flow Studio" button
- [ ] Studio page loads with flow canvas
- [ ] Voice Lab drawer opens and closes
- [ ] Settings modal accessible

### 2. Test API Routes

Test each API route to ensure secrets are properly configured:

```bash
# Set your deployment URL
export API_URL=https://your-app.vercel.app

# Test Gemini API
curl -X POST $API_URL/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello", "temperature": 0.7}'

# Test ElevenLabs TTS
curl -X POST $API_URL/api/elevenlabs/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voiceId": "pNInz6obpgDQGcFmaJgB"}'

# Test Twilio SMS
curl -X POST $API_URL/api/twilio/sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "from": "+0987654321", "body": "Test"}'
```

Expected responses:
- Status: 200 OK
- JSON with `success: true`
- No authentication errors

### 3. Configure CORS for Webhooks

If using Twilio webhooks, configure allowed origins:

1. **Twilio Console**
   - Go to Phone Numbers → Active Numbers
   - Select your number
   - Voice & Fax → A Call Comes In
   - Set Webhook URL: `https://your-app.vercel.app/api/twilio/webhook`
   - Method: HTTP POST

2. **Verify CORS Headers**
   - Check `vercel.json` includes CORS headers
   - Test webhook delivery from Twilio

### 4. Enable Monitoring

1. **Vercel Analytics**
   - Go to Project → Analytics
   - Enable Web Analytics
   - Enable Audiences (optional)

2. **Function Logs**
   - Go to Project → Logs
   - Monitor API route executions
   - Set up alerts for errors

3. **Error Tracking** (Optional)
   - Integrate Sentry or similar
   - Add DSN to environment variables

### 5. Performance Optimization

- [ ] Enable Edge Runtime where possible (already configured)
- [ ] Verify CDN caching for static assets
- [ ] Check function execution times (target < 10s)
- [ ] Enable Vercel Speed Insights

### 6. Security Hardening

- [ ] Verify all API routes validate input (Zod schemas)
- [ ] Check error responses don't leak secrets
- [ ] Enable Vercel Firewall (Pro plan)
- [ ] Set up rate limiting for API routes
- [ ] Review Vercel Security tab

### 7. Custom Domain (Optional)

```bash
# Add custom domain via CLI
vercel domains add yourdomain.com

# Or via dashboard:
# Project Settings → Domains → Add Domain
```

Configure DNS:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 8. Preview Deployments

Configure preview deployments for branches:

1. **GitHub Integration**
   - Vercel auto-deploys pull requests
   - Each PR gets unique preview URL

2. **Environment Variables**
   - Use separate API keys for preview
   - Set in "Preview" environment scope

## Webhook Configuration

### Twilio Voice Webhook

1. **Set Webhook URL**
   ```
   https://your-app.vercel.app/api/twilio/voice/incoming
   ```

2. **Verify CORS**
   - Twilio needs to POST to your endpoint
   - CORS configured in `vercel.json`

3. **Test Webhook**
   ```bash
   curl -X POST https://your-app.vercel.app/api/twilio/voice/incoming \
     -d "CallSid=CA123" \
     -d "From=+1234567890" \
     -d "To=+0987654321"
   ```

### SAP Business One Webhooks (if applicable)

Configure SAP to send events to:
```
https://your-app.vercel.app/api/sap/webhook
```

Add verification token to environment:
```env
SAP_WEBHOOK_SECRET=your_webhook_secret
```

## Troubleshooting

### Build Failures

**Error**: Module not found
```bash
# Solution: Clear Vercel cache
vercel --force

# Or in dashboard: Deployments → ... → Redeploy → Clear cache
```

**Error**: Environment variable not found
```bash
# Solution: Ensure all env vars are set in Vercel dashboard
# Check: Settings → Environment Variables
```

### Runtime Errors

**Error**: Function timeout
```json
// Increase timeout in vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60  // Increase from 30s
    }
  }
}
```

**Error**: CORS issues
```bash
# Verify CORS headers in vercel.json
# Check browser console for specific origin errors
```

### API Integration Issues

**Error**: External API authentication failed
- Verify API keys in Vercel environment variables
- Check API key format (no extra spaces/quotes)
- Test with same keys locally first
- Check service account permissions

**Error**: Rate limiting
- Implement request queuing
- Use Vercel KV for rate limit tracking
- Add retry logic with exponential backoff

### WebSocket/Streaming Issues

**Note**: Vercel Edge doesn't support true WebSockets
- We use Server-Sent Events (SSE) instead
- For true WebSocket, consider:
  - Railway
  - Render
  - AWS Lambda with API Gateway

## Production Readiness

### Before Going Live

- [ ] All environment variables configured
- [ ] API routes tested and working
- [ ] CORS configured for webhooks
- [ ] Error tracking enabled
- [ ] Monitoring and alerts set up
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified (auto by Vercel)
- [ ] Load testing completed
- [ ] Backup plan for critical data
- [ ] Documentation updated

### Scaling Considerations

1. **Function Limits**
   - Free: 100 GB-hours/month
   - Pro: 1000 GB-hours/month
   - Enterprise: Unlimited

2. **Edge Network**
   - Automatically scales globally
   - No manual configuration needed

3. **Database** (when added)
   - Use Vercel Postgres or external DB
   - Configure connection pooling
   - Enable read replicas for scaling

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status**: [vercel-status.com](https://vercel-status.com)

## Next Steps

After successful deployment:

1. **Enable Mock Mode Toggle**
   - Test flows without consuming API credits
   - Switch between mock/real APIs in settings

2. **Create Example Flows**
   - Import sample flows for demos
   - Test all node types

3. **Set Up Monitoring**
   - Track API usage and costs
   - Monitor function performance
   - Set up alerts for failures

4. **Documentation**
   - Update README with production URL
   - Add screenshots of deployed app
   - Create user guides

---

**Deployment Complete!** 🚀

Your CRMFlow application is now live and ready to build intelligent voice-driven workflows.
