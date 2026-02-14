"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Loader2,
    MapPin,
    MoreHorizontal,
    Smartphone,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

/* ─── Brand data with SVG-like icon placeholders ─── */
const brands = [
    { name: "Apple", icon: "🍎", query: "apple" },
    { name: "Samsung", icon: "📱", query: "samsung" },
    { name: "Google", icon: "🔍", query: "google" },
    { name: "Xiaomi", icon: "📲", query: "xiaomi" },
    { name: "OnePlus", icon: "⚡", query: "oneplus" },
    { name: "Other", icon: "➕", query: "" },
];

/* ─── Mock Data ─────────────────────────────── */
const MOCK_NEAR_ME: ListingData[] = [
    {
        id: "n1",
        brand: "Apple",
        model: "iPhone 15 Pro",
        price: 450000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Clifton, Karachi",
        distance_km: 1.2,
        condition_rating: 9,
        pta_approved: true,
        battery_health_percent: 92,
    },
    {
        id: "n2",
        brand: "Samsung",
        model: "Galaxy S24 Ultra",
        price: 315000,
        phone_type: "new",
        ram_gb: 12,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "DHA, Lahore",
        distance_km: 2.5,
        condition_rating: null,
        pta_approved: true,
    },
    {
        id: "n3",
        brand: "Google",
        model: "Pixel 8",
        price: 165000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Gulshan, Karachi",
        distance_km: 3.1,
        condition_rating: 8,
        pta_approved: false,
        battery_health_percent: 95,
    },
    {
        id: "n4",
        brand: "Samsung",
        model: "Galaxy Z Fold 5",
        price: 380000,
        phone_type: "used",
        ram_gb: 12,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "F-7, Islamabad",
        distance_km: 0.8,
        condition_rating: 9,
        pta_approved: true,
        battery_health_percent: 88,
    },
];

const MOCK_LATEST: ListingData[] = [
    {
        id: "l1",
        brand: "Apple",
        model: "MacBook Pro M2",
        price: 435000,
        phone_type: "used",
        ram_gb: 16,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "Lahore",
        condition_rating: 9,
        pta_approved: null,
        battery_health_percent: 96,
    },
    {
        id: "l2",
        brand: "Google",
        model: "Pixel 7 Pro",
        price: 130000,
        phone_type: "new",
        ram_gb: 12,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Islamabad",
        condition_rating: null,
        pta_approved: true,
    },
    {
        id: "l3",
        brand: "Apple",
        model: "iPhone 13 Mini",
        price: 114000,
        phone_type: "used",
        ram_gb: 4,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Rawalpindi",
        condition_rating: 8,
        pta_approved: true,
        battery_health_percent: 85,
    },
    {
        id: "l4",
        brand: "Sony",
        model: "Xperia 1 V",
        price: 225000,
        phone_type: "new",
        ram_gb: 12,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Multan",
        condition_rating: null,
        pta_approved: null,
    },
];

/* ─── Page Component ──────────────────────── */
export default function HomePage() {
    const [nearMe, setNearMe] = useState<ListingData[]>([]);
    const [latest, setLatest] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get("/api/v1/listings/");
                const items = res.data?.items || [];
                if (items.length > 0) {
                    setNearMe(items.slice(0, 4));
                    setLatest(items.slice(4, 8).length > 0 ? items.slice(4, 8) : items.slice(0, 4));
                } else {
                    setNearMe(MOCK_NEAR_ME);
                    setLatest(MOCK_LATEST);
                }
            } catch {
                setNearMe(MOCK_NEAR_ME);
                setLatest(MOCK_LATEST);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />

            <main className="flex-1">
                {/* ─── Hero ────────────────────────── */}
                <HeroSection />

                {/* ─── Browse by Brand ─────────────── */}
                <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-secondary-900 sm:text-xl">
                            Browse by Brand
                        </h2>
                        <Link
                            href="/search"
                            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            View all
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
                        {brands.map((brand, i) => (
                            <motion.div
                                key={brand.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: i * 0.04,
                                    duration: 0.3,
                                }}
                            >
                                <Link
                                    href={`/search?brand=${brand.query}`}
                                    className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-5 ring-1 ring-secondary-200/80 transition-all duration-200 hover:ring-primary-200 hover:shadow-premium hover:-translate-y-0.5"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                                        <span className="text-xl">
                                            {brand.icon}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-secondary-700">
                                        {brand.name}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ─── Near Me ─────────────────────── */}
                <section className="container mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-secondary-900 sm:text-xl">
                                Near Me
                            </h2>
                            <p className="text-xs text-secondary-500">
                                Popular listings within 5 km
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50"
                                aria-label="Next"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="mt-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {nearMe.map((listing, i) => (
                                <PhoneCard
                                    key={listing.id}
                                    listing={listing}
                                    index={i}
                                    variant="grid"
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ─── Latest Listings ─────────────── */}
                <section className="container mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-secondary-900 sm:text-xl">
                            Latest Listings
                        </h2>
                        <div className="flex items-center gap-3">
                            <select className="rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-600">
                                <option>Newest First</option>
                                <option>Price: Low → High</option>
                                <option>Price: High → Low</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="mt-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <>
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {latest.map((listing, i) => (
                                    <PhoneCard
                                        key={listing.id}
                                        listing={listing}
                                        index={i}
                                        variant="grid"
                                    />
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="mt-8 flex justify-center">
                                <Link href="/search">
                                    <Button variant="outline" size="md">
                                        Load More Listings
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </section>

                {/* ─── Map CTA ─────────────────────── */}
                <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-800 to-secondary-900 p-8 sm:p-12">
                        {/* Decorative map grid */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="h-full w-full" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: "40px 40px",
                            }} />
                        </div>

                        <div className="relative z-10 max-w-md">
                            <h3 className="text-xl font-bold text-white sm:text-2xl">
                                Find local deals in your
                                <br />
                                neighborhood
                            </h3>
                            <p className="mt-2 text-sm text-white/60">
                                Switch to map view to see exact locations of
                                verified sellers. Meeting up in public places
                                has never been easier.
                            </p>
                            <Link href="/search?view=map" className="mt-5 inline-block">
                                <Button
                                    size="md"
                                    leftIcon={
                                        <MapPin className="h-4 w-4" />
                                    }
                                >
                                    Explore on Map
                                </Button>
                            </Link>
                        </div>

                        {/* Decorative dots */}
                        <div className="absolute right-8 top-8 hidden sm:block">
                            <div className="flex flex-col gap-4">
                                {[
                                    { top: 0, left: 20 },
                                    { top: 30, left: 60 },
                                    { top: 60, left: 10 },
                                    { top: 90, left: 45 },
                                ].map((dot, i) => (
                                    <div
                                        key={i}
                                        className="h-3 w-3 rounded-full bg-primary-500/80"
                                        style={{
                                            transform: `translate(${dot.left}px, ${dot.top}px)`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
