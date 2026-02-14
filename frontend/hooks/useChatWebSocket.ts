import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Types ──────────────────────────────── */
export type RecipientType = "group" | "buyer_only" | "seller_only" | "admin_only";
export type MessageType = "text" | "image" | "system";

export interface ChatMessage {
    id?: string;
    order_id?: string;
    sender_id?: string;
    sender_name: string;
    sender_role: string;
    content: string;
    message_type: MessageType;
    recipient_type: RecipientType;
    is_system_message: boolean;
    is_read?: boolean;
    created_at: string;
    /* System-only field for join/leave events */
    type?: "system" | "error";
}

interface UseChatWebSocketOptions {
    orderId: string;
    token: string | null;
}

interface UseChatWebSocketReturn {
    messages: ChatMessage[];
    isConnected: boolean;
    sendMessage: (
        content: string,
        recipientType?: RecipientType,
        messageType?: MessageType
    ) => void;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/* ─── Constants ──────────────────────────── */
const WS_BASE =
    (typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_WS_URL
        : undefined) || "ws://localhost:8001";

const INITIAL_RETRY_MS = 5_000;
const MAX_RETRY_MS = 30_000;

/* ═══════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════ */
export function useChatWebSocket({
    orderId,
    token,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectDelay = useRef(INITIAL_RETRY_MS);
    const intentionalClose = useRef(false);

    /* ─── Connect ────────────────────────── */
    const connect = useCallback(() => {
        if (!token || !orderId) return;

        // Clean up any existing connection
        if (wsRef.current) {
            intentionalClose.current = true;
            wsRef.current.close();
        }

        const url = `${WS_BASE}/ws/chat/${orderId}?token=${token}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
            setIsConnected(true);
            reconnectDelay.current = INITIAL_RETRY_MS; // reset backoff
        };

        ws.onmessage = (event) => {
            try {
                const data: ChatMessage = JSON.parse(event.data);

                // Handle system join/leave messages
                if (data.type === "system") {
                    setMessages((prev) => [
                        ...prev,
                        {
                            ...data,
                            sender_name: data.sender_name || "System",
                            sender_role: "system",
                            message_type: "system",
                            recipient_type: data.recipient_type || "group",
                            is_system_message: true,
                            created_at:
                                data.created_at || new Date().toISOString(),
                        },
                    ]);
                    return;
                }

                // Handle error messages
                if (data.type === "error") {
                    console.error("WS error:", data.content);
                    return;
                }

                // Regular chat message
                setMessages((prev) => [...prev, data]);
            } catch (err) {
                console.error("Failed to parse WS message:", err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            wsRef.current = null;

            // Auto-reconnect unless intentionally closed
            if (!intentionalClose.current) {
                reconnectTimer.current = setTimeout(() => {
                    connect();
                }, reconnectDelay.current);

                // Exponential backoff (5s → 10s → 20s → 30s max)
                reconnectDelay.current = Math.min(
                    reconnectDelay.current * 2,
                    MAX_RETRY_MS
                );
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        intentionalClose.current = false;
        wsRef.current = ws;
    }, [orderId, token]);

    /* ─── Send ───────────────────────────── */
    const sendMessage = useCallback(
        (
            content: string,
            recipientType: RecipientType = "group",
            messageType: MessageType = "text"
        ) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.warn("WebSocket not connected — message not sent");
                return;
            }

            const payload = {
                content,
                recipient_type: recipientType,
                message_type: messageType,
            };

            wsRef.current.send(JSON.stringify(payload));
        },
        []
    );

    /* ─── Lifecycle ──────────────────────── */
    useEffect(() => {
        connect();

        return () => {
            intentionalClose.current = true;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return { messages, isConnected, sendMessage, setMessages };
}
