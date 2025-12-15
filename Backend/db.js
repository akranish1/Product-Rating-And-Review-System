const mongoose = require('mongoose')
require('dotenv').config()

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product_reviews'

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

module.exports = connectDB
