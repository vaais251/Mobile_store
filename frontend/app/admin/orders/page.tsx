"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ShoppingBag,
    Clock,
    MessageSquare,
    CheckCircle2,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Star,
    Loader2,
    Calendar,
    MessageCircle,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Order Status Tabs ──────────────────── */
const STATUS_TABS = [
    { label: "All Orders", value: null },
    { label: "Pending", value: "created" },
    { label: "In-Chat", value: "admin_review" },
    { label: "Completed", value: "completed" },
];

/* ─── Order Type ─────────────────────────── */
interface Order {
    id: string;
    buyer_id: string;
    seller_id: string;
    listing_id: string;
    status: string;
    listing_brand: string;
    listing_model: string;
    listing_price: number;
    seller_city: string;
    agreed_price?: number;
    created_at: string;
    updated_at: string;
    // enriched fields
    seller_name?: string;
    buyer_name?: string;
    seller_rating?: number;
    buyer_rating?: number;
    storage?: string;
    color?: string;
}

/* ─── Mock Orders ────────────────────────── */
const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-8821",
        buyer_id: "b1",
        seller_id: "s1",
        listing_id: "l1",
        status: "admin_review",
        listing_brand: "Apple",
        listing_model: "iPhone 14 Pro",
        listing_price: 850,
        seller_city: "New York",
        seller_name: "Johnathan Doe",
        buyer_name: "Sarah Smith",
        seller_rating: 4.8,
        buyer_rating: 5.0,
        storage: "256GB",
        color: "Space Black",
        created_at: "2023-10-24T10:00:00Z",
        updated_at: "2023-10-24T10:00:00Z",
    },
    {
        id: "ORD-8819",
        buyer_id: "b2",
        seller_id: "s2",
        listing_id: "l2",
        status: "created",
        listing_brand: "Apple",
        listing_model: "iPhone 13 Mini",
        listing_price: 620,
        seller_city: "New Jersey",
        seller_name: "Mike Johnson",
        buyer_name: "Emma Wilson",
        seller_rating: 4.2,
        buyer_rating: 4.9,
        storage: "128GB",
        color: "Starlight",
        created_at: "2023-10-23T10:00:00Z",
        updated_at: "2023-10-23T10:00:00Z",
    },
    {
        id: "ORD-8815",
        buyer_id: "b3",
        seller_id: "s3",
        listing_id: "l3",
        status: "completed",
        listing_brand: "Samsung",
        listing_model: "S22 Ultra",
        listing_price: 780,
        seller_city: "Bronx",
        seller_name: "Tech Resale Co.",
        buyer_name: "David Miller",
        seller_rating: 4.7,
        buyer_rating: 5.0,
        storage: "512GB",
        color: "Phantom Grey",
        created_at: "2023-10-22T10:00:00Z",
        updated_at: "2023-10-22T10:00:00Z",
    },
    {
        id: "ORD-8810",
        buyer_id: "b4",
        seller_id: "s4",
        listing_id: "l4",
        status: "created",
        listing_brand: "Google",
        listing_model: "Pixel 8 Pro",
        listing_price: 650,
        seller_city: "Brooklyn",
        seller_name: "Elena Q.",
        buyer_name: "David W.",
        seller_rating: 4.5,
        buyer_rating: 4.3,
        storage: "256GB",
        color: "Bay",
        created_at: "2023-10-21T10:00:00Z",
        updated_at: "2023-10-21T10:00:00Z",
    },
    {
        id: "ORD-8805",
        buyer_id: "b5",
        seller_id: "s5",
        listing_id: "l5",
        status: "meeting_scheduled",
        listing_brand: "OnePlus",
        listing_model: "12 Pro",
        listing_price: 500,
        seller_city: "Queens",
        seller_name: "Jordan K.",
        buyer_name: "Alex T.",
        seller_rating: 4.6,
        buyer_rating: 4.8,
        storage: "256GB",
        color: "Silky Black",
        created_at: "2023-10-20T10:00:00Z",
        updated_at: "2023-10-20T10:00:00Z",
    },
];

/* ─── Helpers ────────────────────────────── */
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusBadge(s: string) {
    const map: Record<string, { label: string; color: string }> = {
        created: { label: "PENDING", color: "bg-amber-100 text-amber-700" },
        admin_review: { label: "IN-CHAT", color: "bg-blue-100 text-blue-700" },
        meeting_scheduled: { label: "SCHEDULED", color: "bg-indigo-100 text-indigo-700" },
        completed: { label: "COMPLETED", color: "bg-emerald-100 text-emerald-700" },
        cancelled: { label: "CANCELLED", color: "bg-red-100 text-red-700" },
    };
    const cfg = map[s] || { label: s, color: "bg-secondary-100 text-secondary-600" };
    return (
        <span className={cn("rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", cfg.color)}>
            {cfg.label}
        </span>
    );
}

/* ═══════════════════════════════════════════
   Order Management Page
   ═══════════════════════════════════════════ */
export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    /* ─── Fetch Orders ───────────────────── */
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                if (activeTab) params.status = activeTab;
                const res = await api.get("/api/v1/orders/", { params });
                const data = res.data?.items || res.data || [];
                setOrders(data.length > 0 ? data : MOCK_ORDERS);
            } catch {
                setOrders(MOCK_ORDERS);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [activeTab]);

    /* ─── Compute Stats ──────────────────── */
    const allOrders = orders;
    const stats = {
        total: 1284,
        pending: 42,
        active: 18,
        completed: 1120,
    };

    /* ─── Filtered Orders ────────────────── */
    const filteredOrders = orders.filter((o) => {
        const matchTab = !activeTab || o.status === activeTab;
        const matchSearch = !searchQuery ||
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.listing_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.listing_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.seller_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchTab && matchSearch;
    });

    const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary-900">Order Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                    <input
                        type="text"
                        placeholder="Search Order ID, Seller, Buyer..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="h-10 w-72 rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm placeholder:text-secondary-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Total Orders" value={stats.total} trend={12.5} subtitle="+12.5% from last month" color="primary" index={0} />
                <StatCard icon={<MapPin className="h-5 w-5" />} label="Pending Pickup" value={stats.pending} subtitle="Average 2.4 days wait" color="warning" index={1} />
                <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Active Chats" value={stats.active} subtitle="8 required admin attention" color="accent" index={2} />
                <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={stats.completed} subtitle="98% Success rate" color="success" index={3} />
            </div>

            {/* Filter Tabs + Controls */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-xl bg-white p-1 premium-shadow">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
                            className={cn(
                                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
                                activeTab === tab.value
                                    ? "bg-primary-500 text-white shadow-sm"
                                    : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors">
                        <Calendar className="h-4 w-4" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors">
                        <Filter className="h-4 w-4" />
                        Advanced Filters
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl bg-white premium-shadow">
                {/* Table Header */}
                <div className="hidden border-b border-secondary-100 px-6 py-3 lg:grid lg:grid-cols-12 lg:gap-4">
                    <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Order ID</span>
                    <span className="col-span-3 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Item Details</span>
                    <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Seller</span>
                    <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Buyer</span>
                    <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Status</span>
                    <span className="col-span-3 text-[11px] font-semibold uppercase tracking-wider text-secondary-400 text-right">Moderator Actions</span>
                </div>

                {/* Rows */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                ) : paginatedOrders.length === 0 ? (
                    <div className="py-16 text-center">
                        <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-secondary-300" />
                        <p className="text-sm text-secondary-500">No orders found</p>
                    </div>
                ) : (
                    paginatedOrders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-1 gap-3 border-b border-secondary-50 px-6 py-4 transition-colors hover:bg-secondary-50/50 lg:grid-cols-12 lg:items-center lg:gap-4"
                        >
                            {/* Order ID */}
                            <div className="col-span-1">
                                <p className="text-xs font-bold text-primary-600">#{order.id}</p>
                                <p className="text-[11px] text-secondary-400">{formatDate(order.created_at)}</p>
                            </div>

                            {/* Item Details */}
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                                    <span className="text-sm font-bold text-secondary-500">
                                        {order.listing_brand.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-secondary-900">{order.listing_brand} {order.listing_model}</p>
                                    <p className="text-xs text-secondary-400">
                                        {order.storage || "256GB"} • {order.color || ""}
                                    </p>
                                </div>
                            </div>

                            {/* Seller */}
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-secondary-900">{order.seller_name || "—"}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-secondary-500">{order.seller_rating || "4.5"}</span>
                                    <span className="text-xs text-secondary-400 ml-1">{order.seller_city}</span>
                                </div>
                            </div>

                            {/* Buyer */}
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-secondary-900">{order.buyer_name || "—"}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-secondary-500">{order.buyer_rating || "4.5"}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                                {statusBadge(order.status)}
                            </div>

                            {/* Moderator Actions */}
                            <div className="col-span-3 flex justify-end gap-2">
                                <button
                                    onClick={() => router.push(`/admin/chats/${order.id}`)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                                        order.status === "completed"
                                            ? "bg-secondary-100 text-secondary-500"
                                            : "bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-500/20"
                                    )}
                                >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Message Seller
                                </button>
                                <button
                                    onClick={() => router.push(`/admin/chats/${order.id}`)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                                        order.status === "completed"
                                            ? "bg-secondary-100 text-secondary-500"
                                            : "border border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50"
                                    )}
                                >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Message Buyer
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-secondary-100 px-6 py-3">
                    <p className="text-xs text-secondary-500">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length.toLocaleString()} results
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "min-w-[28px] rounded-lg px-2 py-1 text-xs font-medium transition-all",
                                    currentPage === page
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-600 hover:bg-secondary-100"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        {totalPages > 4 && <span className="text-xs text-secondary-400 px-1">...</span>}
                        {totalPages > 3 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={cn(
                                    "min-w-[28px] rounded-lg px-2 py-1 text-xs font-medium transition-all",
                                    currentPage === totalPages
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-600 hover:bg-secondary-100"
                                )}
                            >
                                {totalPages}
                            </button>
                        )}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
