"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
    /** If provided, search is handled in-place (scrolls to listings) */
    onSearch?: (query: string) => void;
    /** If provided, type pills filter in-place */
    onTypeSelect?: (type: "new" | "used" | null) => void;
}

export function HeroSection({ onSearch, onTypeSelect }: HeroSectionProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [activeType, setActiveType] = useState<"used" | "new" | null>(null);

    const handleSearch = () => {
        if (onSearch) {
            onSearch(query.trim());
            // Scroll to listings section
            document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            const params = new URLSearchParams();
            if (query.trim()) params.set("q", query.trim());
            if (activeType) params.set("type", activeType);
            router.push(`/search?${params.toString()}`);
        }
    };

    const handleTypeToggle = (type: "used" | "new") => {
        const newType = activeType === type ? null : type;
        setActiveType(newType);
        if (onTypeSelect) {
            onTypeSelect(newType);
            document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-primary-50/30 to-secondary-100 px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
            {/* Animated background elements */}
            <div className="absolute -right-32 -top-16 h-96 w-96 rounded-full bg-primary-100/30 blur-3xl animate-pulse" />
            <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-primary-50/40 blur-3xl" />
            <div className="absolute left-1/2 top-1/4 h-40 w-40 rounded-full bg-primary-200/20 blur-3xl" />

            <div className="container relative z-10 mx-auto max-w-4xl text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-600 ring-1 ring-primary-200/60"
                >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin-Moderated Marketplace
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-secondary-900 sm:text-4xl lg:text-5xl">
                        Find your next phone,{" "}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                                locally.
                            </span>
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                            />
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm text-secondary-500 sm:text-base leading-relaxed">
                        Safe, admin-moderated peer-to-peer marketplace for
                        mobile devices in your neighborhood.
                    </p>
                </motion.div>

                {/* Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                    className="mx-auto mt-8 max-w-2xl"
                >
                    <div className="relative flex items-center overflow-hidden rounded-2xl bg-white shadow-premium-lg ring-1 ring-secondary-200/60">
                        <Search className="absolute left-4 h-5 w-5 text-secondary-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for iPhone 15, Samsung S24, Pixel 8..."
                            className="h-14 w-full bg-transparent pl-12 pr-40 text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none sm:text-base"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-[0.98] shadow-md shadow-primary-500/25"
                        >
                            Search
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Type pills + Location */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-2"
                >
                    <button
                        onClick={() => handleTypeToggle("used")}
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
                            activeType === "used"
                                ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                : "bg-white text-secondary-600 hover:bg-primary-50 ring-1 ring-secondary-200"
                        )}
                    >
                        🔄 Used Phones
                    </button>
                    <button
                        onClick={() => handleTypeToggle("new")}
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
                            activeType === "new"
                                ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                : "bg-white text-secondary-600 hover:bg-primary-50 ring-1 ring-secondary-200"
                        )}
                    >
                        ✨ New Phones
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 ring-1 ring-secondary-200">
                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                        All Pakistan
                    </button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-secondary-500"
                >
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Verified Sellers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                        <span>PTA Status Check</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Safe Local Pickup</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
