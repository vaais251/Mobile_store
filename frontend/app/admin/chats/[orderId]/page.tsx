"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    ImagePlus,
    Smile,
    Clock,
    Users,
    UserCheck,
    Lock,
    Shield,
    MapPin,
    Star,
    CheckCircle2,
    AlertTriangle,
    ChevronLeft,
    Circle,
    Info,
    Flag,
    Calendar,
    Phone,
    ShieldCheck,
    Eye,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
    useChatWebSocket,
    type RecipientType,
    type ChatMessage,
} from "@/hooks/useChatWebSocket";

/* ─── Admin Tab Config ───────────────────── */
const ADMIN_TABS: { label: string; value: RecipientType; icon: React.ElementType }[] = [
    { label: "Group Thread", value: "group", icon: Users },
    { label: "To Buyer", value: "buyer_only", icon: UserCheck },
    { label: "To Seller", value: "seller_only", icon: Lock },
];

/* ─── Deal Status Steps ──────────────────── */
const DEAL_STEPS = [
    { label: "Negotiation", description: "Price agreed by both parties", status: "completed", icon: CheckCircle2 },
    { label: "Admin Review", description: "Device verification complete", status: "completed", icon: CheckCircle2 },
    { label: "Pickup Scheduled", description: "Tomorrow at 3:00 PM", status: "active", icon: Calendar },
    { label: "Payment & Completion", description: "Awaiting pickup meeting", status: "pending", icon: Clock },
];

/* ─── Mock Order Details ─────────────────── */
const MOCK_ORDER_DETAILS = {
    product_name: "iPhone 15 Pro",
    product_spec: "256GB • Blue Titanium",
    price: 850,
    condition: "Like New",
    battery_health: "100%",
    location: "New York, NY",
    buyer: {
        name: "John D.",
        rating: 4.9,
        reviews: 42,
        joined: "May 2021",
        verified: "KYC Level 2",
        online: true,
    },
    seller: {
        name: "Sarah M.",
        rating: 4.7,
        reviews: 128,
        joined: "Jan 2019",
        flag_history: "1 Warning",
        address: "1245 North Avenue, Chicago, IL 60614",
    },
    audit_log: [
        { action: "Admin shared seller address", time: "2 mins ago", actor: "Admin" },
        { action: "System buyer viewed address", time: "Just now", actor: "System" },
    ],
};

/* ─── Mock Cases List ────────────────────── */
const MOCK_CASES = [
    { id: "case-1", order_id: "ord-2941", case_number: "#2941", product: "iPhone 15 Pro - 256GB", buyer: "John D.", seller: "Sarah M.", status: "coordinating", last_message: "Wait, where are we meeting exactly?", price: 850 },
    { id: "case-2", order_id: "ord-2938", case_number: "#2938", product: "Samsung S23 Ultra", buyer: "Mike R.", seller: "TechHub Ltd.", status: "ready", last_message: "", price: 780 },
    { id: "case-3", order_id: "ord-2935", case_number: "#2935", product: "Pixel 8 Pro - Sealed", buyer: "Elena Q.", seller: "David W.", status: "pending_addr", last_message: "", price: 650 },
];

/* ═══════════════════════════════════════════
   Admin Chat Moderation Page
   ═══════════════════════════════════════════ */
export default function AdminChatPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    /* ─── Auth / User State ──────────────── */
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    /* ─── UI State ───────────────────────── */
    const [recipientType, setRecipientType] = useState<RecipientType>("group");
    const [inputText, setInputText] = useState("");
    const [showRightPanel, setShowRightPanel] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* ─── Load User Info ─────────────────── */
    useEffect(() => {
        if (typeof window !== "undefined") {
            const t = localStorage.getItem("access_token");
            setToken(t);
            if (t) {
                try {
                    const payload = JSON.parse(atob(t.split(".")[1]));
                    setUserId(payload.sub || null);
                } catch { }
            }
        }
    }, []);

    /* ─── WebSocket ──────────────────────── */
    const { messages, isConnected, sendMessage, setMessages } = useChatWebSocket({ orderId, token });

    /* ─── Load Chat History ──────────────── */
    useEffect(() => {
        if (!token || !orderId) return;
        const loadHistory = async () => {
            try {
                const res = await api.get(`/api/v1/chat/${orderId}/history`, { params: { limit: 100, offset: 0 } });
                const history: ChatMessage[] = res.data?.messages || [];
                if (history.length > 0) setMessages(history);
            } catch { }
        };
        loadHistory();
    }, [token, orderId, setMessages]);

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
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    /* ─── Status Badge Color ─────────────── */
    function statusColor(s: string) {
        const map: Record<string, string> = {
            coordinating: "bg-blue-100 text-blue-700",
            ready: "bg-emerald-100 text-emerald-700",
            pending_addr: "bg-amber-100 text-amber-700",
        };
        return map[s] || "bg-secondary-100 text-secondary-600";
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-0 -m-4 sm:-m-6 lg:-m-8">
            {/* ═══ LEFT PANEL: Cases List ═══ */}
            <div className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-secondary-200 bg-white">
                {/* Search */}
                <div className="p-4 border-b border-secondary-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search cases..."
                            className="w-full h-9 rounded-lg border border-secondary-200 bg-secondary-50 pl-9 pr-3 text-xs placeholder:text-secondary-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-100 transition-all"
                        />
                        <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Cases */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {MOCK_CASES.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => router.push(`/admin/chats/${c.order_id}`)}
                            className={cn(
                                "cursor-pointer border-b border-secondary-50 px-4 py-3.5 transition-colors",
                                orderId === c.order_id ? "bg-blue-50/60 border-l-2 border-l-primary-500" : "hover:bg-secondary-50"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-primary-600">CASE {c.case_number}</span>
                                <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", statusColor(c.status))}>
                                    {c.status.replace("_", " ")}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-secondary-900">{c.product}</p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-secondary-400">
                                <span>👤 {c.buyer} vs. {c.seller}</span>
                            </div>
                            {c.last_message && (
                                <p className="mt-1 text-[11px] text-secondary-400 truncate italic">&quot;{c.last_message}&quot;</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ CENTER: Chat Area ═══ */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-secondary-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/admin/chats")} className="rounded-lg p-1 text-secondary-400 hover:bg-secondary-100 lg:hidden">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-bold text-secondary-900">Admin Support</h2>
                                <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-700">Moderator</span>
                            </div>
                            <span className="text-[11px] text-secondary-400">Transaction ID: #PH-{orderId?.substring(0, 8)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-xs font-medium text-secondary-600 hover:bg-secondary-50 transition-colors">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Report Issue
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm Deal
                        </button>
                        <button
                            onClick={() => setShowRightPanel(!showRightPanel)}
                            className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 transition-colors"
                        >
                            <Info className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Admin Channel Tabs */}
                <div className="flex border-b border-secondary-200 bg-white px-4 sm:px-6">
                    {ADMIN_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = recipientType === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setRecipientType(tab.value)}
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
                    {/* Share Address Button */}
                    <div className="ml-auto flex items-center py-1">
                        <button className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-red-600 transition-colors">
                            <MapPin className="h-3 w-3" />
                            Share Seller Address
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin sm:px-6 bg-[#F8F9FB]">
                    {/* Coordination Banner */}
                    <div className="mb-4 flex justify-center">
                        <span className="rounded-full bg-secondary-200 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-500">
                            Coordination Started
                        </span>
                    </div>

                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                                <Users className="h-8 w-8 text-primary-400" />
                            </div>
                            <p className="text-sm font-medium text-secondary-600">No messages yet</p>
                            <p className="mt-1 text-xs text-secondary-400">Send a message to start moderating</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, i) => {
                                    const isMe = msg.sender_id === userId;
                                    const isSystem = msg.message_type === "system" || msg.is_system_message;
                                    const showSender = i === 0 || messages[i - 1]?.sender_id !== msg.sender_id;

                                    if (isSystem) {
                                        return (
                                            <motion.div key={msg.id || `msg-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                                <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5">
                                                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-[11px] font-medium text-blue-700">{msg.content}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={msg.id || `msg-${i}`}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
                                        >
                                            {!isMe && showSender && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-200 mt-auto">
                                                    <span className="text-[10px] font-bold text-secondary-500">{msg.sender_name?.charAt(0) || "?"}</span>
                                                </div>
                                            )}
                                            {!isMe && !showSender && <div className="w-8" />}
                                            <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start")}>
                                                {showSender && (
                                                    <div className={cn("mb-1 flex items-center gap-2", isMe ? "justify-end" : "")}>
                                                        <span className="text-xs font-semibold text-secondary-700">{msg.sender_name}</span>
                                                        {msg.sender_role === "admin" && (
                                                            <span className="rounded bg-primary-100 px-1 py-0.5 text-[8px] font-bold text-primary-700">MODERATOR</span>
                                                        )}
                                                        {msg.sender_role === "buyer" && (
                                                            <span className="rounded bg-blue-100 px-1 py-0.5 text-[8px] font-bold text-blue-700">BUYER</span>
                                                        )}
                                                        {msg.sender_role === "seller" && (
                                                            <span className="rounded bg-emerald-100 px-1 py-0.5 text-[8px] font-bold text-emerald-700">SELLER</span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "rounded-2xl px-4 py-2.5",
                                                    isMe
                                                        ? "bg-primary-500 text-white rounded-br-md"
                                                        : "bg-white text-secondary-800 rounded-bl-md premium-shadow"
                                                )}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                </div>
                                                <div className={cn("mt-1 flex items-center gap-1", isMe ? "justify-end" : "")}>
                                                    <span className="text-[10px] text-secondary-400">
                                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                                                    </span>
                                                    {msg.recipient_type !== "group" && (
                                                        <span className={cn("text-[9px] font-bold uppercase", isMe ? "text-blue-200" : "text-secondary-400")}>
                                                            {msg.recipient_type === "buyer_only" ? "• Buyer Only" : msg.recipient_type === "seller_only" ? "• Seller Only" : ""}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-secondary-200 bg-white px-4 py-3 sm:px-6">
                    {/* Recipient indicator */}
                    {recipientType !== "group" && (
                        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                            <Lock className="h-3 w-3" />
                            Sending to: {recipientType === "buyer_only" ? "Buyer Only" : "Seller Only"}
                        </div>
                    )}

                    <div className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 focus-within:border-primary-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message to the group..."
                            className="flex-1 bg-transparent text-sm text-secondary-900 placeholder:text-secondary-400 outline-none"
                        />
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 text-secondary-400 hover:text-secondary-600 transition-colors">
                                <Smile className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-secondary-400 hover:text-secondary-600 transition-colors">
                                <ImagePlus className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-secondary-400 hover:text-secondary-600 transition-colors">
                                <Clock className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Replies */}
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-secondary-400 uppercase tracking-wider">Quick Replies:</span>
                        <button className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-600 hover:bg-primary-100 transition-colors">
                            Safety Tips
                        </button>
                        <button className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-600 hover:bg-primary-100 transition-colors">
                            Verify ID
                        </button>
                        <button className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-600 hover:bg-primary-100 transition-colors">
                            Schedule Pickup
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT PANEL: Details ═══ */}
            {showRightPanel && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="hidden xl:flex w-[320px] shrink-0 flex-col border-l border-secondary-200 bg-white overflow-y-auto scrollbar-thin"
                >
                    {/* Item Details */}
                    <div className="p-5 border-b border-secondary-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-3">Item Details</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-secondary-100">
                                <Phone className="h-6 w-6 text-secondary-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-secondary-900">{MOCK_ORDER_DETAILS.product_name}</p>
                                <p className="text-xs text-secondary-400">{MOCK_ORDER_DETAILS.product_spec}</p>
                                <p className="text-sm font-bold text-primary-600 mt-0.5">${MOCK_ORDER_DETAILS.price.toLocaleString()}.00</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-secondary-400">Condition:</span><br /><span className="font-medium text-secondary-700">{MOCK_ORDER_DETAILS.condition}</span></div>
                            <div><span className="text-secondary-400">Battery Health:</span><br /><span className="font-medium text-emerald-600">{MOCK_ORDER_DETAILS.battery_health}</span></div>
                            <div className="col-span-2"><span className="text-secondary-400">Location:</span><br /><span className="font-medium text-secondary-700">{MOCK_ORDER_DETAILS.location}</span></div>
                        </div>
                    </div>

                    {/* Deal Status */}
                    <div className="p-5 border-b border-secondary-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-3">Deal Status</h3>
                        <div className="space-y-3">
                            {DEAL_STEPS.map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={cn(
                                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                            step.status === "completed" ? "bg-emerald-100" : step.status === "active" ? "bg-blue-100" : "bg-secondary-100"
                                        )}>
                                            <Icon className={cn("h-3.5 w-3.5", step.status === "completed" ? "text-emerald-600" : step.status === "active" ? "text-blue-600" : "text-secondary-400")} />
                                        </div>
                                        <div>
                                            <p className={cn("text-xs font-semibold", step.status === "active" ? "text-primary-600" : step.status === "completed" ? "text-secondary-900" : "text-secondary-400")}>
                                                {step.label}
                                            </p>
                                            <p className="text-[11px] text-secondary-400">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Buyer Details */}
                    <div className="p-5 border-b border-secondary-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-3">Buyer Details</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-600">{MOCK_ORDER_DETAILS.buyer.name.charAt(0)}</span>
                                </div>
                                {MOCK_ORDER_DETAILS.buyer.online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-secondary-900">{MOCK_ORDER_DETAILS.buyer.name}</p>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-secondary-600">{MOCK_ORDER_DETAILS.buyer.rating}</span>
                                    <span className="text-xs text-secondary-400">({MOCK_ORDER_DETAILS.buyer.reviews} Reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-secondary-400 uppercase text-[10px] font-semibold">Joined</span><br /><span className="font-medium text-secondary-700">{MOCK_ORDER_DETAILS.buyer.joined}</span></div>
                            <div><span className="text-secondary-400 uppercase text-[10px] font-semibold">Verified</span><br /><span className="font-medium text-emerald-600">{MOCK_ORDER_DETAILS.buyer.verified}</span></div>
                        </div>
                    </div>

                    {/* Seller Details */}
                    <div className="p-5 border-b border-secondary-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-3">Seller Details</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-sm font-bold text-emerald-600">{MOCK_ORDER_DETAILS.seller.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-secondary-900">{MOCK_ORDER_DETAILS.seller.name}</p>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-secondary-600">{MOCK_ORDER_DETAILS.seller.rating}</span>
                                    <span className="text-xs text-secondary-400">({MOCK_ORDER_DETAILS.seller.reviews} Reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div><span className="text-secondary-400 uppercase text-[10px] font-semibold">Joined</span><br /><span className="font-medium text-secondary-700">{MOCK_ORDER_DETAILS.seller.joined}</span></div>
                            <div><span className="text-secondary-400 uppercase text-[10px] font-semibold">Flag History</span><br /><span className="font-medium text-amber-600">{MOCK_ORDER_DETAILS.seller.flag_history}</span></div>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Registered Address</span>
                            </div>
                            <p className="text-xs text-secondary-600">{MOCK_ORDER_DETAILS.seller.address}</p>
                        </div>
                    </div>

                    {/* Audit Log */}
                    <div className="p-5 border-b border-secondary-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-3">Audit Log</h3>
                        <div className="space-y-3">
                            {MOCK_ORDER_DETAILS.audit_log.map((log, i) => (
                                <div key={i} className="flex items-start gap-3 border-l-2 border-secondary-200 pl-3">
                                    <div>
                                        <p className="text-xs text-secondary-700">
                                            <span className="font-semibold">{log.actor}</span> {log.action}
                                        </p>
                                        <p className="text-[10px] text-secondary-400">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Safety First Card */}
                    <div className="p-5">
                        <div className="rounded-xl bg-blue-50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Safety First</span>
                            </div>
                            <ul className="space-y-2 text-xs text-secondary-600">
                                <li className="flex items-start gap-2">
                                    <Info className="h-3 w-3 shrink-0 mt-0.5 text-blue-500" />
                                    Always meet in the designated public location provided by the admin.
                                </li>
                                <li className="flex items-start gap-2">
                                    <Info className="h-3 w-3 shrink-0 mt-0.5 text-blue-500" />
                                    Inspect the device thoroughly before finalizing the digital payment.
                                </li>
                                <li className="flex items-start gap-2">
                                    <Info className="h-3 w-3 shrink-0 mt-0.5 text-blue-500" />
                                    Never share personal contact information outside this chat.
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
