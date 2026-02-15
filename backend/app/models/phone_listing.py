"""
PhoneMarket — Phone Listing Model.

Supports both **New** and **Used** phones via a single-table strategy with
nullable columns for type-specific fields.  The `phone_type` discriminator
determines which fields are relevant.

Location inherits from the seller by default but can be overridden per listing.
"""

import enum
import uuid

from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ENUM, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ListingStatus(str, enum.Enum):
    """Lifecycle status of a listing."""

    AVAILABLE = "available"
    SOLD = "sold"
    PENDING = "pending"


class PhoneType(str, enum.Enum):
    """Whether the phone is new or used."""

    NEW = "new"
    USED = "used"


class PhoneListing(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "phone_listings"

    # ─── Foreign Keys ─────────────────────────
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ─── Status & Type ────────────────────────
    status: Mapped[ListingStatus] = mapped_column(
        ENUM(ListingStatus, name="listing_status", create_type=True),
        nullable=False,
        default=ListingStatus.AVAILABLE,
    )
    phone_type: Mapped[PhoneType] = mapped_column(
        ENUM(PhoneType, name="phone_type", create_type=True),
        nullable=False,
    )

    # ─── Shared Tech Specs ───────────────────
    brand: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    ram_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    battery_capacity_mah: Mapped[int] = mapped_column(Integer, nullable=False)
    camera_resolution_mp: Mapped[int] = mapped_column(Integer, nullable=False)
    thumbnail_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    additional_images: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # ─── Used-Phone Specific ─────────────────
    battery_health_percent: Mapped[int | None] = mapped_column(
        SmallInteger, nullable=True
    )
    pta_approved: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    is_locally_used: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True, comment="Whether the phone was used locally in Pakistan"
    )
    condition_rating: Mapped[int | None] = mapped_column(
        SmallInteger, nullable=True, comment="1-10 scale"
    )
    defects_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    accessories_included: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # ─── New-Phone Specific ──────────────────
    processor_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    warranty_period: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment="e.g. 12 months"
    )

    # ─── Location Override ───────────────────
    # When NULL, the API layer falls back to the Seller's location.
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_long: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ─── Relationships ───────────────────────
    seller = relationship("User", back_populates="listings")
    orders = relationship("Order", back_populates="listing", lazy="selectin")

    def __repr__(self) -> str:
        return f"<PhoneListing {self.brand} {self.model} [{self.status.value}]>"
