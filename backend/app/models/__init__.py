"""
PhoneMarket — Model Registry.

Import all models here so that:
  1. Alembic's `target_metadata = Base.metadata` picks up every table.
  2. Application code can do `from app.models import User, PhoneListing, ...`.
"""

from app.models.base import Base  # noqa: F401
from app.models.message import Message, MessageType, RecipientType  # noqa: F401
from app.models.order import Order, OrderStatus  # noqa: F401
from app.models.phone_listing import (  # noqa: F401
    ListingStatus,
    PhoneListing,
    PhoneType,
)
from app.models.user import User, UserRole  # noqa: F401

__all__ = [
    "Base",
    "User",
    "UserRole",
    "PhoneListing",
    "ListingStatus",
    "PhoneType",
    "Order",
    "OrderStatus",
    "Message",
    "MessageType",
    "RecipientType",
]
