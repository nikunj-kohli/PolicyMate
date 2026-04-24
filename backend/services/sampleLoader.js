import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getAllPolicies, createPolicyDocument } from './supabaseClient.js'
import { parsePolicyFile } from './pdfParser.js'
import { addPolicyDocument } from './ragPipeline.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sampleDir = path.join(__dirname, '../sample-policies')

export async function initializeSamplePolicies() {
  try {
    const existing = await getAllPolicies()
    if (existing && existing.length > 0) {
      console.log('Sample policies already loaded')
      return
    }
  } catch (error) {
    console.warn('Unable to check Supabase for sample policies, falling back to local load', error.message)
  }

  try {
    const entries = await fs.readdir(sampleDir)
    const policyFiles = entries.filter((file) => ['.pdf', '.json', '.txt'].includes(path.extname(file).toLowerCase()))
    for (const file of policyFiles) {
      const filePath = path.join(sampleDir, file)
      const text = await parsePolicyFile(filePath)
      let policyName = 'Sample Policy'
      let insurer = 'Sample Insurer'
      if (file.toLowerCase().endsWith('.json')) {
        try {
          const json = JSON.parse(await fs.readFile(filePath, 'utf8'))
          policyName = json.policyName || policyName
          insurer = json.insurer || insurer
        } catch (error) {
          // Keep fallback names if JSON parse fails.
        }
      } else {
        const parts = file.split('-').slice(0, 2).map((part) => part.replace(/\.(json|txt|pdf)$/i, '').trim())
        policyName = parts[0] || policyName
        insurer = parts[1] || insurer
      }
      const metadata = {
        id: file.replace(/[^a-zA-Z0-9_-]/g, '-'),
        filename: file,
        policyName,
        insurer,
        uploadDate: new Date().toISOString(),
        sourceType: path.extname(file).toLowerCase().replace('.', ''),
        text,
      }
      await createPolicyDocument(metadata).catch(() => null)
      await addPolicyDocument(metadata).catch((error) => console.warn('Chroma load skip', error.message))
    }
    console.log('Loaded sample policies from sample-policies')
  } catch (error) {
    console.error('Failed to load sample policies', error)
  }
}
