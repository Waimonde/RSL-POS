# RSL POS

Point-of-Sale system for small and medium retail shops in Nairobi, built by Ryantech Solutions Limited.

## Tech Stack

- **Backend:** Django REST Framework + PostgreSQL
- **Frontend:** React
- **Auth:** JWT (djangorestframework-simplejwt)
- **Payments:** Cash + M-Pesa (Daraja API)

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
│   ├── reports/              # Analytics (models only)
│   ├── api/                  # API layer (standalone app)
│   │   ├── __init__.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── accounts.py
│   │   │   ├── inventory.py
│   │   │   ├── sales.py
│   │   │   └── ...
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── accounts.py
│   │   │   ├── inventory.py
│   │   │   ├── sales.py
│   │   │   └── ...
│   │   ├── urls.py
│   │   └── tests.py
│   ├── manage.py
│   ├── pyproject.toml
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
│   ├── POS.pdf               # Original brief
│   └── RSL_POS.md            # Implementation guide
├── docker-compose.yml        # PostgreSQL container
├── .gitignore
└── README.md
```

## Getting Started

**Backend:**

```bash
cd backend
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env
npm start
```
