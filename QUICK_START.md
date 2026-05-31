# ⚡ SmarterBlinkit - Quick Start Guide

**Get up and running in 5 minutes!**

---

## 🚀 Fastest Way to Start

### Windows Users
```bash
# Double-click this file:
start.bat
```

That's it! The script will:
1. Check Node.js installation
2. Install dependencies (if needed)
3. Start backend server
4. Start frontend server
5. Open browser automatically

---

## 🖥️ Manual Start (All Platforms)

### Step 1: Start Backend
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
```

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173/
```

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 🔐 Login & Test

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Buyer | `buyer@test.com` | `buyer123` |
| Seller | `seller@test.com` | `seller123` |
| Owner | `owner@test.com` | `owner123` |

### Quick Test
1. **Login as Buyer**
2. **Type:** `I have a cold`
3. **See:** AI-suggested products
4. **Success!** ✅

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check if .env file exists
ls backend/.env

# If not, create it with your credentials
# See SETUP_GUIDE.md for details
```

### Frontend won't start?
```bash
# Install dependencies
cd frontend
npm install

# Try again
npm run dev
```

### Port already in use?
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

---

## 📚 Full Documentation

- **Complete Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **All Features:** [FEATURES.md](./FEATURES.md)
- **Competition Guide:** [COMPETITION_GUIDE.md](./COMPETITION_GUIDE.md)
- **Demo Cheatsheet:** [DEMO_CHEATSHEET.md](./DEMO_CHEATSHEET.md)
- **Project Status:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## 🎯 What to Do Next?

### For Development
1. Read [FEATURES.md](./FEATURES.md) to understand all features
2. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
3. Explore the code in `backend/` and `frontend/src/`

### For Competition
1. Read [COMPETITION_GUIDE.md](./COMPETITION_GUIDE.md)
2. Print [DEMO_CHEATSHEET.md](./DEMO_CHEATSHEET.md)
3. Practice demo 10 times
4. Go win! 🏆

---

## 📞 Need Help?

**Check these in order:**
1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
2. [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current status & known issues
3. Backend logs - Check terminal where backend is running
4. Frontend logs - Check browser console (F12)

---

## ✅ Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] `.env` file created in `backend/` folder
- [ ] MongoDB URI added to `.env`
- [ ] Groq API key added to `.env`
- [ ] Neo4j credentials added to `.env`
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login as buyer
- [ ] AI search works

---

**🎉 You're all set! Happy coding!**
