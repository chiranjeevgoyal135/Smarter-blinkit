# ⚡ SmarterBlinkit - AI-Powered Grocery Platform

> **India's Most Intelligent Grocery Shopping Experience**  
> Built with React, Node.js, MongoDB, Neo4j, and Groq AI

---

## 🎯 Project Overview

**SmarterBlinkit** is a next-generation grocery delivery platform that leverages cutting-edge AI and graph databases to revolutionize how Indians shop for groceries. Unlike traditional e-commerce platforms, SmarterBlinkit understands **intent**, not just keywords.

### 🏆 Competition-Ready Features

This project showcases:
- ✅ **Advanced AI Integration** (Groq LLaMA 3.3 70B)
- ✅ **Graph Database** (Neo4j for product relationships)
- ✅ **Real-time Analytics** (Live owner dashboard)
- ✅ **Smart Inventory Management** (AI-powered barcode system)
- ✅ **Modern UI/UX** (Gradient-based design, smooth animations)
- ✅ **Multi-role Architecture** (Buyer, Seller, Owner)

---

## 🚀 Key Features

### 🤖 **1. AI Intent Search**
**Problem Solved:** Traditional search requires exact product names. Users think in situations, not SKUs.

**Our Solution:**
- Type "I have a cold" → Get medicines, tissues, honey, ginger
- Type "movie night" → Get popcorn, chips, cold drinks, chocolates
- Type "make pizza for 4" → Get all ingredients with quantities

**Tech Stack:** Groq AI (LLaMA 3.3 70B) + Custom prompt engineering

```javascript
// Example: User types "I have a cold"
AI Response: {
  matched: true,
  keyword: "cold remedy",
  suggestions: [
    { name: "Vicks VapoRub", reason: "Relieves congestion", emoji: "💊" },
    { name: "Honey", reason: "Soothes throat", emoji: "🍯" },
    { name: "Ginger", reason: "Natural remedy", emoji: "🫚" }
  ]
}
```

---

### 🍳 **2. Recipe Agent**
**Problem Solved:** Users don't know what ingredients they need for a dish.

**Our Solution:**
- Type any dish name (e.g., "Pizza for 4 people")
- AI breaks down ingredients with quantities
- Matches ingredients to available inventory
- One-click add all to cart

**Tech Stack:** Groq AI + Inventory matching algorithm

---

### 🔗 **3. Smart Product Pairing (Neo4j)**
**Problem Solved:** Users miss complementary products.

**Our Solution:**
- Graph database tracks "bought together" patterns
- Real-time relationship analysis
- Similar product suggestions when items are out of stock

**Tech Stack:** Neo4j Graph Database + Cypher queries

```cypher
// Example: Find products bought with "Bread"
MATCH (p1:Product {name: "Bread"})-[:BOUGHT_WITH]->(p2:Product)
RETURN p2.name, p2.price, p2.category
ORDER BY p2.popularity DESC
LIMIT 5
```

---

### 📦 **4. AI Barcode Inventory (Seller Dashboard)**
**Problem Solved:** Manual inventory management is time-consuming and error-prone.

**Our Solution:**
- Scan barcode or type manually
- AI generates product details (name, brand, category, emoji)
- Bulk update mode for fast restocking
- Low stock alerts
- Printable barcode labels

**Tech Stack:** Groq AI + MongoDB + Custom barcode generation

---

### 🛒 **5. Smart Cart Splitting**
**Problem Solved:** Items from multiple shops = multiple delivery fees.

**Our Solution:**
- AI analyzes cart items
- Finds optimal shop distribution
- Minimizes delivery fees
- Shows delivery time for each shop

**Tech Stack:** Custom optimization algorithm + MongoDB aggregation

---

### 💰 **6. Money Map (Owner Dashboard)**
**Problem Solved:** Owners need visual insights into spending patterns.

**Our Solution:**
- Interactive graph visualization
- Shows product relationships
- Revenue flow analysis
- Category-wise breakdown

**Tech Stack:** D3.js-style custom visualization + Neo4j

---

### 📊 **7. Live Analytics Dashboard**
**Problem Solved:** Owners need real-time business insights.

**Our Solution:**
- Live order feed (updates every 7 seconds)
- Top-selling products (last 1 hour)
- Revenue trends (15-min buckets)
- Top-rated shops across India
- Category performance breakdown

**Tech Stack:** MongoDB aggregation + Real-time polling

---

### 🎭 **8. Face Recognition Login**
**Problem Solved:** Typing passwords is slow and insecure.

**Our Solution:**
- One-click face login
- Uses OpenCV.js client-side library
- Works with any webcam
- Falls back to password if camera unavailable

**Tech Stack:** OpenCV.js + Haar Cascade Frontal Face Classifier

---

### 💳 **9. Razorpay Payment Integration**
**Problem Solved:** Secure payment processing.

**Our Solution:**
- Razorpay SDK integration
- Mock mode for testing (no real charges)
- Multiple payment methods (Card, UPI, COD)
- Order tracking with live countdown

**Tech Stack:** Razorpay API + Express.js webhooks

---

### 📍 **10. Location-Based Shop Selection**
**Problem Solved:** Users want fastest delivery from nearest shop.

**Our Solution:**
- Auto-detect user location
- Calculate distance to all shops
- Show delivery time estimates
- Switch shops with one click

**Tech Stack:** Geolocation API + Haversine distance formula

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Buyer   │  │  Seller  │  │  Owner   │  │  Login   │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │  (Face)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Inventory │  │ Payment  │  │Analytics │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↕                    ↕                    ↕
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   MongoDB    │    │    Neo4j     │    │   Groq AI    │
│  (Products,  │    │  (Product    │    │  (LLaMA 3.3  │
│   Orders,    │    │Relationships)│    │    70B)      │
│   Users)     │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - UI library
- **Vite** - Build tool (faster than CRA)
- **Framer Motion** - Smooth animations
- **React Icons** - Icon library
- **OpenCV.js** - Face recognition / detection

### **Backend**
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Neo4j Driver** - Graph database client
- **node-fetch** - HTTP client for AI APIs

### **Databases**
- **MongoDB Atlas** - Primary database (products, orders, users)
- **Neo4j AuraDB** - Graph database (product relationships)

### **AI/ML**
- **Groq Cloud** - Ultra-fast LLM inference (LLaMA 3.3 70B)
- **HuggingFace** - Embeddings API (optional)

### **Payment**
- **Razorpay** - Payment gateway (mock mode available)

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))
- Neo4j AuraDB account ([Sign up](https://neo4j.com/cloud/aura/))
- Groq API key ([Get free key](https://console.groq.com/))

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/smarter-blinkit.git
cd smarter-blinkit
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarter-blinkit

# Groq AI (Required for AI features)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Neo4j (Required for product pairing)
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Razorpay (Optional - uses mock mode if not provided)
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# HuggingFace (Optional - uses public API if not provided)
HF_API_TOKEN=hf_your_token
```

Seed databases:
```bash
# Seed MongoDB
npm run seed

# Seed Neo4j (creates product relationships)
node neo4j-seed.js
```

Start backend:
```bash
npm start
# Backend runs on http://localhost:5000
```

### **3. Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### **4. Open in Browser**
```
http://localhost:5173
```

---

## 👥 Demo Accounts

### **Buyer Account**
- **Email:** `buyer@test.com`
- **Password:** `buyer123`
- **Features:** AI search, recipe agent, cart splitting, checkout

### **Seller Account**
- **Email:** `seller@test.com`
- **Password:** `seller123`
- **Features:** Barcode inventory, AI product addition, analytics

### **Owner Account**
- **Email:** `owner@test.com`
- **Password:** `owner123`
- **Features:** Live dashboard, money map, top products, shop ratings

---

## 🎨 UI/UX Highlights

### **Design System**
- **Primary Color:** `#f6a623` (Orange - represents energy & freshness)
- **Dark Mode:** `#0a0f1e` (Owner dashboard)
- **Gradients:** Used throughout for modern feel
- **Typography:** Segoe UI (clean, professional)
- **Animations:** Framer Motion for smooth transitions

### **Key UI Features**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states with spinners
- ✅ Success/error feedback
- ✅ Smooth page transitions
- ✅ Hover effects on interactive elements
- ✅ Empty states with helpful messages
- ✅ Live data updates (owner dashboard)

---

## 📊 Database Schema

### **MongoDB Collections**

#### **users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed
  role: "buyer" | "seller" | "owner",
  shopId: String, // for sellers
  shopName: String, // for sellers
  createdAt: Date
}
```

#### **products**
```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  category: String,
  price: Number,
  unit: String,
  stock: Number,
  barcode: String,
  emoji: String,
  shopId: String,
  lowStockThreshold: Number,
  createdAt: Date
}
```

#### **orders**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  shopId: String,
  items: [{ productId, name, qty, price }],
  total: Number,
  status: "pending" | "confirmed" | "delivered",
  paymentId: String,
  createdAt: Date
}
```

### **Neo4j Graph Schema**

```cypher
// Nodes
(:Product {name, price, category, barcode})
(:Category {name})

// Relationships
(:Product)-[:BELONGS_TO]->(:Category)
(:Product)-[:BOUGHT_WITH {count}]->(:Product)
(:Product)-[:SIMILAR_TO {score}]->(:Product)
```

---

## 🔥 Performance Optimizations

1. **Groq AI** - 10x faster than OpenAI (uses LPU instead of GPU)
2. **MongoDB Indexing** - Indexed on `barcode`, `shopId`, `category`
3. **Neo4j Caching** - Frequently accessed relationships cached
4. **React Lazy Loading** - Components loaded on demand
5. **Debounced Search** - 600ms delay to reduce API calls
6. **Optimistic UI Updates** - Instant feedback before server response

---

## 🧪 Testing

### **Test AI Intent Search**
```bash
curl -X POST http://localhost:5000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{"query": "I have a cold"}'
```

### **Test Recipe Agent**
```bash
curl -X POST http://localhost:5000/api/recipe/suggest \
  -H "Content-Type: application/json" \
  -d '{"query": "Make pizza for 4 people"}'
```

### **Test Payment (Mock)**
```bash
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

---

## 🚧 Future Enhancements

- [ ] **Voice Search** - "Alexa, add milk to cart"
- [ ] **AR Product Preview** - See products in your kitchen
- [ ] **Subscription Model** - Weekly grocery auto-delivery
- [ ] **Social Sharing** - Share recipes with friends
- [ ] **Loyalty Program** - Points for every purchase
- [ ] **Multi-language** - Hindi, Tamil, Telugu support
- [ ] **Dark Mode** - For buyer/seller dashboards
- [ ] **PWA** - Install as mobile app
- [ ] **Push Notifications** - Order updates
- [ ] **Chat Support** - AI-powered customer service

---

## 🤝 Contributing

This is a competition project, but suggestions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is built for educational/competition purposes.

---

## 👨‍💻 Author

**Your Name**  
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Groq** - For blazing-fast AI inference
- **Neo4j** - For powerful graph database
- **MongoDB** - For flexible document storage
- **Razorpay** - For seamless payment integration
- **Blinkit** - For inspiration (we made it smarter! 😉)

---

## 📸 Screenshots

### Buyer Dashboard
![Buyer Dashboard](./screenshots/buyer-dashboard.png)
*AI Intent Search in action*

### Seller Dashboard
![Seller Dashboard](./screenshots/seller-dashboard.png)
*Barcode inventory management*

### Owner Dashboard
![Owner Dashboard](./screenshots/owner-dashboard.png)
*Live analytics and insights*

### Recipe Agent
![Recipe Agent](./screenshots/recipe-agent.png)
*One-click ingredient addition*

---

## 🎯 Competition Judging Criteria

### **Innovation** ⭐⭐⭐⭐⭐
- AI intent search (not just keyword matching)
- Graph database for product relationships
- Face recognition login
- Smart cart splitting

### **Technical Complexity** ⭐⭐⭐⭐⭐
- Multi-database architecture (MongoDB + Neo4j)
- Real-time analytics
- AI integration (Groq LLaMA 3.3 70B)
- Payment gateway integration

### **User Experience** ⭐⭐⭐⭐⭐
- Modern, gradient-based UI
- Smooth animations
- Intuitive navigation
- Helpful empty states

### **Business Impact** ⭐⭐⭐⭐⭐
- Solves real problems (intent search, inventory management)
- Scalable architecture
- Revenue optimization (cart splitting)
- Data-driven insights (owner dashboard)

---

## 📞 Support

Having issues? Check these:

1. **Backend not starting?**
   - Check `.env` file exists
   - Verify MongoDB URI is correct
   - Ensure port 5000 is free

2. **Frontend not loading?**
   - Run `npm install` in frontend folder
   - Check backend is running
   - Verify port 5173 is free

3. **AI features not working?**
   - Check `GROQ_API_KEY` in `.env`
   - Verify API key is valid
   - Check Groq API quota

4. **Face login not working?**
   - Allow camera permissions
   - Check models are in `/public/models`
   - Try in HTTPS (required for camera)

---

**Built with ❤️ for the competition**

⚡ **SmarterBlinkit** - Because grocery shopping should be intelligent, not just fast.
