/**
 * Google Gemini Mock Service
 *
 * Simulates Google Gemini AI services for development and testing
 */

export interface GeminiListenSimResult {
  transcript: string
  intent: string
  entities: Record<string, any>
  confidence: number
  timestamp: Date
}

export interface GeminiSentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  magnitude: number
  analysis: string
}

/**
 * Simulates speech-to-text and intent recognition via Gemini
 * Returns deterministic sample data based on context
 */
export function geminiListenSim(audioInput?: string, context?: any): GeminiListenSimResult {
  // Check if this is a candidate screening interview
  const isCandidateScreening = context?.webhookPayload?.event === 'candidate.application'

  if (isCandidateScreening) {
    // Candidate interview responses
    const candidateResponses = [
      {
        transcript: "Yes, I'm ready to begin! Thanks for the opportunity.",
        intent: 'acknowledgment',
        entities: { ready: true, sentiment: 'positive' },
        confidence: 0.95,
      },
      {
        transcript: "I have about 5 years of experience with React and TypeScript. I've built several production applications including an e-commerce platform and a real-time collaboration tool. I'm very comfortable with modern React patterns like hooks and context API.",
        intent: 'technical_response',
        entities: {
          frameworks: ['React', 'TypeScript'],
          experience_years: 5,
          projects: ['e-commerce', 'collaboration tool'],
          key_skills: ['hooks', 'context API']
        },
        confidence: 0.92,
      },
      {
        transcript: "The most challenging problem I solved recently was optimizing a slow data visualization dashboard. The issue was that we were re-rendering the entire chart on every data update. I implemented React.memo and useMemo to prevent unnecessary re-renders, and used a virtualization library for large datasets. This reduced render time by 80%.",
        intent: 'problem_solving',
        entities: {
          problem: 'performance optimization',
          solution: ['memoization', 'virtualization'],
          outcome: '80% improvement',
          technical_depth: 'high'
        },
        confidence: 0.90,
      },
      {
        transcript: "I really enjoy collaborative development. I actively participate in code reviews, both giving and receiving feedback constructively. I believe in clear communication and documentation. I use pull request descriptions to explain my changes, and I'm always happy to pair program when tackling complex problems.",
        intent: 'teamwork_response',
        entities: {
          collaboration_style: 'active',
          code_review: 'participates',
          communication: 'clear',
          pair_programming: 'positive'
        },
        confidence: 0.88,
      },
    ]

    const index = context?.conversationTurn ? context.conversationTurn % candidateResponses.length : 0
    return {
      ...candidateResponses[index],
      timestamp: new Date(),
    }
  }

  // Sales call responses (existing functionality)
  const sampleResponses = [
    {
      transcript: "Hi, I'm calling from Acme Corporation",
      intent: 'company_introduction',
      entities: { companyName: 'Acme Corporation', role: 'representative' },
      confidence: 0.92,
    },
    {
      transcript: "This is TechStart Inc, we'd like to discuss your services",
      intent: 'service_inquiry',
      entities: { companyName: 'TechStart Inc', interest_level: 'high' },
      confidence: 0.88,
    },
    {
      transcript: "I'm with Global Logistics Ltd",
      intent: 'company_introduction',
      entities: { companyName: 'Global Logistics Ltd', topic: 'introduction' },
      confidence: 0.95,
    },
    {
      transcript: "I represent SmallBiz Solutions",
      intent: 'company_introduction',
      entities: { companyName: 'SmallBiz Solutions', role: 'representative' },
      confidence: 0.90,
    },
    {
      transcript: "This is NewCompany Inc, we're interested in your product",
      intent: 'product_inquiry',
      entities: { companyName: 'NewCompany Inc', interest_level: 'high' },
      confidence: 0.87,
    },
  ]

  // Return a deterministic response based on context or random
  const index = context?.conversationTurn ? context.conversationTurn % sampleResponses.length : 0
  const response = sampleResponses[index]

  return {
    ...response,
    timestamp: new Date(),
  }
}

/**
 * Simulates sentiment analysis via Gemini
 */
export function geminiSentimentSim(text: string): GeminiSentimentResult {
  // Simple keyword-based sentiment detection for deterministic results
  const positiveWords = ['great', 'excellent', 'love', 'happy', 'wonderful', 'amazing', 'perfect']
  const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'horrible', 'awful', 'worst']

  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  let score = 0
  let magnitude = 0.5

  if (positiveCount > negativeCount) {
    sentiment = 'positive'
    score = Math.min(0.5 + positiveCount * 0.2, 1.0)
    magnitude = positiveCount * 0.3
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative'
    score = Math.max(-0.5 - negativeCount * 0.2, -1.0)
    magnitude = negativeCount * 0.3
  } else {
    score = 0
    magnitude = 0.3
  }

  return {
    sentiment,
    score,
    magnitude,
    analysis: `Text shows ${sentiment} sentiment with ${Math.abs(score).toFixed(2)} confidence`,
  }
}

/**
 * Simulates general text generation via Gemini
 */
export function geminiGenerateSim(prompt: string, context?: any) {
  const responses = {
    greeting: "Hello! I'm here to help. How can I assist you today?",
    qualification:
      "Based on your requirements, I'd be happy to discuss how our solution can help your organization.",
    followup: "Thank you for that information. Let me ask a few more questions to better understand your needs.",
    closing: "Thank you for your time today. I'll send you a summary of our conversation shortly.",
  }

  // Determine response type based on prompt keywords
  let responseText = responses.followup
  if (prompt.toLowerCase().includes('greet') || prompt.toLowerCase().includes('hello')) {
    responseText = responses.greeting
  } else if (prompt.toLowerCase().includes('qualif') || prompt.toLowerCase().includes('assess')) {
    responseText = responses.qualification
  } else if (prompt.toLowerCase().includes('close') || prompt.toLowerCase().includes('end')) {
    responseText = responses.closing
  }

  return {
    text: responseText,
    model: 'gemini-pro',
    tokens: responseText.split(' ').length,
    timestamp: new Date(),
  }
}

/**
 * Simulates entity extraction via Gemini
 */
export function geminiExtractEntitiesSim(text: string) {
  // Simple regex-based entity extraction for deterministic results
  const entities: Record<string, any> = {}

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  if (emailMatch) entities.email = emailMatch[0]

  // Extract phone
  const phoneMatch = text.match(/\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/)
  if (phoneMatch) entities.phone = phoneMatch[0]

  // Extract company names (simple detection)
  const companyMatch = text.match(/\b([A-Z][a-z]+ (?:Corporation|Corp|Inc|LLC|Ltd))\b/)
  if (companyMatch) entities.company = companyMatch[1]

  // Extract names (simple detection of capitalized words)
  const nameMatch = text.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/)
  if (nameMatch) entities.name = nameMatch[1]

  return {
    entities,
    count: Object.keys(entities).length,
    timestamp: new Date(),
  }
}
