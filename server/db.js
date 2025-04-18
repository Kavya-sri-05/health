// server/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use a default MongoDB URI if not provided in environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health_tracker';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;