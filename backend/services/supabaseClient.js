import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// Table names matching Supabase setup
const TABLES = {
  PROFILES: 'user_profiles',
  POLICIES: 'policy_documents',
  RECOMMENDATIONS: 'recommendations',
  CHATS: 'chat_sessions',
  MEDIA: 'media_assets',
}

// -------------------- USER PROFILES --------------------
export async function createUserProfile(profile) {
  const { data, error } = await supabase.from(TABLES.PROFILES).insert([profile]).select().single()
  if (error) throw error
  return data
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase.from(TABLES.PROFILES).select('*').eq('user_id', userId).single()
  if (error) return null
  return data
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// -------------------- POLICY DOCUMENTS --------------------
export async function createPolicyDocument(metadata) {
  const { data, error } = await supabase.from(TABLES.POLICIES).insert([{
    id: metadata.id,
    policy_name: metadata.policyName,
    insurer: metadata.insurer,
    category: metadata.category,
    coverage_type: metadata.coverageType,
    text_content: metadata.text,
    document_url: metadata.documentUrl,
    cloudinary_public_id: metadata.cloudinaryPublicId,
    key_benefits: metadata.keyBenefits || [],
    exclusions: metadata.exclusions || [],
    eligibility: metadata.eligibility || {},
    metadata: metadata.metadata || {},
    is_active: true,
  }]).select().single()

  if (error) {
    console.error('Supabase insert failed', error)
    throw error
  }
  return data
}

export async function getAllPolicies() {
  const { data, error } = await supabase.from(TABLES.POLICIES).select('*').eq('is_active', true)
  if (error) {
    console.error('Supabase fetch failed', error)
    throw new Error('Failed to load policy metadata')
  }
  return data?.map(mapPolicyRow) || []
}

function mapPolicyRow(row) {
  return {
    id: row.id,
    policyName: row.policy_name,
    insurer: row.insurer,
    category: row.category,
    coverageType: row.coverage_type,
    premiumMin: row.premium_min,
    premiumMax: row.premium_max,
    coverageAmountMin: row.coverage_amount_min,
    coverageAmountMax: row.coverage_amount_max,
    keyBenefits: row.key_benefits,
    exclusions: row.exclusions,
    eligibility: row.eligibility,
    documentUrl: row.document_url,
    text: row.text_content,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPolicyById(id) {
  const { data, error } = await supabase.from(TABLES.POLICIES).select('*').eq('id', id).single()
  if (error || !data) return null
  return mapPolicyRow(data)
}

export async function getPoliciesByCategory(category) {
  const { data, error } = await supabase
    .from(TABLES.POLICIES)
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
  if (error) throw error
  return data?.map(mapPolicyRow) || []
}

export async function updatePolicyDocument(id, updates) {
  const dataToUpdate = {}
  if (updates.policyName) dataToUpdate.policy_name = updates.policyName
  if (updates.insurer) dataToUpdate.insurer = updates.insurer
  if (updates.category) dataToUpdate.category = updates.category
  if (updates.coverageType) dataToUpdate.coverage_type = updates.coverageType
  if (updates.premiumMin) dataToUpdate.premium_min = updates.premiumMin
  if (updates.premiumMax) dataToUpdate.premium_max = updates.premiumMax
  if (updates.isActive !== undefined) dataToUpdate.is_active = updates.isActive

  dataToUpdate.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from(TABLES.POLICIES)
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('Supabase update failed', error)
    throw error
  }
  return mapPolicyRow(data)
}

export async function deletePolicyDocument(id) {
  // Soft delete - set is_active to false
  const { data, error } = await supabase
    .from(TABLES.POLICIES)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('Supabase delete failed', error)
    throw error
  }
  return data
}

// -------------------- RECOMMENDATIONS --------------------
export async function saveRecommendation(recommendation) {
  const { data, error } = await supabase
    .from(TABLES.RECOMMENDATIONS)
    .insert([recommendation])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserRecommendations(userId) {
  const { data, error } = await supabase
    .from(TABLES.RECOMMENDATIONS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// -------------------- CHAT SESSIONS --------------------
export async function saveChatSession(session) {
  const { data, error } = await supabase
    .from(TABLES.CHATS)
    .upsert([session], { onConflict: 'session_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getChatSession(userId, sessionId) {
  const { data, error } = await supabase
    .from(TABLES.CHATS)
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .single()
  if (error) return null
  return data
}

export async function getUserChatSessions(userId) {
  const { data, error } = await supabase
    .from(TABLES.CHATS)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

// -------------------- MEDIA ASSETS (Cloudinary) --------------------
export async function saveMediaAsset(asset) {
  const { data, error } = await supabase.from(TABLES.MEDIA).insert([asset]).select().single()
  if (error) throw error
  return data
}

export async function getMediaAssets(relatedPolicyId) {
  const { data, error } = await supabase
    .from(TABLES.MEDIA)
    .select('*')
    .eq('related_policy_id', relatedPolicyId)
  if (error) throw error
  return data || []
}

export async function deleteMediaAsset(id) {
  const { error } = await supabase.from(TABLES.MEDIA).delete().eq('id', id)
  if (error) throw error
  return true
}

// Export supabase instance for direct access if needed
export { supabase }

export async function saveFeedback(feedback) {
  const { data, error } = await supabase
    .from(TABLES.FEEDBACK)
    .insert([feedback])
    .select()
    .single()
  if (error) {
    console.error('Feedback save failed', error)
    throw error
  }
  return data
}

export async function getFeedbackByQuery(userQuery) {
  const { data, error } = await supabase
    .from(TABLES.FEEDBACK)
    .select('*')
    .ilike('user_query', `%${userQuery}%`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllFeedback() {
  const { data, error } = await supabase
    .from(TABLES.FEEDBACK)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// -------------------- TEST CASES --------------------
export async function saveTestCase(testCase) {
  const { data, error } = await supabase
    .from(TABLES.TEST_CASES)
    .insert([testCase])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTestCases(category) {
  const query = supabase.from(TABLES.TEST_CASES).select('*')
  if (category) {
    query.eq('category', category)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateTestCaseResult(id, isCorrect) {
  const column = isCorrect ? 'success_count' : 'failure_count'
  const { data, error } = await supabase
    .from(TABLES.TEST_CASES)
    .update({ 
      [column]: supabase.raw(`${column} + 1`),
      last_tested_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// -------------------- TRAINING LOGS --------------------
export async function saveTrainingLog(log) {
  const { data, error } = await supabase
    .from(TABLES.TRAINING_LOGS)
    .insert([log])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTrainingLogs(testCaseId) {
  const { data, error } = await supabase
    .from(TABLES.TRAINING_LOGS)
    .select('*')
    .eq('test_case_id', testCaseId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
