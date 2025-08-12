const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

function sign(user) {
  return jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, level } = req.body
    if (!email || !password || !username) return res.status(400).json({ error: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already in use' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash, username, level })
    res.json({ token: sign(user), user: { id: user._id, email: user.email, username: user.username, level: user.level } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to register' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ token: sign(user), user: { id: user._id, email: user.email, username: user.username, level: user.level } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Me
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash')
  res.json({ user })
})

module.exports = router
