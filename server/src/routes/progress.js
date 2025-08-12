const router = require('express').Router()
const Progress = require('../models/Progress')
const User = require('../models/User')
const auth = require('../middleware/auth')

// Record progress
router.post('/', auth, async (req, res) => {
  try {
    const { lessonId, xpEarned = 10, mistakes = [], stats = {} } = req.body
    const progress = await Progress.create({ user: req.userId, lesson: lessonId, xpEarned, mistakes, stats })
    // naive XP + streak update
    const user = await User.findById(req.userId)
    user.xp += xpEarned
    user.streak = Math.max(1, user.streak + 1)
    await user.save()
    res.json({ progress, user: { xp: user.xp, streak: user.streak } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to record progress' })
  }
})

// Summary
router.get('/summary', auth, async (req, res) => {
  const total = await Progress.countDocuments({ user: req.userId })
  const xp = (await Progress.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(String(req.userId)) } },
    { $group: { _id: null, sum: { $sum: '$xpEarned' } } }
  ]))[0]?.sum || 0
  res.json({ lessonsCompleted: total, xp })
})

module.exports = router
