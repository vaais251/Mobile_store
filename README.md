# PhoneMarket — Used Mobile Marketplace

PhoneMarket is a specialized marketplace for used and new mobile phones, featuring real-time chat, admin-mediated transactions, and location-based searching.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Leaflet (Maps).
- **Backend**: FastAPI, PostgreSQL (PostGIS), SQLAlchemy, WebSockets.
- **Infrastructure**: Docker & Docker Compose.

---

## Prerequisites
Ensure you have the following installed:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js 18+](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/)

---

## Quick Start

### 1. Start Backend & Database
From the root directory, run:
```bash
docker-compose up --build -d
```
This starts:
- **PostgreSQL/PostGIS** on `localhost:5432`
- **FastAPI Backend** on `http://localhost:8000`
- **pgAdmin** on `http://localhost:5050`

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Setup & Seeding

### Create the first Super Admin
You can register an admin user via the [Swagger UI](http://localhost:8000/docs#/Auth/register_api_v1_auth_register_post) or by using `curl`:
```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Super Admin",
  "phone": "0300-1111111",
  "password": "adminpassword",
  "role": "admin"
}'
```

### Seed Dummy Data
To populate the app with test listings, users, and chats:
```bash
python seed_data.py
```
*(Requires `requests` library: `pip install requests`)*

---

## Project Structure
- `/frontend`: Next.js application.
- `/backend`: FastAPI application and models.
- `/docker-compose.yml`: Infrastructure orchestration.
