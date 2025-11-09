import { z } from 'zod'

// Common schemas
export const contextSchema = z.record(z.any())

// Gemini API schemas
export const geminiGenerateSchema = z.object({
  prompt: z.string().min(1),
  context: contextSchema.optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export const geminiStreamSchema = z.object({
  prompt: z.string().min(1),
  context: contextSchema.optional(),
})

// ElevenLabs API schemas
export const elevenlabsTtsSchema = z.object({
  text: z.string().min(1),
  voiceId: z.string().optional(),
  modelId: z.string().optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
})

export const elevenlabsVoicesSchema = z.object({})

// Twilio API schemas
export const twilioCallSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/),
  from: z.string().regex(/^\+[1-9]\d{1,14}$/),
  twiml: z.string().optional(),
  url: z.string().url().optional(),
})

export const twilioSmsSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/),
  from: z.string().regex(/^\+[1-9]\d{1,14}$/),
  body: z.string().min(1),
})

export const twilioWhatsappSchema = z.object({
  to: z.string().regex(/^whatsapp:\+[1-9]\d{1,14}$/),
  from: z.string().regex(/^whatsapp:\+[1-9]\d{1,14}$/),
  body: z.string().min(1),
})

// SAP API schemas
export const sapGetCustomerSchema = z.object({
  customerId: z.string().optional(),
  companyName: z.string().optional(),
})

export const sapCreateOrderSchema = z.object({
  customerId: z.string(),
  items: z.array(
    z.object({
      itemCode: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  deliveryDate: z.string().optional(),
})

export const sapGetInventorySchema = z.object({
  itemCode: z.string().optional(),
  warehouseCode: z.string().optional(),
})

// Google API schemas
export const googleCalendarEventSchema = z.object({
  summary: z.string().min(1),
  description: z.string().optional(),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  attendees: z.array(z.string().email()).optional(),
  timeZone: z.string().optional(),
})

export const googleSheetsReadSchema = z.object({
  spreadsheetId: z.string().min(1),
  range: z.string().min(1),
})

export const googleSheetsWriteSchema = z.object({
  spreadsheetId: z.string().min(1),
  range: z.string().min(1),
  values: z.array(z.array(z.any())),
})

// Qlay API schemas
export const qlayExecuteSchema = z.object({
  workflowId: z.string().min(1),
  input: contextSchema,
})

// WebRTC/WebSocket schemas
export const audioStreamSchema = z.object({
  sessionId: z.string().min(1),
  audioData: z.string().optional(), // base64 encoded
  format: z.enum(['pcm', 'wav', 'webm']).optional(),
  sampleRate: z.number().optional(),
})

export const transcriptStreamSchema = z.object({
  sessionId: z.string().min(1),
  interim: z.boolean().optional(),
})
