import app from './app.js'
import dotenv from 'dotenv'
import { initializeSamplePolicies } from './services/sampleLoader.js'

dotenv.config()

const PORT = process.env.PORT || 5000

await initializeSamplePolicies()

app.listen(PORT, () => {
  console.log(`PolicyMate backend listening on http://localhost:${PORT}`)
})
