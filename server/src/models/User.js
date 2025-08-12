const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  username: { type: String, required: true },
  avatarUrl: String,
  country: String,
  level: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  goals: [{ type: String }],
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }],
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
