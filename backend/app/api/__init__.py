"""
PhoneMarket — API Router Registry.

All sub-routers are included here and mounted on the app via a single import.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check():
    """Lightweight health-check endpoint for Docker / load-balancer probes."""
    return {"status": "healthy", "service": "PhoneMarket API"}
