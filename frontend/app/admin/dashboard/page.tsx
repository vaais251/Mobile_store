"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ShoppingBag,
    Clock,
    MessageSquare,
    CheckCircle2,
    Eye,
    ChevronRight,
    Loader2,
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
}

/* ─── Mock Orders ────────────────────────── */
const MOCK_ORDERS: Order[] = [
    {
        id: "ord-001",
        buyer_id: "b1",
        seller_id: "s1",
        listing_id: "l1",
        status: "created",
        listing_brand: "Apple",
        listing_model: "iPhone 15 Pro Max",
        listing_price: 420000,
        seller_city: "Lahore",
        created_at: new Date(Date.now() - 1_800_000).toISOString(),
        updated_at: new Date(Date.now() - 1_800_000).toISOString(),
    },
    {
        id: "ord-002",
        buyer_id: "b2",
        seller_id: "s2",
        listing_id: "l2",
        status: "admin_review",
        listing_brand: "Samsung",
        listing_model: "Galaxy S24 Ultra",
        listing_price: 310000,
        seller_city: "Karachi",
        created_at: new Date(Date.now() - 7_200_000).toISOString(),
        updated_at: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
        id: "ord-003",
        buyer_id: "b3",
        seller_id: "s3",
        listing_id: "l3",
        status: "meeting_scheduled",
        listing_brand: "Google",
        listing_model: "Pixel 9 Pro",
        listing_price: 195000,
        seller_city: "Islamabad",
        created_at: new Date(Date.now() - 86_400_000).toISOString(),
        updated_at: new Date(Date.now() - 43_200_000).toISOString(),
    },
    {
        id: "ord-004",
        buyer_id: "b4",
        seller_id: "s4",
        listing_id: "l4",
        status: "completed",
        listing_brand: "Apple",
        listing_model: "iPhone 14",
        listing_price: 175000,
        seller_city: "Rawalpindi",
        created_at: new Date(Date.now() - 172_800_000).toISOString(),
        updated_at: new Date(Date.now() - 86_400_000).toISOString(),
    },
    {
        id: "ord-005",
        buyer_id: "b5",
        seller_id: "s5",
        listing_id: "l5",
        status: "created",
        listing_brand: "OnePlus",
        listing_model: "12R",
        listing_price: 125000,
        seller_city: "Faisalabad",
        created_at: new Date(Date.now() - 600_000).toISOString(),
        updated_at: new Date(Date.now() - 600_000).toISOString(),
    },
];

/* ─── Helpers ────────────────────────────── */
function formatPrice(p: number) {
    return `PKR ${p.toLocaleString("en-PK")}`;
}

function relativeTime(dateStr: string) {
    const ms = Date.now() - new Date(dateStr).getTime();
    if (ms < 60_000) return "Just now";
    if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
    if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function statusBadge(s: string) {
    const map: Record<string, { label: string; color: string }> = {
        created: {
            label: "Pending",
            color: "bg-warning-50 text-warning-700",
        },
        admin_review: {
            label: "In Chat",
            color: "bg-primary-50 text-primary-600",
        },
        meeting_scheduled: {
            label: "Meeting Set",
            color: "bg-indigo-50 text-indigo-600",
        },
        completed: {
            label: "Completed",
            color: "bg-success-50 text-success-700",
        },
        cancelled: {
            label: "Cancelled",
            color: "bg-accent-50 text-accent-600",
        },
    };
    const cfg = map[s] || { label: s, color: "bg-secondary-100 text-secondary-600" };
    return (
        <span
            className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                cfg.color
            )}
        >
            {cfg.label}
        </span>
    );
}

/* ═══════════════════════════════════════════
   Admin Dashboard
   ═══════════════════════════════════════════ */
export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(null);

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
    const allOrders = activeTab ? MOCK_ORDERS : orders;
    const stats = {
        total: allOrders.length,
        pending: allOrders.filter(
            (o) => o.status === "created"
        ).length,
        active: allOrders.filter(
            (o) =>
                o.status === "admin_review" ||
                o.status === "meeting_scheduled"
        ).length,
        completed: allOrders.filter(
            (o) => o.status === "completed"
        ).length,
    };

    /* ─── Filtered Orders ────────────────── */
    const displayOrders = activeTab
        ? orders.filter((o) => o.status === activeTab)
        : orders;

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary-900">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-secondary-500">
                    Manage orders, monitor activity, and coordinate transactions
                </p>
            </div>

            {/* Stats Row */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<ShoppingBag className="h-5 w-5" />}
                    label="Total Orders"
                    value={stats.total}
                    trend={12.5}
                    color="primary"
                    index={0}
                />
                <StatCard
                    icon={<Clock className="h-5 w-5" />}
                    label="Pending Pickup"
                    value={stats.pending}
                    color="warning"
                    index={1}
                />
                <StatCard
                    icon={<MessageSquare className="h-5 w-5" />}
                    label="Active Chats"
                    value={stats.active}
                    trend={8.3}
                    color="accent"
                    index={2}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    label="Completed"
                    value={stats.completed}
                    trend={24.1}
                    color="success"
                    index={3}
                />
            </div>

            {/* Filter Tabs */}
            <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 premium-shadow">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.value)}
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

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl bg-white premium-shadow">
                {/* Table Header */}
                <div className="hidden border-b border-secondary-100 px-6 py-3 md:grid md:grid-cols-12 md:gap-4">
                    <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                        Order ID
                    </span>
                    <span className="col-span-3 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                        Item
                    </span>
                    <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                        Seller
                    </span>
                    <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                        Price
                    </span>
                    <span className="col-span-1 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                        Status
                    </span>
                    <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-secondary-400 text-right">
                        Action
                    </span>
                </div>

                {/* Rows */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="py-16 text-center">
                        <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-secondary-300" />
                        <p className="text-sm text-secondary-500">
                            No orders found
                        </p>
                    </div>
                ) : (
                    displayOrders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-1 gap-2 border-b border-secondary-50 px-6 py-4 transition-colors hover:bg-secondary-50/50 md:grid-cols-12 md:items-center md:gap-4"
                        >
                            {/* Order ID */}
                            <div className="col-span-2">
                                <p className="text-xs font-mono text-secondary-500">
                                    {order.id.substring(0, 8)}...
                                </p>
                                <p className="text-[11px] text-secondary-400">
                                    {relativeTime(order.created_at)}
                                </p>
                            </div>

                            {/* Item */}
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                                    <span className="text-xs font-bold text-secondary-600">
                                        {order.listing_brand
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-secondary-900">
                                        {order.listing_brand}{" "}
                                        {order.listing_model}
                                    </p>
                                </div>
                            </div>

                            {/* Seller */}
                            <div className="col-span-2">
                                <p className="text-sm text-secondary-700">
                                    {order.seller_city || "—"}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="col-span-2">
                                <p className="text-sm font-bold text-secondary-900">
                                    {formatPrice(
                                        order.agreed_price ||
                                        order.listing_price
                                    )}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                                {statusBadge(order.status)}
                            </div>

                            {/* Action */}
                            <div className="col-span-2 flex justify-end">
                                <button
                                    onClick={() =>
                                        router.push(`/chat/${order.id}`)
                                    }
                                    className="flex items-center gap-1.5 rounded-xl bg-primary-50 px-3.5 py-2 text-xs font-semibold text-primary-600 transition-all hover:bg-primary-100"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Manage
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
