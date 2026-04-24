import express from 'express'
import cors from 'cors'
import compression from 'compression'
import session from 'express-session'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import recommendationRoutes from './routes/recommendation.js'
import chatRoutes from './routes/chat.js'
import adminRoutes from './routes/admin.js'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(compression())
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'policy-mate-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    },
  }),
)

app.use('/api', recommendationRoutes)
app.use('/api', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/sample-policies', express.static(path.join(__dirname, 'sample-policies')))

app.get('/', (_req, res) => {
  res.json({ status: 'PolicyMate backend is running' })
})

export default app
