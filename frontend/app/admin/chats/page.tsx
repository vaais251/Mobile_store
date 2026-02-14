"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    MessageCircle,
    Search,
    Loader2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Star,
    MapPin,
    ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
interface ChatCase {
    id: string;
    order_id: string;
    case_number: string;
    product_name: string;
    buyer_name: string;
    seller_name: string;
    status: string;
    last_message?: string;
    last_message_time: string;
    unread_count: number;
    price: number;
}

/* ─── Status Tabs ────────────────────────── */
const CHAT_TABS = [
    { label: "All Chats", value: null, count: 24 },
    { label: "Active", value: "active", count: 12 },
    { label: "Pending", value: "pending", count: 8 },
    { label: "Resolved", value: "resolved", count: 4 },
];

/* ─── Mock Cases ─────────────────────────── */
const MOCK_CASES: ChatCase[] = [
    {
        id: "1",
        order_id: "ord-2941",
        case_number: "#2941",
        product_name: "iPhone 15 Pro - 256GB",
        buyer_name: "John D.",
        seller_name: "Sarah M.",
        status: "coordinating",
        last_message: "Wait, where are we meeting exactly?",
        last_message_time: "2m ago",
        unread_count: 3,
        price: 850,
    },
    {
        id: "2",
        order_id: "ord-2938",
        case_number: "#2938",
        product_name: "Samsung S23 Ultra",
        buyer_name: "Mike R.",
        seller_name: "TechHub Ltd.",
        status: "ready",
        last_message: "Device verified, meeting confirmed for tomorrow",
        last_message_time: "15m ago",
        unread_count: 0,
        price: 780,
    },
    {
        id: "3",
        order_id: "ord-2935",
        case_number: "#2935",
        product_name: "Pixel 8 Pro - Sealed",
        buyer_name: "Elena Q.",
        seller_name: "David W.",
        status: "pending_addr",
        last_message: "Can you share the pickup location?",
        last_message_time: "1h ago",
        unread_count: 1,
        price: 650,
    },
    {
        id: "4",
        order_id: "ord-2932",
        case_number: "#2932",
        product_name: "iPhone 14 - 128GB",
        buyer_name: "Alex T.",
        seller_name: "Jordan K.",
        status: "resolved",
        last_message: "Transaction completed successfully",
        last_message_time: "3h ago",
        unread_count: 0,
        price: 520,
    },
    {
        id: "5",
        order_id: "ord-2928",
        case_number: "#2928",
        product_name: "Galaxy S24 Ultra",
        buyer_name: "Lisa P.",
        seller_name: "Mobile Mart",
        status: "coordinating",
        last_message: "Admin has verified the IMEI number",
        last_message_time: "5h ago",
        unread_count: 0,
        price: 920,
    },
];

/* ─── Helpers ────────────────────────────── */
function statusBadge(s: string) {
    const map: Record<string, { label: string; color: string }> = {
        coordinating: { label: "Coordinating", color: "bg-blue-100 text-blue-700" },
        ready: { label: "Ready", color: "bg-emerald-100 text-emerald-700" },
        pending_addr: { label: "Pending Addr", color: "bg-amber-100 text-amber-700" },
        resolved: { label: "Resolved", color: "bg-secondary-100 text-secondary-600" },
        active: { label: "Active", color: "bg-blue-100 text-blue-700" },
        pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
    };
    const cfg = map[s] || { label: s, color: "bg-secondary-100 text-secondary-600" };
    return <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>;
}

/* ═══════════════════════════════════════════
   All Chats Page
   ═══════════════════════════════════════════ */
export default function ChatsPage() {
    const router = useRouter();
    const [cases, setCases] = useState<ChatCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCases = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/v1/orders/");
                const data = res.data?.items || res.data || [];
                if (data.length > 0) {
                    const mapped = data.map((o: Record<string, unknown>, idx: number) => ({
                        id: String(o.id),
                        order_id: String(o.id),
                        case_number: `#${3000 - idx}`,
                        product_name: `${o.listing_brand || "Phone"} ${o.listing_model || ""}`,
                        buyer_name: "Buyer",
                        seller_name: "Seller",
                        status: o.status === "admin_review" ? "coordinating" : o.status === "completed" ? "resolved" : "pending",
                        last_message: "",
                        last_message_time: "",
                        unread_count: 0,
                        price: Number(o.listing_price) || 0,
                    }));
                    setCases(mapped.length > 0 ? mapped : MOCK_CASES);
                } else {
                    setCases(MOCK_CASES);
                }
            } catch {
                setCases(MOCK_CASES);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const filteredCases = cases.filter((c) => {
        const matchTab = !activeTab ||
            (activeTab === "active" && (c.status === "coordinating" || c.status === "active")) ||
            (activeTab === "pending" && (c.status === "pending_addr" || c.status === "pending")) ||
            (activeTab === "resolved" && c.status === "resolved");
        const matchSearch = !searchQuery ||
            c.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.case_number.includes(searchQuery);
        return matchTab && matchSearch;
    });

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">All Chats</h1>
                    <p className="mt-1 text-sm text-secondary-500">Monitor and moderate marketplace conversations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700">{filteredCases.filter(c => c.status !== "resolved").length} Active Cases</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-60 rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm placeholder:text-secondary-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl bg-white p-1 premium-shadow w-fit">
                {CHAT_TABS.map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
                            activeTab === tab.value
                                ? "bg-primary-500 text-white shadow-sm"
                                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                        )}
                    >
                        {tab.label}
                        <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            activeTab === tab.value ? "bg-white/20 text-white" : "bg-secondary-100 text-secondary-500"
                        )}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Cases Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-white premium-shadow">
                    <MessageCircle className="mx-auto mb-3 h-10 w-10 text-secondary-300" />
                    <p className="text-sm text-secondary-500">No chat cases found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredCases.map((chatCase, i) => (
                        <motion.div
                            key={chatCase.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => router.push(`/admin/chats/${chatCase.order_id}`)}
                            className="group cursor-pointer rounded-2xl bg-white p-5 premium-shadow hover:shadow-premium-lg transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    {/* Product Icon */}
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-100 group-hover:bg-primary-50 transition-colors">
                                        <span className="text-sm font-bold text-secondary-500 group-hover:text-primary-500 transition-colors">
                                            {chatCase.product_name.charAt(0)}
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-primary-600">CASE {chatCase.case_number}</span>
                                            {statusBadge(chatCase.status)}
                                        </div>
                                        <h3 className="mt-1 text-sm font-semibold text-secondary-900">{chatCase.product_name}</h3>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-secondary-500">
                                            <span>👤 {chatCase.buyer_name}</span>
                                            <span className="text-secondary-300">vs.</span>
                                            <span>{chatCase.seller_name}</span>
                                        </div>
                                        {chatCase.last_message && (
                                            <p className="mt-2 text-xs text-secondary-400 truncate italic">
                                                &quot;{chatCase.last_message}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className="text-sm font-bold text-emerald-600">${chatCase.price.toLocaleString()}</span>
                                    <span className="text-[11px] text-secondary-400">{chatCase.last_message_time}</span>
                                    {chatCase.unread_count > 0 && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
                                            {chatCase.unread_count}
                                        </span>
                                    )}
                                    <ArrowUpRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-500 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
