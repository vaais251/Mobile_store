"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Heart,
    MapPin,
    Shield,
    Tag,
    MessageSquare,
    Phone as PhoneIcon,
} from "lucide-react";
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
    /* Detail fields */
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
    /** "grid" = home page compact card, "search" = search result card with specs + CTA */
    variant?: "grid" | "search";
}

/* ─── Format Price ────────────────────────── */
function formatPrice(price: number): string {
    return price.toLocaleString("en-PK");
}

/* ─── Main Component ─────────────────────── */
export function PhoneCard({
    listing,
    index = 0,
    variant = "grid",
}: PhoneCardProps) {
    const {
        id,
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
        battery_health_percent,
    } = listing;

    const isSearch = variant === "search";

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: "easeOut",
            }}
            className="group relative overflow-hidden rounded-2xl bg-white premium-shadow transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1"
        >
            <Link href={`/listings/${id}`} className="block">
                {/* ─── Image Area ─────────────────── */}
                <div
                    className={cn(
                        "relative overflow-hidden bg-secondary-100",
                        isSearch ? "aspect-[4/3]" : "aspect-[4/3]"
                    )}
                >
                    {thumbnail_image ? (
                        <Image
                            src={thumbnail_image}
                            alt={`${brand} ${model}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary-50 to-secondary-100">
                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-200/80">
                                    <Tag className="h-8 w-8 text-secondary-400" />
                                </div>
                                <p className="text-[11px] text-secondary-400">
                                    No image
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
                        <span
                            className={cn(
                                "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
                                phone_type === "new"
                                    ? "bg-primary-500"
                                    : "bg-secondary-700"
                            )}
                        >
                            {phone_type}
                        </span>
                        {pta_approved !== null && pta_approved !== undefined && (
                            <span
                                className={cn(
                                    "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
                                    pta_approved
                                        ? "bg-emerald-500"
                                        : "bg-orange-500"
                                )}
                            >
                                {pta_approved ? "PTA Approved" : "Non-PTA"}
                            </span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-secondary-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-red-500 hover:scale-110"
                        aria-label="Add to favorites"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <Heart className="h-4 w-4" />
                    </button>
                </div>

                {/* ─── Content ─────────────────────── */}
                <div className="p-4">
                    {/* Title + Price row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-[15px] font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                            {brand} {model}
                        </h3>
                        <div className="shrink-0 text-right">
                            <p className="text-[11px] font-medium text-primary-400 leading-none">
                                Rs.
                            </p>
                            <p className="text-base font-bold text-primary-500 leading-tight">
                                {formatPrice(price)}
                            </p>
                        </div>
                    </div>

                    {/* Location */}
                    {location_city && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-secondary-500">
                            <MapPin className="h-3 w-3 shrink-0 text-primary-400" />
                            <span className="truncate">
                                {location_city}
                                {distance_km != null && (
                                    <span className="ml-1 text-secondary-400">
                                        ·{" "}
                                        {distance_km < 1
                                            ? "<1"
                                            : Math.round(distance_km)}{" "}
                                        km away
                                    </span>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Specs row */}
                    {isSearch && (
                        <div className="mt-3 flex items-center gap-0 divide-x divide-secondary-200 rounded-xl bg-secondary-50 text-center">
                            <div className="flex-1 py-2">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-secondary-400">
                                    RAM
                                </p>
                                <p className="text-sm font-bold text-secondary-800">
                                    {ram_gb} GB
                                </p>
                            </div>
                            <div className="flex-1 py-2">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-secondary-400">
                                    Storage
                                </p>
                                <p className="text-sm font-bold text-secondary-800">
                                    {storage_gb} GB
                                </p>
                            </div>
                            <div className="flex-1 py-2">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-secondary-400">
                                    Battery
                                </p>
                                <p className="text-sm font-bold text-secondary-800">
                                    {battery_health_percent
                                        ? `${battery_health_percent}%`
                                        : "N/A"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Home card: compact specs */}
                    {!isSearch && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-secondary-500">
                            <span>{storage_gb}GB</span>
                            <span className="h-1 w-1 rounded-full bg-secondary-300" />
                            <span>{ram_gb}GB RAM</span>
                            {battery_health_percent && (
                                <>
                                    <span className="h-1 w-1 rounded-full bg-secondary-300" />
                                    <span>🔋 {battery_health_percent}%</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Condition bar (used only, home variant) */}
                    {!isSearch &&
                        phone_type === "used" &&
                        condition_rating != null && (
                            <div className="mt-2.5 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary-200">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            condition_rating >= 8
                                                ? "bg-emerald-500"
                                                : condition_rating >= 5
                                                    ? "bg-amber-500"
                                                    : "bg-red-500"
                                        )}
                                        style={{
                                            width: `${condition_rating * 10}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-secondary-600">
                                    {condition_rating}/10
                                </span>
                            </div>
                        )}
                </div>
            </Link>

            {/* CTA buttons (search variant only) */}
            {isSearch && (
                <div className="flex items-center gap-2 border-t border-secondary-100 px-4 pb-4 pt-3">
                    <Link
                        href={`/chat/${id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Message Seller
                    </Link>
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50"
                        aria-label="Call seller"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <PhoneIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </motion.article>
    );
}
