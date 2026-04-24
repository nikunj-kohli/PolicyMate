import express from 'express'
import { getPolicyById } from '../services/supabaseClient.js'
import { generateChatResponse } from '../services/aiAgent.js'

const router = express.Router()

router.post('/chat', async (req, res) => {
  try {
    const { message, history, policyId } = req.body
    const sessionProfile = req.session.profile
    const sessionRecommendation = req.session.recommendation

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Chat message is required' })
    }

    const profile = sessionProfile || req.body.profile
    const finalPolicyId = policyId || sessionRecommendation?.policyId

    if (!profile || !finalPolicyId) {
      return res.status(400).json({ error: 'Profile and recommended policy are required for chat context' })
    }

    const policy = await getPolicyById(finalPolicyId)
    if (!policy) {
      return res.status(404).json({ error: 'Recommended policy not found' })
    }

    const response = await generateChatResponse({ message, history, profile, policy })
    return res.json(response)
  } catch (error) {
    console.error('Chat error', error)
    return res.status(500).json({ error: 'Failed to generate chat response' })
  }
})

export default router
