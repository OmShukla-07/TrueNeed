# TrueNeed Backend - Django REST API

Full-featured authentication backend for TrueNeed with JWT tokens.

## 🚀 Features

- ✅ Email-based authentication (no username required)
- ✅ JWT access & refresh tokens
- ✅ User registration and login
- ✅ Django admin panel
- ✅ CORS configured for React frontend
- ✅ Ready for OAuth integration (Google/Apple/Microsoft)
- ✅ Custom user model with future-proof fields

## 📦 Installation

### Prerequisites
- Python 3.8+
- pip
- PostgreSQL (optional, using SQLite for now)

### Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   .\venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies** (already done):
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations** (already done):
   ```bash
   python manage.py migrate
   ```

5. **Create superuser** (already done):
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server:**
   ```bash
   python manage.py runserver
   ```

Server will start at: `http://localhost:8000`

## 🔐 API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "password2": "securepassword123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "date_joined": "2026-02-07T..."
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJh...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
  },
  "message": "User registered successfully"
}
```

#### Login
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "user": { ... },
  "tokens": { ... },
  "message": "Login successful"
}
```

#### Get Current User
```
GET /api/auth/me/
Authorization: Bearer <access_token>

Response:
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "date_joined": "2026-02-07T..."
}
```

#### Refresh Token
```
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

#### Logout
```
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJ..."
}
```

## 🗂️ Project Structure

```
backend/
├── config/                # Django project settings
│   ├── settings.py       # Main configuration
│   ├── urls.py           # Main URL routing
│   └── wsgi.py           # WSGI application
│
├── users/                # User authentication app
│   ├── models.py         # Custom User model
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API endpoints
│   ├── urls.py           # User app URLs
│   └── admin.py          # Admin interface
│
├── venv/                 # Python virtual environment
├── manage.py             # Django management script
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── db.sqlite3            # SQLite database (dev only)
```

## 🎛️ Environment Variables

Create `.env` file in backend folder:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=trueneed_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Frontend
FRONTEND_URL=http://localhost:3000

# n8n Webhooks (add later)
N8N_CHAT_WEBHOOK_URL=
N8N_ANALYZE_WEBHOOK_URL=
```

## 🔧 Configuration

### Switch to PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE trueneed_db;
   ```

3. Update `.env` with your credentials

4. Uncomment PostgreSQL config in `config/settings.py`:
   ```python
   DATABASES = {
       "default": {
           "ENGINE": "django.db.backends.postgresql",
           ...
       }
   }
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

### Django Admin Panel

Access at: `http://localhost:8000/admin/`

Login with superuser credentials:
- Email: `admin@trueneed.com`
- Password: `admin` (change in production!)

## 📝 User Model

Custom user model with the following fields:

```python
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Future OAuth support
    oauth_provider = models.CharField(...)  # 'google', 'apple', 'microsoft'
    oauth_id = models.CharField(...)
```

## 🔗 Frontend Integration

The React frontend (`src/api.js`) is already configured to connect to this backend:

- Auto-refresh expired tokens
- Store tokens in localStorage
- Handle authentication errors
- CORS properly configured

## 🚧 TODO: n8n Integration (LAST STEP)

Will add later:
- Chat webhook endpoint
- Product analysis webhook
- Forward requests to n8n workflows
- Handle n8n responses

## 🐛 Troubleshooting

### Cannot connect to database
- Make sure PostgreSQL is running
- Check `.env` credentials
- Or use SQLite for development (already configured)

### CORS errors
- Verify `FRONTEND_URL` in `.env`
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`

### Token expired
- Frontend auto-refreshes tokens
- Check `JWT_ACCESS_TOKEN_LIFETIME` setting

## 📚 Dependencies

- Django 6.0.2 - Web framework
- djangorestframework 3.16.1 - REST API
- djangorestframework-simplejwt 5.5.1 - JWT auth
- django-cors-headers 4.9.0 - CORS handling
- python-decouple 3.8 - Environment variables
- psycopg2-binary 2.9.11 - PostgreSQL adapter
- httpx 0.28.1 - HTTP client (for n8n integration)

## 🎉 Status

✅ Django backend complete
✅ JWT authentication working
✅ Frontend integration ready
⏳ n8n webhooks pending (LAST STEP)
