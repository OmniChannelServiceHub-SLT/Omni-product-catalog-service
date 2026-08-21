const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is missing. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`[product-catalog-service] MongoDB connected -> ${mongoose.connection.name}`);
  } catch (err) {
    console.error('[product-catalog-service] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
