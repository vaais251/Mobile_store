"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useChatWebSocket";

/* ─── Time Formatter ─────────────────────── */
function formatTime(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return "";
    }
}

/* ─── Role Badge ─────────────────────────── */
function RoleBadge({ role }: { role: string }) {
    const config: Record<string, { label: string; color: string }> = {
        admin: { label: "Admin", color: "bg-accent-100 text-accent-600" },
        buyer: { label: "Buyer", color: "bg-primary-100 text-primary-600" },
        seller: { label: "Seller", color: "bg-success-50 text-success-700" },
    };

    const c = config[role.toLowerCase()] || {
        label: role,
        color: "bg-secondary-100 text-secondary-600",
    };

    return (
        <span
            className={cn(
                "ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                c.color
            )}
        >
            {c.label}
        </span>
    );
}

/* ─── Private Tag ────────────────────────── */
function PrivateTag({ recipientType }: { recipientType: string }) {
    if (recipientType === "group") return null;

    const labels: Record<string, string> = {
        buyer_only: "🔒 Buyer Only",
        seller_only: "🔒 Seller Only",
        admin_only: "🔒 Admin Only",
    };

    return (
        <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-warning-50 px-2 py-0.5 text-[10px] font-semibold text-warning-700">
            <Lock className="h-2.5 w-2.5" />
            {labels[recipientType] || recipientType}
        </span>
    );
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
interface MessageBubbleProps {
    message: ChatMessage;
    isMe: boolean;
    showSender?: boolean;
}

export function MessageBubble({
    message,
    isMe,
    showSender = true,
}: MessageBubbleProps) {
    /* ─── System Message ─────────────────── */
    if (
        message.is_system_message ||
        message.message_type === "system" ||
        message.type === "system"
    ) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center py-1.5"
            >
                <span className="rounded-full bg-warning-50 px-4 py-1.5 text-xs font-medium text-warning-700 shadow-sm">
                    {message.content}
                </span>
            </motion.div>
        );
    }

    /* ─── Regular Message ────────────────── */
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
                "flex w-full",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[75%] sm:max-w-[65%]",
                    isMe ? "items-end" : "items-start"
                )}
            >
                {/* Sender name (left-aligned messages only) */}
                {!isMe && showSender && (
                    <div className="mb-1 flex items-center pl-1">
                        <span className="text-xs font-semibold text-secondary-600">
                            {message.sender_name}
                        </span>
                        <RoleBadge role={message.sender_role} />
                    </div>
                )}

                {/* Bubble */}
                <div
                    className={cn(
                        "relative rounded-2xl px-4 py-2.5 shadow-sm",
                        isMe
                            ? "rounded-br-md bg-primary-500 text-white"
                            : "rounded-bl-md bg-white text-secondary-900"
                    )}
                >
                    {/* Content */}
                    {message.message_type === "image" ? (
                        <div className="overflow-hidden rounded-lg">
                            <img
                                src={message.content}
                                alt="Shared image"
                                className="max-h-64 rounded-lg object-cover"
                            />
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                        </p>
                    )}

                    {/* Timestamp */}
                    <p
                        className={cn(
                            "mt-1 text-[10px]",
                            isMe
                                ? "text-right text-white/60"
                                : "text-right text-secondary-400"
                        )}
                    >
                        {formatTime(message.created_at)}
                    </p>
                </div>

                {/* Private tag (visible to admin to show message was private) */}
                {message.recipient_type !== "group" && (
                    <div
                        className={cn(
                            "mt-0.5",
                            isMe ? "text-right pr-1" : "pl-1"
                        )}
                    >
                        <PrivateTag recipientType={message.recipient_type} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
