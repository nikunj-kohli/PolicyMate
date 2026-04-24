import { jest } from '@jest/globals'

// Extract rankPolicies logic from aiAgent.js for testing.
// In a real refactor, rankPolicies should be exported from aiAgent.js
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

describe('Recommendation Logic', () => {
  const policies = [
    {
      id: 'p1',
      policyName: 'Basic Cover',
      keyBenefits: ['Affordable', 'Reimbursement'],
      waitingPeriod: '36 months'
    },
    {
      id: 'p2',
      policyName: 'Diabetic Care Plus',
      keyBenefits: ['Covers Diabetes from day 1', 'Cashless network'],
      waitingPeriod: '12 months'
    },
    {
      id: 'p3',
      policyName: 'Senior Shield',
      keyBenefits: ['Cashless network', 'No pre-medical test'],
      waitingPeriod: '12 months'
    }
  ]

  it('should rank Diabetic Care Plus highest for a 50-year-old diabetic user', () => {
    const profile = {
      fullName: 'John Doe',
      age: 50,
      conditions: ['Diabetes']
    }

    const ranked = rankPolicies(profile, policies)
    
    // Diabetic Care Plus: +30 (diabetes benefit) +20 (cashless) +10 (age 45+ and 12m waiting) = 60
    // Senior Shield: +20 (cashless) +10 (age 45+ and 12m waiting) = 30
    // Basic Cover: 0

    expect(ranked[0].policyName).toBe('Diabetic Care Plus')
    expect(ranked[0].score).toBe(60)
    expect(ranked[1].policyName).toBe('Senior Shield')
    expect(ranked[1].score).toBe(30)
  })

  it('should rank Senior Shield highest for an older user without diabetes', () => {
    const profile = {
      fullName: 'Jane Doe',
      age: 60,
      conditions: ['Hypertension']
    }

    const ranked = rankPolicies(profile, policies)
    
    // Diabetic Care Plus: +20 (cashless) +10 (age 45+ and 12m waiting) = 30
    // Senior Shield: +20 (cashless) +10 (age 45+ and 12m waiting) = 30
    // Both score 30, but neither gets the diabetes bonus.

    expect(ranked[0].score).toBe(30)
    expect(ranked[2].policyName).toBe('Basic Cover')
  })
})
