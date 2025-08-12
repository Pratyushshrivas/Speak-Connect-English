const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  xpEarned: { type: Number, default: 0 },
  mistakes: [{ type: String }],
  stats: { type: mongoose.Schema.Types.Mixed },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Progress', progressSchema)
