"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Smartphone,
    CheckCircle2,
    Tag,
    AlertTriangle,
    Search,
    ChevronDown,
    SlidersHorizontal,
    Pencil,
    MessageSquare,
    Trash2,
    MapPin,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════ */
interface Listing {
    id: string;
    brand: string;
    model: string;
    thumbnail: string | null;
    phone_type: "new" | "used";
    location_city: string;
    price: number;
    status: "available" | "sold" | "pending";
    created_at: string;
}

const MOCK_LISTINGS: Listing[] = [
    {
        id: "1",
        brand: "Apple",
        model: "iPhone 14 Pro Max",
        thumbnail: null,
        phone_type: "new",
        location_city: "Downtown Hub",
        price: 1099.0,
        status: "available",
        created_at: "2023-10-24T00:00:00Z",
    },
    {
        id: "2",
        brand: "Samsung",
        model: "Galaxy S22",
        thumbnail: null,
        phone_type: "used",
        location_city: "North Side",
        price: 649.0,
        status: "sold",
        created_at: "2023-10-20T00:00:00Z",
    },
    {
        id: "3",
        brand: "Google",
        model: "Pixel 7 Pro",
        thumbnail: null,
        phone_type: "used",
        location_city: "East Market",
        price: 899.0,
        status: "pending",
        created_at: "2023-10-28T00:00:00Z",
    },
    {
        id: "4",
        brand: "OnePlus",
        model: "11 5G",
        thumbnail: null,
        phone_type: "new",
        location_city: "West Plaza",
        price: 729.0,
        status: "available",
        created_at: "2023-10-15T00:00:00Z",
    },
    {
        id: "5",
        brand: "Xiaomi",
        model: "13 Pro",
        thumbnail: null,
        phone_type: "used",
        location_city: "Central Market",
        price: 549.0,
        status: "available",
        created_at: "2023-10-18T00:00:00Z",
    },
    {
        id: "6",
        brand: "Apple",
        model: "iPhone 13",
        thumbnail: null,
        phone_type: "used",
        location_city: "South Gate",
        price: 699.0,
        status: "sold",
        created_at: "2023-10-12T00:00:00Z",
    },
    {
        id: "7",
        brand: "Samsung",
        model: "Galaxy Z Fold5",
        thumbnail: null,
        phone_type: "new",
        location_city: "Downtown Hub",
        price: 1799.0,
        status: "available",
        created_at: "2023-10-25T00:00:00Z",
    },
    {
        id: "8",
        brand: "Google",
        model: "Pixel 8",
        thumbnail: null,
        phone_type: "new",
        location_city: "North Side",
        price: 699.0,
        status: "pending",
        created_at: "2023-10-22T00:00:00Z",
    },
    {
        id: "9",
        brand: "Oppo",
        model: "Find X6 Pro",
        thumbnail: null,
        phone_type: "used",
        location_city: "East Market",
        price: 599.0,
        status: "available",
        created_at: "2023-10-10T00:00:00Z",
    },
    {
        id: "10",
        brand: "Vivo",
        model: "X90 Pro",
        thumbnail: null,
        phone_type: "new",
        location_city: "Central Market",
        price: 849.0,
        status: "sold",
        created_at: "2023-10-08T00:00:00Z",
    },
];

const TOTAL_RESULTS = 42;

/* ─── Stat Cards Config ──────────────────── */
const stats = [
    {
        label: "Total Listings",
        value: 42,
        icon: Smartphone,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
    },
    {
        label: "Available",
        value: 28,
        icon: CheckCircle2,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
    },
    {
        label: "Sold",
        value: 11,
        icon: Tag,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
    },
    {
        label: "Moderation",
        value: 3,
        icon: AlertTriangle,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
    },
];

/* ─── Helpers ────────────────────────────── */
function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; dot: string; text: string; label: string }> = {
        available: {
            bg: "bg-emerald-50",
            dot: "bg-emerald-500",
            text: "text-emerald-700",
            label: "Available",
        },
        sold: {
            bg: "bg-secondary-100",
            dot: "bg-secondary-400",
            text: "text-secondary-600",
            label: "Sold",
        },
        pending: {
            bg: "bg-amber-50",
            dot: "bg-amber-500",
            text: "text-amber-700",
            label: "Moderation",
        },
    };
    const c = config[status] || config.available;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                c.bg,
                c.text
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
            {c.label}
        </span>
    );
}

function ConditionBadge({ type }: { type: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                type === "new"
                    ? "bg-primary-50 text-primary-600"
                    : "bg-amber-50 text-amber-600"
            )}
        >
            {type}
        </span>
    );
}

/* ═══════════════════════════════════════════
   Seller Inventory Page
   ═══════════════════════════════════════════ */
export default function SellerInventoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    /* ─── Filtered Listings ─────────────── */
    const filtered = useMemo(() => {
        return MOCK_LISTINGS.filter((l) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (
                    !l.brand.toLowerCase().includes(q) &&
                    !l.model.toLowerCase().includes(q)
                )
                    return false;
            }
            if (statusFilter !== "all" && l.status !== statusFilter)
                return false;
            if (conditionFilter !== "all" && l.phone_type !== conditionFilter)
                return false;
            return true;
        });
    }, [searchQuery, statusFilter, conditionFilter]);

    const totalPages = Math.ceil(TOTAL_RESULTS / pageSize);
    const showStart = (currentPage - 1) * pageSize + 1;
    const showEnd = Math.min(currentPage * pageSize, TOTAL_RESULTS);

    return (
        <div className="space-y-6">
            {/* ═══ Stat Cards ═══════════════ */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.3 }}
                            className="flex items-center gap-4 rounded-2xl bg-white p-5 premium-shadow"
                        >
                            <div
                                className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-xl",
                                    stat.iconBg
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-6 w-6",
                                        stat.iconColor
                                    )}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-secondary-500">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-extrabold text-secondary-900">
                                    {stat.value}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ═══ Search & Filters ═════════ */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-5 py-4 premium-shadow"
            >
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search phone models, brands..."
                        className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 appearance-none rounded-xl border border-secondary-200 bg-white pl-4 pr-9 text-sm font-medium text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="pending">Moderation</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" />
                </div>

                {/* Condition Filter */}
                <div className="relative">
                    <select
                        value={conditionFilter}
                        onChange={(e) => setConditionFilter(e.target.value)}
                        className="h-10 appearance-none rounded-xl border border-secondary-200 bg-white pl-4 pr-9 text-sm font-medium text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="all">All Condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" />
                </div>

                {/* More Filters */}
                <button className="flex h-10 items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50">
                    <SlidersHorizontal className="h-4 w-4" />
                    More Filters
                </button>
            </motion.div>

            {/* ═══ Inventory Table ══════════ */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="overflow-hidden rounded-2xl bg-white premium-shadow"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-secondary-100">
                                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-400">
                                    Phone Listing
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-400">
                                    Condition
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-400">
                                    Location
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-400">
                                    Price
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-400">
                                    Status
                                </th>
                                <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-secondary-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((listing, i) => (
                                <tr
                                    key={listing.id}
                                    className="border-b border-secondary-50 transition-colors hover:bg-secondary-50/50 last:border-0"
                                >
                                    {/* Phone Listing */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Thumbnail */}
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100">
                                                <Smartphone className="h-5 w-5 text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-secondary-900">
                                                    {listing.brand}{" "}
                                                    {listing.model}
                                                </p>
                                                <p className="text-xs text-secondary-400">
                                                    Added:{" "}
                                                    {formatDate(
                                                        listing.created_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Condition */}
                                    <td className="px-4 py-4">
                                        <ConditionBadge
                                            type={listing.phone_type}
                                        />
                                    </td>

                                    {/* Location */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1 text-sm text-secondary-600">
                                            <MapPin className="h-3.5 w-3.5 text-primary-400" />
                                            {listing.location_city}
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-semibold text-secondary-900">
                                            $
                                            {listing.price
                                                .toFixed(2)
                                                .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                )}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <StatusBadge
                                            status={listing.status}
                                        />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                className="rounded-lg p-2 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="rounded-lg p-2 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
                                                title="Messages"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="rounded-lg p-2 text-secondary-400 transition-colors hover:bg-accent-50 hover:text-accent-500"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ─── Pagination ──────────── */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-secondary-100 px-6 py-4 sm:flex-row">
                    <p className="text-sm text-secondary-500">
                        Showing{" "}
                        <span className="font-medium text-secondary-700">
                            {showStart}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-secondary-700">
                            {showEnd}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-secondary-700">
                            {TOTAL_RESULTS}
                        </span>{" "}
                        results
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-400 transition-colors hover:bg-secondary-50 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from(
                            { length: Math.min(totalPages, 3) },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                                    currentPage === page
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-400 transition-colors hover:bg-secondary-50 disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ═══ Bottom Section ═══════════ */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* ─── Active Pickup Locations ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="rounded-2xl bg-white p-6 premium-shadow lg:col-span-3"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary-500" />
                        <h3 className="text-base font-bold text-secondary-900">
                            Active Pickup Locations
                        </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {/* Location Card 1 */}
                        <div className="rounded-xl border border-secondary-200 p-4">
                            <h4 className="text-sm font-semibold text-secondary-900">
                                Downtown Central Hub
                            </h4>
                            <p className="mt-0.5 text-xs text-secondary-500">
                                123 Market St, Financial District
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-medium text-emerald-600">
                                    OPEN (Pickups available)
                                </span>
                            </div>
                        </div>
                        {/* Location Card 2 */}
                        <div className="rounded-xl border border-secondary-200 p-4">
                            <h4 className="text-sm font-semibold text-secondary-900">
                                North side Delivery Point
                            </h4>
                            <p className="mt-0.5 text-xs text-secondary-500">
                                456 Pine Rd, Uptown Plaza
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-medium text-emerald-600">
                                    OPEN (Pickups available)
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Moderation Status ──────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-200 bg-white p-6 text-center lg:col-span-2"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                        <ShieldCheck className="h-7 w-7 text-primary-500" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-secondary-900">
                        Moderation Status
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-secondary-500">
                        All chats are monitored by admins to ensure safe
                        transactions for local pickups.
                    </p>
                    <Link
                        href="/safety"
                        className="mt-3 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        Read safety guidelines
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
