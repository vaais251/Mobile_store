"""
PhoneMarket — FastAPI Application Entry Point.

Lifecycle:
  • startup  – verifies DB connectivity
  • shutdown – disposes engine pool

Mounts:
  • REST API under /api/v1 (via api_router)
  • WebSocket chat at /ws/chat/{order_id} (direct on app)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router as api_router
from app.core.config import get_settings
from app.core.database import engine
from app.routers.chat import websocket_chat

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup → yield → shutdown."""
    # Startup: test DB connection
    async with engine.connect() as conn:
        await conn.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )
    yield
    # Shutdown: dispose connection pool
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Phone Marketplace – Admin-Mediated Trading Platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── REST Routers ────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# ─── WebSocket Routes ────────────────────────
app.websocket("/ws/chat/{order_id}")(websocket_chat)


@app.get("/", tags=["Root"])
async def root():
    """Root redirect / welcome endpoint."""
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
    }
