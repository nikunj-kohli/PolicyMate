import dotenv from 'dotenv'
import axios from 'axios'
import { retrievePolicyChunks } from './ragPipeline.js'
import { learningSystem, logFeedback, getLearningStats } from './learningSystem.js'

dotenv.config()

/**
 * Gemini LLM Integration
 * Uses Google Gemini API with fallback to demo mode
 */
class GeminiLLM {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    this.isConfigured = !!this.apiKey
  }

  async call(prompt, options = {}) {
    if (!this.isConfigured) {
      return this.demoResponse(prompt)
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.2,
            maxOutputTokens: options.maxTokens || 1200,
            topP: 0.8,
            topK: 40,
          },
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } catch (error) {
      console.error('Gemini API error:', error.message)
      return this.demoResponse(prompt)
    }
  }

  demoResponse(prompt) {
    if (prompt.includes('recommendation')) {
      return JSON.stringify({
        recommendedPolicyId: 'demo-health-1',
        recommendedPolicyName: 'Health Plus Elite',
        peerComparison: [
          { policyName: 'Health Plus Elite', insurer: 'Aarogya Aid', premium: '₹12,000/yr', coverAmount: '₹5,00,000', waitingPeriod: '24 months', keyBenefit: 'Low Co-pay', suitabilityScore: '92' },
          { policyName: 'Care Shield', insurer: 'Care Insure', premium: '₹9,500/yr', coverAmount: '₹3,00,000', waitingPeriod: '36 months', keyBenefit: 'Affordable Premium', suitabilityScore: '75' }
        ],
        coverageDetail: {
          inclusions: ['In-patient hospitalisation', 'Day care treatments', 'Pre/Post hospitalisation'],
          exclusions: ['Cosmetic surgery', 'Dental treatment unless from accident', 'Self-inflicted injuries'],
          subLimits: ['Room rent up to 1% of sum insured', 'ICU up to 2% of sum insured'],
          coPay: '10% on claims above ₹1,00,000',
          claimType: 'Cashless at network hospitals'
        },
        whyThisPolicy: "Thank you for sharing your profile. I understand that managing conditions like yours requires comprehensive support. Based on your profile, Health Plus Elite is the best fit. Your age puts you in a bracket where comprehensive cover is essential, and the ₹5,00,000 cover amount adequately protects your income band. Importantly, because you have pre-existing conditions, this policy's 24-month waiting period is one of the lowest available, ensuring you get coverage faster. The low co-pay also means fewer out-of-pocket expenses when you need care in your city's network hospitals."
      })
    }
    return JSON.stringify({ reply: 'Demo mode: Configure Gemini API key for full responses.' })
  }
}

const llm = new GeminiLLM()

function buildRecommendationPrompt(profile, policies, policyContext) {
  const profileSummary = `User profile:
- Full Name: ${profile.fullName}
- Age: ${profile.age}
- Lifestyle: ${profile.lifestyle}
- Pre-existing conditions: ${profile.conditions?.join(', ') || 'None'}
- Annual Income: ${profile.income}
- City Type: ${profile.city}`

  const policyList = policies.map((p) => `- ${p.policyName} by ${p.insurer}`).join('\n')
  const learningContext = learningSystem.buildEnhancedPrompt('', profile.age?.toString(), profile)

  return `You are an empathetic, highly skilled health insurance recommendation advisor for AarogyaAid.
Your goal is to recommend the best policy based strictly on the user's profile and the retrieved policy chunks below.

INSTRUCTIONS:
1. EMPATHY & TONE: Acknowledge the user's health situation and personal context before presenting any numbers or policy names. Communicate with warmth, not clinical detachment.
2. JARGON: Define any insurance term (e.g., deductible, co-pay) the first time you use it in the reasoning.
3. GROUNDING: Use ONLY the provided retrieved policy document text to construct your tables. Do not hallucinate coverage amounts or terms.
4. REASONING: Your 'whyThisPolicy' must be exactly 150-250 words. It MUST explicitly reference at least 3 of the 6 profile fields (Age, Lifestyle, Conditions, Income, City, Name) and connect them to specific policy features.

${learningContext ? `LEARNING: ${learningContext}` : ''}
${profileSummary}

Available policies:
${policyList}

Retrieved Policy Document Text:
${JSON.stringify(policyContext)}

Return ONLY a valid JSON object with the following exact schema:
{
  "recommendedPolicyId": "The ID of the recommended policy",
  "recommendedPolicyName": "The name of the recommended policy",
  "peerComparison": [
    { "policyName": "...", "insurer": "...", "premium": "...", "coverAmount": "...", "waitingPeriod": "...", "keyBenefit": "...", "suitabilityScore": "..." }
  ],
  "coverageDetail": {
    "inclusions": ["...", "..."],
    "exclusions": ["...", "..."],
    "subLimits": ["...", "..."],
    "coPay": "...",
    "claimType": "..."
  },
  "whyThisPolicy": "150-250 words explicitly connecting the policy's features to at least 3 of the 6 profile fields, starting with an empathetic acknowledgement."
}`
}

function buildChatPrompt({ message, history = [], profile, policy }) {
  const historyText = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')

  return `You are a policy assistant for AarogyaAid. 
Your goal is to answer user questions regarding their recommended policy based ONLY on the provided policy documents, using empathetic language.

User Profile: ${JSON.stringify(profile)}
Recommended Policy: ${policy.policyName}

INSTRUCTIONS:
1. SESSION MEMORY: Remember the user's profile and previous conversation. Do NOT ask for information they have already provided in their profile or chat history.
2. SOURCE GROUNDING: Base all factual answers solely on standard insurance knowledge and the context of the recommended policy. Do not hallucinate coverage that doesn't exist.
3. EXAMPLES: If asked to explain a term or how it applies, generate a realistic scenario using the user's ACTUAL health condition and city.
4. MEDICAL GUARDRAIL: If a user asks for medical advice (e.g., "should I get this surgery?"), you MUST politely decline and advise them to consult a doctor. Keep the conversation focused purely on insurance coverage.

Conversation History:
${historyText}

USER NEW MESSAGE: ${message}

Return ONLY a valid JSON object with the following schema: { "reply": "Your markdown-formatted reply" }`
}

function rankPolicies(profile, policies) {
  const conditions = profile.conditions || []
  return policies.map((policy) => {
    let score = 0
    const benefits = policy.keyBenefits || []
    if (benefits.some(b => b.toLowerCase().includes('diabetes')) && conditions.includes('Diabetes')) score += 30
    if (benefits.some(b => b.toLowerCase().includes('cashless'))) score += 20
    if (profile.age >= 45 && policy.waitingPeriod?.toString().includes('12')) score += 10
    return { ...policy, score }
  }).sort((a, b) => b.score - a.score)
}

export async function generateRecommendation(profile, policies) {
  const sorted = rankPolicies(profile, policies)
  const recommended = sorted[0]
  const topAlternatives = sorted.slice(1, 4)
  
  const searchQuery = `Health insurance for ${profile.age} year old, conditions: ${profile.conditions?.join(' ')}, income ${profile.income}, city ${profile.city}`
  const policyContext = await retrievePolicyChunks(searchQuery, 6)
  
  const prompt = buildRecommendationPrompt(profile, policies, policyContext)
  const raw = await llm.call(prompt, { temperature: 0.2, maxTokens: 1500 })

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { reply: raw, error: 'Parse error' }
  }

  parsed.recommendedPolicyId = recommended?.id
  parsed.recommendedPolicyName = recommended?.policyName
  parsed.alternatives = topAlternatives
  parsed.modelUsed = 'gemini-2.0-flash'
  parsed.policyContext = policyContext

  return parsed
}

export async function generateChatResponse({ message, history, profile, policy }) {
  const prompt = buildChatPrompt({ message, history, profile, policy })
  const raw = await llm.call(prompt, { temperature: 0.3, maxTokens: 800 })
  try {
    return JSON.parse(raw)
  } catch {
    return { reply: raw }
  }
}

export async function evaluateRecommendation(userQuery, userProfile, modelResponse, expectedResponse) {
  return logFeedback(userQuery, userProfile, modelResponse, expectedResponse, 'gemini-2.0-flash')
}

export async function getModelStats() {
  return getLearningStats()
}

export default { generateRecommendation, generateChatResponse, evaluateRecommendation, getModelStats }
