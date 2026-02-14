"""
PhoneMarket — Chat Router.

REST:
  GET /chat/{order_id}/history — paginated message history (role-filtered)

WebSocket:
  WS /ws/chat/{order_id}?token=JWT — real-time chat with filtered broadcast

Graceful disconnect handling via try/finally around the receive loop.
"""

import json
import logging
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db
from app.core.security import decode_access_token, get_current_user
from app.models.message import Message, MessageType, RecipientType
from app.models.order import Order
from app.models.user import User, UserRole
from app.schemas.chat import ChatHistoryResponse, ChatMessageIn, ChatMessageOut
from app.utils.websocket_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])


# ─── Helper: verify user belongs to order ────
async def _get_order_or_403(
    order_id: uuid.UUID,
    user: User,
    db: AsyncSession,
) -> Order:
    """Load an order and verify the user is a participant or admin."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if user.role != UserRole.ADMIN and user.id not in (
        order.buyer_id,
        order.seller_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this order",
        )

    return order


# ─── Helper: filter messages by user role ────
def _visibility_filter(user: User, order: Order):
    """
    Return SQLAlchemy filter clauses so users only see
    messages they are permitted to view.
    """
    if user.role == UserRole.ADMIN:
        # Admins see everything
        return []

    filters = []
    if user.id == order.buyer_id:
        # Buyer sees GROUP + BUYER_ONLY
        filters.append(
            Message.recipient_type.in_([
                RecipientType.GROUP,
                RecipientType.BUYER_ONLY,
            ])
        )
    elif user.id == order.seller_id:
        # Seller sees GROUP + SELLER_ONLY
        filters.append(
            Message.recipient_type.in_([
                RecipientType.GROUP,
                RecipientType.SELLER_ONLY,
            ])
        )

    return filters


# ─────────────────────────────────────────────
# GET /chat/{order_id}/history
# ─────────────────────────────────────────────
@router.get(
    "/{order_id}/history",
    response_model=ChatHistoryResponse,
    summary="Fetch paginated chat history",
)
async def get_chat_history(
    order_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns paginated message history for an order.
    Messages are filtered based on the caller's role:
      - Buyers never see SELLER_ONLY or ADMIN_ONLY messages.
      - Sellers never see BUYER_ONLY or ADMIN_ONLY messages.
      - Admins see everything.
    """
    order = await _get_order_or_403(order_id, current_user, db)

    # Base query
    query = (
        select(Message, User.name, User.role)
        .join(User, Message.sender_id == User.id)
        .where(Message.order_id == order_id)
    )

    # Apply visibility filter
    vis_filters = _visibility_filter(current_user, order)
    for f in vis_filters:
        query = query.where(f)

    # Count total
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Fetch page (oldest first for chat)
    query = (
        query
        .order_by(Message.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    rows = result.all()

    messages = [
        ChatMessageOut(
            id=msg.id,
            order_id=msg.order_id,
            sender_id=msg.sender_id,
            sender_name=name,
            sender_role=role.value,
            content=msg.content,
            message_type=msg.message_type,
            recipient_type=msg.recipient_type,
            is_system_message=msg.is_system_message,
            is_read=msg.is_read,
            created_at=msg.created_at,
        )
        for msg, name, role in rows
    ]

    return ChatHistoryResponse(
        messages=messages,
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total,
    )


# ─────────────────────────────────────────────
# WebSocket: /ws/chat/{order_id}?token=JWT
# ─────────────────────────────────────────────
async def websocket_chat(websocket: WebSocket, order_id: uuid.UUID):
    """
    WebSocket endpoint for real-time order chat.

    Authentication: Pass JWT as query param `?token=...`
    Protocol:
      1. Client sends JSON: { "content": "...", "recipient_type": "group", "message_type": "text" }
      2. Server saves to DB → broadcasts to eligible participants.
      3. Server sends JSON back: full ChatMessageOut.
    """
    # ── Authenticate via query param ──
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return

    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=4001, reason="Invalid token")
            return
        user_id = uuid.UUID(user_id_str)
    except Exception:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    # ── Load user and verify order access ──
    async with AsyncSessionLocal() as db:
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return

        order_result = await db.execute(select(Order).where(Order.id == order_id))
        order = order_result.scalar_one_or_none()
        if not order:
            await websocket.close(code=4004, reason="Order not found")
            return

        if user.role != UserRole.ADMIN and user.id not in (
            order.buyer_id,
            order.seller_id,
        ):
            await websocket.close(code=4003, reason="Not a participant in this order")
            return

        buyer_id = order.buyer_id
        seller_id = order.seller_id
        user_name = user.name
        user_role = user.role

    # ── Connect to room ──
    order_id_str = str(order_id)
    await manager.connect(order_id_str, user_id, user_role, websocket)

    # ── Broadcast join notification ──
    join_msg = {
        "type": "system",
        "content": f"{user_name} joined the chat",
        "sender_name": "System",
        "sender_role": "system",
        "recipient_type": RecipientType.GROUP.value,
    }
    await manager.broadcast(
        order_id_str, join_msg, RecipientType.GROUP, buyer_id, seller_id
    )

    # ── Receive loop ──
    try:
        while True:
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
                msg_in = ChatMessageIn(**data)
            except (json.JSONDecodeError, Exception) as e:
                await websocket.send_json({
                    "type": "error",
                    "content": f"Invalid message format: {str(e)}",
                })
                continue

            # Save to database
            async with AsyncSessionLocal() as db:
                message = Message(
                    sender_id=user_id,
                    order_id=order_id,
                    content=msg_in.content,
                    message_type=msg_in.message_type,
                    recipient_type=msg_in.recipient_type,
                    is_system_message=False,
                )
                db.add(message)
                await db.commit()
                await db.refresh(message)

                # Build outbound payload
                out = ChatMessageOut(
                    id=message.id,
                    order_id=message.order_id,
                    sender_id=message.sender_id,
                    sender_name=user_name,
                    sender_role=user_role.value,
                    content=message.content,
                    message_type=message.message_type,
                    recipient_type=message.recipient_type,
                    is_system_message=message.is_system_message,
                    is_read=message.is_read,
                    created_at=message.created_at,
                )

            # Broadcast to eligible participants
            await manager.broadcast(
                order_id_str,
                out.model_dump(mode="json"),
                msg_in.recipient_type,
                buyer_id,
                seller_id,
            )

    except WebSocketDisconnect:
        logger.info(f"WS client disconnected: user={user_id} order={order_id}")
    except Exception as e:
        logger.error(f"WS error: user={user_id} order={order_id} error={e}")
    finally:
        # ── Graceful cleanup ──
        manager.disconnect(order_id_str, user_id)

        # Broadcast leave notification (best-effort)
        leave_msg = {
            "type": "system",
            "content": f"{user_name} left the chat",
            "sender_name": "System",
            "sender_role": "system",
            "recipient_type": RecipientType.GROUP.value,
        }
        try:
            await manager.broadcast(
                order_id_str, leave_msg, RecipientType.GROUP, buyer_id, seller_id
            )
        except Exception:
            pass
