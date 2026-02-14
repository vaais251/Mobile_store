"""
PhoneMarket — WebSocket Connection Manager.

Manages real-time chat connections per order, with filtered broadcast
based on RecipientType:

  GROUP       → all participants on the order
  BUYER_ONLY  → buyer + admins only
  SELLER_ONLY → seller + admins only
  ADMIN_ONLY  → admins only
"""

import logging
import uuid
from dataclasses import dataclass, field

from fastapi import WebSocket
from starlette.websockets import WebSocketState

from app.models.message import RecipientType
from app.models.user import UserRole

logger = logging.getLogger(__name__)


@dataclass
class ConnectedUser:
    """Tracks a single WebSocket connection with user metadata."""
    user_id: uuid.UUID
    role: UserRole
    websocket: WebSocket


class ConnectionManager:
    """
    Manages WebSocket connections grouped by order_id.

    Structure:
      active_connections[order_id] = { user_id_str: ConnectedUser }
    """

    def __init__(self):
        self.active_connections: dict[str, dict[str, ConnectedUser]] = {}

    async def connect(
        self,
        order_id: str,
        user_id: uuid.UUID,
        role: UserRole,
        websocket: WebSocket,
    ) -> None:
        """Accept and register a WebSocket connection for an order room."""
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = {}

        self.active_connections[order_id][str(user_id)] = ConnectedUser(
            user_id=user_id,
            role=role,
            websocket=websocket,
        )
        logger.info(
            f"WS connected: user={user_id} order={order_id} "
            f"(room size: {len(self.active_connections[order_id])})"
        )

    def disconnect(self, order_id: str, user_id: uuid.UUID) -> None:
        """Remove a connection from an order room."""
        uid_str = str(user_id)
        room = self.active_connections.get(order_id)
        if room and uid_str in room:
            del room[uid_str]
            logger.info(f"WS disconnected: user={user_id} order={order_id}")
            # Clean up empty rooms
            if not room:
                del self.active_connections[order_id]

    async def broadcast(
        self,
        order_id: str,
        message: dict,
        recipient_type: RecipientType,
        buyer_id: uuid.UUID,
        seller_id: uuid.UUID,
    ) -> None:
        """
        Send a message to the appropriate participants based on recipient_type.

        Args:
            order_id: The order room to broadcast in.
            message: Serialised message dict to send.
            recipient_type: Controls visibility.
            buyer_id: The buyer on this order (from Order model).
            seller_id: The seller on this order (from Order model).
        """
        room = self.active_connections.get(order_id, {})
        stale: list[str] = []

        for uid_str, conn in room.items():
            if not self._should_receive(conn, recipient_type, buyer_id, seller_id):
                continue

            try:
                if conn.websocket.client_state == WebSocketState.CONNECTED:
                    await conn.websocket.send_json(message)
            except Exception:
                logger.warning(
                    f"WS send failed: user={uid_str} order={order_id}, marking stale"
                )
                stale.append(uid_str)

        # Clean up broken connections
        for uid_str in stale:
            room.pop(uid_str, None)
        if order_id in self.active_connections and not self.active_connections[order_id]:
            del self.active_connections[order_id]

    @staticmethod
    def _should_receive(
        conn: ConnectedUser,
        recipient_type: RecipientType,
        buyer_id: uuid.UUID,
        seller_id: uuid.UUID,
    ) -> bool:
        """Determine if a connected user should receive this message."""
        # Admins always see everything
        if conn.role == UserRole.ADMIN:
            return True

        if recipient_type == RecipientType.GROUP:
            return True
        elif recipient_type == RecipientType.BUYER_ONLY:
            return conn.user_id == buyer_id
        elif recipient_type == RecipientType.SELLER_ONLY:
            return conn.user_id == seller_id
        elif recipient_type == RecipientType.ADMIN_ONLY:
            return False  # already handled above

        return False

    def get_room_size(self, order_id: str) -> int:
        """Return the number of active connections for an order."""
        return len(self.active_connections.get(order_id, {}))


# ─── Singleton Instance ─────────────────────
manager = ConnectionManager()
