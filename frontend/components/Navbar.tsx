"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MessageSquare,
    Plus,
    User,
    Menu,
    X,
    Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { label: "Browse", href: "/browse" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-secondary-300/60 bg-white/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* ─── Logo ───────────────────────── */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
                        <Smartphone className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-secondary-900">
                        Phone<span className="text-primary-500">ly</span>
                    </span>
                </Link>

                {/* ─── Desktop Search ─────────────── */}
                <div className="hidden md:block">
                    <div
                        className={cn(
                            "flex h-10 w-72 items-center gap-2 rounded-xl border bg-secondary-200/80 px-3 transition-all duration-200 lg:w-96",
                            searchFocused
                                ? "border-primary-500 bg-white shadow-sm ring-2 ring-primary-100"
                                : "border-transparent hover:bg-secondary-300/60"
                        )}
                    >
                        <Search className="h-4 w-4 shrink-0 text-secondary-500" />
                        <input
                            type="text"
                            placeholder="Search phones, brands, models..."
                            className="w-full bg-transparent text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div>
                </div>

                {/* ─── Desktop Actions ────────────── */}
                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 hover:text-secondary-900"
                        >
                            {l.label}
                        </Link>
                    ))}

                    <div className="mx-2 h-6 w-px bg-secondary-300" />

                    {/* Chat icon */}
                    <button
                        className="relative rounded-lg p-2 text-secondary-600 transition-colors hover:bg-secondary-200 hover:text-secondary-900"
                        aria-label="Chats"
                    >
                        <MessageSquare className="h-5 w-5" />
                        {/* Notification dot */}
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
                    </button>

                    {/* Profile */}
                    <button
                        className="rounded-lg p-2 text-secondary-600 transition-colors hover:bg-secondary-200 hover:text-secondary-900"
                        aria-label="Profile"
                    >
                        <User className="h-5 w-5" />
                    </button>

                    {/* List CTA */}
                    <Button
                        size="sm"
                        leftIcon={<Plus className="h-4 w-4" />}
                        className="ml-1"
                    >
                        List an Item
                    </Button>
                </div>

                {/* ─── Mobile Hamburger ───────────── */}
                <button
                    className="rounded-lg p-2 text-secondary-700 md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* ─── Mobile Menu ──────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-secondary-200 bg-white md:hidden"
                    >
                        <div className="space-y-1 px-4 pb-4 pt-3">
                            {/* Mobile search */}
                            <div className="mb-3 flex h-10 items-center gap-2 rounded-xl border border-secondary-300 bg-secondary-100 px-3">
                                <Search className="h-4 w-4 text-secondary-500" />
                                <input
                                    type="text"
                                    placeholder="Search phones..."
                                    className="w-full bg-transparent text-sm focus:outline-none"
                                />
                            </div>

                            {navLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {l.label}
                                </Link>
                            ))}

                            <div className="my-2 h-px bg-secondary-200" />

                            <Link
                                href="/chats"
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100"
                                onClick={() => setMobileOpen(false)}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Chats
                            </Link>

                            <Link
                                href="/profile"
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100"
                                onClick={() => setMobileOpen(false)}
                            >
                                <User className="h-4 w-4" />
                                Profile
                            </Link>

                            <Button
                                size="md"
                                leftIcon={<Plus className="h-4 w-4" />}
                                className="mt-2 w-full"
                            >
                                List an Item
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
