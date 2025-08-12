const router = require('express').Router()
const User = require('../models/User')

router.get('/', async (_req, res) => {
  const top = await User.find().sort({ xp: -1, streak: -1 }).limit(20).select('username xp streak')
  res.json({ leaderboard: top })
})

module.exports = router
