"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    ShoppingBag,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowUpRight,
    Calendar,
    Download,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────── */
interface MetricCard {
    label: string;
    value: string;
    change: number;
    icon: React.ElementType;
    color: string;
    iconBg: string;
}

/* ─── Mock Data ──────────────────────────── */
const METRICS: MetricCard[] = [
    { label: "Total Revenue", value: "$128,450", change: 15.3, icon: DollarSign, color: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Avg. Transaction Value", value: "$742", change: 8.1, icon: TrendingUp, color: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Resolution Rate", value: "94.8%", change: 2.4, icon: CheckCircle2, color: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Avg. Resolution Time", value: "2.3 days", change: -12.5, icon: Clock, color: "text-amber-600", iconBg: "bg-amber-50" },
];

const MONTHLY_DATA = [
    { month: "Aug", orders: 890, completed: 845, disputes: 12 },
    { month: "Sep", orders: 1020, completed: 975, disputes: 8 },
    { month: "Oct", orders: 1150, completed: 1090, disputes: 15 },
    { month: "Nov", orders: 980, completed: 940, disputes: 10 },
    { month: "Dec", orders: 1284, completed: 1220, disputes: 7 },
    { month: "Jan", orders: 1350, completed: 1290, disputes: 9 },
];

const TOP_SELLERS = [
    { name: "TechHub Ltd.", orders: 350, revenue: "$45,200", rating: 4.9, growth: 22 },
    { name: "Sarah Mitchell", orders: 128, revenue: "$18,500", rating: 4.7, growth: 15 },
    { name: "MobileWorld", orders: 95, revenue: "$14,300", rating: 4.8, growth: 8 },
    { name: "Jordan K.", orders: 72, revenue: "$9,800", rating: 4.5, growth: -3 },
    { name: "Digital Zone", orders: 68, revenue: "$8,900", rating: 4.6, growth: 12 },
];

const TOP_BRANDS = [
    { name: "Apple", percentage: 42, count: 539, color: "bg-blue-500" },
    { name: "Samsung", percentage: 28, count: 360, color: "bg-emerald-500" },
    { name: "Google", percentage: 12, count: 154, color: "bg-amber-500" },
    { name: "OnePlus", percentage: 10, count: 128, color: "bg-purple-500" },
    { name: "Others", percentage: 8, count: 103, color: "bg-secondary-400" },
];

const RECENT_DISPUTES = [
    { id: "DSP-421", reason: "Item not as described", buyer: "Alex T.", seller: "Jordan K.", status: "investigating", date: "2 days ago" },
    { id: "DSP-418", reason: "No-show at pickup", buyer: "Lisa P.", seller: "MobileWorld", status: "resolved", date: "5 days ago" },
    { id: "DSP-415", reason: "Price disagreement", buyer: "Mike R.", seller: "Digital Zone", status: "pending", date: "1 week ago" },
];

/* ═══════════════════════════════════════════
   Reports Page
   ═══════════════════════════════════════════ */
export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState("30d");

    const maxOrders = Math.max(...MONTHLY_DATA.map(d => d.orders));

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Reports</h1>
                    <p className="mt-1 text-sm text-secondary-500">Analytics and insights for your marketplace</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-xl bg-white p-1 premium-shadow">
                        {["7d", "30d", "90d", "1y"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                                    timeRange === range
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                )}
                            >
                                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {METRICS.map((metric, i) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-2xl bg-white p-5 premium-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-500">{metric.label}</p>
                                    <p className="mt-1 text-[28px] font-extrabold text-secondary-900 leading-tight">{metric.value}</p>
                                </div>
                                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", metric.iconBg)}>
                                    <Icon className={cn("h-5 w-5", metric.color)} />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
                                {metric.change > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={metric.change > 0 ? "text-emerald-600" : "text-red-500"}>
                                    {Math.abs(metric.change)}%
                                </span>
                                <span className="text-secondary-400">vs last period</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Orders Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 rounded-2xl bg-white p-6 premium-shadow"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-secondary-900">Orders Overview</h2>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary-500" /> Orders</div>
                            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed</div>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 h-48">
                        {MONTHLY_DATA.map((d, i) => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex gap-1 items-end" style={{ height: "160px" }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.orders / maxOrders) * 100}%` }}
                                        transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                                        className="flex-1 rounded-t-md bg-primary-100"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.completed / maxOrders) * 100}%` }}
                                        transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                                        className="flex-1 rounded-t-md bg-emerald-400"
                                    />
                                </div>
                                <span className="text-[10px] text-secondary-400 font-medium">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Brand Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl bg-white p-6 premium-shadow"
                >
                    <h2 className="text-sm font-bold text-secondary-900 mb-4">Brand Distribution</h2>
                    <div className="space-y-4">
                        {TOP_BRANDS.map((brand) => (
                            <div key={brand.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-secondary-700">{brand.name}</span>
                                    <span className="text-xs text-secondary-500">{brand.count} ({brand.percentage}%)</span>
                                </div>
                                <div className="h-2 rounded-full bg-secondary-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${brand.percentage}%` }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className={cn("h-full rounded-full", brand.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Sellers */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl bg-white premium-shadow overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
                        <h2 className="text-sm font-bold text-secondary-900">Top Sellers</h2>
                        <button className="text-xs font-semibold text-primary-500 hover:text-primary-600">View All</button>
                    </div>
                    {TOP_SELLERS.map((seller, i) => (
                        <div key={seller.name} className="flex items-center gap-4 border-b border-secondary-50 px-6 py-3.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[10px] font-bold text-secondary-500">
                                {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-secondary-900">{seller.name}</p>
                                <p className="text-xs text-secondary-400">{seller.orders} orders • {seller.revenue}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    <span className="text-xs font-medium text-secondary-700">{seller.rating}</span>
                                </div>
                                <span className={cn("text-[10px] font-medium", seller.growth > 0 ? "text-emerald-600" : "text-red-500")}>
                                    {seller.growth > 0 ? "+" : ""}{seller.growth}%
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Recent Disputes */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-2xl bg-white premium-shadow overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
                        <h2 className="text-sm font-bold text-secondary-900">Recent Disputes</h2>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{RECENT_DISPUTES.filter(d => d.status !== "resolved").length} Active</span>
                    </div>
                    {RECENT_DISPUTES.map((dispute) => (
                        <div key={dispute.id} className="border-b border-secondary-50 px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-secondary-700">{dispute.id}</span>
                                        <span className={cn(
                                            "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                            dispute.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                                                dispute.status === "investigating" ? "bg-blue-100 text-blue-700" :
                                                    "bg-amber-100 text-amber-700"
                                        )}>
                                            {dispute.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-secondary-900">{dispute.reason}</p>
                                    <p className="text-xs text-secondary-400 mt-0.5">{dispute.buyer} → {dispute.seller}</p>
                                </div>
                                <span className="text-[11px] text-secondary-400">{dispute.date}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
