"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShoppingBag,
    Clock,
    MessageSquare,
    CheckCircle2,
    TrendingUp,
    ArrowUpRight,
    AlertCircle,
    MapPin,
    Users,
    Activity,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
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

interface RecentActivity {
    id: string;
    user_name: string;
    action: string;
    time: string;
    avatar_initial: string;
}

/* ─── Mock Data ──────────────────────────── */
const MOCK_ORDERS: Order[] = [
    {
        id: "ord-8821",
        buyer_id: "b1",
        seller_id: "s1",
        listing_id: "l1",
        status: "admin_review",
        listing_brand: "Apple",
        listing_model: "iPhone 14 Pro",
        listing_price: 850,
        seller_city: "New York",
        created_at: "2023-10-24T10:00:00Z",
        updated_at: "2023-10-24T10:00:00Z",
    },
    {
        id: "ord-8819",
        buyer_id: "b2",
        seller_id: "s2",
        listing_id: "l2",
        status: "created",
        listing_brand: "Apple",
        listing_model: "iPhone 13 Mini",
        listing_price: 620,
        seller_city: "New Jersey",
        created_at: "2023-10-23T10:00:00Z",
        updated_at: "2023-10-23T10:00:00Z",
    },
    {
        id: "ord-8815",
        buyer_id: "b3",
        seller_id: "s3",
        listing_id: "l3",
        status: "completed",
        listing_brand: "Samsung",
        listing_model: "S22 Ultra",
        listing_price: 780,
        seller_city: "Bronx",
        created_at: "2023-10-22T10:00:00Z",
        updated_at: "2023-10-22T10:00:00Z",
    },
];

const MOCK_ACTIVITY: RecentActivity[] = [
    {
        id: "1",
        user_name: "Johnathan Doe",
        action: "Is the buyer verified? They're asking for a lower price...",
        time: "2m ago",
        avatar_initial: "JD",
    },
    {
        id: "2",
        user_name: "Sarah Smith",
        action: "Payment confirmed for order #8821",
        time: "15m ago",
        avatar_initial: "SS",
    },
    {
        id: "3",
        user_name: "Mike Johnson",
        action: "New order request submitted",
        time: "1h ago",
        avatar_initial: "MJ",
    },
];

/* ─── Helpers ────────────────────────────── */
function statusBadge(s: string) {
    const map: Record<string, { label: string; color: string }> = {
        created: {
            label: "Pending",
            color: "bg-amber-100 text-amber-700",
        },
        admin_review: {
            label: "In-Chat",
            color: "bg-blue-100 text-blue-700",
        },
        meeting_scheduled: {
            label: "Meeting Set",
            color: "bg-indigo-100 text-indigo-700",
        },
        completed: {
            label: "Completed",
            color: "bg-emerald-100 text-emerald-700",
        },
        cancelled: {
            label: "Cancelled",
            color: "bg-red-100 text-red-700",
        },
    };
    const cfg = map[s] || { label: s, color: "bg-secondary-100 text-secondary-600" };
    return (
        <span
            className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
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

    /* ─── Fetch Orders ───────────────────── */
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/v1/orders/");
                const data = res.data?.items || res.data || [];
                setOrders(data.length > 0 ? data : MOCK_ORDERS);
            } catch {
                setOrders(MOCK_ORDERS);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary-900">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-secondary-500">
                    Overview of your marketplace activity
                </p>
            </div>

            {/* Stats Row */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<ShoppingBag className="h-5 w-5" />}
                    label="Total Orders"
                    value={1284}
                    trend={12.5}
                    subtitle="+12.5% from last month"
                    color="primary"
                    index={0}
                />
                <StatCard
                    icon={<MapPin className="h-5 w-5" />}
                    label="Pending Pickup"
                    value={42}
                    subtitle="Average 2.4 days wait"
                    color="warning"
                    index={1}
                />
                <StatCard
                    icon={<MessageSquare className="h-5 w-5" />}
                    label="Active Chats"
                    value={18}
                    subtitle="8 required admin attention"
                    color="accent"
                    index={2}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    label="Completed"
                    value={1120}
                    subtitle="98% Success rate"
                    color="success"
                    index={3}
                />
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Orders */}
                <div className="lg:col-span-2 rounded-2xl bg-white premium-shadow overflow-hidden">
                    <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
                        <h2 className="text-sm font-bold text-secondary-900">Recent Orders</h2>
                        <Link
                            href="/admin/orders"
                            className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            View All
                            <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-secondary-50">
                        {orders.slice(0, 5).map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-4 px-6 py-3.5 hover:bg-secondary-50/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/admin/orders`)}
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-100">
                                    <span className="text-xs font-bold text-secondary-600">
                                        {order.listing_brand.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-secondary-900 truncate">
                                        {order.listing_brand} {order.listing_model}
                                    </p>
                                    <p className="text-xs text-secondary-400">#{order.id}</p>
                                </div>
                                <div className="text-right">
                                    {statusBadge(order.status)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Chat Activity */}
                <div className="rounded-2xl bg-white premium-shadow overflow-hidden">
                    <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
                        <h2 className="text-sm font-bold text-secondary-900">Recent Chat Activity</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-secondary-400">Live</span>
                        </div>
                    </div>
                    <div className="divide-y divide-secondary-50">
                        {MOCK_ACTIVITY.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary-50/50 transition-colors cursor-pointer"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                    <span className="text-[10px] font-bold">{activity.avatar_initial}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs">
                                        <span className="font-semibold text-secondary-900">{activity.user_name}</span>
                                        <span className="text-secondary-400"> to Admin</span>
                                    </p>
                                    <p className="mt-0.5 text-xs text-secondary-500 line-clamp-2">{activity.action}</p>
                                </div>
                                <span className="shrink-0 text-[10px] text-secondary-400">{activity.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl bg-white p-5 premium-shadow"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-secondary-900">856</p>
                            <p className="text-xs text-secondary-500">Active Users</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">+8.2% this week</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl bg-white p-5 premium-shadow"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-secondary-900">5</p>
                            <p className="text-xs text-secondary-500">Open Disputes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                        <span className="font-medium">2 require immediate action</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl bg-white p-5 premium-shadow"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <Activity className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-secondary-900">$48.2K</p>
                            <p className="text-xs text-secondary-500">Monthly Volume</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">+15.3% from last month</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
