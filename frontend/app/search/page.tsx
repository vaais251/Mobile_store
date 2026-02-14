"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    List,
    Loader2,
    X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import { Map, type MapMarker } from "@/components/ui/Map";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Mock Data ──────────────────────────── */
const MOCK_LISTINGS: ListingData[] = [
    {
        id: "s1",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        price: 420000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Lahore",
        location_lat: 31.5204,
        location_long: 74.3587,
        condition_rating: 9,
        pta_approved: true,
        battery_health_percent: 92,
    },
    {
        id: "s2",
        brand: "Samsung",
        model: "Galaxy S24 Ultra",
        price: 310000,
        phone_type: "new",
        ram_gb: 12,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "Karachi",
        location_lat: 24.8607,
        location_long: 67.0011,
        condition_rating: null,
        pta_approved: true,
    },
    {
        id: "s3",
        brand: "Google",
        model: "Pixel 9 Pro",
        price: 195000,
        phone_type: "used",
        ram_gb: 16,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Islamabad",
        location_lat: 33.6844,
        location_long: 73.0479,
        condition_rating: 8,
        pta_approved: true,
        battery_health_percent: 95,
    },
    {
        id: "s4",
        brand: "OnePlus",
        model: "12R",
        price: 125000,
        phone_type: "new",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Rawalpindi",
        location_lat: 33.5651,
        location_long: 73.0169,
        condition_rating: null,
        pta_approved: null,
    },
    {
        id: "s5",
        brand: "Apple",
        model: "iPhone 14",
        price: 175000,
        phone_type: "used",
        ram_gb: 6,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Faisalabad",
        location_lat: 31.4504,
        location_long: 73.135,
        condition_rating: 7,
        pta_approved: true,
        battery_health_percent: 88,
    },
    {
        id: "s6",
        brand: "Samsung",
        model: "Galaxy Z Flip 5",
        price: 195000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Multan",
        location_lat: 30.1575,
        location_long: 71.5249,
        condition_rating: 8,
        pta_approved: true,
        battery_health_percent: 90,
    },
];

/* ═══════════════════════════════════════════
   Search Page
   ═══════════════════════════════════════════ */
export default function SearchPage() {
    const [listings, setListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [viewMode, setViewMode] = useState<"split" | "list" | "map">(
        "split"
    );
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    /* ─── Fetch Listings ─────────────────── */
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/v1/listings/", {
                    params: query ? { brand: query } : {},
                });
                const data = res.data?.items || res.data || [];
                setListings(data.length > 0 ? data : MOCK_LISTINGS);
            } catch {
                setListings(MOCK_LISTINGS);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [query]);

    /* ─── Map Markers ────────────────────── */
    const markers: MapMarker[] = listings
        .filter((l) => l.location_lat && l.location_long)
        .map((l) => ({
            lat: l.location_lat!,
            lng: l.location_long!,
            title: `${l.brand} ${l.model}`,
            id: l.id,
        }));

    /* ─── Center: average of all markers, default Pakistan ── */
    const center: [number, number] =
        markers.length > 0
            ? [
                markers.reduce((s, m) => s + m.lat, 0) / markers.length,
                markers.reduce((s, m) => s + m.lng, 0) / markers.length,
            ]
            : [30.3753, 69.3451];

    /* ─── Handle Marker Click → scroll list ── */
    const handleMarkerClick = useCallback((marker: MapMarker) => {
        if (marker.id) {
            setHighlightedId(marker.id);
            cardRefs.current[marker.id]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            // Clear highlight after 2s
            setTimeout(() => setHighlightedId(null), 2000);
        }
    }, []);

    /* ─── Filtered Listings ──────────────── */
    const filtered = query
        ? listings.filter(
            (l) =>
                l.brand.toLowerCase().includes(query.toLowerCase()) ||
                l.model.toLowerCase().includes(query.toLowerCase())
        )
        : listings;

    return (
        <div className="flex min-h-screen flex-col bg-secondary-200">
            <Navbar />

            {/* Search Bar + Controls */}
            <div className="border-b border-secondary-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by brand or model..."
                            className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="hidden items-center gap-1 rounded-xl bg-secondary-100 p-1 sm:flex">
                        {(
                            [
                                { v: "split", icon: SlidersHorizontal },
                                { v: "list", icon: List },
                                { v: "map", icon: MapPin },
                            ] as const
                        ).map(({ v, icon: Icon }) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                className={cn(
                                    "rounded-lg p-2 transition-all",
                                    viewMode === v
                                        ? "bg-white text-primary-600 shadow-sm"
                                        : "text-secondary-500 hover:text-secondary-700"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "gap-6",
                                viewMode === "split"
                                    ? "grid grid-cols-1 lg:grid-cols-2"
                                    : viewMode === "list"
                                        ? "block"
                                        : "block"
                            )}
                        >
                            {/* Listing Cards */}
                            {viewMode !== "map" && (
                                <div
                                    className={cn(
                                        viewMode === "split"
                                            ? "max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin"
                                            : ""
                                    )}
                                >
                                    <p className="mb-4 text-sm font-medium text-secondary-500">
                                        {filtered.length} phone
                                        {filtered.length !== 1 ? "s" : ""}{" "}
                                        found
                                    </p>

                                    <div
                                        className={cn(
                                            "grid gap-4",
                                            viewMode === "split"
                                                ? "grid-cols-1"
                                                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                        )}
                                    >
                                        {filtered.map((listing, i) => (
                                            <div
                                                key={listing.id}
                                                ref={(el) => {
                                                    cardRefs.current[
                                                        listing.id
                                                    ] = el;
                                                }}
                                                className={cn(
                                                    "transition-all duration-500",
                                                    highlightedId ===
                                                    listing.id &&
                                                    "ring-2 ring-primary-500 ring-offset-2 rounded-2xl"
                                                )}
                                            >
                                                <a
                                                    href={`/listings/${listing.id}`}
                                                >
                                                    <PhoneCard
                                                        listing={listing}
                                                        index={i}
                                                    />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Map */}
                            {viewMode !== "list" && (
                                <div
                                    className={cn(
                                        viewMode === "split"
                                            ? "sticky top-6"
                                            : ""
                                    )}
                                >
                                    <Map
                                        center={center}
                                        markers={markers}
                                        zoom={6}
                                        height={
                                            viewMode === "map"
                                                ? "calc(100vh - 200px)"
                                                : "calc(100vh - 200px)"
                                        }
                                        onMarkerClick={handleMarkerClick}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
