# RSL POS

Point-of-Sale system for small and medium retail shops in Nairobi, built by Ryantech Solutions Limited.

## Tech Stack

- **Backend:** Django REST Framework + PostgreSQL
- **Frontend:** React (JavaScript) + Vite + Tailwind CSS + shadcn/ui
- **Auth:** JWT (djangorestframework-simplejwt) with auto-refresh
- **Charts:** Recharts
- **Payments:** Cash + M-Pesa (Daraja API)
- **Database:** PostgreSQL (Docker for local dev)
- **Package Manager:** uv (Python), npm (frontend)

## Project Structure

```
rsl_pos/
├── backend/                  # Django REST API
│   ├── config/               # Project settings, urls, wsgi
│   ├── accounts/             # Users, roles, auth (models only)
│   ├── inventory/            # Products, categories, stock (models only)
│   ├── sales/                # POS transactions (models only)
│   ├── payments/             # Cash, M-Pesa (models only)
│   ├── customers/            # Customer profiles (models only)
│   ├── suppliers/            # Supplier records (models only)
│   ├── returns/              # Returns and refunds (models only)
│   ├── reports/              # Analytics (models only)
│   ├── api/                  # API layer (standalone app)
│   │   ├── __init__.py
│   │   ├── permissions.py    # IsAdmin, IsCashier, IsAdminOrReadOnly
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   └── accounts.py   # Login, User, UserList serializers
│   │   ├── views.py          # Auth views (login, refresh, users)
│   │   ├── urls.py
│   │   └── tests.py
│   ├── manage.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── uv.lock
│   └── .env.example
├── frontend/                 # React app (Vite + Tailwind + shadcn/ui)
│   ├── src/
│   │   ├── api/              # Axios with JWT interceptors
│   │   │   └── axios.js
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AppHeader.jsx
│   │   │   ├── AppLayout.jsx
│   │   │   ├── AppSidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ui/           # shadcn/ui base components
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── use-mobile.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── POS.pdf               # Original project brief
│   └── RSL_POS.md            # Implementation guide
├── docker-compose.yml        # PostgreSQL container
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.13+
- Docker (for PostgreSQL)
- Node.js 18+ (for frontend)

### Backend

```bash
cd backend
docker compose up -d          # Start PostgreSQL
uv sync                       # Install dependencies
cp .env.example .env          # Configure environment
uv run python manage.py migrate
uv run python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                   # Start Vite dev server
```

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login/` | Login, returns JWT tokens + user |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/users/me/` | Current user profile |

## Git Workflow

- Feature branches: `feat/branch-name`
- Commits: `feat: add product management`
- PRs for reviewed changes before merging to `main`
- Never commit `.env` files, passwords, or API keys
