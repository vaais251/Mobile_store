"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

/* ─── Brand Icons ─────────────────────────── */
const brands = [
    { name: "Apple", emoji: "🍎", query: "apple" },
    { name: "Samsung", emoji: "📱", query: "samsung" },
    { name: "Google", emoji: "🔍", query: "google" },
    { name: "Xiaomi", emoji: "📲", query: "xiaomi" },
    { name: "OnePlus", emoji: "⚡", query: "oneplus" },
    { name: "Oppo", emoji: "🌟", query: "oppo" },
    { name: "Vivo", emoji: "🎯", query: "vivo" },
    { name: "Realme", emoji: "💎", query: "realme" },
];

/* ─── Mock Data (fallback) ────────────────── */
const MOCK_LISTINGS: ListingData[] = [
    {
        id: "1",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        price: 420000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Lahore",
        distance_km: 2.4,
        condition_rating: 9,
        pta_approved: true,
    },
    {
        id: "2",
        brand: "Samsung",
        model: "Galaxy S24 Ultra",
        price: 285000,
        phone_type: "used",
        ram_gb: 12,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Islamabad",
        distance_km: 5.1,
        condition_rating: 8,
        pta_approved: true,
    },
    {
        id: "3",
        brand: "Google",
        model: "Pixel 9 Pro",
        price: 210000,
        phone_type: "new",
        ram_gb: 16,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Karachi",
        distance_km: null,
        condition_rating: null,
        pta_approved: null,
    },
    {
        id: "4",
        brand: "Xiaomi",
        model: "14 Ultra",
        price: 175000,
        phone_type: "used",
        ram_gb: 12,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "Rawalpindi",
        distance_km: 12.3,
        condition_rating: 7,
        pta_approved: false,
    },
    {
        id: "5",
        brand: "OnePlus",
        model: "12",
        price: 140000,
        phone_type: "new",
        ram_gb: 12,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Faisalabad",
        distance_km: null,
        condition_rating: null,
        pta_approved: null,
    },
    {
        id: "6",
        brand: "Apple",
        model: "iPhone 14",
        price: 195000,
        phone_type: "used",
        ram_gb: 6,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Lahore",
        distance_km: 0.8,
        condition_rating: 6,
        pta_approved: true,
    },
    {
        id: "7",
        brand: "Samsung",
        model: "Galaxy A55",
        price: 68000,
        phone_type: "new",
        ram_gb: 8,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Multan",
        distance_km: null,
        condition_rating: null,
        pta_approved: null,
    },
    {
        id: "8",
        brand: "Oppo",
        model: "Find X7 Ultra",
        price: 230000,
        phone_type: "used",
        ram_gb: 16,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "Peshawar",
        distance_km: 45.7,
        condition_rating: 10,
        pta_approved: true,
    },
];

/* ─── Page Component ──────────────────────── */
export default function HomePage() {
    const [listings, setListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get("/api/v1/listings/");
                if (res.data?.items?.length > 0) {
                    setListings(res.data.items);
                } else {
                    setListings(MOCK_LISTINGS);
                }
            } catch {
                // Backend not reachable — use mock data
                setListings(MOCK_LISTINGS);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                {/* ─── Hero ─────────────────────── */}
                <HeroSection />

                {/* ─── Browse by Brand ──────────── */}
                <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-secondary-900 sm:text-2xl">
                            Browse by Brand
                        </h2>
                        <button className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
                            View all
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-4">
                        {brands.map((brand, i) => (
                            <motion.button
                                key={brand.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04, duration: 0.3 }}
                                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-secondary-200/80 transition-all duration-200 hover:ring-primary-200 hover:shadow-premium hover:-translate-y-0.5 press-effect"
                            >
                                <span className="text-2xl sm:text-3xl">{brand.emoji}</span>
                                <span className="text-xs font-medium text-secondary-700">
                                    {brand.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* ─── Latest Listings ──────────── */}
                <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-secondary-900 sm:text-2xl">
                            Latest Listings
                        </h2>
                        <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                            See all
                        </Button>
                    </div>

                    {loading ? (
                        <div className="mt-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {listings.map((listing, i) => (
                                <PhoneCard key={listing.id} listing={listing} index={i} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
