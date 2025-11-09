/**
 * Flow Templates
 *
 * Pre-built workflow templates that can be loaded into the studio
 */

import { Node, Edge } from 'reactflow'
import { NodeData } from './nodeTypes'

export interface FlowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: Node<NodeData>[]
  edges: Edge[]
}

/**
 * SAP Sales Qualifier Template
 *
 * Flow: Inbound Call → Speak Text (Greeting) → Listen & Understand →
 *       SAP Get Customer → Condition (High Value?) →
 *       TRUE: Speak Text (VIP) → End
 *       FALSE: Speak Text (Standard) → SAP Create Lead → End
 */
export const sapSalesQualifierTemplate: FlowTemplate = {
  id: 'sap-sales-qualifier',
  name: 'SAP Sales Qualifier',
  description:
    'Automates initial qualification of sales leads with SAP integration. Identifies high-value customers and routes accordingly.',
  category: 'Sales',
  nodes: [
    // 1. Inbound Call Trigger
    {
      id: 'node-1',
      type: 'custom',
      position: { x: 50, y: 100 },
      data: {
        label: 'Inbound Call',
        nodeType: 'inbound-call',
        config: {
          label: 'Inbound Call',
          description: 'Receive incoming sales inquiry',
          phoneNumber: '+1-555-SALES-01',
        },
      },
    },

    // 2. Speak Text - Greeting
    {
      id: 'node-2',
      type: 'custom',
      position: { x: 50, y: 220 },
      data: {
        label: 'Greeting',
        nodeType: 'speak-text',
        config: {
          label: 'Greeting',
          description: 'Welcome message to caller',
          text: 'Hello! Thank you for calling Acme Sales. My name is Sarah, your AI sales assistant. May I have your company name please?',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.5,
          similarityBoost: 0.75,
        },
      },
    },

    // 3. Listen & Understand - Capture Company Name
    {
      id: 'node-3',
      type: 'custom',
      position: { x: 50, y: 360 },
      data: {
        label: 'Capture Company Name',
        nodeType: 'listen-understand',
        config: {
          label: 'Capture Company Name',
          description: 'Extract company name from caller response',
          inputMode: 'voice',
          language: 'en-US',
          maxDuration: 30,
          promptTemplate:
            'Extract the company name from the following speech. Return JSON with { "companyName": "..." }',
        },
      },
    },

    // 4. SAP Get Customer
    {
      id: 'node-4',
      type: 'custom',
      position: { x: 50, y: 500 },
      data: {
        label: 'Check SAP Customer',
        nodeType: 'sap-get-customer',
        config: {
          label: 'Check SAP Customer',
          description: 'Look up customer in SAP by company name',
          endpoint: '/api/sap/customers',
          searchField: 'companyName',
          searchValue: 'extractedEntities.companyName',
        },
      },
    },

    // 5. Condition - High Value Customer?
    {
      id: 'node-5',
      type: 'custom',
      position: { x: 50, y: 640 },
      data: {
        label: 'High Value Customer?',
        nodeType: 'condition',
        config: {
          label: 'High Value Customer?',
          description: 'Check if customer revenue > $500k',
          expression: 'sapCustomer && sapCustomer.annualRevenue > 500000',
        },
      },
    },

    // 6. Speak Text - VIP Path (TRUE)
    {
      id: 'node-6',
      type: 'custom',
      position: { x: 350, y: 760 },
      data: {
        label: 'VIP Response',
        nodeType: 'speak-text',
        config: {
          label: 'VIP Response',
          description: 'Premium service message for high-value customers',
          text: 'Thank you! I see you are one of our valued enterprise clients. Let me connect you directly with your dedicated account manager. Please hold.',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.6,
          similarityBoost: 0.8,
        },
      },
    },

    // 7. Speak Text - Standard Path (FALSE)
    {
      id: 'node-7',
      type: 'custom',
      position: { x: -250, y: 760 },
      data: {
        label: 'Standard Response',
        nodeType: 'speak-text',
        config: {
          label: 'Standard Response',
          description: 'Standard service message for new/standard customers',
          text: 'Thank you for your interest! I will create a lead for our sales team to follow up with you within 24 hours. May I confirm your contact information?',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.5,
          similarityBoost: 0.75,
        },
      },
    },

    // 8. SAP Create Lead - Standard Path
    {
      id: 'node-8',
      type: 'custom',
      position: { x: -250, y: 900 },
      data: {
        label: 'Create SAP Lead',
        nodeType: 'sap-create-lead',
        config: {
          label: 'Create SAP Lead',
          description: 'Create new lead in SAP for follow-up',
          endpoint: '/api/sap/leads',
          fieldMappings: {
            companyName: 'extractedEntities.companyName',
            contactName: 'callerName',
            email: 'callData.from',
            phone: 'callerId',
            source: '"inbound_call"',
            status: '"new"',
            priority: '"medium"',
          },
        },
      },
    },
  ],

  edges: [
    // Inbound Call → Greeting
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'callerId',
      targetHandle: null,
    },
    // Greeting → Capture Company Name
    {
      id: 'edge-2',
      source: 'node-2',
      target: 'node-3',
      sourceHandle: 'audio',
      targetHandle: null,
    },
    // Capture Company Name → Check SAP Customer
    {
      id: 'edge-3',
      source: 'node-3',
      target: 'node-4',
      sourceHandle: 'entities',
      targetHandle: null,
    },
    // Check SAP Customer → Condition
    {
      id: 'edge-4',
      source: 'node-4',
      target: 'node-5',
      sourceHandle: 'customer',
      targetHandle: null,
    },
    // Condition TRUE → VIP Response
    {
      id: 'edge-5',
      source: 'node-5',
      target: 'node-6',
      sourceHandle: 'true',
      targetHandle: null,
    },
    // Condition FALSE → Standard Response
    {
      id: 'edge-6',
      source: 'node-5',
      target: 'node-7',
      sourceHandle: 'false',
      targetHandle: null,
    },
    // Standard Response → Create SAP Lead
    {
      id: 'edge-7',
      source: 'node-7',
      target: 'node-8',
      sourceHandle: 'audio',
      targetHandle: null,
    },
  ],
}

/**
 * Qlay Candidate Screener Template
 *
 * Flow: Webhook → Speak Text (Intro) → Google Read Sheet (Questions) →
 *       [Question Loop: Speak Text → Listen & Understand] x3 →
 *       Qlay Screen Candidate → End
 */
export const qlayCandidateScreenerTemplate: FlowTemplate = {
  id: 'qlay-candidate-screener',
  name: 'Qlay Candidate Screener',
  description:
    'Automated candidate screening with AI-powered interview questions and analysis. Loads questions from Google Sheets and submits transcript to Qlay.',
  category: 'Recruitment',
  nodes: [
    // 1. Webhook Trigger - Candidate Application
    {
      id: 'node-1',
      type: 'custom',
      position: { x: 50, y: 50 },
      data: {
        label: 'Candidate Application',
        nodeType: 'webhook',
        config: {
          label: 'Candidate Application',
          description: 'Triggered when candidate submits application (Note: In production, this would initiate an outbound call via Twilio)',
          webhookId: 'candidate-application',
          method: 'POST',
        },
      },
    },

    // 2. Speak Text - Introduction
    {
      id: 'node-2',
      type: 'custom',
      position: { x: 50, y: 170 },
      data: {
        label: 'Screening Introduction',
        nodeType: 'speak-text',
        config: {
          label: 'Screening Introduction',
          description: 'Introduce the screening process',
          text: 'Hello! Thank you for applying to our Software Engineer position. I\'m Alex, an AI screening assistant. I\'d like to ask you a few quick questions about your background and experience. This should take about 5 minutes. Are you ready to begin?',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.6,
          similarityBoost: 0.75,
        },
      },
    },

    // 3. Google Read Sheet - Load Questions
    {
      id: 'node-3',
      type: 'custom',
      position: { x: 50, y: 310 },
      data: {
        label: 'Load Interview Questions',
        nodeType: 'google-read-sheet',
        config: {
          label: 'Load Interview Questions',
          description: 'Fetch screening questions from Google Sheets',
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          sheetName: 'Screening Questions',
          range: 'A2:B10',
          includeHeaders: true,
        },
      },
    },

    // 4. Speak Text - Question 1
    {
      id: 'node-4',
      type: 'custom',
      position: { x: 50, y: 450 },
      data: {
        label: 'Question 1',
        nodeType: 'speak-text',
        config: {
          label: 'Question 1',
          description: 'Ask about technical experience',
          text: 'Great! Let\'s start with your technical background. Can you tell me about your experience with modern web development frameworks like React, Vue, or Angular? What projects have you worked on?',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.5,
          similarityBoost: 0.75,
        },
      },
    },

    // 5. Listen & Understand - Answer 1
    {
      id: 'node-5',
      type: 'custom',
      position: { x: 50, y: 590 },
      data: {
        label: 'Capture Answer 1',
        nodeType: 'listen-understand',
        config: {
          label: 'Capture Answer 1',
          description: 'Capture response about technical experience',
          inputMode: 'voice',
          language: 'en-US',
          maxDuration: 90,
          promptTemplate: 'Extract key points about technical experience, frameworks mentioned, and project details.',
        },
      },
    },

    // 6. Speak Text - Question 2
    {
      id: 'node-6',
      type: 'custom',
      position: { x: 50, y: 730 },
      data: {
        label: 'Question 2',
        nodeType: 'speak-text',
        config: {
          label: 'Question 2',
          description: 'Ask about problem-solving',
          text: 'Excellent. Now, can you describe a challenging technical problem you\'ve solved recently? What was the problem, and how did you approach finding a solution?',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.5,
          similarityBoost: 0.75,
        },
      },
    },

    // 7. Listen & Understand - Answer 2
    {
      id: 'node-7',
      type: 'custom',
      position: { x: 50, y: 870 },
      data: {
        label: 'Capture Answer 2',
        nodeType: 'listen-understand',
        config: {
          label: 'Capture Answer 2',
          description: 'Capture response about problem-solving',
          inputMode: 'voice',
          language: 'en-US',
          maxDuration: 90,
          promptTemplate: 'Extract the problem description, approach taken, and outcome.',
        },
      },
    },

    // 8. Speak Text - Question 3
    {
      id: 'node-8',
      type: 'custom',
      position: { x: 50, y: 1010 },
      data: {
        label: 'Question 3',
        nodeType: 'speak-text',
        config: {
          label: 'Question 3',
          description: 'Ask about team collaboration',
          text: 'Perfect. One last question: Tell me about your experience working in a team. How do you handle code reviews and collaborate with other developers?',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.5,
          similarityBoost: 0.75,
        },
      },
    },

    // 9. Listen & Understand - Answer 3
    {
      id: 'node-9',
      type: 'custom',
      position: { x: 50, y: 1150 },
      data: {
        label: 'Capture Answer 3',
        nodeType: 'listen-understand',
        config: {
          label: 'Capture Answer 3',
          description: 'Capture response about teamwork',
          inputMode: 'voice',
          language: 'en-US',
          maxDuration: 90,
          promptTemplate: 'Extract collaboration style, code review practices, and team communication.',
        },
      },
    },

    // 10. Speak Text - Closing
    {
      id: 'node-10',
      type: 'custom',
      position: { x: 50, y: 1290 },
      data: {
        label: 'Closing Statement',
        nodeType: 'speak-text',
        config: {
          label: 'Closing Statement',
          description: 'Thank candidate and set expectations',
          text: 'Thank you so much for your time today! Those were great answers. Our team will review your responses and get back to you within 2 business days. Have a wonderful day!',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          stability: 0.6,
          similarityBoost: 0.8,
        },
      },
    },

    // 11. Qlay Screen Candidate - Analysis
    {
      id: 'node-11',
      type: 'custom',
      position: { x: 50, y: 1430 },
      data: {
        label: 'Qlay Screening Analysis',
        nodeType: 'qlay-screen-candidate',
        config: {
          label: 'Qlay Screening Analysis',
          description: 'Send interview transcript to Qlay for AI-powered analysis',
          jobId: 'JOB-SE-2024-001',
          position: 'Software Engineer',
          fieldMappings: {
            name: 'webhookPayload.data.candidateName',
            email: 'webhookPayload.data.email',
            phone: 'webhookPayload.data.phone',
            resume: 'webhookPayload.data.resumeUrl',
            transcript: 'transcribedText',
            experience: 'webhookPayload.data.yearsExperience',
            education: 'webhookPayload.data.education',
            skills: 'webhookPayload.data.skills',
          },
        },
      },
    },
  ],

  edges: [
    // Webhook → Introduction
    { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'payload', targetHandle: null },
    // Introduction → Load Questions
    { id: 'edge-2', source: 'node-2', target: 'node-3', sourceHandle: 'audio', targetHandle: null },
    // Load Questions → Question 1
    { id: 'edge-3', source: 'node-3', target: 'node-4', sourceHandle: 'data', targetHandle: null },
    // Question 1 → Answer 1
    { id: 'edge-4', source: 'node-4', target: 'node-5', sourceHandle: 'audio', targetHandle: null },
    // Answer 1 → Question 2
    { id: 'edge-5', source: 'node-5', target: 'node-6', sourceHandle: 'text', targetHandle: null },
    // Question 2 → Answer 2
    { id: 'edge-6', source: 'node-6', target: 'node-7', sourceHandle: 'audio', targetHandle: null },
    // Answer 2 → Question 3
    { id: 'edge-7', source: 'node-7', target: 'node-8', sourceHandle: 'text', targetHandle: null },
    // Question 3 → Answer 3
    { id: 'edge-8', source: 'node-8', target: 'node-9', sourceHandle: 'audio', targetHandle: null },
    // Answer 3 → Closing
    { id: 'edge-9', source: 'node-9', target: 'node-10', sourceHandle: 'text', targetHandle: null },
    // Closing → Qlay Analysis
    { id: 'edge-10', source: 'node-10', target: 'node-11', sourceHandle: 'audio', targetHandle: null },
  ],
}

/**
 * All available templates
 */
export const flowTemplates: FlowTemplate[] = [
  sapSalesQualifierTemplate,
  qlayCandidateScreenerTemplate,
]

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): FlowTemplate | undefined {
  return flowTemplates.find((t) => t.id === templateId)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): FlowTemplate[] {
  return flowTemplates.filter((t) => t.category === category)
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  return Array.from(new Set(flowTemplates.map((t) => t.category)))
}
