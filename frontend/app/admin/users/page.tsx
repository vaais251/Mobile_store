"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    Star,
    Shield,
    ShoppingBag,
    Eye,
    Ban,
    CheckCircle,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    UserCheck,
    UserX,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    address_city: string;
    shop_name?: string;
    is_individual: boolean;
    created_at: string;
    rating?: number;
    total_orders?: number;
    status?: string;
}

/* ─── Tabs ───────────────────────────────── */
const USER_TABS = [
    { label: "All Users", value: null },
    { label: "Buyers", value: "buyer" },
    { label: "Sellers", value: "seller" },
    { label: "Admins", value: "admin" },
];

/* ─── Mock Users ─────────────────────────── */
const MOCK_USERS: User[] = [
    { id: "u1", name: "John Davidson", phone: "+1234567890", email: "john@email.com", role: "buyer", address_city: "New York", is_individual: true, created_at: "2021-05-15", rating: 4.9, total_orders: 42, status: "verified" },
    { id: "u2", name: "Sarah Mitchell", phone: "+1234567891", email: "sarah@email.com", role: "seller", address_city: "Chicago", is_individual: true, created_at: "2019-01-20", rating: 4.7, total_orders: 128, status: "verified" },
    { id: "u3", name: "Mike Rodriguez", phone: "+1234567892", email: "mike@email.com", role: "buyer", address_city: "Brooklyn", is_individual: true, created_at: "2022-08-10", rating: 4.5, total_orders: 8, status: "active" },
    { id: "u4", name: "TechHub Ltd.", phone: "+1234567893", email: "info@techhub.com", role: "seller", address_city: "Manhattan", is_individual: false, shop_name: "TechHub Ltd.", created_at: "2020-03-01", rating: 4.8, total_orders: 350, status: "verified" },
    { id: "u5", name: "Elena Quinn", phone: "+1234567894", email: "elena@email.com", role: "buyer", address_city: "Queens", is_individual: true, created_at: "2023-02-14", rating: 4.2, total_orders: 3, status: "active" },
    { id: "u6", name: "David Williams", phone: "+1234567895", role: "buyer", address_city: "Bronx", is_individual: true, created_at: "2023-06-22", rating: 3.8, total_orders: 1, status: "flagged" },
];

/* ═══════════════════════════════════════════
   Users Management Page
   ═══════════════════════════════════════════ */
export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // In the future this would call the API
                setUsers(MOCK_USERS);
            } catch {
                setUsers(MOCK_USERS);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u) => {
        const matchTab = !activeTab || u.role === activeTab;
        const matchSearch = !searchQuery ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.phone.includes(searchQuery) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchTab && matchSearch;
    });

    const roleBadge = (role: string) => {
        const map: Record<string, { label: string; color: string }> = {
            buyer: { label: "Buyer", color: "bg-blue-100 text-blue-700" },
            seller: { label: "Seller", color: "bg-emerald-100 text-emerald-700" },
            admin: { label: "Admin", color: "bg-purple-100 text-purple-700" },
        };
        const cfg = map[role] || { label: role, color: "bg-secondary-100 text-secondary-600" };
        return <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>;
    };

    const statusIndicator = (status?: string) => {
        const colors: Record<string, string> = {
            verified: "bg-emerald-400",
            active: "bg-blue-400",
            flagged: "bg-amber-400",
            banned: "bg-red-400",
        };
        return <span className={cn("h-2.5 w-2.5 rounded-full", colors[status || "active"] || "bg-secondary-300")} />;
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
                    <p className="mt-1 text-sm text-secondary-500">Manage marketplace users and their verification</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-64 rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm placeholder:text-secondary-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="rounded-2xl bg-white p-5 premium-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Total Users</p>
                            <p className="mt-1 text-[28px] font-extrabold text-secondary-900 leading-tight">2,847</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50"><Users className="h-5 w-5 text-blue-500" /></div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <TrendingUp className="h-3 w-3" />+5.2% this month
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl bg-white p-5 premium-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Verified</p>
                            <p className="mt-1 text-[28px] font-extrabold text-secondary-900 leading-tight">1,945</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50"><UserCheck className="h-5 w-5 text-emerald-500" /></div>
                    </div>
                    <p className="mt-2 text-xs text-secondary-500">68% verification rate</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-2xl bg-white p-5 premium-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Active Sellers</p>
                            <p className="mt-1 text-[28px] font-extrabold text-secondary-900 leading-tight">423</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50"><ShoppingBag className="h-5 w-5 text-amber-500" /></div>
                    </div>
                    <p className="mt-2 text-xs text-secondary-500">189 individual, 234 shops</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="rounded-2xl bg-white p-5 premium-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Flagged</p>
                            <p className="mt-1 text-[28px] font-extrabold text-secondary-900 leading-tight">12</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50"><UserX className="h-5 w-5 text-red-500" /></div>
                    </div>
                    <p className="mt-2 text-xs text-red-500 font-medium">3 require review</p>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl bg-white p-1 premium-shadow w-fit">
                {USER_TABS.map((tab) => (
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

            {/* Users Table */}
            <div className="overflow-hidden rounded-2xl bg-white premium-shadow">
                <div className="hidden border-b border-secondary-100 px-6 py-3 lg:grid lg:grid-cols-12 lg:gap-4">
                    <span className="col-span-3 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">User</span>
                    <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Role</span>
                    <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Location</span>
                    <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Rating</span>
                    <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Orders</span>
                    <span className="col-span-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Joined</span>
                    <span className="col-span-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-400 text-right">Actions</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="mx-auto mb-3 h-10 w-10 text-secondary-300" />
                        <p className="text-sm text-secondary-500">No users found</p>
                    </div>
                ) : (
                    filteredUsers.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-1 gap-3 border-b border-secondary-50 px-6 py-4 transition-colors hover:bg-secondary-50/50 lg:grid-cols-12 lg:items-center lg:gap-4"
                        >
                            {/* User */}
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="relative">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                                        <span className="text-sm font-bold text-primary-600">{user.name.charAt(0)}</span>
                                    </div>
                                    <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white", user.status === "verified" ? "bg-emerald-400" : user.status === "flagged" ? "bg-amber-400" : "bg-blue-400")} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-secondary-900 truncate">{user.name}</p>
                                    <p className="text-xs text-secondary-400 truncate">{user.email || user.phone}</p>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="col-span-2">
                                {roleBadge(user.role)}
                                {user.shop_name && <p className="text-[10px] text-secondary-400 mt-0.5">{user.shop_name}</p>}
                            </div>

                            {/* Location */}
                            <div className="col-span-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-secondary-400" />
                                <span className="text-sm text-secondary-600">{user.address_city}</span>
                            </div>

                            {/* Rating */}
                            <div className="col-span-1 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium text-secondary-700">{user.rating || "N/A"}</span>
                            </div>

                            {/* Orders */}
                            <div className="col-span-1">
                                <span className="text-sm text-secondary-700">{user.total_orders || 0}</span>
                            </div>

                            {/* Joined */}
                            <div className="col-span-1">
                                <span className="text-xs text-secondary-500">{new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-2">
                                <button className="flex items-center gap-1 rounded-lg bg-secondary-100 px-3 py-1.5 text-xs font-medium text-secondary-600 hover:bg-secondary-200 transition-colors">
                                    <Eye className="h-3 w-3" />
                                    View
                                </button>
                                {user.status === "flagged" ? (
                                    <button className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors">
                                        <CheckCircle className="h-3 w-3" />
                                        Verify
                                    </button>
                                ) : (
                                    <button className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                                        <Ban className="h-3 w-3" />
                                        Flag
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
