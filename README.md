# RSL POS

Point-of-Sale system for small and medium retail shops in Nairobi, built by Ryantech Solutions Limited.

## Tech Stack

- **Backend:** Django REST Framework + PostgreSQL
- **Frontend:** React
- **Auth:** JWT (djangorestframework-simplejwt)
- **Payments:** Cash + M-Pesa (Daraja API)
- **Database:** PostgreSQL (Docker for local dev)

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
├── frontend/                 # React app
│   └── src/
│       ├── api/              # Axios, API helpers
│       ├── components/       # Reusable UI
│       ├── pages/            # Route views
│       ├── hooks/            # Custom hooks
│       ├── context/          # Auth, cart state
│       └── utils/            # Formatters, helpers
├── docs/
│   └── POS.pdf               # Original project brief
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
npm start
```

## Git Workflow

- Use feature branches: `feat/branch-name`
- Meaningful commits: `feat: add product management`
- PRs for reviewed changes before merging to `main`
- Never commit `.env` files, passwords, or API keys
