# SAP Integration Nodes Documentation

This document describes the SAP integration nodes in CRMFlow and how to use field mappings.

## Overview

SAP nodes integrate with SAP systems to manage customers and leads. They use **field mapping** to extract data from the execution context and transform it into the format expected by SAP.

---

## 1. SAP Get Customer Node

Retrieves customer data from SAP based on a search criteria.

### Configuration

#### Basic Settings
- **SAP Credentials Reference**: Reference to stored SAP credentials (optional for mock mode)
- **Endpoint**: SAP API endpoint path (default: `/api/customers`)

#### Search Settings
- **Search By**: Field to use for searching
  - `customerId` - Search by customer ID
  - `companyName` - Search by company name
  - `email` - Search by email address
  - `phone` - Search by phone number

- **Search Value (Context Path)**: Path to the search value in the execution context
  - Example: `webhookPayload.data.customerId`
  - Example: `callerId`
  - Example: `customer.id`

### Context Path Resolution

The node uses **dot notation** to access nested values in the execution context:

```javascript
// If context is:
{
  webhookPayload: {
    data: {
      customerId: "CUST-12345"
    }
  },
  callerId: "+14155551234"
}

// Then:
"webhookPayload.data.customerId" → "CUST-12345"
"callerId" → "+14155551234"
```

### Output Variables

- `customer` - Full customer object with all fields
- `customerId` - Customer ID
- `companyName` - Company name

### Mock Data

In mock mode, the node returns sample customers:
- "Acme" → Acme Corporation
- "Globex" → Globex Corporation
- "Initech" → Initech Inc
- "Hooli" → Hooli XYZ

### Example Flow

```
[Webhook Trigger]
    ↓ (webhookPayload.data.customerId = "CUST-123")
[SAP Get Customer]
  - Search By: customerId
  - Search Value: webhookPayload.data.customerId
    ↓ (customer, customerId, companyName)
[Speak Text]
  - Text: "Hello {{companyName}}, how can I help you?"
```

---

## 2. SAP Create Lead Node

Creates a new lead in SAP with mapped field values.

### Configuration

#### Basic Settings
- **SAP Credentials Reference**: Reference to stored SAP credentials (optional for mock mode)
- **Endpoint**: SAP API endpoint path (default: `/api/leads`)

#### Field Mappings

Map execution context values to SAP lead fields using the **Field Mapping Editor**.

##### Available Fields

| Field Name | Required | Description |
|------------|----------|-------------|
| companyName | Yes | Company or organization name |
| contactName | No | Contact person name |
| email | No | Email address |
| phone | No | Phone number |
| source | No | Lead source (e.g., "webhook", "call") |
| industry | No | Industry type |
| revenue | No | Annual revenue |
| notes | No | Additional notes |

##### Mapping Syntax

**Context Paths** (dot notation):
```
callerId
webhookPayload.data.email
customer.companyName
transcribedText
```

**Static Values** (wrapped in quotes):
```
"webhook"
"High Priority"
"Inbound Call"
```

### Field Mapping Editor

The node includes a visual field mapping editor with:
- **Help Toggle** - Shows/hides examples and documentation
- **Context Path Examples** - Quick reference for common patterns
- **Available Variables** - List of all context variables
- **Real-time Validation** - Validates mappings as you type

### Default Mappings

```javascript
{
  companyName: "webhookPayload.data.customerName",
  contactName: "callerName",
  email: "webhookPayload.data.email",
  phone: "callerId",
  source: "\"webhook\""
}
```

### How Field Mapping Works

1. **Node Execution** - When the node executes, it reads field mappings from config
2. **Context Resolution** - For each mapping, resolves the value from context:
   - `callerId` → Direct property access
   - `webhookPayload.data.email` → Nested property access
   - `"webhook"` → Static string value
3. **Data Construction** - Builds lead object with resolved values
4. **Validation** - Checks required fields (companyName)
5. **API Call** - Sends to SAP (or mock in development)

### Output Variables

- `leadId` - Unique ID of the created lead
- `sapLead` - Full lead object with all fields
- `sapResponse` - API response from SAP

### Example Flow

```
[Webhook Trigger]
    ↓
[Sentiment Analysis]
    ↓ positive
[SAP Create Lead]
  Field Mappings:
    - companyName: webhookPayload.data.customerName
    - email: webhookPayload.data.email
    - phone: webhookPayload.data.phone
    - source: "webhook"
    - notes: transcribedText
    ↓ (leadId, sapLead, sapResponse)
[Speak Text]
  - Text: "Lead {{leadId}} has been created for {{sapLead.companyName}}"
```

---

## Context Path Reference

### Common Context Variables

After each node type, these variables become available:

#### Webhook Trigger
- `webhookPayload` - Full webhook payload
- `webhookPayload.data.*` - Nested data properties
- `headers` - HTTP headers

#### Inbound Call Trigger
- `callerId` - Caller's phone number
- `callerName` - Caller's name (if available)
- `callData` - Full call details
- `callData.callerCity` - Caller's city
- `callData.callerState` - Caller's state

#### Listen & Understand
- `transcribedText` - Transcribed speech
- `userResponse` - User's response
- `intent` - Detected intent

#### Sentiment Analysis
- `sentiment` - Sentiment result (positive/negative/neutral)
- `sentimentScore` - Numeric score (0-1)
- `sentimentMagnitude` - Strength of sentiment

#### SAP Get Customer
- `customer` - Full customer object
- `customerId` - Customer ID
- `companyName` - Company name

#### SAP Create Lead
- `leadId` - Created lead ID
- `sapLead` - Lead details
- `sapResponse` - API response

---

## Field Mapping Best Practices

### 1. Use Descriptive Mappings

**Good:**
```
companyName: "webhookPayload.data.customerName"
email: "webhookPayload.data.email"
```

**Avoid:**
```
companyName: "webhookPayload.data.name"  // Ambiguous
email: "email"  // May not exist at root level
```

### 2. Provide Fallback Values

For optional fields, consider creating a condition node to set defaults:

```
[Condition]
  - Expression: customer.revenue === undefined
  - True → [Set Variable] revenue = "Unknown"
  - False → Continue
```

### 3. Validate Input Data

Use condition nodes before SAP operations to validate:

```
[Condition]
  - Expression: webhookPayload.data.email !== undefined
  - True → [Create Lead]
  - False → [Log Error]
```

### 4. Use Static Values for Constants

When a field should always have the same value:

```
source: "\"webhook\""
priority: "\"High\""
status: "\"New\""
```

### 5. Combine Multiple Sources

You can't use expressions in field mappings, but you can prepare data in earlier nodes:

```
[JavaScript/Transform Node] (future feature)
  - combinedNotes = transcribedText + " | Source: " + webhookPayload.source
[SAP Create Lead]
  - notes: "combinedNotes"
```

---

## Mock Mode

Both SAP nodes work in mock mode by default, making it easy to test without SAP credentials.

### Enable Mock Mode

Mock mode is automatically enabled when:
- `process.env.NODE_ENV !== 'production'`
- OR when calling `isMockMode()` returns true

### Mock Behavior

**SAP Get Customer:**
- Returns predefined sample customers
- Matches based on company name substrings
- Always returns data structure matching real SAP responses

**SAP Create Lead:**
- Generates unique lead IDs
- Logs all mapped fields
- Returns success response with lead details

### Disable Mock Mode

Set in your `.env.local`:
```
NODE_ENV=production
SAP_API_URL=https://your-sap-instance.com
SAP_CLIENT_ID=your-client-id
SAP_CLIENT_SECRET=your-client-secret
```

---

## Error Handling

### Missing Required Fields

If `companyName` is missing, the node will:
1. Log a warning
2. Use fallback value: "Unknown Company"
3. Continue execution

### Search Value Not Found

If the search value path doesn't exist in context:
1. Log warning with the path attempted
2. Set `customer` to `null`
3. Continue execution (allows for conditional flows)

### API Errors (Production)

When calling real SAP APIs:
1. Network errors are caught and logged
2. Invalid credentials return 401
3. Validation errors return 400
4. Node execution fails and stops the flow

---

## Testing SAP Nodes

### 1. Test with Simulation

Use the "Simulate Webhook" button with custom data:

```javascript
// Create a test webhook in frontend/src/app/studio/page.tsx
const testPayload = {
  webhookPayload: {
    data: {
      customerId: "CUST-123",
      customerName: "Test Company Inc",
      email: "test@company.com",
      phone: "+14155551234"
    }
  }
}
```

### 2. Test Field Mappings

1. Add SAP Create Lead node
2. Configure field mappings
3. Click "Simulate Webhook"
4. Check execution logs to see mapped values

### 3. Test Customer Lookup

1. Add SAP Get Customer node
2. Set search value to `webhookPayload.data.customerId`
3. Use simulation with customer ID
4. Verify customer data in execution logs

### 4. Test Full Flow

```
[Webhook] → [Get Customer] → [Condition] → [Create Lead] → [Speak Response]
```

---

## Production Configuration

### Required Environment Variables

```env
# SAP Credentials
SAP_API_URL=https://your-sap-instance.com
SAP_CLIENT_ID=your_client_id
SAP_CLIENT_SECRET=your_client_secret
SAP_USERNAME=your_username
SAP_PASSWORD=your_password

# Optional
SAP_TIMEOUT=30000  # API timeout in ms
SAP_RETRY_ATTEMPTS=3
```

### Credentials Reference

The `credentialsRef` field links to stored credentials. This will be used to look up credentials from a secure store.

**Example:**
```
credentialsRef: "sap_production_creds"
```

---

## Future Enhancements

- [ ] Expression support in field mappings (e.g., `firstName + " " + lastName`)
- [ ] Custom field validation rules
- [ ] Batch operations (create multiple leads)
- [ ] Update/delete operations
- [ ] Real-time field preview
- [ ] SAP field schema validation
- [ ] Credential manager UI
- [ ] Error retry configuration

---

## Troubleshooting

### Field Mapping Not Working

1. **Check context path** - Use execution logs to see available context
2. **Verify syntax** - Use dot notation, wrap strings in quotes
3. **Check data type** - Some fields expect specific types

### Customer Not Found

1. **Verify search value** - Check execution logs for resolved value
2. **Check search field** - Ensure it matches SAP field name
3. **Test with mock data** - Use "Acme", "Globex", etc.

### Lead Creation Fails

1. **Check required fields** - `companyName` is required
2. **Verify field mappings** - Ensure all paths resolve
3. **Check credentials** - In production, verify SAP credentials

---

## API Reference

### Field Mapping Helper Functions

```typescript
// Resolve a context path to a value
resolveContextPath(context: any, path: string): any

// Apply all field mappings
applyFieldMappings(context: any, mappings: FieldMapping): Record<string, any>
```

### Usage Example

```typescript
const context = {
  callerId: "+14155551234",
  webhookPayload: { data: { email: "test@example.com" } }
}

const mappings = {
  phone: "callerId",
  email: "webhookPayload.data.email",
  source: "\"webhook\""
}

const result = applyFieldMappings(context, mappings)
// → { phone: "+14155551234", email: "test@example.com", source: "webhook" }
```
