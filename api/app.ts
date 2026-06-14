/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { authMiddleware } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import corridorRoutes from './routes/corridors.js'
import dashboardRoutes from './routes/dashboard.js'
import alertRoutes from './routes/alerts.js'
import inspectionRoutes from './routes/inspection.js'
import reportRoutes from './routes/reports.js'
import systemRoutes from './routes/system.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * Auth Middleware
 */
app.use(authMiddleware)

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/corridors', corridorRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/inspection', inspectionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/system', systemRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
