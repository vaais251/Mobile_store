"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Battery,
    Camera,
    HardDrive,
    ShoppingBag,
    Star,
    Shield,
    MapPin,
    ChevronLeft,
    Heart,
    Share2,
    Loader2,
    Check,
    Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListingData } from "@/components/PhoneCard";
import api from "@/lib/api";

/* ─── Price Formatter ────────────────────── */
function formatPrice(price: number): string {
    return `PKR ${price.toLocaleString("en-PK")}`;
}

/* ─── Star Rating ────────────────────────── */
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={cn(
                        "h-3.5 w-3.5",
                        i <= Math.round(rating)
                            ? "fill-warning-500 text-warning-500"
                            : "fill-secondary-200 text-secondary-200"
                    )}
                />
            ))}
            <span className="ml-1 text-xs font-medium text-secondary-500">
                {rating.toFixed(1)}
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
interface ListingDetailsProps {
    listing: ListingData;
}

export function ListingDetails({ listing }: ListingDetailsProps) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    const allImages = listing.images?.length
        ? listing.images
        : listing.thumbnail_image
            ? [listing.thumbnail_image]
            : [];

    /* ─── Purchase Handler ───────────────── */
    const handlePurchase = useCallback(async () => {
        // Check if logged in
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (!token) {
                router.push(`/login?redirect=/listings/${listing.id}`);
                return;
            }
        }

        setIsPurchasing(true);
        try {
            const res = await api.post("/api/v1/orders/", {
                listing_id: listing.id,
            });
            const orderId = res.data?.id || res.data?.order_id;
            if (orderId) {
                router.push(`/chat/${orderId}`);
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number } };
            if (err?.response?.status === 401) {
                router.push(`/login?redirect=/listings/${listing.id}`);
            } else {
                console.error("Failed to create order:", error);
                // TODO: show toast notification
            }
        } finally {
            setIsPurchasing(false);
        }
    }, [listing.id, router]);

    /* ═══════════════════════════════════════
       Render
       ═══════════════════════════════════════ */
    return (
        <div>
            {/* ─── Back Navigation ─────────── */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-1.5 text-sm font-medium text-secondary-600 transition-colors hover:text-secondary-900"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to listings
            </button>

            {/* ─── Two Column Grid ─────────── */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                {/* ─── LEFT: Gallery ───────── */}
                <div className="lg:col-span-3">
                    <div className="overflow-hidden rounded-2xl bg-white premium-shadow">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-secondary-100">
                            <AnimatePresence mode="wait">
                                {allImages.length > 0 ? (
                                    <motion.div
                                        key={selectedImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full w-full"
                                    >
                                        <Image
                                            src={allImages[selectedImage]}
                                            alt={`${listing.brand} ${listing.model}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            priority
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary-200">
                                                <Tag className="h-10 w-10 text-secondary-400" />
                                            </div>
                                            <p className="text-sm text-secondary-400">
                                                No images available
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Top-right actions */}
                            <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                    onClick={() => setIsFavorited(!isFavorited)}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all",
                                        isFavorited
                                            ? "bg-accent-500 text-white"
                                            : "bg-white/80 text-secondary-600 hover:bg-white hover:text-accent-500"
                                    )}
                                >
                                    <Heart
                                        className={cn(
                                            "h-5 w-5",
                                            isFavorited && "fill-current"
                                        )}
                                    />
                                </button>
                                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-secondary-600 backdrop-blur-sm transition-all hover:bg-white hover:text-primary-500">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 p-3">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={cn(
                                            "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-20",
                                            selectedImage === i
                                                ? "border-primary-500 ring-2 ring-primary-100"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Description (below gallery) ── */}
                    {listing.description && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 rounded-2xl bg-white p-6 premium-shadow"
                        >
                            <h2 className="text-lg font-bold text-secondary-900">
                                Description
                            </h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-secondary-600">
                                {listing.description}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* ─── RIGHT: Info Panel ───── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-white p-6 premium-shadow"
                    >
                        {/* Condition Badge */}
                        <div className="mb-3 flex items-center gap-2">
                            <span
                                className={cn(
                                    "rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                                    listing.phone_type === "new"
                                        ? "bg-primary-50 text-primary-600"
                                        : "bg-secondary-100 text-secondary-700"
                                )}
                            >
                                {listing.phone_type === "new"
                                    ? "✨ Brand New"
                                    : "📱 Used"}
                            </span>
                            {listing.pta_approved && (
                                <span className="flex items-center gap-1 rounded-lg bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700">
                                    <Shield className="h-3 w-3" />
                                    PTA Approved
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold tracking-tight text-secondary-900">
                            {listing.brand} {listing.model}
                        </h1>

                        {/* Specs subtitle */}
                        <p className="mt-1 text-sm text-secondary-500">
                            {listing.storage_gb}GB Storage · {listing.ram_gb}GB
                            RAM
                            {listing.color && ` · ${listing.color}`}
                        </p>

                        {/* Price */}
                        <p className="mt-4 text-3xl font-extrabold text-primary-500">
                            {formatPrice(listing.price)}
                        </p>
                    </motion.div>

                    {/* Key Specs Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-3"
                    >
                        {/* Battery Health (used only) */}
                        {listing.phone_type === "used" &&
                            listing.battery_health_percent != null && (
                                <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 premium-shadow">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
                                        <Battery className="h-5 w-5 text-success-500" />
                                    </div>
                                    <span className="text-lg font-bold text-secondary-900">
                                        {listing.battery_health_percent}%
                                    </span>
                                    <span className="text-[11px] font-medium text-secondary-500">
                                        Battery
                                    </span>
                                </div>
                            )}

                        {/* Camera */}
                        {listing.camera_mp != null && (
                            <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 premium-shadow">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                                    <Camera className="h-5 w-5 text-primary-500" />
                                </div>
                                <span className="text-lg font-bold text-secondary-900">
                                    {listing.camera_mp}MP
                                </span>
                                <span className="text-[11px] font-medium text-secondary-500">
                                    Camera
                                </span>
                            </div>
                        )}

                        {/* Storage */}
                        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 premium-shadow">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50">
                                <HardDrive className="h-5 w-5 text-warning-500" />
                            </div>
                            <span className="text-lg font-bold text-secondary-900">
                                {listing.storage_gb >= 1024
                                    ? `${listing.storage_gb / 1024}TB`
                                    : `${listing.storage_gb}GB`}
                            </span>
                            <span className="text-[11px] font-medium text-secondary-500">
                                Storage
                            </span>
                        </div>
                    </motion.div>

                    {/* Purchase Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <Button
                            size="xl"
                            className="w-full"
                            leftIcon={
                                isPurchasing ? undefined : (
                                    <ShoppingBag className="h-5 w-5" />
                                )
                            }
                            isLoading={isPurchasing}
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                        >
                            Request Purchase
                        </Button>
                        <p className="mt-2 text-center text-xs text-secondary-400">
                            Our admin will verify and connect you with the
                            seller
                        </p>
                    </motion.div>

                    {/* Seller Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl bg-white p-5 premium-shadow"
                    >
                        <h3 className="mb-3 text-sm font-bold text-secondary-900">
                            Seller Information
                        </h3>
                        <div className="flex items-center gap-3">
                            {/* Avatar placeholder */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                <span className="text-lg font-bold">
                                    {(listing.seller_name || "U")
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-secondary-900">
                                    {listing.seller_name || "PhoneMarket User"}
                                </p>
                                {listing.seller_rating != null && (
                                    <StarRating
                                        rating={listing.seller_rating}
                                    />
                                )}
                            </div>
                            {listing.seller_verified && (
                                <div className="flex items-center gap-1 rounded-lg bg-success-50 px-2.5 py-1.5">
                                    <Check className="h-3.5 w-3.5 text-success-500" />
                                    <span className="text-[11px] font-semibold text-success-700">
                                        Verified
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Location Card */}
                    {(listing.location_city || listing.location_address) && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="overflow-hidden rounded-2xl bg-white premium-shadow"
                        >
                            {/* Map placeholder */}
                            <div className="relative h-36 bg-gradient-to-br from-primary-50 via-primary-100/50 to-secondary-100">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <MapPin className="h-8 w-8 text-primary-500" />
                                        <span className="text-xs font-medium text-primary-600">
                                            {listing.location_city || "Location"}
                                        </span>
                                    </div>
                                </div>
                                {/* Grid overlay to simulate map */}
                                <div
                                    className="absolute inset-0 opacity-[0.04]"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                                        backgroundSize: "32px 32px",
                                    }}
                                />
                            </div>
                            <div className="px-5 py-3">
                                <div className="flex items-center gap-2 text-sm text-secondary-600">
                                    <MapPin className="h-4 w-4 shrink-0 text-secondary-400" />
                                    <span>
                                        {listing.location_address ||
                                            listing.location_city ||
                                            "Unknown location"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
