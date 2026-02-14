"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickFilters = [
    "All",
    "iPhone",
    "Samsung",
    "Google Pixel",
    "Xiaomi",
    "OnePlus",
    "Oppo",
];

export function HeroSection() {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-secondary-50 to-secondary-200 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
            {/* Background decoration */}
            <div className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
            <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-primary-50/50 blur-3xl" />

            <div className="container relative z-10 mx-auto max-w-4xl text-center">
                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl lg:text-5xl">
                        Find your next phone,{" "}
                        <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                            locally.
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-secondary-600 sm:text-lg">
                        Safe, admin-moderated peer-to-peer marketplace.
                        <br className="hidden sm:block" />
                        PTA verified phones. Transparent deals.
                    </p>
                </motion.div>

                {/* ─── Search Bar ─────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mx-auto mt-8 max-w-2xl"
                >
                    <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-premium-lg ring-1 ring-secondary-200/60">
                        <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
                            <Search className="h-5 w-5 shrink-0 text-secondary-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by brand, model, or keyword..."
                                className="w-full bg-transparent py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none sm:text-base"
                            />
                        </div>

                        {/* Location chip */}
                        <button className="hidden items-center gap-1 rounded-xl border border-secondary-200 px-3 py-2 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-100 sm:flex">
                            <MapPin className="h-3.5 w-3.5" />
                            Nearby
                        </button>

                        {/* Filters button */}
                        <button className="hidden rounded-xl border border-secondary-200 p-2.5 text-secondary-500 transition-colors hover:bg-secondary-100 sm:block">
                            <SlidersHorizontal className="h-4 w-4" />
                        </button>

                        {/* Search button */}
                        <Button size="md" className="shrink-0 rounded-xl px-6">
                            Search
                        </Button>
                    </div>
                </motion.div>

                {/* ─── Quick Filters ──────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2"
                >
                    {quickFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                                activeFilter === f
                                    ? "bg-primary-500 text-white shadow-sm"
                                    : "bg-white text-secondary-600 hover:bg-secondary-100 ring-1 ring-secondary-200/80"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
