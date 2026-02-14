"""
PhoneMarket — Order Schemas.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.order import OrderStatus


# ─── Creation ────────────────────────────────
class OrderCreate(BaseModel):
    """Buyer initiates a purchase request on a listing."""

    listing_id: uuid.UUID


# ─── Response ────────────────────────────────
class OrderOut(BaseModel):
    """
    Order response — returns city/general area only (NOT exact address).
    """

    id: uuid.UUID
    buyer_id: uuid.UUID
    seller_id: uuid.UUID
    listing_id: uuid.UUID
    status: OrderStatus
    agreed_price: float | None = None
    meeting_location: str | None = None
    meeting_notes: str | None = None
    cancellation_reason: str | None = None

    # Safe seller location (city only, no street)
    seller_city: str | None = None
    listing_brand: str | None = None
    listing_model: str | None = None
    listing_price: float | None = None

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
