"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════ */
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    trend?: number; // percentage change, e.g. +12.5 or -3.2
    color?: "primary" | "success" | "warning" | "accent";
    index?: number; // for staggered animation
}

const COLOR_MAP = {
    primary: {
        bg: "bg-primary-50",
        icon: "bg-primary-100 text-primary-500",
        trend: "text-primary-600",
    },
    success: {
        bg: "bg-success-50",
        icon: "bg-success-100 text-success-500",
        trend: "text-success-600",
    },
    warning: {
        bg: "bg-warning-50",
        icon: "bg-warning-100 text-warning-500",
        trend: "text-warning-600",
    },
    accent: {
        bg: "bg-accent-50",
        icon: "bg-accent-100 text-accent-500",
        trend: "text-accent-600",
    },
};

export function StatCard({
    icon,
    label,
    value,
    trend,
    color = "primary",
    index = 0,
}: StatCardProps) {
    const colors = COLOR_MAP[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="rounded-2xl bg-white p-5 premium-shadow"
        >
            <div className="flex items-start justify-between">
                <div
                    className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        colors.icon
                    )}
                >
                    {icon}
                </div>

                {trend !== undefined && (
                    <div
                        className={cn(
                            "flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-semibold",
                            trend >= 0
                                ? "bg-success-50 text-success-600"
                                : "bg-accent-50 text-accent-600"
                        )}
                    >
                        {trend >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>

            <p className="mt-3 text-2xl font-extrabold text-secondary-900">
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="mt-0.5 text-sm font-medium text-secondary-500">
                {label}
            </p>
        </motion.div>
    );
}
