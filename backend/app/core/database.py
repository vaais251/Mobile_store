"""
PhoneMarket — Async Database Engine & Session Management.

Provides:
  • AsyncEngine (single instance, created at startup)
  • async_sessionmaker for request-scoped sessions
  • get_db — FastAPI dependency that yields an AsyncSession
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

settings = get_settings()

# ─── Engine ───────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

# ─── Session Factory ─────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ─── Dependency ──────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a transactional async session, rolling back on error."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
