"""
PhoneMarket — User Model.

Roles:
  • Admin  – mediates all chats and reviews orders.
  • Buyer  – browses listings and initiates purchases.
  • Seller – lists phones (individual or shop).
"""

import enum

from sqlalchemy import Boolean, Float, String, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    """Allowed user roles."""

    ADMIN = "admin"
    BUYER = "buyer"
    SELLER = "seller"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    # ─── Identity ─────────────────────────────
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        ENUM(UserRole, name="user_role", create_type=True),
        nullable=False,
        default=UserRole.BUYER,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # ─── Seller-Specific ─────────────────────
    shop_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_individual: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ─── Address ──────────────────────────────
    address_street: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_city: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # ─── Location ─────────────────────────────
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_long: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ─── Relationships ───────────────────────
    listings = relationship("PhoneListing", back_populates="seller", lazy="selectin")
    orders_as_buyer = relationship(
        "Order",
        back_populates="buyer",
        foreign_keys="[Order.buyer_id]",
        lazy="selectin",
    )
    orders_as_seller = relationship(
        "Order",
        back_populates="seller",
        foreign_keys="[Order.seller_id]",
        lazy="selectin",
    )
    sent_messages = relationship(
        "Message",
        back_populates="sender",
        foreign_keys="[Message.sender_id]",
        lazy="selectin",
    )
    received_messages = relationship(
        "Message",
        back_populates="receiver",
        foreign_keys="[Message.receiver_id]",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User {self.name} ({self.role.value})>"
