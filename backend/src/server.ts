import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import path from 'path'
import productsRouter from './routes/products'
import uploadRouter from './routes/upload'
import authRouter from './routes/auth'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 9001

app.use(cors({
  origin: ['http://localhost:9000', 'http://127.0.0.1:9000'],
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/products', productsRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/auth', authRouter)

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`)
  console.log(`📚 API endpoints:`)
  console.log(`   - GET    /api/health`)
  console.log(`   - POST   /api/auth/send-code`)
  console.log(`   - POST   /api/auth/login`)
  console.log(`   - GET    /api/auth/me`)
  console.log(`   - GET    /api/products`)
  console.log(`   - GET    /api/products/:id`)
  console.log(`   - POST   /api/products`)
  console.log(`   - PUT    /api/products/:id`)
  console.log(`   - DELETE /api/products/:id`)
  console.log(`   - POST   /api/upload`)
})
