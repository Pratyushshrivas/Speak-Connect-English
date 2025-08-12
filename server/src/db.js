const mongoose = require('mongoose')

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri, { autoIndex: true })
  console.log('MongoDB connected')
}
