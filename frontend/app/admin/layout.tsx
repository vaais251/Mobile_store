"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    BarChart3,
    Menu,
    X,
    Shield,
    LogOut,
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
        href: "/admin/dashboard",
        icon: ShoppingBag,
    },
    {
        label: "Users",
        href: "/admin/dashboard",
        icon: Users,
    },
    {
        label: "Reports",
        href: "/admin/dashboard",
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

    return (
        <div className="flex min-h-screen bg-secondary-200">
            {/* ─── Desktop Sidebar ─────── */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-secondary-200 bg-white lg:flex">
                {/* Brand */}
                <div className="flex items-center gap-2.5 border-b border-secondary-100 px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-secondary-900">
                            PhoneMarket
                        </h1>
                        <p className="text-[11px] font-medium text-primary-500">
                            Admin Panel
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4">
                    <ul className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-primary-50 text-primary-600"
                                                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                                        )}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="border-t border-secondary-100 px-3 py-3">
                    <button
                        onClick={() => {
                            localStorage.removeItem("access_token");
                            router.push("/");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-secondary-500 transition-colors hover:bg-accent-50 hover:text-accent-600"
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
                            className="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-secondary-200 bg-white lg:hidden flex"
                        >
                            <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-secondary-900">
                                        Admin
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="rounded-lg p-1 text-secondary-500 hover:bg-secondary-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <nav className="flex-1 px-3 py-4">
                                <ul className="space-y-1">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        const isActive =
                                            pathname === item.href;
                                        return (
                                            <li key={item.label}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() =>
                                                        setSidebarOpen(false)
                                                    }
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                                                        isActive
                                                            ? "bg-primary-50 text-primary-600"
                                                            : "text-secondary-600 hover:bg-secondary-50"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
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
            <div className="flex flex-1 flex-col">
                {/* Top bar (mobile) */}
                <header className="flex items-center border-b border-secondary-200 bg-white px-4 py-3 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-1.5 text-secondary-600 hover:bg-secondary-100"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="ml-3 text-sm font-bold text-secondary-900">
                        Admin Panel
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
