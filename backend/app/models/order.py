"""
PhoneMarket — Order Model.

Tracks the full transaction lifecycle:
  Created → Admin_Review → Meeting_Scheduled → Completed
                                              → Cancelled  (at any stage)

Each order links a Buyer, a Seller, and a specific PhoneListing.
"""

import enum
import uuid

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OrderStatus(str, enum.Enum):
    """Transaction lifecycle states."""

    CREATED = "created"
    ADMIN_REVIEW = "admin_review"
    MEETING_SCHEDULED = "meeting_scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    # ─── Foreign Keys ─────────────────────────
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("phone_listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ─── Status ──────────────────────────────
    status: Mapped[OrderStatus] = mapped_column(
        ENUM(OrderStatus, name="order_status", create_type=True),
        nullable=False,
        default=OrderStatus.CREATED,
    )

    # ─── Details ─────────────────────────────
    agreed_price: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    meeting_location: Mapped[str | None] = mapped_column(Text, nullable=True)
    meeting_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ─── Relationships ───────────────────────
    buyer = relationship(
        "User",
        back_populates="orders_as_buyer",
        foreign_keys=[buyer_id],
    )
    seller = relationship(
        "User",
        back_populates="orders_as_seller",
        foreign_keys=[seller_id],
    )
    listing = relationship("PhoneListing", back_populates="orders")
    messages = relationship("Message", back_populates="order", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Order {self.id} [{self.status.value}]>"
