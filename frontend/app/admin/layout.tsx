"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    MessageCircle,
    BarChart3,
    Menu,
    X,
    Shield,
    LogOut,
    Bell,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Sidebar Links ──────────────────────── */
const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "All Chats",
        href: "/admin/chats",
        icon: MessageCircle,
    },
    {
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
    },
];

/* ═══════════════════════════════════════════
   Admin Layout
   ═══════════════════════════════════════════ */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [adminName, setAdminName] = useState("Admin");

    /* ─── Role Guard ─────────────────────── */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.role !== "admin") {
                router.push("/");
                return;
            }
            setAdminName(payload.name || "Admin");
            setAuthorized(true);
        } catch {
            router.push("/");
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary-200">
                <div className="flex flex-col items-center gap-3">
                    <Shield className="h-10 w-10 text-secondary-400 animate-pulse" />
                    <p className="text-sm text-secondary-500">
                        Verifying admin access...
                    </p>
                </div>
            </div>
        );
    }

    const isActivePath = (href: string) => {
        if (href === "/admin/dashboard") return pathname === "/admin/dashboard" || pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FB]">
            {/* ─── Desktop Sidebar ─────── */}
            <aside className="hidden w-[240px] shrink-0 flex-col bg-white border-r border-secondary-200 lg:flex">
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-[15px] font-bold text-secondary-900 tracking-tight">
                        PhoneHub
                    </h1>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2">
                    <ul className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActivePath(item.href);
                            return (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all",
                                            isActive
                                                ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                                                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                                        )}
                                    >
                                        <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "")} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Admin Info + Logout */}
                <div className="border-t border-secondary-100 px-4 py-3">
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
                            <span className="text-xs font-bold text-primary-600">
                                {adminName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-secondary-900 truncate">{adminName}</p>
                            <p className="text-[10px] text-secondary-500">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("access_token");
                            router.push("/");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-xs font-medium text-secondary-500 transition-colors hover:bg-accent-50 hover:text-accent-600"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ─── Mobile Sidebar ─────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            className="fixed inset-y-0 left-0 z-50 w-[240px] flex-col bg-white lg:hidden flex"
                        >
                            <div className="flex items-center justify-between px-6 py-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[15px] font-bold text-secondary-900">
                                        PhoneHub
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="rounded-lg p-1 text-secondary-500 hover:bg-secondary-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <nav className="flex-1 px-3 py-2">
                                <ul className="space-y-0.5">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = isActivePath(item.href);
                                        return (
                                            <li key={item.label}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() =>
                                                        setSidebarOpen(false)
                                                    }
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all",
                                                        isActive
                                                            ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                                                            : "text-secondary-600 hover:bg-secondary-50"
                                                    )}
                                                >
                                                    <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "")} />
                                                    {item.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Main Content ─────── */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top bar */}
                <header className="flex items-center justify-between border-b border-secondary-200 bg-white px-4 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-1.5 text-secondary-600 hover:bg-secondary-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative rounded-xl p-2 text-secondary-500 hover:bg-secondary-50 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500" />
                        </button>
                        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-secondary-50 px-3 py-1.5 cursor-pointer hover:bg-secondary-100 transition-colors">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500">
                                <span className="text-[10px] font-bold text-white">
                                    {adminName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-secondary-700">{adminName}</span>
                            <ChevronDown className="h-3 w-3 text-secondary-400" />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
