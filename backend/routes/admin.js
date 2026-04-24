import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import adminAuth from '../middleware/auth.js'
import { createPolicyDocument, getAllPolicies, updatePolicyDocument, deletePolicyDocument } from '../services/supabaseClient.js'
import { parsePolicyFile } from '../services/pdfParser.js'
import { addPolicyDocument, removePolicyDocumentById } from '../services/ragPipeline.js'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadFolder = path.join(__dirname, '../sample-policies')
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadFolder),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true
    return res.json({ success: true })
  }
  return res.status(401).json({ error: 'Invalid admin credentials' })
})

router.post('/logout', adminAuth, (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

router.post('/upload', adminAuth, upload.single('policy'), async (req, res) => {
  try {
    const { policyName, insurer } = req.body
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    if (!policyName || !insurer) {
      return res.status(400).json({ error: 'Policy name and insurer are required' })
    }
    const filePath = req.file.path
    const text = await parsePolicyFile(filePath)
    const metadata = {
      id: uuidv4(),
      filename: req.file.filename,
      policyName,
      insurer,
      uploadDate: new Date().toISOString(),
      sourceType: path.extname(req.file.originalname).toLowerCase().replace('.', ''),
      text,
    }

    await createPolicyDocument(metadata)
    await addPolicyDocument(metadata)
    return res.json({ success: true, document: metadata })
  } catch (error) {
    console.error('Upload error', error)
    return res.status(500).json({ error: 'Failed to upload policy document' })
  }
})

router.get('/docs', adminAuth, async (req, res) => {
  try {
    const documents = await getAllPolicies()
    return res.json({ documents })
  } catch (error) {
    console.error('Docs list error', error)
    return res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

router.put('/docs/:id', adminAuth, async (req, res) => {
  try {
    const updates = req.body
    const updated = await updatePolicyDocument(req.params.id, updates)
    return res.json({ success: true, document: updated })
  } catch (error) {
    console.error('Update error', error)
    return res.status(500).json({ error: 'Failed to update document metadata' })
  }
})

router.delete('/docs/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await deletePolicyDocument(req.params.id)
    await removePolicyDocumentById(req.params.id)
    return res.json({ success: true, deleted })
  } catch (error) {
    console.error('Delete error', error)
    return res.status(500).json({ error: 'Failed to delete document' })
  }
})

export default router
