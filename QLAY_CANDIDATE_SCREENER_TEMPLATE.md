# Qlay Candidate Screener Template

## Overview

The **Qlay Candidate Screener** template is a pre-built, production-ready workflow that automates candidate screening interviews using AI-powered voice interaction and Qlay's intelligent candidate analysis platform.

## What It Does

This template creates a complete end-to-end automated recruitment screening flow that:

1. **Receives candidate application** via webhook when a candidate applies
2. **Initiates screening call** (in production, triggers outbound call via Twilio)
3. **Introduces the screening process** with a friendly AI voice
4. **Loads interview questions** from a Google Sheet for flexibility
5. **Conducts structured interview** with 3 screening questions
6. **Captures and transcribes** all candidate responses
7. **Analyzes interview performance** using Qlay's AI screening platform
8. **Returns comprehensive evaluation** with scores and recommendations

## Template Flow

```
┌─────────────────────┐
│  Webhook Trigger    │ Candidate application received
│ (candidate.apply)   │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Speak Text         │ "Hello! Thank you for applying..."
│  (Introduction)     │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Google Read Sheet  │ Load interview questions
│  (Questions)        │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Speak Text         │ Question 1: Technical experience
│  (Question 1)       │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Listen &           │ Capture Answer 1
│  Understand         │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Speak Text         │ Question 2: Problem solving
│  (Question 2)       │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Listen &           │ Capture Answer 2
│  Understand         │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Speak Text         │ Question 3: Teamwork
│  (Question 3)       │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Listen &           │ Capture Answer 3
│  Understand         │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Speak Text         │ "Thank you! We'll be in touch..."
│  (Closing)          │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Qlay Screen        │ AI-powered analysis
│  Candidate          │ • Overall score
│                     │ • Competency breakdown
│                     │ • Recommendation
└─────────────────────┘
```

## Node Configuration Details

### 1. Candidate Application (Webhook Trigger)
- **Type**: `webhook`
- **Config**:
  - Webhook ID: `candidate-application`
  - Method: `POST`
  - Note: In production, this would initiate an outbound call via Twilio

### 2. Screening Introduction (Speak Text)
- **Type**: `speak-text`
- **Config**:
  - Text: "Hello! Thank you for applying to our Software Engineer position. I'm Alex, an AI screening assistant. I'd like to ask you a few quick questions about your background and experience. This should take about 5 minutes. Are you ready to begin?"
  - Voice ID: `21m00Tcm4TlvDq8ikWAM`
  - Stability: 0.6
  - Similarity Boost: 0.75

### 3. Load Interview Questions (Google Read Sheet)
- **Type**: `google-read-sheet`
- **Config**:
  - Spreadsheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
  - Sheet Name: `Screening Questions`
  - Range: `A2:B10`
  - Include Headers: `true`

**Mock Questions Loaded:**
| Question | Category | Weight |
|----------|----------|--------|
| Can you tell me about your experience with modern web development frameworks? | Technical | 3 |
| Describe a challenging technical problem you've solved recently. | Problem Solving | 4 |
| Tell me about your experience working in a team. | Teamwork | 3 |
| What interests you most about this position? | Culture Fit | 2 |
| How do you stay current with new technologies? | Learning | 2 |

### 4-9. Interview Question Loop
Each question follows the pattern:
- **Speak Text** → Ask the question
- **Listen & Understand** → Capture and transcribe the answer (90 seconds max)

**Question 1: Technical Experience**
- "Can you tell me about your experience with modern web development frameworks like React, Vue, or Angular? What projects have you worked on?"

**Question 2: Problem Solving**
- "Excellent. Now, can you describe a challenging technical problem you've solved recently? What was the problem, and how did you approach finding a solution?"

**Question 3: Team Collaboration**
- "Perfect. One last question: Tell me about your experience working in a team. How do you handle code reviews and collaborate with other developers?"

### 10. Closing Statement (Speak Text)
- **Type**: `speak-text`
- **Config**:
  - Text: "Thank you so much for your time today! Those were great answers. Our team will review your responses and get back to you within 2 business days. Have a wonderful day!"
  - Stability: 0.6
  - Similarity Boost: 0.8

### 11. Qlay Screening Analysis
- **Type**: `qlay-screen-candidate`
- **Config**:
  - Job ID: `JOB-SE-2024-001`
  - Position: `Software Engineer`
  - Field Mappings:
    - `name`: `webhookPayload.data.candidateName`
    - `email`: `webhookPayload.data.email`
    - `phone`: `webhookPayload.data.phone`
    - `resume`: `webhookPayload.data.resumeUrl`
    - `transcript`: `transcribedText` (accumulated from all Listen & Understand nodes)
    - `experience`: `webhookPayload.data.yearsExperience`
    - `education`: `webhookPayload.data.education`
    - `skills`: `webhookPayload.data.skills`

## Testing the Template

### Method 1: Load Template
1. Go to **Studio** (http://localhost:3003/studio)
2. Click **Templates** button in toolbar
3. Select **Qlay Candidate Screener** (under Recruitment Templates)
4. Confirm to load the template

### Method 2: Simulate Candidate Application

Click **Simulate Webhook** to trigger the flow with this payload:

```json
{
  "event": "candidate.application",
  "data": {
    "candidateName": "Alex Johnson",
    "email": "alex.johnson@email.com",
    "phone": "+14155558888",
    "position": "Software Engineer",
    "resumeUrl": "https://example.com/resumes/alex-johnson.pdf",
    "yearsExperience": 5,
    "education": "BS Computer Science, MIT",
    "skills": "React, TypeScript, Node.js, Python, AWS",
    "source": "linkedin"
  }
}
```

### Expected Execution Logs

```
[INFO] Webhook: Received candidate.application event
[SUCCESS] Webhook: Candidate Alex Johnson applied for Software Engineer

[INFO] Screening Introduction: Speaking text...
[SUCCESS] Screening Introduction: Audio generated successfully

[INFO] Load Interview Questions: Reading Google Sheet
[SUCCESS] Load Interview Questions: Read 5 rows from Google Sheet

[INFO] Question 1: Speaking text...
[SUCCESS] Question 1: Audio generated successfully

[INFO] Capture Answer 1: Listening to candidate...
[SUCCESS] Capture Answer 1: Transcript: "I have about 5 years of experience with React and TypeScript..."

[INFO] Question 2: Speaking text...
[SUCCESS] Question 2: Audio generated successfully

[INFO] Capture Answer 2: Listening to candidate...
[SUCCESS] Capture Answer 2: Transcript: "The most challenging problem I solved recently..."

[INFO] Question 3: Speaking text...
[SUCCESS] Question 3: Audio generated successfully

[INFO] Capture Answer 3: Listening to candidate...
[SUCCESS] Capture Answer 3: Transcript: "I really enjoy collaborative development..."

[INFO] Closing Statement: Speaking text...
[SUCCESS] Closing Statement: Audio generated successfully

[INFO] Qlay Screening Analysis: Screening candidate for Software Engineer
[SUCCESS] Qlay Screening Analysis: Screening complete: YES (score: 78)
  - Technical: 82
  - Communication: 78
  - Problem Solving: 80
  - Culture Fit: 75
  - Recommendation: YES
```

## Mock Data & Responses

### Mock Candidate Responses

**Answer 1 (Technical):**
> "I have about 5 years of experience with React and TypeScript. I've built several production applications including an e-commerce platform and a real-time collaboration tool. I'm very comfortable with modern React patterns like hooks and context API."

**Answer 2 (Problem Solving):**
> "The most challenging problem I solved recently was optimizing a slow data visualization dashboard. The issue was that we were re-rendering the entire chart on every data update. I implemented React.memo and useMemo to prevent unnecessary re-renders, and used a virtualization library for large datasets. This reduced render time by 80%."

**Answer 3 (Teamwork):**
> "I really enjoy collaborative development. I actively participate in code reviews, both giving and receiving feedback constructively. I believe in clear communication and documentation. I use pull request descriptions to explain my changes, and I'm always happy to pair program when tackling complex problems."

### Qlay Screening Output

The mock Qlay service will return:

```json
{
  "screeningId": "SCR_1699472384_8k3j2m9",
  "candidateName": "Alex Johnson",
  "position": "Software Engineer",
  "overallScore": 78,
  "recommendation": "yes",
  "competencies": {
    "technical": 82,
    "communication": 78,
    "problemSolving": 80,
    "cultureFit": 75
  },
  "analysis": {
    "strengths": [
      "Strong technical foundation and problem-solving abilities",
      "Excellent communication skills during interview",
      "Good cultural fit with team values"
    ],
    "concerns": [],
    "summary": "Alex Johnson is a qualified candidate for Software Engineer. Good technical foundation and team fit. Recommended to proceed to next interview round."
  },
  "metadata": {
    "screenedAt": "2024-11-09T01:00:00.000Z",
    "jobId": "JOB-SE-2024-001",
    "transcriptLength": 542
  }
}
```

## Customization Guide

### Adding More Questions

To add more interview questions:

1. **Edit the Google Sheet** (or update mock data in `googleMock.ts`):
   ```typescript
   {
     Question: 'Your new question here',
     Category: 'Technical',
     Weight: 3,
   }
   ```

2. **Add Speak Text + Listen & Understand nodes** to the flow:
   - Copy an existing question pair (nodes 4-5, 6-7, or 8-9)
   - Update the question text
   - Connect to the flow sequence

3. **Update edges** to link the new nodes in sequence

### Changing Question Categories

Modify the questions in your Google Sheet or in `googleMock.ts`:

**Current Categories:**
- Technical
- Problem Solving
- Teamwork
- Culture Fit
- Learning

**Example New Categories:**
- Leadership
- Communication
- Time Management
- Conflict Resolution
- Innovation

### Customizing Voice & Tone

Edit any Speak Text node:
- **Voice ID**: Change to different ElevenLabs voice
- **Stability**: Higher = more consistent, Lower = more varied
- **Similarity Boost**: Higher = closer to original voice
- **Text**: Modify the script for different tone/style

### Adjusting Screening Criteria

Edit the Qlay node's Job ID and Position to match your roles:
```javascript
jobId: 'JOB-PM-2024-001',  // Product Manager role
position: 'Product Manager',
```

The mock service will adjust scoring based on the position.

### Integrating with Your ATS

The webhook trigger can integrate with:
- **Greenhouse**: Use webhook automation
- **Lever**: Configure outbound webhooks
- **Workday**: Set up integration events
- **Custom ATS**: POST to `/api/hooks/candidate-application`

Example webhook payload:
```json
{
  "event": "candidate.application",
  "timestamp": "2024-11-09T01:00:00Z",
  "data": {
    "candidateName": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "position": "Software Engineer",
    "resumeUrl": "https://example.com/resume.pdf",
    "yearsExperience": 5,
    "education": "BS Computer Science",
    "skills": "React, Node.js, Python"
  }
}
```

## Production Deployment

### Before Going Live:

1. **Configure Real APIs**:
   ```bash
   # .env.local
   USE_MOCK=0

   # Voice & AI
   ELEVENLABS_API_KEY=your_elevenlabs_key
   GOOGLE_GEMINI_API_KEY=your_gemini_key

   # Telephony (for outbound calls)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=+1234567890

   # Google Sheets
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

   # Qlay Screening
   QLAY_API_KEY=your_qlay_key
   QLAY_API_URL=https://api.qlay.ai/v1
   ```

2. **Set Up Google Sheet**:
   - Create a Google Sheet with interview questions
   - Format: Column A = Question, Column B = Category, Column C = Weight
   - Share with service account email
   - Copy the spreadsheet ID from the URL

3. **Configure Twilio Outbound Calls**:
   - Set up TwiML app for voice
   - Configure webhook for call status callbacks
   - Implement outbound call initiation on webhook trigger

4. **Test the Complete Flow**:
   - Trigger webhook from your ATS
   - Verify outbound call is placed
   - Confirm questions are asked in sequence
   - Check Qlay receives complete transcript
   - Validate screening results are accurate

5. **Monitor & Optimize**:
   - Track completion rates
   - Analyze average screening scores
   - Refine questions based on interview performance
   - Adjust Qlay scoring thresholds

## Business Value

### Time Savings
- **Before**: Manual phone screens (30-45 min per candidate)
- **After**: Automated screening (5-7 min per candidate)
- **ROI**: 85% reduction in screening time

### Candidate Experience
- **Consistent**: Same questions, same quality for every candidate
- **Flexible**: Candidates can complete screening at their convenience
- **Fast**: Immediate feedback and next steps
- **Fair**: AI-powered analysis removes human bias

### Recruiter Benefits
- **Scale**: Screen 10x more candidates in the same time
- **Focus**: Spend time on qualified candidates only
- **Data**: Structured interview data for analytics
- **Quality**: AI-powered insights on soft skills and culture fit

### Cost Efficiency
- **Automation**: Reduce need for initial phone screen coordinators
- **Quality**: Better signal on candidate fit before deep-dive interviews
- **Speed**: Reduce time-to-hire by 40%

## Interview Question Best Practices

### Good Questions (Ask These)
✅ Open-ended: "Tell me about a time when..."
✅ Behavioral: "How do you handle..."
✅ Specific: "Describe your experience with X..."
✅ Relevant: Directly related to job requirements

### Poor Questions (Avoid These)
❌ Yes/No: "Do you have experience with React?"
❌ Leading: "You're good at teamwork, right?"
❌ Overly Technical: "What's the time complexity of quicksort?"
❌ Irrelevant: "What's your favorite color?"

### Sample Question Sets

**For Software Engineers:**
1. Technical depth in specific tech stack
2. Problem-solving approach and debugging
3. Code review and collaboration
4. Learning and staying current
5. Project ownership and delivery

**For Product Managers:**
1. Product vision and strategy
2. Stakeholder management
3. Data-driven decision making
4. User empathy and research
5. Cross-functional leadership

**For Sales Roles:**
1. Closing techniques and negotiation
2. Objection handling
3. Pipeline management
4. Customer relationship building
5. Quota achievement examples

## Support

For questions or customization help:
1. Check the [main README](./README.md)
2. Review [Qlay Node documentation](./README.md#qlay-candidate-screening)
3. Explore [Google Sheets integration](./README.md#google-cloud-sheets-calendar-etc)

## Next Steps

After implementing this template, consider:
1. **Sentiment Analysis**: Add sentiment node after each answer to gauge enthusiasm
2. **Conditional Branching**: Ask different follow-up questions based on initial answers
3. **Multi-language**: Support screening in multiple languages
4. **Video Integration**: Add video recording for visual assessment
5. **Calendar Integration**: Automatically schedule next-round interviews for qualified candidates
