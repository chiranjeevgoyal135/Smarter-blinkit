// backend/db.js — MongoDB connection via Mongoose
const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "smarter_blinkit",
      serverSelectionTimeoutMS: 10000, // fail fast — 10s instead of 30s default
    });
    isConnected = true;
    console.log("✅ MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("");
    console.error("   Possible causes:");
    console.error("   1. Atlas cluster is paused — resume it at cloud.mongodb.com");
    console.error("   2. Wrong MONGODB_URI in .env — copy a fresh URI from Atlas → Connect");
    console.error("   3. IP not whitelisted — add your IP in Atlas → Network Access");
    console.error("   4. Wrong DB user password in the URI");
    console.error("");
    process.exit(1);
  }
}

module.exports = connectDB;