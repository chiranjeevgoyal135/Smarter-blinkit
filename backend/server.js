// backend/server.js
require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./db");
const app        = express();

app.use(cors());
app.use(express.json());

// Database connection middleware (ensures connection before routing)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed: " + err.message });
  }
});

// Synchronous route definitions (required for serverless target)
app.use("/api/auth",             require("./routes/auth"));
app.use("/api/inventory",        require('./routes/inventory'));
app.use("/api/suggestions",      require("./routes/suggestions"));
app.use("/api/shops",            require("./routes/shops"));
app.use("/api/payment",          require("./routes/payment"));
app.use("/api/recipe",           require("./routes/recipe"));
app.use("/api/similar",          require("./routes/similar"));
app.use("/api/cart-suggestions", require("./routes/cart-suggestions"));
app.use("/api/shop-inventory",   require("./routes/shop-inventory"));
app.use("/api/cart-split",       require("./routes/cart-split"));
app.use("/api/analytics",        require("./routes/analytics"));
app.use("/api/money-map",        require("./routes/money-map"));
app.use("/api/product-pairing",  require("./routes/product-pairing"));

app.get("/", (req, res) => res.json({ message:"Smarter Blinkit API ✅", db:"MongoDB" }));

// Start server if run directly (local mode)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Backend at http://localhost:${PORT}`);
    console.log("MongoDB:     ✅ Connection Pending (will connect on first request)");
    console.log("Groq:        ", process.env.GROQ_API_KEY    ? "✅" : "❌");
    console.log("Neo4j:       ", process.env.NEO4J_URI        ? "✅" : "❌");
    console.log("Razorpay:    ", process.env.RAZORPAY_KEY_ID  ? "✅" : "❌ (mock)");
    console.log("HuggingFace: ", process.env.HF_API_TOKEN     ? "✅" : "⚠️  (public)");
  });
}

// Export app for Vercel Serverless Functions
module.exports = app;