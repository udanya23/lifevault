/**
 * config/db.js — MongoDB connection with Mongoose
 *
 * Features:
 * - Async/await connection
 * - Retry logic: if initial connection fails we retry up to 5 times
 *   with exponential back-off (important for Atlas cold starts)
 * - Mongoose strict mode enforced (rejects unknown fields)
 * - Connection event listeners for monitoring
 */

const mongoose = require('mongoose');

// Enforce strict mode globally — any field not in the schema is silently ignored
mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB Atlas (or local) with retry logic.
 *
 * @param {number} retries  - Maximum retry attempts (default 5)
 * @param {number} delay    - Base delay in ms between retries (doubles each attempt)
 */
const connectDB = async (retries = 5, delay = 2000) => {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!uri) {
    console.error('❌ MONGODB_URI (or MONGODB_URL) is not defined in environment variables.');
    process.exit(1);
  }

  // Fail fast for template URIs so startup errors are actionable.
  if (uri.includes('<username>') || uri.includes('<password>') || uri.includes('cluster0.xxxxx')) {
    console.error('❌ MONGODB_URI is still using placeholder values in backend/.env.');
    console.error('   Use a real MongoDB Atlas URI (or a valid local Mongo URI) and restart the backend.');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        // These options are the recommended production settings
        maxPoolSize: 10,        // Maximum simultaneous connections in the pool
        serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
        socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return; // Success — exit the retry loop
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ MongoDB connection failed after ${retries} attempts.`);
        console.error(error.message);
        process.exit(1); // Fatal — cannot run without DB
      }

      const waitTime = delay * Math.pow(2, attempt - 1); // Exponential back-off
      console.warn(`⚠️ MongoDB connection attempt ${attempt}/${retries} failed. Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

// ── Connection Event Listeners ────────────────────────────────────────────────
// These log useful info in production without any extra library

mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose: connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose: disconnected from MongoDB');
});

// Graceful shutdown — close the connection when the Node process terminates
// This prevents hanging connections that could exhaust Atlas connection limits
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Mongoose connection closed due to app termination.');
  process.exit(0);
});

module.exports = connectDB;
