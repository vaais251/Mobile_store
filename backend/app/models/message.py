"""
PhoneMarket — Message / Chat Model.

Admin-Mediated Communication:
  All conversations are routed through an Admin user.  The data model stores
  sender_id, optional receiver_id, and the related order_id so that the API
  layer can enforce channel rules (Admin↔Buyer and Admin↔Seller) while keeping
  a single, auditable message table.

  The `recipient_type` field controls message visibility:
    • GROUP       — everyone on the order sees it
    • BUYER_ONLY  — only buyer + admins
    • SELLER_ONLY — only seller + admins
    • ADMIN_ONLY  — internal admin notes
"""

import enum
import uuid

from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MessageType(str, enum.Enum):
    """Content type of the message."""

    TEXT = "text"
    IMAGE = "image"
    SYSTEM = "system"  # auto-generated status updates


class RecipientType(str, enum.Enum):
    """Who should see this message within the order chat."""

    GROUP = "group"
    BUYER_ONLY = "buyer_only"
    SELLER_ONLY = "seller_only"
    ADMIN_ONLY = "admin_only"


class Message(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "messages"

    # ─── Participants ─────────────────────────
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    receiver_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # ─── Order Context ───────────────────────
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ─── Content ─────────────────────────────
    message_type: Mapped[MessageType] = mapped_column(
        ENUM(MessageType, name="message_type", create_type=True),
        nullable=False,
        default=MessageType.TEXT,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ─── Recipient Visibility ────────────────
    recipient_type: Mapped[RecipientType] = mapped_column(
        ENUM(RecipientType, name="recipient_type", create_type=True),
        nullable=False,
        default=RecipientType.GROUP,
    )
    is_system_message: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    # ─── Relationships ───────────────────────
    sender = relationship(
        "User",
        back_populates="sent_messages",
        foreign_keys=[sender_id],
    )
    receiver = relationship(
        "User",
        back_populates="received_messages",
        foreign_keys=[receiver_id],
    )
    order = relationship("Order", back_populates="messages")

    def __repr__(self) -> str:
        return f"<Message {self.id} from={self.sender_id} type={self.recipient_type.value}>"
