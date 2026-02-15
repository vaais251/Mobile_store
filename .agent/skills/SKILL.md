---
name: PhoneMarket Project Context
description: Full project knowledge for the PhoneMarket (SMobie) used-mobile marketplace — architecture, tech stack, data models, API, frontend, dev workflows, and conventions.
---

# PhoneMarket — Project Skill

> **Pakistan's admin-mediated mobile phone marketplace** with real-time chat, geo-proximity search, and role-based access control.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
│  ┌──────────────┐   ┌──────────────┐                   │
│  │ PostgreSQL 16 │◄──│ FastAPI      │  REST /api/v1     │
│  │ (Alpine)      │   │ Backend      │  WS   /ws/chat/   │
│  │ Port: 5432    │   │ Port: 8000   │                   │
│  └──────────────┘   └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
         ▲                    ▲
         │                    │ HTTP + WebSocket
         │              ┌─────┴──────┐
         │              │ Next.js 14 │  Port: 3000
         │              │ Frontend   │
         │              └────────────┘
         │
    Alembic Migrations
```

- **Monorepo** at `d:\Coding playGround\Startup\01_SMobie`
- Backend: `./backend/` — FastAPI + async SQLAlchemy + Alembic
- Frontend: `./frontend/` — Next.js 14 + Tailwind CSS 3 + Framer Motion
- Infrastructure: `docker-compose.yml` orchestrates PostgreSQL + Backend

---

## 2. Tech Stack

### Backend
| Layer           | Technology                                      |
|-----------------|-------------------------------------------------|
| Framework       | FastAPI 0.115.6 (async)                         |
| Runtime         | Python 3.12, Uvicorn 0.34.0                     |
| ORM             | SQLAlchemy 2.0.36 (async via `asyncpg`)         |
| Migrations      | Alembic 1.14.1                                  |
| Auth            | JWT (`python-jose`), bcrypt (`passlib`)         |
| Config          | `pydantic-settings` (env-based)                 |
| WebSocket       | FastAPI native + custom `WebSocketManager`      |
| Validation      | Pydantic v2 schemas                             |
| Dockerfile      | `python:3.12-slim`, non-root user, gcc+libpq    |

### Frontend
| Layer           | Technology                                      |
|-----------------|-------------------------------------------------|
| Framework       | Next.js 14.2.21 (App Router)                    |
| Language        | TypeScript 5.7                                  |
| Styling         | Tailwind CSS 3.4.17 + custom design tokens      |
| State           | Zustand 5.0.3                                   |
| HTTP Client     | Axios 1.7.9 (JWT interceptor)                   |
| Animations      | Framer Motion 11.18                             |
| Maps            | Leaflet 1.9.4 + react-leaflet 4.2.1            |
| Icons           | Lucide React 0.469                              |
| Font            | Inter (Google Fonts, `--font-inter` CSS var)    |

### Infrastructure
| Service         | Details                                         |
|-----------------|-------------------------------------------------|
| Database        | PostgreSQL 16 Alpine on Docker                  |
| Container       | `phonemarket_db`, `phonemarket_backend`         |
| Network         | `phonemarket_net` (bridge)                      |
| Volumes         | `postgres_data` (persistent)                    |

---

## 3. Project File Structure

```
01_SMobie/
├── .env                    # Environment variables (gitignored)
├── .env.example            # Template for .env
├── .gitignore
├── README.md
├── docker-compose.yml      # PostgreSQL 16 + FastAPI backend
├── run_project.sh          # One-click launch script
├── seed_data.py            # Populates test data via API calls
│
├── backend/
│   ├── Dockerfile          # Python 3.12-slim, non-root
│   ├── requirements.txt    # Pinned deps
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── main.py             # Thin entry: `uvicorn app.main:app`
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/       # 5 migration files
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI app factory (CORS, lifespan, routers)
│   │   ├── api/
│   │   │   └── __init__.py # Router registry (auth, chat, listings, orders + /health)
│   │   ├── core/
│   │   │   ├── config.py   # Settings (pydantic-settings, lru_cache singleton)
│   │   │   ├── database.py # AsyncEngine, sessionmaker, get_db dependency
│   │   │   └── security.py # JWT create/decode, bcrypt hash/verify, get_current_user
│   │   ├── models/
│   │   │   ├── __init__.py # Model registry (imports all for Alembic)
│   │   │   ├── base.py     # Base, UUIDPrimaryKeyMixin, TimestampMixin
│   │   │   ├── user.py     # User model (roles: admin/buyer/seller)
│   │   │   ├── phone_listing.py  # PhoneListing (new/used, location, JSONB images)
│   │   │   ├── order.py    # Order (lifecycle: created→admin_review→meeting→completed)
│   │   │   └── message.py  # Message (admin-mediated chat with recipient_type)
│   │   ├── routers/
│   │   │   ├── auth.py     # register, login, me, update_me
│   │   │   ├── listings.py # create, search (Haversine geo), detail
│   │   │   ├── orders.py   # create, list, detail
│   │   │   └── chat.py     # REST history + WebSocket real-time
│   │   ├── schemas/
│   │   │   ├── user.py     # UserCreate, UserLogin, TokenResponse, UserOut, UserUpdate
│   │   │   ├── listing.py  # PhoneListingCreate, PhoneFilter, PhoneListingOut, Detail, ListResponse
│   │   │   ├── order.py    # OrderCreate, OrderOut
│   │   │   └── chat.py     # Chat message schemas
│   │   └── utils/
│   │       └── websocket_manager.py  # Connection tracking, room-based broadcast
│   └── tests/
│
└── frontend/
    ├── package.json
    ├── next.config.js      # API rewrites to localhost:8001, image remotes
    ├── tailwind.config.ts  # Custom design system tokens
    ├── tsconfig.json
    ├── postcss.config.js
    ├── app/
    │   ├── layout.tsx      # Root layout (Inter font, ClientProvider)
    │   ├── globals.css     # Global styles
    │   ├── page.tsx        # Home page (Hero, Browse by Brand, Near Me, Latest)
    │   ├── login/page.tsx  # Login form
    │   ├── search/page.tsx # Search with filters, sort, pagination, map toggle
    │   ├── sell/page.tsx   # Listing creation wizard
    │   ├── listings/       # Listing detail pages
    │   ├── chat/page.tsx   # Real-time chat interface
    │   ├── profile/page.tsx
    │   └── admin/
    │       ├── layout.tsx  # Admin sidebar navigation
    │       ├── page.tsx    # Dashboard redirect
    │       ├── dashboard/  # Admin stats dashboard
    │       ├── users/      # User management
    │       ├── orders/     # Order management
    │       ├── chats/      # Chat moderation
    │       └── reports/    # Reports view
    ├── components/
    │   ├── Navbar.tsx       # Navigation bar (role-aware: Login/Admin/Sell)
    │   ├── Footer.tsx       # Site footer
    │   ├── HeroSection.tsx  # Landing hero with search
    │   ├── PhoneCard.tsx    # Listing card (supports multiple variants)
    │   ├── CitySelector.tsx # Pakistani city picker
    │   ├── auth/
    │   │   └── RequireAuth.tsx  # Auth guard wrapper
    │   ├── listing/
    │   │   ├── ListingWizard.tsx   # Multi-step listing creation
    │   │   ├── ListingDetails.tsx  # Full listing view
    │   │   └── SimilarListings.tsx # Related listings
    │   ├── chat/
    │   │   ├── ChatSidebar.tsx     # Conversation list
    │   │   └── MessageBubble.tsx   # Chat message UI
    │   ├── admin/
    │   │   └── StatCard.tsx        # Dashboard metric cards
    │   ├── providers/
    │   │   └── client-provider.tsx # Client-side wrapper (Zustand, etc.)
    │   └── ui/
    │       ├── button.tsx          # Reusable button component
    │       ├── Map.tsx             # Leaflet map wrapper (dynamic import)
    │       └── MapInner.tsx        # Map rendering logic
    ├── hooks/
    │   └── useChatWebSocket.ts     # WebSocket hook for real-time chat
    └── lib/
        ├── api.ts                  # Axios instance (JWT interceptor, 401 handling)
        ├── upload.ts               # ListingFormData interface + submitListing()
        ├── utils.ts                # Utility functions
        └── pakistani-cities.ts     # City data for location features
```

---

## 4. Data Models & Enums

### User
- **Roles**: `admin`, `buyer`, `seller`
- **Fields**: name, phone (unique, Pakistani format validated), email, hashed_password, shop_name, is_individual, address_street, address_city, location_lat/long
- **Relationships**: listings (seller), orders_as_buyer, orders_as_seller, sent_messages, received_messages
- **Primary Key**: UUID (`UUIDPrimaryKeyMixin`)
- **Timestamps**: created_at, updated_at (`TimestampMixin`)

### PhoneListing
- **Types**: `new`, `used` (via `PhoneType` enum)
- **Status**: `available`, `sold`, `pending` (via `ListingStatus` enum)
- **Shared fields**: brand, model, price (Numeric 12,2), ram_gb, storage_gb, battery_capacity_mah, camera_resolution_mp, thumbnail_image, additional_images (JSONB)
- **Used-specific**: battery_health_percent, pta_approved, is_locally_used, condition_rating (1-10), defects_description, accessories_included (JSONB)
- **New-specific**: processor_name, warranty_period
- **Location**: lat/long override (falls back to seller's location)
- **Validation**: `PhoneListingCreate` schema enforces type-specific required fields

### Order
- **Status lifecycle**: `created` → `admin_review` → `meeting_scheduled` → `completed` | `cancelled`
- **Links**: buyer_id, seller_id, listing_id (all UUID FKs)
- **Fields**: agreed_price, meeting_location, meeting_notes, cancellation_reason
- **Privacy**: Seller's exact address is NEVER exposed; only city is returned

### Message
- **Types**: `text`, `image`, `system`
- **Recipient visibility**: `group`, `buyer_only`, `seller_only`, `admin_only`
- **Admin-mediated**: All chats route through admin; visibility filters enforce channel rules
- **Fields**: sender_id, receiver_id (optional), order_id, content, is_read, is_system_message

---

## 5. API Endpoints

### Authentication (`/api/v1/auth/`)
| Method | Endpoint     | Description              | Auth     |
|--------|-------------|--------------------------|----------|
| POST   | `/register`  | Create user account      | Public   |
| POST   | `/login`     | Get JWT token            | Public   |
| GET    | `/me`        | Current user profile     | Required |
| PUT    | `/me`        | Update profile           | Required |

- Login uses **phone + password** (not email)
- JWT payload: `{ sub: user_id, role, name }`
- Token expiry: 24 hours
- Phone validation: Pakistani `0XXX-XXXXXXX` or E.164 `+XXXXXXXXXXX`

### Listings (`/api/v1/listings/`)
| Method | Endpoint          | Description                         | Auth     |
|--------|-------------------|-------------------------------------|----------|
| POST   | `/`               | Create listing (sellers only)       | Required |
| GET    | `/`               | Search with filters + geo-proximity | Public   |
| GET    | `/{listing_id}`   | Listing detail view                 | Public   |

- **Search filters**: brand, phone_type, status, price_min/max, ram_gb (array), storage_gb, pta_approved, is_locally_used
- **Geo-proximity**: lat, long, radius_km — uses **Haversine formula** in SQL
- **Pagination**: page, page_size (default 20, max 100)
- **Location resolution**: listing-level override → seller fallback

### Orders (`/api/v1/orders/`)
| Method | Endpoint          | Description                     | Auth     |
|--------|-------------------|---------------------------------|----------|
| POST   | `/`               | Request purchase (buyers only)  | Required |
| GET    | `/`               | List user's orders              | Required |
| GET    | `/{order_id}`     | Order detail                    | Required |

- Only **buyers** can create orders
- Cannot order own listing
- Duplicate active order detection
- Listing status changes to `pending` on order creation

### Chat (`/api/v1/chat/` + WebSocket)
| Protocol | Endpoint                        | Description               | Auth     |
|----------|---------------------------------|---------------------------|----------|
| GET      | `/{order_id}/history`           | Paginated message history | Required |
| WS       | `/ws/chat/{order_id}?token=JWT` | Real-time chat            | Required |

- WebSocket protocol: Client sends `{ content, recipient_type, message_type }`
- Server saves to DB → broadcasts to eligible participants
- Messages filtered by role (buyers never see seller_only/admin_only, etc.)

### System
| Method | Endpoint        | Description      |
|--------|----------------|------------------|
| GET    | `/api/v1/health`| Health check     |
| GET    | `/`             | Root welcome     |

---

## 6. Security & Auth

- **Password hashing**: bcrypt via `passlib` (`CryptContext`)
- **JWT**: `python-jose`, HS256 algorithm
- **OAuth2 scheme**: `OAuth2PasswordBearer` with tokenUrl `/api/v1/auth/login`
- **Dependency**: `get_current_user` — extracts UUID from JWT `sub` claim, queries DB
- **Frontend**: JWT stored in `localStorage`, attached via Axios request interceptor
- **401 handling**: Axios response interceptor clears token and redirects to `/login`
- **CORS origins**: `localhost:3000`, `localhost:3001`, `localhost:3002`

---

## 7. Database

- **Engine**: PostgreSQL 16 Alpine (Docker) or local
- **Driver**: `asyncpg` (fully async)
- **Connection pool**: size=20, max_overflow=10, pool_pre_ping=True
- **Session pattern**: `get_db` dependency yields `AsyncSession`, auto-commits on success, rollbacks on error
- **Alembic migrations** in `backend/alembic/versions/`:
  - `7ecbee53ff48_initial.py` — initial schema
  - `663534e2040c_add_hashed_password.py`
  - `a1b2c3d4e5f6_add_is_locally_used.py`
  - `d8750f73a2b8_make_address_fields_required.py`
  - `f38ec14738e4_add_chat_recipient_type.py`

---

## 8. Frontend Design System

### Tailwind Color Tokens
| Token      | Default    | Purpose                        |
|------------|------------|--------------------------------|
| `primary`  | `#007AFF`  | Main CTA blue (full 50-900)    |
| `secondary`| `#F5F5F7`  | Background grays (full 50-900) |
| `accent`   | `#FF3B30`  | Alert red (full 50-900)        |
| `success`  | `#34C759`  | Green indicators (50, 500, 700)|
| `warning`  | `#FF9500`  | Orange warnings (50, 500, 700) |

### Design Tokens
- **Font**: Inter via CSS variable `--font-inter`
- **Shadows**: `premium`, `premium-lg`, `premium-xl`
- **Animations**: `fade-in`, `slide-up`, `scale-in`
- **Border radius**: `2xl`=1rem, `3xl`=1.25rem, `4xl`=1.5rem
- **Container**: centered, responsive padding, max-width screens

### Frontend API Layer
- Base URL: `NEXT_PUBLIC_API_URL` || `http://localhost:8000`
- Next.js rewrites: `/api/:path*` → `http://localhost:8000/api/:path*`
- Image remotes: `localhost:8000`
- Timeout: 15 seconds

---

## 9. Environment Variables

```env
# PostgreSQL
POSTGRES_USER=phonemarket_user
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=phonemarket_db
DB_PORT=5432

# Backend
BACKEND_PORT=8000
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@db:5432/phonemarket_db
APP_NAME=PhoneMarket
DEBUG=true
SECRET_KEY=<random-key>

# JWT (in config.py defaults)
JWT_SECRET_KEY=<jwt-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend (in next.config.js / .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## 10. Development Workflows

### Start Everything
```bash
# Option 1: Use the launch script
bash run_project.sh

# Option 2: Manual
docker-compose up -d --build      # DB + Backend
cd frontend && npm install && npm run dev  # Frontend
```

### Run Backend Only (dev)
```bash
docker-compose up -d db           # Start PostgreSQL only
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Migrations
```bash
cd backend
alembic upgrade head              # Apply all migrations
alembic revision --autogenerate -m "description"  # Create new migration
```

### Seed Test Data
```bash
pip install requests websockets
python seed_data.py
```
Creates: 1 admin, 2 sellers, 1 buyer, 5 listings, 1 order, 3 chat messages.

**Test credentials:**
| Role   | Phone          | Password      |
|--------|--------------- |---------------|
| Admin  | `0300-0000000` | `admin123`    |
| Seller | `0311-1234567` | `password123` |
| Seller | `0322-7654321` | `password123` |
| Buyer  | `0333-5555555` | `password123` |

### URLs
| Service   | URL                           |
|-----------|-------------------------------|
| Frontend  | http://localhost:3000          |
| Backend   | http://localhost:8000          |
| Swagger   | http://localhost:8000/docs     |
| ReDoc     | http://localhost:8000/redoc    |

---

## 11. Key Business Rules

1. **Admin-mediated transactions**: All communication between buyer and seller goes through admin. Admin can see all messages; buyers/sellers see only permitted channels.
2. **Seller address privacy**: Never expose seller's street address in API responses. Only city is shared in order responses.
3. **Phone type validation**: Used phones require `battery_health_percent`, `pta_approved`, `is_locally_used`, `condition_rating`. New phones require `processor_name`, `warranty_period`.
4. **Order constraints**: Only buyers can create orders. Cannot order own listing. Duplicate active order detection prevents double-orders. Listing status changes to `pending` when ordered.
5. **Location fallback**: Listing location defaults to seller's GPS coordinates unless explicitly overridden per listing.
6. **Pakistani phone format**: `0XXX-XXXXXXX` or international `+XXXXXXXXXXX` accepted.

---

## 12. Known Issues & Notes

- **Backend port**: Backend runs on port 8000. Frontend `api.ts` and `next.config.js` are configured to target port 8000. (Previously referenced port 8001 — fixed Feb 2026.)
- **Seed script**: `seed_data.py` hits `http://localhost:8000` — requires backend running on that port.
- **Seller registration**: The `address_street` and `address_city` fields are required for all user registrations. The seed script for sellers does not include `address_street`, which may cause 422 errors (fixed by adding default empty string in the seed data or making the field optional in seed payloads).
- **WebSocket chat seeding** requires `websockets` library: `pip install websockets`.
- **No file/image upload endpoint** yet — `ListingFormData` in `upload.ts` builds multipart `FormData` but the backend listings router currently accepts JSON, not multipart.
- **Tests directory** exists at `backend/tests/` but is currently empty (only `__init__.py`).

---

## 13. Naming Conventions

- **Backend**: Python snake_case for files, functions, variables. PascalCase for classes/models/schemas.
- **Frontend**: PascalCase for components (`PhoneCard.tsx`), camelCase for hooks (`useChatWebSocket.ts`), kebab-case for UI primitives (`client-provider.tsx`).
- **API prefix**: All REST endpoints under `/api/v1/`.
- **Database tables**: plural lowercase (`users`, `phone_listings`, `orders`, `messages`).
- **Enum values**: lowercase snake_case strings (`admin_review`, `buyer_only`).
