#!/bin/bash
# ─────────────────────────────────────────────
# PhoneMarket — Launch Script
# ─────────────────────────────────────────────

set -e

echo "🚀  PhoneMarket — Starting Up"
echo ""

# ── 1. Check Docker ──────────────────────────
if ! docker info > /dev/null 2>&1; then
    echo "❌  Docker is not running."
    echo "   Please start Docker Desktop and try again."
    exit 1
fi
echo "✅  Docker is running"

# ── 2. Start Backend & DB ────────────────────
echo "📦  Starting containers (backend + database)..."
docker-compose up -d --build
echo "✅  Containers started"

# ── 3. Wait for Backend ──────────────────────
echo "⏳  Waiting for backend API..."
MAX_WAIT=60
ELAPSED=0
until curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs | grep -q "200"; do
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "⚠️  Backend did not respond within ${MAX_WAIT}s. Check Docker logs."
        break
    fi
    printf "."
done
echo ""
echo "✅  Backend API is ready at http://localhost:8000"

# ── 4. Install Frontend Deps ─────────────────
echo "📥  Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing npm packages..."
    npm install
fi

# ── 5. Start Frontend ────────────────────────
echo "🌐  Starting frontend dev server..."

# Platform-specific: open in new terminal if possible
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows / Git Bash
    start cmd //c "cd frontend && npm run dev"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'
else
    # Linux — run in background
    npm run dev &
fi

echo ""
echo "✨  PhoneMarket is launching!"
echo ""
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:8000/docs"
echo "   pgAdmin  → http://localhost:5050"
echo ""
echo "   Run 'python seed_data.py' to populate test data."
