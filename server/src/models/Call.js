const mongoose = require('mongoose')

const callSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startedAt: { type: Date },
  endedAt: { type: Date },
  topic: String,
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
}, { timestamps: true })

module.exports = mongoose.model('Call', callSchema)
