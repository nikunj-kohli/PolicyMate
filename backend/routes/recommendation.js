import express from 'express'
import { validateProfile } from '../services/profileValidation.js'
import { getAllPolicies } from '../services/supabaseClient.js'
import { generateRecommendation } from '../services/aiAgent.js'

const router = express.Router()

router.post('/recommend', async (req, res) => {
  try {
    const profile = req.body
    const validation = validateProfile(profile)
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors })
    }

    const policies = await getAllPolicies()
    if (!policies || policies.length === 0) {
      return res.status(500).json({ error: 'Policy knowledge base is empty. Upload sample policies in admin.' })
    }

    const recommendation = await generateRecommendation(profile, policies)
    req.session.profile = profile
    req.session.recommendation = {
      policyId: recommendation.recommendedPolicyId,
      policyName: recommendation.recommendedPolicyName,
      timestamp: Date.now(),
    }

    return res.json(recommendation)
  } catch (error) {
    console.error('Recommend error', error)
    return res.status(500).json({ error: 'Failed to generate recommendation' })
  }
})

export default router
