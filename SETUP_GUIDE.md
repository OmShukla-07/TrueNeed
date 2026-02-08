# TrueNeed - Complete Setup Guide

## 🎯 What We Built

1. **Django REST API Backend** (Port 8000)
   - Email/password authentication
   - JWT token system
   - User registration & login
   - Django admin panel
   - CORS enabled for React

2. **React Frontend Integration**
   - API service (`src/api.js`)
   - Login/Signup forms connected
   - Token management (auto-refresh)
   - User state management
   - Protected routes ready

## 🚀 Running the Project

### Start Backend (Terminal 1)

```bash
cd backend
.\venv\Scripts\python.exe manage.py runserver
```

Server: `http://localhost:8000`
Admin: `http://localhost:8000/admin/`

### Start Frontend (Terminal 2)

```bash
npm run dev
```

Frontend: `http://localhost:3000`

## 🧪 Testing Authentication

### 1. Create Account
1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "testpass123"
4. Click "Sign Up"
5. You'll be logged in automatically
6. Navbar shows "Hi, Test" with Logout button

### 2. Login
1. Click "Logout" (if logged in)
2. Click "Login"
3. Enter credentials
4. Click "Login"
5. Logged in successfully

### 3. Test API Directly

Using curl or Postman:

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@test.com\",\"password\":\"pass123\",\"password2\":\"pass123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@test.com\",\"password\":\"pass123\"}"
```

**Get User Info:**
```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 📁 File Structure

```
TrueNeed/
├── backend/                 # Django REST API
│   ├── config/             # Settings
│   ├── users/              # Auth app
│   ├── venv/               # Python env
│   ├── manage.py
│   ├── db.sqlite3          # Database
│   └── README.md
│
├── src/                    # React frontend
│   ├── api.js              # ✨ NEW: API service
│   ├── App.jsx             # Updated with auth
│   ├── App.css             # Auth panel styles
│   └── ...
│
├── package.json
└── vite.config.js
```

## 🔐 What's Working

### Backend APIs ✅
- `POST /api/auth/register/` - Create account
- `POST /api/auth/login/` - Login
- `GET /api/auth/me/` - Get user info
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/token/refresh/` - Refresh token
- Admin panel at `/admin/`

### Frontend Features ✅
- Login form with validation
- Signup form with validation
- Auto-login after signup
- Token storage in localStorage
- Auto token refresh on expiry
- User greeting in navbar
- Logout functionality
- Error handling & display
- Loading states
- Theme-aware auth panels
- Social login UI (Google/Apple/Microsoft)

### Security ✅
- Password hashing (bcrypt)
- JWT tokens (60min access, 24h refresh)
- CORS protection
- CSRF protection
- Input validation
- SQL injection protection (ORM)

## 🎨 UI Features

### Auth Panels
- ✅ Slide from right animation
- ✅ Blurred backdrop
- ✅ Real Google/Apple/Microsoft logos
- ✅ Theme support (light/dark)
- ✅ Mobile responsive
- ✅ Error messages
- ✅ Loading states
- ✅ Switch between login/signup

### Navbar
- Shows "Hi, [Name]" + Logout when logged in
- Shows Login + Sign Up when logged out
- Theme toggle always visible

## ⚙️ Configuration

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production-TrueNeed2026
FRONTEND_URL=http://localhost:3000

# Database (using SQLite for now)
# Switch to PostgreSQL later

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60          # 60 minutes
JWT_REFRESH_TOKEN_LIFETIME=1440       # 24 hours
```

### Frontend (api.js)
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 🔄 Token Flow

1. User registers/logs in
2. Backend returns access + refresh tokens
3. Frontend stores tokens in localStorage
4. Frontend adds `Authorization: Bearer <token>` to requests
5. When access token expires (60min):
   - Frontend auto-calls refresh endpoint
   - Gets new access token
   - Retries original request
6. When refresh token expires (24h):
   - User must login again

## 🐛 Common Issues

### CORS Error
- Backend must be running on port 8000
- Check `FRONTEND_URL` in backend `.env`

### Token Expired
- Frontend auto-refreshes
- If refresh fails, user logs out

### Login/Signup Not Working
- Check browser console for errors
- Verify backend is running
- Check network tab for API responses

### User Not Persisting
- Check localStorage in browser DevTools
- Look for `access_token`, `refresh_token`, `user`

## 📊 Admin Panel

Access: `http://localhost:8000/admin/`

**Credentials:**
- Email: `admin@trueneed.com`
- Password: `admin` (change this!)

**What You Can Do:**
- View all users
- Edit user details
- Deactivate accounts
- View login history
- Grant admin permissions

## 🚧 Next Steps (n8n Integration - LAST)

### Chat System
1. Create n8n workflow for chat
2. Get webhook URL
3. Add to `.env`: `N8N_CHAT_WEBHOOK_URL=...`
4. Create backend endpoint to forward to n8n
5. Update frontend `chatAPI.sendMessage()`

### Product Analysis
1. Create n8n workflow for scraping
2. Get webhook URL
3. Add to `.env`: `N8N_ANALYZE_WEBHOOK_URL=...`
4. Create backend endpoint
5. Update frontend `productAPI.analyzeProduct()`

### Implementation Pattern
```python
# backend/chat/views.py
import httpx
from decouple import config

async def chat_message(request):
    webhook_url = config('N8N_CHAT_WEBHOOK_URL')
    async with httpx.AsyncClient() as client:
        response = await client.post(webhook_url, json={
            'user_id': request.user.id,
            'message': request.data['message']
        })
    return Response(response.json())
```

## 🎉 What's Complete

✅ Django backend with JWT auth
✅ User registration & login
✅ React frontend integration
✅ Token management
✅ Auto token refresh
✅ User state persistence
✅ Protected routes
✅ Error handling
✅ Loading states
✅ Theme support
✅ Admin panel
✅ CORS configuration
✅ Security best practices

**Ready for n8n integration when you're ready!**

---

**Questions?**
- Check `backend/README.md` for API docs
- Review `src/api.js` for frontend implementation
- Test endpoints with Postman/curl
