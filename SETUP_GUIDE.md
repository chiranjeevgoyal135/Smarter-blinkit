# 🚀 SmarterBlinkit - Complete Setup Guide

This guide will help you set up the entire project from scratch, including all external services.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Neo4j AuraDB Setup](#neo4j-auradb-setup)
4. [Groq API Setup](#groq-api-setup)
5. [Razorpay Setup (Optional)](#razorpay-setup-optional)
6. [Local Installation](#local-installation)
7. [Database Seeding](#database-seeding)
8. [Running the Application](#running-the-application)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- **Code editor** (VS Code recommended)
- **Modern browser** (Chrome, Firefox, Edge)
- **Stable internet connection** (for cloud services)

---

## 🍃 MongoDB Atlas Setup

MongoDB Atlas is our primary database for storing products, orders, and users.

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"**
3. Sign up with email or Google

### Step 2: Create Cluster
1. After login, click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select **AWS** as provider
4. Choose region closest to you (e.g., Mumbai for India)
5. Cluster name: `smarter-blinkit`
6. Click **"Create"**

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `smarter_blinkit_user`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Address
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `smarter_blinkit`

**Example:**
```
mongodb+srv://smarter_blinkit_user:YOUR_PASSWORD@smarter-blinkit.xxxxx.mongodb.net/smarter_blinkit?retryWrites=true&w=majority
```

---

## 🔗 Neo4j AuraDB Setup

Neo4j is our graph database for product relationships and recommendations.

### Step 1: Create Account
1. Go to [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Click **"Start Free"**
3. Sign up with email or Google

### Step 2: Create Instance
1. After login, click **"New Instance"**
2. Choose **"AuraDB Free"**
3. Instance name: `smarter-blinkit`
4. Region: Choose closest to you
5. Click **"Create"**

### Step 3: Save Credentials
**IMPORTANT:** A popup will show your credentials. **Save them immediately!**

- **Connection URI:** `neo4j+s://xxxxx.databases.neo4j.io`
- **Username:** `neo4j`
- **Password:** (auto-generated, save it!)

You **cannot** retrieve the password later!

### Step 4: Verify Connection
1. Click **"Open"** on your instance
2. Use **Neo4j Browser** to test connection
3. Run query: `RETURN "Hello World" AS message`
4. If successful, you're ready!

---

## 🤖 Groq API Setup

Groq provides ultra-fast AI inference for our intent search and recipe agent.

### Step 1: Create Account
1. Go to [Groq Console](https://console.groq.com/)
2. Click **"Sign Up"**
3. Sign up with email or Google

### Step 2: Get API Key
1. After login, go to **"API Keys"**
2. Click **"Create API Key"**
3. Name: `smarter-blinkit`
4. Click **"Create"**
5. **Copy the API key** (you won't see it again!)

**Example:**
```
gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Test API Key
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If you see a list of models, it's working!

---

## 💳 Razorpay Setup (Optional)

Razorpay is for payment processing. **This is optional** - the app works in mock mode without it.

### Step 1: Create Account
1. Go to [Razorpay](https://razorpay.com/)
2. Click **"Sign Up"**
3. Complete business verification (takes 1-2 days)

### Step 2: Get Test Keys
1. After login, go to **"Settings"** → **"API Keys"**
2. Switch to **"Test Mode"** (top-right toggle)
3. Click **"Generate Test Key"**
4. Copy **Key ID** and **Key Secret**

**Example:**
```
Key ID: rzp_test_xxxxxxxxxxxxxxxx
Key Secret: xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Test Cards
Use these test cards in test mode:

- **Success:** `4111 1111 1111 1111`
- **Failure:** `4000 0000 0000 0002`
- **CVV:** Any 3 digits
- **Expiry:** Any future date

---

## 💻 Local Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/smarter-blinkit.git
cd smarter-blinkit
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

### Step 3: Create .env File
Create `backend/.env` with your credentials:

```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://smarter_blinkit_user:YOUR_PASSWORD@smarter-blinkit.xxxxx.mongodb.net/smarter_blinkit?retryWrites=true&w=majority

# Groq AI (Required)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Neo4j (Required)
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

# Razorpay (Optional - uses mock mode if not provided)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# HuggingFace (Optional - uses public API if not provided)
HF_API_TOKEN=hf_your_token_here

# Server Port (Optional - defaults to 5000)
PORT=5000
```

### Step 4: Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🌱 Database Seeding

### Seed MongoDB
```bash
cd backend
npm run seed
```

This creates:
- 3 demo users (buyer, seller, owner)
- 50+ products across 10 categories
- 5 shops in different Indian cities
- Sample orders for analytics

### Seed Neo4j
```bash
cd backend
node neo4j-seed.js
```

This creates:
- Product nodes
- Category nodes
- BOUGHT_WITH relationships
- SIMILAR_TO relationships

**Expected output:**
```
✅ Neo4j connected
✅ Created 50 product nodes
✅ Created 10 category nodes
✅ Created 120 BOUGHT_WITH relationships
✅ Created 80 SIMILAR_TO relationships
✅ Neo4j seeding complete!
```

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
npm start
```

**Expected output:**
```
✅ Backend at http://localhost:5000
MongoDB:     ✅ Connected
Groq:        ✅
Neo4j:       ✅
Razorpay:    ✅ (or ❌ mock)
HuggingFace: ✅ (or ⚠️  public)
```

### Start Frontend
Open a **new terminal**:
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Open in Browser
```
http://localhost:5173
```

---

## 🎯 Testing the Application

### 1. Test Login
- Click **"Buyer"** tab
- Click **"Click to fill demo credentials"**
- Click **"Login as Buyer"**

### 2. Test AI Intent Search
- Type: `I have a cold`
- Wait 1-2 seconds
- See AI-suggested products

### 3. Test Recipe Agent
- Click **"Recipe Agent"** button
- Type: `Make pizza for 4 people`
- Click search
- See ingredient list with prices

### 4. Test Face Login
- Click **"Face Login"** button
- Allow camera access
- Point face at camera
- Auto-login when face detected

### 5. Test Seller Dashboard
- Logout
- Login as **Seller** (`seller@test.com` / `seller123`)
- Try barcode scanning
- Add products with AI

### 6. Test Owner Dashboard
- Logout
- Login as **Owner** (`owner@test.com` / `owner123`)
- See live analytics
- Check Money Map

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `MONGODB_URI is not set`
- **Fix:** Check `.env` file exists in `backend/` folder
- **Fix:** Verify MongoDB URI is correct

**Error:** `MongoDB connection failed`
- **Fix:** Check IP is whitelisted in MongoDB Atlas
- **Fix:** Verify password in connection string
- **Fix:** Check cluster is not paused

**Error:** `Port 5000 already in use`
- **Fix:** Kill process: `npx kill-port 5000`
- **Fix:** Or change port in `.env`: `PORT=5001`

### Frontend won't start

**Error:** `Cannot GET /`
- **Fix:** Make sure backend is running first
- **Fix:** Check backend URL in `frontend/src/api/api.js`

**Error:** `Port 5173 already in use`
- **Fix:** Kill process: `npx kill-port 5173`
- **Fix:** Or Vite will auto-assign next port

### AI features not working

**Error:** `AI is not responding`
- **Fix:** Check `GROQ_API_KEY` in `.env`
- **Fix:** Verify API key is valid at [Groq Console](https://console.groq.com/)
- **Fix:** Check API quota (free tier: 30 requests/min)

**Error:** `Rate limit exceeded`
- **Fix:** Wait 1 minute and try again
- **Fix:** Upgrade Groq plan for higher limits

### Neo4j features not working

**Error:** `Neo4j connection failed`
- **Fix:** Check `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` in `.env`
- **Fix:** Verify instance is running in Neo4j Aura
- **Fix:** Check instance is not paused

**Error:** `No product relationships found`
- **Fix:** Run `node neo4j-seed.js` to seed data

### Face login not working

**Error:** `Camera not accessible`
- **Fix:** Allow camera permissions in browser
- **Fix:** Check camera is not used by another app
- **Fix:** Try in HTTPS (camera requires secure context)

**Error:** `Models not loading`
- **Fix:** Check `/public/models` folder exists
- **Fix:** Download models from [face-api.js](https://github.com/justadudewhohacks/face-api.js)

### Payment not working

**Error:** `Razorpay not loaded`
- **Fix:** This is normal if `RAZORPAY_KEY_ID` is not set
- **Fix:** App will use mock payment mode
- **Fix:** To use real Razorpay, add keys to `.env`

---

## 📊 Monitoring

### Check Backend Health
```bash
curl http://localhost:5000
```

**Expected:**
```json
{
  "message": "Smarter Blinkit API ✅",
  "db": "MongoDB"
}
```

### Check MongoDB Connection
```bash
curl http://localhost:5000/api/shops
```

Should return list of shops.

### Check Groq AI
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{"query": "milk"}'
```

Should return product suggestions.

### Check Neo4j
```bash
curl http://localhost:5000/api/similar/BARCODE123
```

Should return similar products.

---

## 🔄 Updating the Application

### Update Dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd ../frontend
npm update
```

### Pull Latest Changes
```bash
git pull origin main
npm install  # in both backend and frontend
```

---

## 🚀 Deployment (Optional)

### Deploy Backend (Render)
1. Go to [Render](https://render.com/)
2. Create **Web Service**
3. Connect GitHub repo
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables from `.env`

### Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/)
2. Import GitHub repo
3. Root directory: `frontend`
4. Framework: Vite
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy!

---

## 📞 Need Help?

- **GitHub Issues:** [Report a bug](https://github.com/yourusername/smarter-blinkit/issues)
- **Email:** your.email@example.com
- **Discord:** Join our community (link)

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and running
- [ ] MongoDB connection string copied
- [ ] Neo4j Aura account created
- [ ] Neo4j instance created and running
- [ ] Neo4j credentials saved
- [ ] Groq API account created
- [ ] Groq API key copied
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created with all credentials
- [ ] MongoDB seeded successfully
- [ ] Neo4j seeded successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login as buyer
- [ ] AI search works
- [ ] Recipe agent works
- [ ] Face login works (optional)
- [ ] Seller dashboard works
- [ ] Owner dashboard works

---

**🎉 Congratulations! Your SmarterBlinkit is now running!**

If you completed all steps, you should have a fully functional AI-powered grocery platform.

---

**Last Updated:** May 2026  
**Version:** 2.0.0
