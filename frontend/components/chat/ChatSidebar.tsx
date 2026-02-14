"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
interface Conversation {
    order_id: string;
    other_user_name: string;
    other_user_role: string;
    product_name: string;
    last_message?: string;
    last_message_time?: string;
    unread_count: number;
}

/* ─── Mock Conversations ─────────────────── */
const MOCK_CONVERSATIONS: Conversation[] = [
    {
        order_id: "order-1",
        other_user_name: "Ali Hassan",
        other_user_role: "seller",
        product_name: "iPhone 15 Pro Max",
        last_message: "Sure, I can meet at Liberty Market tomorrow",
        last_message_time: new Date(Date.now() - 300_000).toISOString(),
        unread_count: 2,
    },
    {
        order_id: "order-2",
        other_user_name: "Ahmed Khan",
        other_user_role: "buyer",
        product_name: "Samsung Galaxy S24 Ultra",
        last_message: "What's the lowest you can go?",
        last_message_time: new Date(Date.now() - 3_600_000).toISOString(),
        unread_count: 0,
    },
    {
        order_id: "order-3",
        other_user_name: "Sara Malik",
        other_user_role: "seller",
        product_name: "Google Pixel 9 Pro",
        last_message: "PTA approved, battery health 95%",
        last_message_time: new Date(Date.now() - 86_400_000).toISOString(),
        unread_count: 0,
    },
];

/* ─── Time Formatter ─────────────────────── */
function relativeTime(dateStr: string): string {
    try {
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        const diffMs = now - then;

        if (diffMs < 60_000) return "Just now";
        if (diffMs < 3_600_000)
            return `${Math.floor(diffMs / 60_000)}m ago`;
        if (diffMs < 86_400_000)
            return `${Math.floor(diffMs / 3_600_000)}h ago`;
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    } catch {
        return "";
    }
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
interface ChatSidebarProps {
    activeOrderId?: string;
    isAdmin?: boolean;
    className?: string;
}

export function ChatSidebar({
    activeOrderId,
    isAdmin = false,
    className,
}: ChatSidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get("/api/v1/orders/");
                const orders = res.data?.items || res.data || [];

                const convos: Conversation[] = orders.map(
                    (order: Record<string, unknown>) => ({
                        order_id: order.id as string,
                        other_user_name:
                            (order.seller_name as string) ||
                            (order.buyer_name as string) ||
                            "User",
                        other_user_role: order.seller_name
                            ? "seller"
                            : "buyer",
                        product_name:
                            (order.listing_title as string) ||
                            (order.product_name as string) ||
                            "Phone",
                        last_message:
                            (order.last_message as string) || undefined,
                        last_message_time:
                            (order.updated_at as string) ||
                            (order.created_at as string),
                        unread_count:
                            (order.unread_count as number) || 0,
                    })
                );

                if (convos.length > 0) {
                    setConversations(convos);
                } else {
                    setConversations(MOCK_CONVERSATIONS);
                }
            } catch {
                setConversations(MOCK_CONVERSATIONS);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    return (
        <aside
            className={cn(
                "flex h-full flex-col border-r border-secondary-200 bg-white",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-secondary-100 px-5 py-4">
                <MessageSquare className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-secondary-900">Chats</h2>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-secondary-300" />
                        <p className="text-sm text-secondary-500">
                            No conversations yet
                        </p>
                    </div>
                ) : (
                    conversations.map((convo, i) => {
                        const isActive =
                            activeOrderId === convo.order_id;

                        return (
                            <Link
                                key={convo.order_id}
                                href={`/chat/${convo.order_id}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: i * 0.04,
                                        duration: 0.2,
                                    }}
                                    className={cn(
                                        "flex items-start gap-3 border-b border-secondary-50 px-4 py-3.5 transition-colors",
                                        isActive
                                            ? "border-l-2 border-l-primary-500 bg-primary-50/60"
                                            : "hover:bg-secondary-50"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                        <span className="text-sm font-bold">
                                            {convo.other_user_name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="truncate text-sm font-semibold text-secondary-900">
                                                    {convo.other_user_name}
                                                </span>
                                                {isAdmin && (
                                                    <span
                                                        className={cn(
                                                            "ml-1.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                                            convo.other_user_role ===
                                                                "buyer"
                                                                ? "bg-primary-100 text-primary-600"
                                                                : "bg-success-50 text-success-700"
                                                        )}
                                                    >
                                                        {convo.other_user_role}
                                                    </span>
                                                )}
                                            </div>
                                            {convo.last_message_time && (
                                                <span className="ml-2 shrink-0 text-[11px] text-secondary-400">
                                                    {relativeTime(
                                                        convo.last_message_time
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-0.5 truncate text-xs text-secondary-500">
                                            {convo.product_name}
                                        </p>

                                        <div className="mt-0.5 flex items-center justify-between">
                                            <p className="truncate text-xs text-secondary-400">
                                                {convo.last_message ||
                                                    "No messages yet"}
                                            </p>
                                            {convo.unread_count > 0 && (
                                                <span className="ml-2 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
                                                    {convo.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
