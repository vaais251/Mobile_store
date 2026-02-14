"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    ImagePlus,
    Menu,
    X,
    Circle,
    Smartphone,
    Users,
    UserCheck,
    Lock,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import {
    useChatWebSocket,
    type RecipientType,
    type ChatMessage,
} from "@/hooks/useChatWebSocket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Admin Tab Config ───────────────────── */
const ADMIN_TABS: { label: string; value: RecipientType; icon: React.ElementType }[] = [
    { label: "Group", value: "group", icon: Users },
    { label: "To Buyer", value: "buyer_only", icon: UserCheck },
    { label: "To Seller", value: "seller_only", icon: Lock },
];

/* ─── Mock Order Info ────────────────────── */
const MOCK_ORDER = {
    product_name: "iPhone 15 Pro Max",
    status: "In Progress",
};

/* ═══════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════ */
export default function ChatRoomPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    /* ─── Auth / User State ──────────────── */
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>("buyer");
    const [token, setToken] = useState<string | null>(null);

    /* ─── UI State ───────────────────────── */
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [recipientType, setRecipientType] = useState<RecipientType>("group");
    const [inputText, setInputText] = useState("");
    const [orderInfo, setOrderInfo] = useState(MOCK_ORDER);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = userRole === "admin";

    /* ─── Load User Info ─────────────────── */
    useEffect(() => {
        if (typeof window !== "undefined") {
            const t = localStorage.getItem("access_token");
            setToken(t);

            // Try to decode user info from token (simple JWT decode)
            if (t) {
                try {
                    const payload = JSON.parse(atob(t.split(".")[1]));
                    setUserId(payload.sub || null);
                    setUserRole(payload.role || "buyer");
                } catch {
                    // Token couldn't be decoded — will use defaults
                }
            }
        }
    }, []);

    /* ─── WebSocket ──────────────────────── */
    const { messages, isConnected, sendMessage, setMessages } =
        useChatWebSocket({ orderId, token });

    /* ─── Load Chat History ──────────────── */
    useEffect(() => {
        if (!token || !orderId) return;

        const loadHistory = async () => {
            try {
                const res = await api.get(
                    `/api/v1/chat/${orderId}/history`,
                    { params: { limit: 100, offset: 0 } }
                );
                const history: ChatMessage[] =
                    res.data?.messages || [];
                if (history.length > 0) {
                    setMessages(history);
                }
            } catch {
                // History unavailable — will show only live messages
            }
        };
        loadHistory();
    }, [token, orderId, setMessages]);

    /* ─── Load Order Info ────────────────── */
    useEffect(() => {
        if (!token || !orderId) return;

        const loadOrder = async () => {
            try {
                const res = await api.get(`/api/v1/orders/${orderId}`);
                const data = res.data;
                setOrderInfo({
                    product_name:
                        data.listing_title ||
                        data.product_name ||
                        MOCK_ORDER.product_name,
                    status: data.status || MOCK_ORDER.status,
                });
            } catch {
                // Use mock data
            }
        };
        loadOrder();
    }, [token, orderId]);

    /* ─── Auto-Scroll ────────────────────── */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ─── Send Handler ───────────────────── */
    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text) return;

        sendMessage(text, recipientType, "text");
        setInputText("");
        inputRef.current?.focus();
    }, [inputText, recipientType, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* ─── Image Upload ───────────────────── */
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // TODO: Upload to server and get URL, then send as image message
        // For now, create a local preview URL
        const url = URL.createObjectURL(file);
        sendMessage(url, recipientType, "image");
        e.target.value = "";
    };

    /* ─── Status Badge Color ─────────────── */
    const statusColor = (s: string) => {
        const lower = s.toLowerCase();
        if (lower.includes("complete") || lower.includes("delivered"))
            return "bg-success-50 text-success-700";
        if (lower.includes("cancel") || lower.includes("dispute"))
            return "bg-accent-50 text-accent-600";
        return "bg-primary-50 text-primary-600";
    };

    /* ═══════════════════════════════════════
       Render
       ═══════════════════════════════════════ */
    return (
        <RequireAuth>
            <div className="flex h-screen overflow-hidden bg-secondary-200">
                {/* ─── Desktop Sidebar ─────── */}
                <div className="hidden w-80 shrink-0 md:block">
                    <ChatSidebar
                        activeOrderId={orderId}
                        isAdmin={isAdmin}
                        className="h-full"
                    />
                </div>

                {/* ─── Mobile Sidebar Overlay ─ */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: -320 }}
                                animate={{ x: 0 }}
                                exit={{ x: -320 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed inset-y-0 left-0 z-50 w-80 md:hidden"
                            >
                                <ChatSidebar
                                    activeOrderId={orderId}
                                    isAdmin={isAdmin}
                                    className="h-full"
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ─── Chat Area ───────────── */}
                <div className="flex flex-1 flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between border-b border-secondary-200 bg-white px-4 py-3 shadow-sm sm:px-6">
                        <div className="flex items-center gap-3">
                            {/* Mobile menu toggle */}
                            <button
                                className="rounded-lg p-1.5 text-secondary-600 hover:bg-secondary-100 md:hidden"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                {sidebarOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
                                <Smartphone className="h-5 w-5 text-primary-500" />
                            </div>

                            <div>
                                <h1 className="text-sm font-bold text-secondary-900">
                                    {orderInfo.product_name}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                            statusColor(orderInfo.status)
                                        )}
                                    >
                                        {orderInfo.status}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-secondary-400">
                                        <Circle
                                            className={cn(
                                                "h-2 w-2",
                                                isConnected
                                                    ? "fill-success-500 text-success-500"
                                                    : "fill-secondary-300 text-secondary-300"
                                            )}
                                        />
                                        {isConnected
                                            ? "Connected"
                                            : "Reconnecting..."}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Admin Tabs */}
                    {isAdmin && (
                        <div className="flex border-b border-secondary-200 bg-white px-4 sm:px-6">
                            {ADMIN_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive =
                                    recipientType === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() =>
                                            setRecipientType(tab.value)
                                        }
                                        className={cn(
                                            "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
                                            isActive
                                                ? "border-primary-500 text-primary-600"
                                                : "border-transparent text-secondary-500 hover:text-secondary-700"
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin sm:px-6">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                                    <Users className="h-8 w-8 text-primary-400" />
                                </div>
                                <p className="text-sm font-medium text-secondary-600">
                                    No messages yet
                                </p>
                                <p className="mt-1 text-xs text-secondary-400">
                                    Send a message to start the conversation
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, i) => (
                                        <MessageBubble
                                            key={msg.id || `msg-${i}`}
                                            message={msg}
                                            isMe={
                                                msg.sender_id === userId
                                            }
                                            showSender={
                                                i === 0 ||
                                                messages[i - 1]
                                                    ?.sender_id !==
                                                msg.sender_id
                                            }
                                        />
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-secondary-200 bg-white px-4 py-3 sm:px-6">
                        {/* Recipient indicator for admin */}
                        {isAdmin && recipientType !== "group" && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-warning-50 px-3 py-1.5 text-xs font-medium text-warning-700">
                                <Lock className="h-3 w-3" />
                                Sending to:{" "}
                                {recipientType === "buyer_only"
                                    ? "Buyer Only"
                                    : "Seller Only"}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {/* Image upload */}
                            <button
                                type="button"
                                onClick={() =>
                                    imageInputRef.current?.click()
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
                            >
                                <ImagePlus className="h-5 w-5" />
                            </button>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />

                            {/* Text input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="h-10 flex-1 rounded-xl border border-secondary-200 bg-secondary-50 px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                            />

                            {/* Send button */}
                            <Button
                                size="md"
                                onClick={handleSend}
                                disabled={!inputText.trim() || !isConnected}
                                className="h-10 w-10 !rounded-xl !p-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
}
