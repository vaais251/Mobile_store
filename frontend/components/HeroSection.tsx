"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [activeType, setActiveType] = useState<"used" | "new" | null>(null);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (activeType) params.set("type", activeType);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-secondary-50/50 to-secondary-100 px-4 pb-6 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
            {/* Background blurs */}
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
                        <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                            locally.
                        </span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-secondary-500 sm:text-base">
                        Safe, admin-moderated peer-to-peer marketplace for
                        mobile devices in your neighborhood.
                    </p>
                </motion.div>

                {/* Type pills + Location */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.4 }}
                    className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-2"
                >
                    <button
                        onClick={() =>
                            setActiveType(
                                activeType === "used" ? null : "used"
                            )
                        }
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                            activeType === "used"
                                ? "bg-primary-500 text-white shadow-sm"
                                : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                        )}
                    >
                        Used
                    </button>
                    <button
                        onClick={() =>
                            setActiveType(activeType === "new" ? null : "new")
                        }
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                            activeType === "new"
                                ? "bg-primary-500 text-white shadow-sm"
                                : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                        )}
                    >
                        New
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50">
                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                        All Pakistan
                    </button>
                </motion.div>

                {/* Moderated Transactions Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="mx-auto mt-6 max-w-2xl"
                >
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-white">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-semibold">
                            Moderated Transactions
                        </span>
                        <span className="hidden text-xs text-white/70 sm:block">
                            — Every chat is admin-monitored to ensure safety and
                            prevent fraud in local pickups.
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
