"""
PhoneMarket — Chat Schemas.

Covers WebSocket inbound/outbound payloads and REST history responses.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.message import MessageType, RecipientType


# ─── WebSocket Inbound ───────────────────────
class ChatMessageIn(BaseModel):
    """Payload sent by a client over the WebSocket."""

    content: str = Field(..., min_length=1, max_length=4000)
    recipient_type: RecipientType = RecipientType.GROUP
    message_type: MessageType = MessageType.TEXT


# ─── Message Output (WS broadcast + REST) ───
class ChatMessageOut(BaseModel):
    """Serialised message sent over WS and returned via REST history."""

    id: uuid.UUID
    order_id: uuid.UUID
    sender_id: uuid.UUID
    sender_name: str
    sender_role: str
    content: str
    message_type: MessageType
    recipient_type: RecipientType
    is_system_message: bool = False
    is_read: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── REST History Response ───────────────────
class ChatHistoryResponse(BaseModel):
    """Paginated chat history."""

    messages: list[ChatMessageOut]
    total: int
    limit: int
    offset: int
    has_more: bool
