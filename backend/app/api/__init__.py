"""
PhoneMarket — API Router Registry.

All sub-routers are included here and mounted on the app via a single import.
"""

from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.listings import router as listings_router
from app.routers.orders import router as orders_router

router = APIRouter()

# ─── Include Sub-Routers ─────────────────────
router.include_router(auth_router)
router.include_router(chat_router)
router.include_router(listings_router)
router.include_router(orders_router)


@router.get("/health", tags=["System"])
async def health_check():
    """Lightweight health-check endpoint for Docker / load-balancer probes."""
    return {"status": "healthy", "service": "PhoneMarket API"}
