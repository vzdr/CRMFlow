# SAP Sales Qualifier Template

## Overview

The **SAP Sales Qualifier** template is a pre-built, production-ready workflow that automates initial sales lead qualification using intelligent voice interaction and SAP CRM integration.

## What It Does

This template creates a complete end-to-end flow that:

1. **Receives an inbound sales call** from a prospect or customer
2. **Greets the caller** with a professional AI voice message
3. **Captures the company name** using voice recognition and NLU
4. **Checks SAP** to see if the caller is an existing customer
5. **Routes intelligently** based on customer value:
   - **High-value customers** (>$500k annual revenue) → VIP treatment with immediate account manager transfer
   - **Standard/New customers** → Standard response with lead creation in SAP

## Template Flow

```
┌─────────────────┐
│  Inbound Call   │ Trigger: Receives phone call
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Speak Text     │ "Hello! Thank you for calling Acme Sales..."
│  (Greeting)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Listen &       │ Extract company name from speech
│  Understand     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  SAP Get        │ Look up customer by company name
│  Customer       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Condition      │ Check: annualRevenue > $500k?
│  (High Value?)  │
└────┬───────┬────┘
     │       │
  TRUE│      │FALSE
     │       │
     v       v
┌────────┐ ┌─────────────────┐
│  VIP   │ │    Standard     │
│Response│ │    Response     │
└────────┘ └────────┬────────┘
                    │
                    v
           ┌─────────────────┐
           │  SAP Create     │
           │  Lead           │
           └─────────────────┘
```

## Node Configuration Details

### 1. Inbound Call (Trigger)
- **Type**: `inbound-call`
- **Config**:
  - Phone Number: `+1-555-SALES-01`
  - Description: "Receive incoming sales inquiry"

### 2. Greeting (Speak Text)
- **Type**: `speak-text`
- **Config**:
  - Text: "Hello! Thank you for calling Acme Sales. My name is Sarah, your AI sales assistant. May I have your company name please?"
  - Voice ID: `21m00Tcm4TlvDq8ikWAM` (ElevenLabs)
  - Stability: 0.5
  - Similarity Boost: 0.75

### 3. Capture Company Name (Listen & Understand)
- **Type**: `listen-understand`
- **Config**:
  - Input Mode: `voice`
  - Language: `en-US`
  - Max Duration: 30 seconds
  - Prompt Template: "Extract the company name from the following speech. Return JSON with { \"companyName\": \"...\" }"

### 4. Check SAP Customer (SAP Get Customer)
- **Type**: `sap-get-customer`
- **Config**:
  - Endpoint: `/api/sap/customers`
  - Search Field: `companyName`
  - Search Value: `extractedEntities.companyName` (from Listen & Understand output)

### 5. High Value Customer? (Condition)
- **Type**: `condition`
- **Config**:
  - Expression: `sapCustomer && sapCustomer.annualRevenue > 500000`
  - Description: "Check if customer revenue > $500k"

### 6A. VIP Response (Speak Text - TRUE Path)
- **Type**: `speak-text`
- **Config**:
  - Text: "Thank you! I see you are one of our valued enterprise clients. Let me connect you directly with your dedicated account manager. Please hold."
  - Voice ID: `21m00Tcm4TlvDq8ikWAM`
  - Stability: 0.6
  - Similarity Boost: 0.8

### 6B. Standard Response (Speak Text - FALSE Path)
- **Type**: `speak-text`
- **Config**:
  - Text: "Thank you for your interest! I will create a lead for our sales team to follow up with you within 24 hours. May I confirm your contact information?"
  - Voice ID: `21m00Tcm4TlvDq8ikWAM`
  - Stability: 0.5
  - Similarity Boost: 0.75

### 7. Create SAP Lead (SAP Create Lead - FALSE Path Only)
- **Type**: `sap-create-lead`
- **Config**:
  - Endpoint: `/api/sap/leads`
  - Field Mappings:
    - `companyName`: `extractedEntities.companyName`
    - `contactName`: `callerName`
    - `email`: `callData.from`
    - `phone`: `callerId`
    - `source`: `"inbound_call"` (static value)
    - `status`: `"new"` (static value)
    - `priority`: `"medium"` (static value)

## Testing the Template

### Method 1: Load Template
1. Go to **Studio** (http://localhost:3003/studio)
2. Click **Templates** button in toolbar
3. Select **SAP Sales Qualifier**
4. Confirm to load the template

### Method 2: Simulate Different Scenarios

Click **Simulate Call** to test different customer scenarios:

**Scenario A: High-Value Existing Customer**
- Company: "Acme Corporation" or "TechStart Inc" or "Global Logistics Ltd"
- Expected Result: VIP path → "valued enterprise clients" message
- Annual Revenue: >$500k
- Path: Greeting → Listen → SAP Lookup → Condition (TRUE) → VIP Response

**Scenario B: Standard Existing Customer**
- Company: "SmallBiz Solutions"
- Expected Result: Standard path → Lead creation
- Annual Revenue: $250k (< $500k)
- Path: Greeting → Listen → SAP Lookup → Condition (FALSE) → Standard Response → Create Lead

**Scenario C: New Prospect (Not in SAP)**
- Company: "NewCompany Inc"
- Expected Result: Standard path → Lead creation
- SAP Lookup: Returns `null` (not found)
- Path: Greeting → Listen → SAP Lookup (null) → Condition (FALSE) → Standard Response → Create Lead

### Expected Execution Logs

**High-Value Customer (Acme Corporation):**
```
[INFO] Inbound Call: Received call from +14155551234
[INFO] Greeting: Speaking text...
[SUCCESS] Greeting: Audio generated successfully
[INFO] Capture Company Name: Listening to caller...
[SUCCESS] Capture Company Name: Extracted entities
[INFO] Check SAP Customer: Looking up customer in SAP
[SUCCESS] Check SAP Customer: Found customer "Acme Corporation"
[INFO] High Value Customer?: Evaluating condition
[SUCCESS] High Value Customer?: Condition TRUE (annualRevenue: 2500000 > 500000)
[INFO] VIP Response: Speaking text...
[SUCCESS] VIP Response: Audio generated successfully
```

**Standard Customer (SmallBiz Solutions):**
```
[INFO] Inbound Call: Received call from +14155551234
[INFO] Greeting: Speaking text...
[SUCCESS] Greeting: Audio generated successfully
[INFO] Capture Company Name: Listening to caller...
[SUCCESS] Capture Company Name: Extracted entities
[INFO] Check SAP Customer: Looking up customer in SAP
[SUCCESS] Check SAP Customer: Found customer "SmallBiz Solutions"
[INFO] High Value Customer?: Evaluating condition
[SUCCESS] High Value Customer?: Condition FALSE (annualRevenue: 250000 ≤ 500000)
[INFO] Standard Response: Speaking text...
[SUCCESS] Standard Response: Audio generated successfully
[INFO] Create SAP Lead: Creating lead in SAP
[SUCCESS] Create SAP Lead: Lead created with ID LEAD-12345
```

## Mock Data Reference

### SAP Customers (Pre-configured)
| Company Name           | Annual Revenue | Category    |
|------------------------|----------------|-------------|
| Acme Corporation       | $2,500,000     | High-Value  |
| TechStart Inc          | $1,800,000     | High-Value  |
| Global Logistics Ltd   | $3,200,000     | High-Value  |
| SmallBiz Solutions     | $250,000       | Standard    |

### Listen & Understand Mock Responses
The mock service will rotate through these company names:
1. "Acme Corporation"
2. "TechStart Inc"
3. "Global Logistics Ltd"
4. "SmallBiz Solutions"
5. "NewCompany Inc"

## Customization Guide

### Changing the Revenue Threshold
Edit the Condition node's expression:
```javascript
// Default: $500k threshold
sapCustomer && sapCustomer.annualRevenue > 500000

// Change to $1M threshold
sapCustomer && sapCustomer.annualRevenue > 1000000

// Change to $250k threshold
sapCustomer && sapCustomer.annualRevenue > 250000
```

### Adding More Customer Attributes
You can check additional SAP customer fields in the condition:
```javascript
// Check status and revenue
sapCustomer && sapCustomer.status === 'active' && sapCustomer.annualRevenue > 500000

// Check industry
sapCustomer && sapCustomer.industry === 'Technology'

// Check account manager
sapCustomer && sapCustomer.accountManager === 'Sarah Johnson'
```

### Customizing Voice Messages
Edit the text in any Speak Text node:
- **Greeting**: First message caller hears
- **VIP Response**: Message for high-value customers
- **Standard Response**: Message for standard/new customers

### Adding More Routing Paths
You can add additional condition nodes to create more sophisticated routing:
```
Condition 1: Revenue > $1M → Tier 1 VIP
Condition 2: Revenue > $500k → Tier 2 VIP
Else → Standard Path
```

## Production Deployment

### Before Going Live:

1. **Configure Real APIs**:
   - Set `USE_MOCK=0` in environment
   - Add real API keys to `.env.local`:
     ```
     TWILIO_ACCOUNT_SID=your_twilio_sid
     TWILIO_AUTH_TOKEN=your_twilio_token
     ELEVENLABS_API_KEY=your_elevenlabs_key
     GOOGLE_GEMINI_API_KEY=your_gemini_key
     SAP_API_URL=your_sap_url
     SAP_CLIENT_ID=your_sap_client_id
     SAP_CLIENT_SECRET=your_sap_secret
     ```

2. **Test with Real Phone Calls**:
   - Configure Twilio webhook to point to your deployment
   - Test with actual inbound calls
   - Verify SAP integration is working

3. **Monitor and Iterate**:
   - Review execution logs
   - Analyze which path customers take (VIP vs Standard)
   - Adjust revenue threshold based on business needs
   - Refine voice messages based on customer feedback

## Business Value

### Time Savings
- **Before**: Manual qualification by sales reps (5-10 min per call)
- **After**: Automated qualification (30 seconds)
- **ROI**: 90% reduction in qualification time

### Customer Experience
- **High-Value Customers**: Instant VIP recognition and routing
- **New Prospects**: Professional intake with guaranteed follow-up
- **Consistency**: Same quality experience 24/7

### Data Quality
- **Automatic CRM Updates**: Every call creates/updates SAP records
- **No Manual Entry**: Eliminates data entry errors
- **Complete Audit Trail**: Full execution logs for compliance

## Support

For questions or customization help:
1. Check the [main README](./README.md)
2. Review [SAP Nodes documentation](./SAP_NODES.md)
3. Explore [Trigger Nodes documentation](./TRIGGER_NODES.md)
