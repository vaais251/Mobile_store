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
    trend?: number;
    subtitle?: string;
    color?: "primary" | "success" | "warning" | "accent";
    index?: number;
}

const COLOR_MAP = {
    primary: {
        bg: "bg-white",
        icon: "bg-blue-50 text-blue-500",
        border: "border-blue-100",
    },
    success: {
        bg: "bg-white",
        icon: "bg-emerald-50 text-emerald-500",
        border: "border-emerald-100",
    },
    warning: {
        bg: "bg-white",
        icon: "bg-amber-50 text-amber-500",
        border: "border-amber-100",
    },
    accent: {
        bg: "bg-white",
        icon: "bg-blue-50 text-blue-500",
        border: "border-blue-100",
    },
};

export function StatCard({
    icon,
    label,
    value,
    trend,
    subtitle,
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
                <div>
                    <p className="text-sm font-medium text-secondary-500">
                        {label}
                    </p>
                    <p className="mt-1 text-[28px] font-extrabold text-secondary-900 leading-tight">
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                </div>
                <div
                    className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        colors.icon
                    )}
                >
                    {icon}
                </div>
            </div>

            <div className="mt-2">
                {trend !== undefined && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            trend >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                        )}
                    >
                        {trend >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {subtitle || `${Math.abs(trend).toFixed(1)}% from last month`}
                    </div>
                )}
                {!trend && subtitle && (
                    <p className="text-xs text-secondary-500">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
}
