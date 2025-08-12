const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['vocabulary','grammar','pronunciation','listening','conversation','review'], required: true },
  level: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  xp: { type: Number, default: 10 },
  content: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

module.exports = mongoose.model('Lesson', lessonSchema)
