"use client";

import Image from "next/image";
import { Heart, MapPin, Shield, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────── */
export interface ListingData {
    id: string;
    brand: string;
    model: string;
    price: number;
    phone_type: "new" | "used";
    ram_gb: number;
    storage_gb: number;
    thumbnail_image?: string | null;
    location_city?: string | null;
    location_lat?: number | null;
    location_long?: number | null;
    distance_km?: number | null;
    condition_rating?: number | null;
    pta_approved?: boolean | null;
    battery_health_percent?: number | null;
    seller_name?: string;
    status?: string;
    /* ─── Detail-level fields ─────────────── */
    description?: string | null;
    images?: string[];
    camera_mp?: number | null;
    color?: string | null;
    defects?: string | null;
    warranty_period?: string | null;
    processor?: string | null;
    seller_rating?: number | null;
    seller_verified?: boolean | null;
    location_address?: string | null;
}

interface PhoneCardProps {
    listing: ListingData;
    index?: number;
}

/* ─── Badge Sub-Component ─────────────────── */
function TypeBadge({ type, pta }: { type: "new" | "used"; pta?: boolean | null }) {
    if (pta) {
        return (
            <span className="inline-flex items-center gap-1 rounded-lg bg-success-500/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                <Shield className="h-3 w-3" />
                PTA Verified
            </span>
        );
    }

    return (
        <span
            className={cn(
                "rounded-lg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm",
                type === "new"
                    ? "bg-primary-500/90 text-white"
                    : "bg-secondary-800/70 text-white"
            )}
        >
            {type}
        </span>
    );
}

/* ─── Price Formatter ─────────────────────── */
function formatPrice(price: number): string {
    if (price >= 100000) {
        const lacs = price / 100000;
        return `PKR ${lacs % 1 === 0 ? lacs.toFixed(0) : lacs.toFixed(1)} Lac`;
    }
    return `PKR ${price.toLocaleString("en-PK")}`;
}

/* ─── Main Component ─────────────────────── */
export function PhoneCard({ listing, index = 0 }: PhoneCardProps) {
    const {
        brand,
        model,
        price,
        phone_type,
        thumbnail_image,
        location_city,
        distance_km,
        condition_rating,
        pta_approved,
        storage_gb,
        ram_gb,
    } = listing;

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl bg-white premium-shadow transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1"
        >
            {/* ─── Image Area ─────────────────── */}
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary-100">
                {thumbnail_image ? (
                    <Image
                        src={thumbnail_image}
                        alt={`${brand} ${model}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-200">
                                <Tag className="h-8 w-8 text-secondary-400" />
                            </div>
                            <p className="text-xs text-secondary-400">No image</p>
                        </div>
                    </div>
                )}

                {/* Top-Left: Type badge */}
                <div className="absolute left-2.5 top-2.5">
                    <TypeBadge type={phone_type} pta={pta_approved} />
                </div>

                {/* Top-Right: Favorite */}
                <button
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-secondary-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-accent-500 hover:scale-110"
                    aria-label="Add to favorites"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Heart className="h-4 w-4" />
                </button>
            </div>

            {/* ─── Content Area ───────────────── */}
            <div className="p-4">
                {/* Title */}
                <h3 className="truncate text-[15px] font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {brand} {model}
                </h3>

                {/* Specs row */}
                <p className="mt-0.5 text-xs text-secondary-500">
                    {storage_gb}GB · {ram_gb}GB RAM
                </p>

                {/* Price */}
                <p className="mt-2 text-lg font-bold text-primary-500">
                    {formatPrice(price)}
                </p>

                {/* Location */}
                {(location_city || distance_km != null) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-secondary-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                            {location_city || "Unknown"}
                            {distance_km != null && (
                                <span className="ml-1 text-secondary-400">
                                    · {distance_km < 1 ? "<1" : Math.round(distance_km)} km away
                                </span>
                            )}
                        </span>
                    </div>
                )}

                {/* Condition (used only) */}
                {phone_type === "used" && condition_rating != null && (
                    <div className="mt-2.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary-200">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    condition_rating >= 8
                                        ? "bg-success-500"
                                        : condition_rating >= 5
                                            ? "bg-warning-500"
                                            : "bg-accent-500"
                                )}
                                style={{ width: `${condition_rating * 10}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-secondary-600">
                            {condition_rating}/10
                        </span>
                    </div>
                )}
            </div>
        </motion.article>
    );
}
