import { ChromaClient } from 'chromadb'
import dotenv from 'dotenv'

dotenv.config()

const chromaConfig = {
  path: process.env.CHROMA_URL || 'http://localhost:8000',
}

const client = new ChromaClient(chromaConfig)
const collection = client.collection('policy_chunks')

export async function addChunks(policyId, chunks) {
  const ids = chunks.map((chunk) => chunk.id)
  const documents = chunks.map((chunk) => chunk.text)
  const metadatas = chunks.map((chunk) => ({
    policyId,
    policyName: chunk.policyName,
    insurer: chunk.insurer,
    source: chunk.source,
    section: chunk.section,
  }))

  await collection.add({ ids, documents, metadatas })
}

export async function deletePolicyChunks(policyId) {
  try {
    await collection.delete({ where: { policyId } })
  } catch (error) {
    console.warn('Chroma deletion fallback', error)
    if (Array.isArray(policyId)) {
      await collection.delete({ ids: policyId })
    }
  }
}

export async function searchChunks(query, topK = 5) {
  const result = await collection.query({
    queryTexts: [query],
    nResults: topK,
    include: ['documents', 'metadatas'],
  })
  const documents = result?.results?.[0]?.documents || []
  const metadatas = result?.results?.[0]?.metadatas || []
  return documents.map((doc, index) => ({
    text: doc,
    metadata: metadatas[index] || {},
  }))
}
