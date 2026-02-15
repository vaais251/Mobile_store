"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
    ChevronRight,
    Heart,
    Share2,
    Loader2,
    Check,
    Tag,
    Cpu,
    MemoryStick,
    MessageSquare,
    Package,
    Truck,
    Zap,
    ChevronLeft,
    ChevronDown,
    Info,
    CircleDot,
    Weight,
    Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListingData } from "@/components/PhoneCard";
import api from "@/lib/api";

/* ─── Helpers ────────────────────────────── */
function formatPrice(price: number): string {
    return price.toLocaleString("en-PK");
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Listed today";
    if (days === 1) return "Listed 1 day ago";
    if (days < 30) return `Listed ${days} days ago`;
    const months = Math.floor(days / 30);
    return `Listed ${months} month${months > 1 ? "s" : ""} ago`;
}

function StarRating({ rating, count }: { rating: number; count?: string }) {
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={cn(
                            "h-3.5 w-3.5",
                            i <= Math.round(rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                        )}
                    />
                ))}
            </div>
            {count && (
                <span className="text-xs text-gray-500">({count})</span>
            )}
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

    const isUsed = listing.phone_type === "used";

    const allImages = listing.images?.length
        ? listing.images
        : listing.thumbnail_image
            ? [listing.thumbnail_image]
            : [];

    /* ─── Purchase Handler ───────────────── */
    const handlePurchase = useCallback(async () => {
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
            }
        } finally {
            setIsPurchasing(false);
        }
    }, [listing.id, router]);

    /* ═══════════════════════════════════════
       Shared: Breadcrumb
       ═══════════════════════════════════════ */
    const Breadcrumb = () => (
        <nav className="mb-5 flex items-center gap-1.5 text-sm text-gray-500">
            <Link
                href="/"
                className="transition-colors hover:text-gray-900"
            >
                Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
                href="/search"
                className="transition-colors hover:text-gray-900"
            >
                {isUsed ? "Used Phones" : "New Smartphones"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-900">
                {listing.brand} {listing.model}
            </span>
        </nav>
    );

    /* ═══════════════════════════════════════
       Shared: Image Gallery
       ═══════════════════════════════════════ */
    const ImageGallery = () => (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex gap-0">
                {/* Main image */}
                <div className="relative flex-1 aspect-[4/3] overflow-hidden bg-gray-50">
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
                                    className="object-contain p-4"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            </motion.div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                                        <Tag className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        No images available
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Type badge */}
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        <span
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs font-bold uppercase shadow-sm",
                                isUsed
                                    ? "bg-gray-900 text-white"
                                    : "bg-blue-500 text-white"
                            )}
                        >
                            {isUsed ? "USED" : "NEW PRODUCT"}
                        </span>
                        {isUsed && listing.condition_rating != null && (
                            <span className="rounded-md bg-green-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                ★ {listing.condition_rating}/10 CONDITION
                            </span>
                        )}
                    </div>

                    {/* Favorite */}
                    <button
                        onClick={() => setIsFavorited(!isFavorited)}
                        className={cn(
                            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all",
                            isFavorited
                                ? "bg-red-500 text-white"
                                : "bg-white/90 text-gray-500 hover:text-red-500"
                        )}
                    >
                        <Heart
                            className={cn(
                                "h-4.5 w-4.5",
                                isFavorited && "fill-current"
                            )}
                        />
                    </button>
                </div>

                {/* Side thumbnails (for screens with multiple images) */}
                {allImages.length > 1 && (
                    <div className="hidden sm:flex w-20 flex-col gap-1.5 bg-gray-50 p-1.5">
                        {allImages.slice(0, 4).map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={cn(
                                    "relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all",
                                    selectedImage === i
                                        ? "border-blue-500 ring-1 ring-blue-200"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={img}
                                    alt={`View ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                        {allImages.length > 4 && (
                            <button
                                onClick={() => setSelectedImage(4)}
                                className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200 text-xs font-semibold text-gray-600"
                            >
                                +{allImages.length - 4} More
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom thumbnails (mobile) */}
            {allImages.length > 1 && (
                <div className="flex gap-2 p-3 sm:hidden overflow-x-auto">
                    {allImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={cn(
                                "relative aspect-square w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                selectedImage === i
                                    ? "border-blue-500"
                                    : "border-transparent opacity-60"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`View ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    /* ═══════════════════════════════════════
       USED PHONE LAYOUT
       ═══════════════════════════════════════ */
    if (isUsed) {
        return (
            <div>
                <Breadcrumb />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-3 space-y-5">
                        <ImageGallery />

                        {/* Description */}
                        {listing.description && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                                <h2 className="text-lg font-bold text-gray-900">
                                    Description
                                </h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                                    {listing.description}
                                </p>

                                {/* Defects note */}
                                {listing.defects && (
                                    <p className="mt-3 text-sm text-orange-600">
                                        <strong>Note:</strong>{" "}
                                        {listing.defects}
                                    </p>
                                )}

                                {/* Accessories */}
                                {listing.accessories_included?.items &&
                                    listing.accessories_included.items.length >
                                    0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {listing.accessories_included.items.map(
                                                (item, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                                                    >
                                                        <Check className="h-3 w-3 text-blue-500" />
                                                        {item} Included
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Header Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {listing.brand} {listing.model}
                                    </h1>
                                    <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-500">
                                        {listing.location_city && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {listing.location_city}
                                            </span>
                                        )}
                                        {listing.created_at && (
                                            <span>
                                                {timeAgo(listing.created_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-2xl font-extrabold text-blue-600">
                                    Rs. {formatPrice(listing.price)}
                                </p>
                            </div>

                            {/* Spec chips */}
                            <div className="mt-5 grid grid-cols-3 gap-2.5">
                                {listing.battery_health_percent != null && (
                                    <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                                        <Battery className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs font-semibold text-gray-500 uppercase">
                                            Battery Health
                                        </span>
                                        <span className="text-base font-bold text-gray-900">
                                            {listing.battery_health_percent}%
                                        </span>
                                    </div>
                                )}
                                {listing.camera_mp != null && (
                                    <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                                        <Camera className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs font-semibold text-gray-500 uppercase">
                                            Camera
                                        </span>
                                        <span className="text-base font-bold text-gray-900">
                                            {listing.camera_mp} px
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                                    <HardDrive className="h-5 w-5 text-blue-500" />
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        Storage
                                    </span>
                                    <span className="text-base font-bold text-gray-900">
                                        {listing.storage_gb}GB
                                    </span>
                                </div>
                            </div>

                            {/* Purchase Button */}
                            <Button
                                size="xl"
                                className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-base font-semibold"
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
                            <p className="mt-2 text-center text-xs text-gray-400">
                                This starts an admin-mediated chat between you
                                and the seller to ensure a safe transaction.
                            </p>
                        </motion.div>

                        {/* Seller Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                                        <span className="text-base font-bold text-blue-600">
                                            {(
                                                listing.seller_name || "U"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {listing.seller_name ||
                                                "Phonely User"}
                                        </p>
                                        {listing.seller_rating != null && (
                                            <StarRating
                                                rating={listing.seller_rating}
                                            />
                                        )}
                                    </div>
                                </div>
                                <button className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                                    View Profile
                                </button>
                            </div>
                            {listing.seller_verified && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-green-700">
                                        <strong>Identity Verified.</strong> This
                                        seller has completed the full
                                        verification process for secure local
                                        pickup.
                                    </span>
                                </div>
                            )}
                        </motion.div>

                        {/* Location Context */}
                        {(listing.location_city || listing.location_lat) && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm"
                            >
                                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        Location Context
                                    </h3>
                                    {listing.location_city && (
                                        <span className="text-xs text-gray-500">
                                            {listing.location_city}
                                        </span>
                                    )}
                                </div>
                                {/* Map placeholder */}
                                <div className="relative h-32 bg-gradient-to-br from-blue-50 via-blue-100/40 to-gray-100 mx-4 rounded-xl overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                                            <MapPin className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div
                                        className="absolute inset-0 opacity-[0.05]"
                                        style={{
                                            backgroundImage:
                                                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                                            backgroundSize: "28px 28px",
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="rounded-xl bg-blue-50 p-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Shield className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-semibold text-blue-700">
                                                Safe Local Pickup
                                            </span>
                                        </div>
                                        <p className="text-xs text-blue-600 leading-relaxed">
                                            For your safety, Phonely admins
                                            oversee all transaction chats. We
                                            recommend meeting in public spaces
                                            like local police stations or bank
                                            lobbies for the exchange.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════
       NEW PHONE LAYOUT
       ═══════════════════════════════════════ */
    return (
        <div>
            <Breadcrumb />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-3 space-y-5">
                    <ImageGallery />

                    {/* Spec chips below gallery */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-4 gap-3"
                    >
                        {listing.processor && (
                            <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                                    <Cpu className="h-4.5 w-4.5 text-blue-500" />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                    Processor
                                </span>
                                <span className="text-sm font-bold text-gray-900 text-center">
                                    {listing.processor}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                                <MemoryStick className="h-4.5 w-4.5 text-purple-500" />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                RAM
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {listing.ram_gb}GB Unified
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                                <HardDrive className="h-4.5 w-4.5 text-orange-500" />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                Storage
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {listing.storage_gb >= 1024
                                    ? `${listing.storage_gb / 1024}TB SSD`
                                    : `${listing.storage_gb}GB SSD`}
                            </span>
                        </div>
                        {listing.battery_capacity_mah != null && (
                            <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-sm">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                                    <Battery className="h-4.5 w-4.5 text-green-500" />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                    Battery
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {listing.battery_capacity_mah.toLocaleString()}{" "}
                                    mAh
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Product Details */}
                    {listing.description && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="rounded-2xl bg-white p-6 shadow-sm"
                        >
                            <h2 className="text-lg font-bold text-gray-900">
                                Product Details
                            </h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                                {listing.description}
                            </p>
                        </motion.div>
                    )}

                    {/* Technical Specifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl bg-white p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="h-5 w-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900">
                                Technical Specifications
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {listing.processor && (
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-gray-500">
                                        Processor
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {listing.processor}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">
                                    RAM
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {listing.ram_gb}GB
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">
                                    Storage
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {listing.storage_gb}GB
                                </span>
                            </div>
                            {listing.camera_mp != null && (
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-gray-500">
                                        Main Camera
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {listing.camera_mp}MP
                                    </span>
                                </div>
                            )}
                            {listing.battery_capacity_mah != null && (
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-gray-500">
                                        Battery
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {listing.battery_capacity_mah.toLocaleString()}{" "}
                                        mAh
                                    </span>
                                </div>
                            )}
                            {listing.color && (
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-gray-500">
                                        Color
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {listing.color}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-white p-6 shadow-sm"
                    >
                        <h1 className="text-xl font-bold text-gray-900">
                            {listing.brand} {listing.model}
                        </h1>
                        <p className="mt-1 text-xs text-gray-500">
                            {listing.storage_gb}GB ·{" "}
                            {listing.ram_gb}GB RAM
                            {listing.color && ` · ${listing.color}`} · Brand New
                        </p>

                        {/* Price */}
                        <div className="mt-4">
                            <span className="text-2xl font-extrabold text-gray-900">
                                Rs. {formatPrice(listing.price)}
                            </span>
                        </div>

                        {/* Purchase Button */}
                        <Button
                            size="xl"
                            className="mt-5 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-base font-semibold"
                            leftIcon={
                                isPurchasing ? undefined : (
                                    <ShoppingBag className="h-5 w-5" />
                                )
                            }
                            isLoading={isPurchasing}
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                        >
                            Start Purchase Process
                        </Button>

                        {/* Ask admin */}
                        <button className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-500 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            Ask Admin a Question
                        </button>

                        {/* Info items */}
                        <div className="mt-5 space-y-3">
                            {listing.warranty_period && (
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                        <Shield className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {listing.warranty_period} Warranty
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Official manufacturer coverage
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                    <Truck className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Local Pickup Available
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {listing.location_city
                                            ? `Pickup in ${listing.location_city}`
                                            : "Available for local pickup"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Secure Marketplace Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 shadow-sm text-white"
                    >
                        <h3 className="font-bold text-base">
                            Secure Marketplace
                        </h3>
                        <p className="mt-1 text-xs text-blue-100/90 font-medium">
                            How it works:
                        </p>
                        <div className="mt-3 space-y-2.5">
                            <div className="flex items-start gap-2.5">
                                <CircleDot className="h-4 w-4 mt-0.5 text-blue-200 shrink-0" />
                                <p className="text-xs text-blue-50 leading-relaxed">
                                    Transactions are initiated via a moderated
                                    chat system.
                                </p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <CircleDot className="h-4 w-4 mt-0.5 text-blue-200 shrink-0" />
                                <p className="text-xs text-blue-50 leading-relaxed">
                                    An admin oversees communication to prevent
                                    fraud.
                                </p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <CircleDot className="h-4 w-4 mt-0.5 text-blue-200 shrink-0" />
                                <p className="text-xs text-blue-50 leading-relaxed">
                                    Funds are held in reserve until pickup is
                                    verified.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Available Near You */}
                    {listing.location_city && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="overflow-hidden rounded-2xl bg-white shadow-sm"
                        >
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                    <Zap className="h-4 w-4 text-blue-500" />
                                    Available Near You
                                </h3>
                            </div>
                            <div className="relative h-28 bg-gradient-to-br from-blue-50 via-blue-100/40 to-gray-100 mx-4 mb-4 rounded-xl overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-md">
                                        <MapPin className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div
                                    className="absolute inset-0 opacity-[0.05]"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                                        backgroundSize: "28px 28px",
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-600">
                                    {listing.location_city}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
