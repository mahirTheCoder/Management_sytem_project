const mongoose = require('mongoose');

const dbConfig = async () => {
  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = dbConfig;
