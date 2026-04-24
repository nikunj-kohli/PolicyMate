import dotenv from 'dotenv'
import { saveFeedback, getFeedbackByQuery, getAllFeedback } from './supabaseClient.js'

dotenv.config()

/**
 * Learning & Feedback System
 * Compares model output with expected output and stores corrections
 */

export class LearningSystem {
  constructor() {
    this.threshold = 0.7 // Similarity threshold for considering a match
  }

  /**
   * Calculate similarity between two JSON objects
   */
  calculateSimilarity(obj1, obj2) {
    const str1 = JSON.stringify(obj1, Object.keys(obj1).sort())
    const str2 = JSON.stringify(obj2, Object.keys(obj2).sort())
    
    // Simple similarity: based on common keys and values
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    const commonKeys = keys1.filter(k => keys2.includes(k))
    
    if (commonKeys.length === 0) return 0
    
    let matchScore = 0
    for (const key of commonKeys) {
      if (JSON.stringify(obj1[key]) === JSON.stringify(obj2[key])) {
        matchScore += 1
      }
    }
    
    return matchScore / Math.max(keys1.length, keys2.length)
  }

  /**
   * Compare model response with expected response
   */
  async evaluateResponse(userQuery, userProfile, modelResponse, expectedResponse, modelUsed = 'gemini-2.0-flash') {
    const similarity = this.calculateSimilarity(modelResponse, expectedResponse)
    const isCorrect = similarity >= this.threshold

    // Store feedback in Supabase
    const feedbackRecord = {
      user_query: userQuery,
      user_profile: userProfile,
      model_response: modelResponse,
      expected_response: expectedResponse,
      is_correct: isCorrect,
      correction_reason: isCorrect ? null : this.generateCorrectionReason(modelResponse, expectedResponse),
      model_used: modelUsed,
    }

    await saveFeedback(feedbackRecord)

    return {
      isCorrect,
      similarity,
      feedbackStored: true,
      correction: isCorrect ? null : this.generateCorrection(modelResponse, expectedResponse),
    }
  }

  /**
   * Generate correction reason when model is wrong
   */
  generateCorrectionReason(modelResponse, expectedResponse) {
    const differences = []
    
    for (const key of Object.keys(expectedResponse)) {
      if (JSON.stringify(modelResponse[key]) !== JSON.stringify(expectedResponse[key])) {
        differences.push(`Expected ${key}: ${JSON.stringify(expectedResponse[key])}, Got: ${JSON.stringify(modelResponse[key])}`)
      }
    }
    
    return differences.join('; ')
  }

  /**
   * Generate correction object
   */
  generateCorrection(modelResponse, expectedResponse) {
    return {
      original: modelResponse,
      corrected: expectedResponse,
      fieldsAdjusted: Object.keys(expectedResponse).filter(
        k => JSON.stringify(modelResponse[k]) !== JSON.stringify(expectedResponse[k])
      ),
    }
  }

  /**
   * Get learned corrections for a similar query
   */
  async getLearnedCorrections(userQuery) {
    const feedback = await getFeedbackByQuery(userQuery)
    return feedback.filter(f => !f.is_correct)
  }

  /**
   * Build enhanced prompt with learned corrections
   */
  buildEnhancedPrompt(basePrompt, userQuery, userProfile) {
    const corrections = this.getLearnedCorrections(userQuery)
    
    if (corrections.length === 0) {
      return basePrompt
    }

    const correctionContext = corrections
      .map(c => `Previous similar query: "${c.user_query}"\nExpected: ${JSON.stringify(c.expected_response)}\nCorrection: ${c.correction_reason}`)
      .join('\n\n')

    return `${basePrompt}

IMPORTANT - LEARNED CORRECTIONS FROM PREVIOUS TEST CASES:
${correctionContext}

Use these corrections to avoid repeating the same mistakes.`
  }

  /**
   * Run a test case and evaluate
   */
  async runTestCase(testCase, modelResponse) {
    const evaluation = await this.evaluateResponse(
      testCase.user_query,
      testCase.user_profile,
      modelResponse,
      testCase.expected_output,
      testCase.model_used
    )

    return {
      testCaseId: testCase.id,
      testName: testCase.test_name,
      ...evaluation,
    }
  }

  /**
   * Get learning statistics
   */
  async getLearningStats() {
    const allFeedback = await getAllFeedback()
    
    const correct = allFeedback.filter(f => f.is_correct).length
    const incorrect = allFeedback.filter(f => !f.is_correct).length
    const total = allFeedback.length

    return {
      total,
      correct,
      incorrect,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      recentCorrections: allFeedback.filter(f => !f.is_correct).slice(0, 5),
    }
  }
}

// Export singleton instance
export const learningSystem = new LearningSystem()

// Helper functions for direct import
export async function logFeedback(userQuery, userProfile, modelResponse, expectedResponse, modelUsed) {
  return learningSystem.evaluateResponse(userQuery, userProfile, modelResponse, expectedResponse, modelUsed)
}

export async function getLearningStats() {
  return learningSystem.getLearningStats()
}

export function buildEnhancedPrompt(basePrompt, userQuery, userProfile) {
  return learningSystem.buildEnhancedPrompt(basePrompt, userQuery, userProfile)
}