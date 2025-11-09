# Trigger Nodes Documentation

This document describes the trigger nodes in CRMFlow and how to use them.

## Overview

Trigger nodes start the execution of a flow. They can be activated by:
1. **Manual Simulation** (MVP) - Use the simulation buttons in the toolbar
2. **External Webhooks** - Configure external services to call your webhook endpoints
3. **Twilio Integration** - Receive inbound phone calls

---

## 1. Webhook Node

The Webhook node receives HTTP webhooks from external services.

### Configuration

- **Webhook ID**: Unique identifier for this webhook (e.g., `customer-inquiry`, `order-created`)
- **HTTP Method**: GET, POST, PUT, or PATCH (default: POST)

### Webhook Endpoint

Each webhook has a unique URL:
```
POST /api/hooks/{webhookId}
```

Example:
```
POST http://localhost:3003/api/hooks/customer-inquiry
```

### Testing with Simulation Button

Click **"Simulate Webhook"** in the toolbar to trigger the flow with example data:

```json
{
  "webhookPayload": {
    "event": "customer.inquiry",
    "timestamp": "2025-11-09T00:00:00.000Z",
    "data": {
      "customerId": "CUST-1234",
      "customerName": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+14155559876",
      "subject": "Product inquiry",
      "message": "I am interested in learning more...",
      "source": "website"
    }
  },
  "headers": {
    "content-type": "application/json",
    "x-webhook-signature": "simulated-signature"
  }
}
```

### Testing with cURL

```bash
curl -X POST http://localhost:3003/api/hooks/demo-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test",
    "data": {
      "message": "Hello from webhook"
    }
  }'
```

### Signature Validation (Optional)

For production use, configure a webhook secret and include a signature:

1. Set environment variable:
   ```
   WEBHOOK_CUSTOMER_INQUIRY_SECRET=your-secret-key
   ```

2. Generate signature (HMAC-SHA256):
   ```javascript
   const crypto = require('crypto')
   const timestamp = Date.now().toString()
   const payload = JSON.stringify({ event: 'test', data: {} })
   const data = `${timestamp}.${payload}`
   const signature = crypto.createHmac('sha256', 'your-secret-key')
     .update(data)
     .digest('hex')
   ```

3. Send request with headers:
   ```bash
   curl -X POST http://localhost:3003/api/hooks/customer-inquiry \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Signature: ${signature}" \
     -H "X-Webhook-Timestamp: ${timestamp}" \
     -d '{"event":"test"}'
   ```

### Output Variables

- `webhookPayload` - The payload sent to the webhook
- `headers` - HTTP headers from the request

---

## 2. Inbound Call Node

The Inbound Call node receives phone calls via Twilio.

### Configuration

- **Phone Number**: Twilio phone number (optional, for reference)

### Twilio Webhook URL

Configure this URL in your Twilio phone number settings:
```
POST /api/twilio/webhook
```

Example:
```
POST http://localhost:3003/api/twilio/webhook
```

### Twilio Configuration

1. Log in to [Twilio Console](https://console.twilio.com/)
2. Go to **Phone Numbers** → **Manage** → **Active numbers**
3. Select your phone number
4. Under **Voice & Fax**, set:
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://your-domain.com/api/twilio/webhook`
   - **HTTP**: POST

### Environment Variables

Required for signature validation:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14155551234
```

### Testing with Simulation Button

Click **"Simulate Call"** in the toolbar to trigger the flow with example call data:

```json
{
  "callerId": "+14155551234",
  "callerName": "John Doe",
  "callData": {
    "from": "+14155551234",
    "to": "+14155556789",
    "callSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "direction": "inbound",
    "callerCountry": "US",
    "callerState": "CA",
    "callerCity": "San Francisco"
  }
}
```

### Testing with ngrok (Local Development)

1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 3003`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Configure Twilio webhook: `https://abc123.ngrok.io/api/twilio/webhook`

### Testing with cURL (Twilio Format)

```bash
curl -X POST http://localhost:3003/api/twilio/webhook \
  -d "From=%2B14155551234" \
  -d "To=%2B14155556789" \
  -d "CallSid=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d "AccountSid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d "Direction=inbound" \
  -d "CallerCountry=US" \
  -d "CallerState=CA" \
  -d "CallerCity=San+Francisco"
```

### Output Variables

- `callerId` - Phone number of the caller
- `callerName` - Name of the caller (if available)
- `callData` - Full call details from Twilio

### TwiML Response

The endpoint automatically returns TwiML to handle the call. You can customize this later to integrate with your flow execution.

---

## Flow Execution

When a trigger is activated (via simulation or real webhook), the flow executor:

1. Starts from the trigger node
2. Injects the payload into the execution context
3. Follows the connected nodes
4. Executes each node sequentially
5. Returns logs and results

### Example Flow

```
[Webhook Trigger]
    ↓ (webhookPayload, headers)
[Sentiment Analysis]
    ↓ positive → [Create Lead in SAP]
    ↓ negative → [Send to Support Team]
    ↓ neutral  → [Add to Newsletter]
```

---

## Security Best Practices

### Production Checklist

1. **Enable Signature Validation**
   - Set `TWILIO_AUTH_TOKEN` for Twilio webhooks
   - Set webhook secrets for generic webhooks

2. **Use HTTPS**
   - Never expose webhook endpoints over HTTP in production
   - Use SSL/TLS certificates

3. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Use a service like Cloudflare or AWS WAF

4. **IP Whitelisting** (Optional)
   - Restrict webhook access to known IP ranges
   - Twilio IPs: https://www.twilio.com/docs/usage/webhooks/webhooks-security#ip-addresses

5. **Logging and Monitoring**
   - Log all webhook events
   - Monitor for suspicious activity
   - Set up alerts for failed validations

---

## Troubleshooting

### Webhook Not Receiving Data

1. Check the webhook URL is correct
2. Verify the HTTP method matches (POST, GET, etc.)
3. Check network/firewall rules
4. Use ngrok for local testing

### Twilio Signature Validation Failing

1. Verify `TWILIO_AUTH_TOKEN` is correct
2. Check the URL matches exactly (including protocol and path)
3. Ensure no URL rewriting/redirects

### Simulation Not Working

1. Check browser console for errors
2. Verify the flow has trigger nodes
3. Check execution logs panel

---

## Future Enhancements

- [ ] Database storage for webhook events
- [ ] Webhook retry mechanism
- [ ] Custom TwiML responses based on flow execution
- [ ] Webhook event history and replay
- [ ] Multiple flows per webhook
- [ ] Webhook authentication methods (API keys, OAuth)

---

## API Reference

### GET /api/hooks/{id}

Check webhook status:

```bash
curl http://localhost:3003/api/hooks/demo-webhook
```

Response:
```json
{
  "id": "demo-webhook",
  "name": "Demo Webhook",
  "enabled": true,
  "hasSecret": false,
  "endpoint": "/api/hooks/demo-webhook"
}
```

### GET /api/twilio/webhook

Health check for Twilio endpoint:

```bash
curl http://localhost:3003/api/twilio/webhook
```

Response:
```json
{
  "status": "ok",
  "endpoint": "twilio-webhook",
  "message": "Twilio webhook endpoint is active"
}
```
