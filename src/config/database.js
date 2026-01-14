/**
 * Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/log-analytics';

    await mongoose.connect(mongoUri, {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000
    });

    console.log('[DB] ✓ Connected to MongoDB');

    return mongoose.connection;
  } catch (error) {
    console.error('[DB] ✗ Connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[DB] ✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('[DB] ✗ Disconnect failed:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
