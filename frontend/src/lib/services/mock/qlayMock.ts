/**
 * Qlay Mock Service
 *
 * Simulates Qlay candidate screening API for development and testing
 */

export interface QlayCandidate {
  candidateId: string
  name: string
  email: string
  phone: string
  position: string
  status: 'screening' | 'scheduled' | 'interviewed' | 'passed' | 'rejected'
  score: number
  createdAt: Date
}

export interface QlayScreeningResult {
  screeningId: string
  candidateName: string
  position: string
  overallScore: number
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
  competencies: {
    technical: number
    communication: number
    problemSolving: number
    cultureFit: number
  }
  analysis: {
    strengths: string[]
    concerns: string[]
    summary: string
  }
  metadata: {
    screenedAt: string
    jobId: string
    transcriptLength?: number
    resumeUrl?: string
  }
}

/**
 * Simulates screening a candidate via Qlay
 * Returns deterministic sample data
 */
export function qlayScreenCandidateMock(candidateData: any): QlayScreeningResult {
  const screeningId = 'SCR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

  // Generate scores based on name hash for deterministic results
  const name = candidateData.name || 'Unknown Candidate'
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const baseScore = 50 + (nameHash % 40)

  const technical = Math.min(100, baseScore + (nameHash % 10) - 5)
  const communication = Math.min(100, baseScore + ((nameHash * 2) % 10) - 5)
  const problemSolving = Math.min(100, baseScore + ((nameHash * 3) % 10) - 5)
  const cultureFit = Math.min(100, baseScore + ((nameHash * 5) % 10) - 5)

  const overallScore = Math.round((technical + communication + problemSolving + cultureFit) / 4)

  // Determine recommendation based on score
  let recommendation: QlayScreeningResult['recommendation']
  if (overallScore >= 85) recommendation = 'strong_yes'
  else if (overallScore >= 70) recommendation = 'yes'
  else if (overallScore >= 55) recommendation = 'maybe'
  else if (overallScore >= 40) recommendation = 'no'
  else recommendation = 'strong_no'

  // Generate strengths based on score
  const strengths: string[] = []
  if (overallScore >= 70) {
    strengths.push('Strong technical foundation and problem-solving abilities')
    strengths.push('Excellent communication skills during interview')
  }
  if (candidateData.transcript && candidateData.transcript.length > 500) {
    strengths.push('Articulate and detailed responses to technical questions')
  }
  if (candidateData.experience && Number(candidateData.experience) > 3) {
    strengths.push(`${candidateData.experience}+ years of relevant experience`)
  }
  if (overallScore >= 60) {
    strengths.push('Good cultural fit with team values')
  }
  if (strengths.length === 0) {
    strengths.push('Meets basic requirements for the role')
  }

  // Generate concerns based on score
  const concerns: string[] = []
  if (overallScore < 60) {
    concerns.push('May need additional technical training or mentorship')
  }
  if (overallScore < 50) {
    concerns.push('Communication could be improved for team collaboration')
  }
  if (!candidateData.transcript || candidateData.transcript.length < 200) {
    concerns.push('Limited interview data available for comprehensive assessment')
  }
  if (!candidateData.resume) {
    concerns.push('No resume provided for detailed background verification')
  }

  // Generate summary
  const position = candidateData.position || 'the position'
  let summary: string
  if (recommendation === 'strong_yes') {
    summary = `${name} is an excellent candidate for ${position}. Strong technical skills, great communication, and solid cultural fit. Highly recommended to move forward with offer.`
  } else if (recommendation === 'yes') {
    summary = `${name} is a qualified candidate for ${position}. Good technical foundation and team fit. Recommended to proceed to next interview round.`
  } else if (recommendation === 'maybe') {
    summary = `${name} shows potential for ${position} but has some areas needing development. Consider for junior role or with additional training plan.`
  } else if (recommendation === 'no') {
    summary = `${name} does not currently meet the requirements for ${position}. May be worth revisiting in the future after gaining more experience.`
  } else {
    summary = `${name} is not a suitable fit for ${position} at this time. Recommend exploring other candidates.`
  }

  return {
    screeningId,
    candidateName: name,
    position: candidateData.position || 'Software Engineer',
    overallScore,
    recommendation,
    competencies: {
      technical,
      communication,
      problemSolving,
      cultureFit,
    },
    analysis: {
      strengths,
      concerns,
      summary,
    },
    metadata: {
      screenedAt: new Date().toISOString(),
      jobId: candidateData.jobId || 'UNKNOWN',
      transcriptLength: candidateData.transcript?.length,
      resumeUrl: candidateData.resume,
    },
  }
}

/**
 * Simulates creating a candidate in Qlay
 */
export function qlayCreateCandidateMock(candidateData: {
  name: string
  email: string
  phone?: string
  position: string
  source?: string
}): QlayCandidate {
  const candidateId = 'CND-' + Math.random().toString(36).substring(2, 10).toUpperCase()

  return {
    candidateId,
    name: candidateData.name,
    email: candidateData.email,
    phone: candidateData.phone || '',
    position: candidateData.position,
    status: 'screening',
    score: 0,
    createdAt: new Date(),
  }
}

/**
 * Simulates getting candidate details from Qlay
 */
export function qlayGetCandidateMock(candidateId: string): QlayCandidate | null {
  // Mock database of candidates
  const mockCandidates: QlayCandidate[] = [
    {
      candidateId: 'CND-001',
      name: 'Alice Johnson',
      email: 'alice.j@email.com',
      phone: '+1-555-1001',
      position: 'Software Engineer',
      status: 'passed',
      score: 87,
      createdAt: new Date('2024-10-15'),
    },
    {
      candidateId: 'CND-002',
      name: 'Bob Williams',
      email: 'bob.w@email.com',
      phone: '+1-555-1002',
      position: 'Product Manager',
      status: 'interviewed',
      score: 78,
      createdAt: new Date('2024-10-20'),
    },
    {
      candidateId: 'CND-003',
      name: 'Carol Martinez',
      email: 'carol.m@email.com',
      phone: '+1-555-1003',
      position: 'UX Designer',
      status: 'scheduled',
      score: 0,
      createdAt: new Date('2024-11-01'),
    },
  ]

  return mockCandidates.find((c) => c.candidateId === candidateId) || null
}

/**
 * Simulates getting screening analytics
 */
export function qlayGetAnalyticsMock() {
  return {
    totalScreenings: 124,
    averageScore: 72.5,
    recommendations: {
      strong_yes: 18,
      yes: 35,
      maybe: 42,
      no: 21,
      strong_no: 8,
    },
    topPositions: [
      { position: 'Software Engineer', count: 45 },
      { position: 'Product Manager', count: 28 },
      { position: 'Data Analyst', count: 22 },
      { position: 'UX Designer', count: 19 },
    ],
    passRate: 0.43,
  }
}
