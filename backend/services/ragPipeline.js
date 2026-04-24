import dotenv from 'dotenv'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { addChunks, deletePolicyChunks, searchChunks } from './vectorStore.js'

dotenv.config()

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  openAIApiKey: process.env.NVIDIA_API_KEY,
  baseUrl: process.env.NVIDIA_BASE_URL,
})

export function chunkPolicyText(rawText, policyId, policyName, insurer, source) {
  const cleaned = rawText.replace(/\s+/g, ' ').trim()
  const maxSize = 1000
  const overlap = 200
  const chunks = []
  let index = 0
  let start = 0

  while (start < cleaned.length) {
    const chunkText = cleaned.slice(start, Math.min(start + maxSize, cleaned.length))
    const section = `chunk-${index + 1}`
    chunks.push({
      id: `${policyId}-${index}`,
      text: chunkText,
      policyName,
      insurer,
      source,
      section,
    })
    start += maxSize - overlap
    index += 1
  }

  return chunks
}

export async function addPolicyDocument(policy) {
  const chunks = chunkPolicyText(policy.text, policy.id, policy.policyName, policy.insurer, policy.sourceType)
  await addChunks(policy.id, chunks)
  return chunks.length
}

export async function removePolicyDocumentById(policyId) {
  await deletePolicyChunks(policyId)
}

export async function retrievePolicyChunks(query, topK = 5) {
  return searchChunks(query, topK)
}
