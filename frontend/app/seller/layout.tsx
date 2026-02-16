"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    MessageCircle,
    Clock,
    Settings,
    Menu,
    X,
    Smartphone,
    LogOut,
    Bell,
    Plus,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Sidebar Links ──────────────────────── */
const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/seller/inventory",
        icon: LayoutDashboard,
    },
    {
        label: "Inventory",
        href: "/seller/inventory",
        icon: Package,
    },
    {
        label: "Messages",
        href: "/seller/messages",
        icon: MessageCircle,
        badge: 3,
    },
    {
        label: "Sales History",
        href: "/seller/sales",
        icon: Clock,
    },
    {
        label: "Settings",
        href: "/seller/settings",
        icon: Settings,
    },
];

/* ═══════════════════════════════════════════
   Seller Layout
   ═══════════════════════════════════════════ */
export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [sellerName, setSellerName] = useState("Seller");

    /* ─── Role Guard ─────────────────────── */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.role !== "seller") {
                router.push("/");
                return;
            }
            setSellerName(payload.name || "Seller");
            setAuthorized(true);
        } catch {
            router.push("/login");
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
                <div className="flex flex-col items-center gap-3">
                    <Smartphone className="h-10 w-10 text-primary-500 animate-pulse" />
                    <p className="text-sm text-secondary-500">
                        Verifying seller access...
                    </p>
                </div>
            </div>
        );
    }

    const isActivePath = (href: string) => {
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FB]">
            {/* ─── Desktop Sidebar ─────── */}
            <aside className="hidden w-[220px] shrink-0 flex-col border-r border-secondary-200 bg-white lg:flex">
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-5 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                        <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-[15px] font-bold tracking-tight text-secondary-900">
                        Mobi
                        <span className="text-primary-500">Market</span>
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
                                                ? "bg-primary-50 text-primary-600 font-semibold"
                                                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-[18px] w-[18px]",
                                                isActive
                                                    ? "text-primary-600"
                                                    : "text-secondary-400"
                                            )}
                                        />
                                        <span className="flex-1">
                                            {item.label}
                                        </span>
                                        {item.badge && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Seller Profile */}
                <div className="border-t border-secondary-100 px-4 py-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                            <span className="text-xs font-bold text-white">
                                {sellerName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-secondary-900 truncate">
                                {sellerName}
                            </p>
                            <p className="text-[10px] font-medium text-success-500">
                                Verified Seller
                            </p>
                        </div>
                    </div>
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
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            className="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col bg-white lg:hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                                        <Smartphone className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[15px] font-bold text-secondary-900">
                                        Mobi
                                        <span className="text-primary-500">
                                            Market
                                        </span>
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
                                        const isActive = isActivePath(
                                            item.href
                                        );
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
                                                            ? "bg-primary-50 text-primary-600 font-semibold"
                                                            : "text-secondary-600 hover:bg-secondary-50"
                                                    )}
                                                >
                                                    <Icon
                                                        className={cn(
                                                            "h-[18px] w-[18px]",
                                                            isActive
                                                                ? "text-primary-600"
                                                                : "text-secondary-400"
                                                        )}
                                                    />
                                                    <span className="flex-1">
                                                        {item.label}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            {/* Seller Profile */}
                            <div className="border-t border-secondary-100 px-4 py-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                                        <span className="text-xs font-bold text-white">
                                            {sellerName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-secondary-900 truncate">
                                            {sellerName}
                                        </p>
                                        <p className="text-[10px] font-medium text-success-500">
                                            Verified Seller
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                        <h2 className="text-xl font-bold text-secondary-900">
                            Seller Inventory
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative rounded-xl p-2 text-secondary-500 hover:bg-secondary-50 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500" />
                        </button>
                        <Link
                            href="/sell"
                            className="hidden sm:flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Listing
                            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                        </Link>
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
