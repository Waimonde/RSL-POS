# RSL POS — Implementation Guide

> **Organization:** Ryantech Solutions Limited  
> **Project:** RSL Point-of-Sale (POS) System MVP  
> **Target Audience:** Engineering Attachés & AI Development Agents

---

## 1. Overview

RSL POS is a Point-of-Sale system for small and medium retail shops in Nairobi — clothing stores, boutiques, packaging sellers, and general merchandise shops. This document covers how the MVP will be implemented across the backend (Django REST Framework) and frontend (React).

**Golden Path:** `LOGIN → PRODUCTS → STOCK → SALE → PAYMENT → RECEIPT → REPORT`

---

## 2. Tech Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Backend** | Django REST Framework | Built-in admin, ORM, mature ecosystem, strong community |
| **Frontend** | React | Component-driven UI, fast iteration, wide library support |
| **Database** | PostgreSQL | ACID compliance for transactional POS data |
| **Auth** | JWT via `djangorestframework-simplejwt` | Stateless tokens, role-based access control |
| **Payments** | M-Pesa (Daraja API) + Cash | Modular payment driver pattern for extensibility |
| **Deployment** | Nginx + Gunicorn on `*.ryantech.co.ke` | HTTPS, reverse proxy, production-grade serving |
| **Package Manager** | uv | Fast Python package installer and project manager |
| **Dev Database** | PostgreSQL via Docker | Containerized DB for local development |

---

## 3. Project Structure

```
rsl_pos/
├── backend/
│   ├── config/                  # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/                # Users, roles, auth (models only)
│   ├── inventory/               # Products, categories, stock (models only)
│   ├── sales/                   # POS transactions (models only)
│   ├── payments/                # Cash, M-Pesa (models only)
│   ├── customers/               # Customer profiles (models only)
│   ├── suppliers/               # Supplier records (models only)
│   ├── reports/                 # Analytics (models only)
│   ├── api/                     # API layer (standalone app)
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
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios instance, API helpers
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level views
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # Auth context, cart context
│   │   └── utils/               # Formatters, helpers
│   ├── public/
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── POS.pdf                  # Original project brief
│   └── RSL_POS.md               # This file
├── .gitignore
├── docker-compose.yml            # PostgreSQL container
└── README.md
```

---

## 4. Backend Implementation (Django REST Framework)

### 4.1 Apps Breakdown

The `api` app is a standalone Django app at the backend root that owns all API logic — serializers, views, and URL routing. Domain apps (`accounts`, `inventory`, `sales`, etc.) contain only models and admin. The `api` app imports models from the domain apps and exposes them through REST endpoints.

| App | Models | Key Endpoints |
| :--- | :--- | :--- |
| `accounts` | `User` | `POST /api/auth/login/`, `POST /api/auth/refresh/`, `GET /api/users/` |
| `inventory` | `Category`, `Product`, `StockMovement` | `GET/POST /api/products/`, `GET/PUT /api/products/{id}/`, `POST /api/stock-receive/` |
| `sales` | `Sale`, `SaleItem` | `POST /api/sales/`, `GET /api/sales/{id}/`, `GET /api/sales/` |
| `payments` | `Payment` | `POST /api/payments/`, `POST /api/mpesa/callback/` |
| `customers` | `Customer` | `GET/POST /api/customers/`, `GET /api/customers/{id}/` |
| `suppliers` | `Supplier`, `Purchase`, `PurchaseItem` | `GET/POST /api/suppliers/`, `POST /api/purchases/` |
| `reports` | (read-only views) | `GET /api/reports/daily/`, `GET /api/reports/sales/` |

### 4.2 Models (Django ORM)

```python
# accounts/models.py
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=[('admin','Admin'),('cashier','Cashier')])
    status = models.CharField(max_length=20, choices=[('active','Active'),('inactive','Inactive')])

# inventory/models.py
class Category(models.Model):
    name = models.CharField(max_length=100)

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=100, blank=True)
    buying_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10)

class StockMovement(models.Model):
    MOVEMENT_TYPES = [('in','Stock In'),('out','Stock Out'),('adjustment','Adjustment')]
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=200)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

# sales/models.py
class Sale(models.Model):
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    customer = models.ForeignKey('customers.Customer', on_delete=models.SET_NULL, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('completed','Completed'),('refunded','Refunded')])

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

# payments/models.py
class Payment(models.Model):
    PAYMENT_METHODS = [('cash','Cash'),('mpesa','M-Pesa')]
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference_code = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('success','Success'),('failed','Failed')])
```

### 4.3 Authentication & Permissions

- Login returns JWT access + refresh tokens via `djangorestframework-simplejwt`.
- Custom permission classes: `IsAdmin`, `IsCashier`, `IsAdminOrReadOnly`.
- Frontend stores tokens in `localStorage`; attaches `Authorization: Bearer <token>` header.
- Role checks enforced at both view and serializer level.

### 4.4 Key Business Logic (Backend)

- **Sale completion:** Wrap `Sale`, `SaleItem`, `Payment`, and `StockMovement` creation in a `transaction.atomic()` block to ensure all-or-nothing consistency.
- **Stock deduction:** Decrease `Product.quantity` on each `SaleItem` and log a `stock_movements` entry.
- **Negative stock guard:** Validate in the `Sale` serializer that no item reduces stock below zero.
- **Returns:** Create a `Sale` with status `refunded`, reverse stock via `StockMovement`, and record a negative `Payment`.

---

## 5. Frontend Implementation (React)

### 5.1 Pages & Routing

| Route | Page | Access |
| :--- | :--- | :--- |
| `/login` | Login screen | Public |
| `/` | Dashboard (today's sales, low stock) | Admin + Cashier |
| `/pos` | POS cashier interface (cart, search, checkout) | Cashier |
| `/products` | Product management (CRUD, categories) | Admin |
| `/inventory` | Stock levels, stock receiving | Admin |
| `/customers` | Customer list and profiles | Admin |
| `/suppliers` | Supplier management | Admin |
| `/reports` | Sales and inventory reports | Admin |
| `/settings` | User management, system config | Admin |

### 5.2 Key Components

- **POS Screen:** Product search bar, product grid, cart table, payment modal, receipt preview.
- **Product Form:** Add/edit product with category dropdown, price fields, barcode input.
- **Dashboard Cards:** Today's revenue, transaction count, low-stock alerts, top-selling products.
- **Receipt:** Printable layout using CSS `@media print` or `react-to-print`.

### 5.3 State Management

- **Auth Context:** Stores user info + JWT tokens, provides `login()`/`logout()` helpers.
- **Cart Context:** Manages cart items, quantities, discounts, and totals for the POS screen.
- **API Layer:** Centralized Axios instance with interceptors for token refresh and error handling.

### 5.4 UI Approach

- Tailwind CSS for rapid, responsive styling.
- Mobile-first design — the POS screen must work on tablets used by cashiers.
- Toast notifications for success/error feedback on actions.

---

## 6. M-Pesa Integration

1. Complete cash payments first.
2. Add `reference_code`, `phone_number`, `transaction_status` to the `Payment` model.
3. Implement STK Push endpoint: `POST /api/mpesa/stk-push/`.
4. Implement C2B callback: `POST /api/mpesa/callback/` — idempotent processing to avoid duplicates.
5. Use Daraja API sandbox for testing, switch to production credentials on deploy.

---

## 7. Development Phases

| Phase | Focus | Backend | Frontend |
| :--- | :--- | :--- | :--- |
| 1 | Setup | Django project, DRF, DB connection | React boilerplate, routing, Tailwind |
| 2 | Database | Core models, migrations, seed data | — |
| 3 | Auth | JWT login, permissions, role checks | Login page, auth context, route guards |
| 4 | Products & Inventory | CRUD APIs, stock receiving, alerts | Product list/form, inventory view |
| 5 | POS Sales | Sale creation, stock deduction, atomic transactions | POS screen, cart, checkout flow |
| 6 | Payments & Receipts | Cash + M-Pesa endpoints | Payment modal, receipt view |
| 7 | Supporting Entities | Customers, suppliers, returns | Customer/supplier pages, return flow |
| 8 | Reports | Aggregation queries, analytics APIs | Dashboard cards, report tables |
| 9 | QA & Testing | Unit tests, API tests, edge cases | Component tests, user flow testing |
| 10 | Deployment | Gunicorn + Nginx, HTTPS, seed admin | Build, deploy static files |

---

## 8. Testing Strategy

### Backend
- Django test framework + DRF's `APITestCase`.
- Test models, serializers, and API endpoints.
- Verify: auth flows, role restrictions, sale atomicity, stock deduction, negative stock guard.

### Frontend
- Jest + React Testing Library for component tests.
- Test: login form, product search, cart operations, checkout flow.

### Manual QA Checklist
- [ ] Login with valid/invalid credentials; verify role-based redirection.
- [ ] Cashier cannot access admin-only pages.
- [ ] Create, edit, search, soft-delete products.
- [ ] Process stock receiving; verify quantity increases.
- [ ] Complete POS transaction; verify stock decreases.
- [ ] Test cart: add/remove items, quantity changes, discounts.
- [ ] Verify cash change calculation and receipt format.
- [ ] Process a return; verify stock adjustment.
- [ ] Dashboard metrics match real database rows.
- [ ] Responsive on desktop and tablet/mobile.

---

## 9. Deployment

- **Server:** Ubuntu VPS on `pos.ryantech.co.ke`
- **Web server:** Nginx (reverse proxy) → Gunicorn (Django)
- **Static files:** Served via Nginx or Whitenoise
- **Database:** PostgreSQL on same server (or managed service)
- **SSL:** Let's Encrypt certificate via Certbot
- **Environment variables:** `.env` file on server (never committed to Git)

---

## 10. Key Constraints

- Every sale must have at least one line item.
- Inventory must not go below zero (unless admin override).
- Every stock adjustment must create a `stock_movements` entry.
- Never hard-delete sales — use refunds/cancellations.
- All transactions must record the cashier's `user_id`.
- Secrets and API keys stay in `.env` — never committed.
