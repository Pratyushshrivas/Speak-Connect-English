require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const connectDB = require('./src/db')

// Routes
const authRoutes = require('./src/routes/auth')
const lessonsRoutes = require('./src/routes/lessons')
const progressRoutes = require('./src/routes/progress')
const leaderboardRoutes = require('./src/routes/leaderboard')

const app = express()
const server = http.createServer(app)

// CORS
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
}))
app.use(express.json())

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// API
app.use('/api/auth', authRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

// Socket.io
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || '*' },
})
require('./src/socket/matchmaking')(io)

// Start
const PORT = process.env.PORT || 4000
connectDB().then(() => {
  server.listen(PORT, () => console.log(`API listening on :${PORT}`))
})
