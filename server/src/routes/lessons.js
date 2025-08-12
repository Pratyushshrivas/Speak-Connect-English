const router = require('express').Router()
const Lesson = require('../models/Lesson')

// Get lessons (optionally filter by type or level)
router.get('/', async (req, res) => {
  const { type, level } = req.query
  const query = {}
  if (type) query.type = type
  if (level) query.level = level
  let lessons = await Lesson.find(query).limit(30)
  if (!lessons.length) {
    lessons = [
      { _id: 'seed1', title: 'Core Vocabulary 1', type: 'vocabulary', level: 'beginner', xp: 10 },
      { _id: 'seed2', title: 'Grammar Basics', type: 'grammar', level: 'beginner', xp: 10 },
      { _id: 'seed3', title: 'Pronunciation: /th/', type: 'pronunciation', level: 'beginner', xp: 10 },
    ]
  }
  res.json({ lessons })
})

// Get lesson by id
router.get('/:id', async (req, res) => {
  const l = await Lesson.findById(req.params.id)
  if (!l) return res.status(404).json({ error: 'Lesson not found' })
  res.json({ lesson: l })
})

module.exports = router
