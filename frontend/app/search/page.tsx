"use client";

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    Suspense,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    LayoutGrid,
    List,
    Loader2,
    X,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Map as MapIcon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import { CitySelector } from "@/components/CitySelector";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Mock Data ──────────────────────────── */
const MOCK_LISTINGS: ListingData[] = [
    {
        id: "s1",
        brand: "Apple",
        model: "iPhone 13 - 256GB",
        price: 185000,
        phone_type: "new",
        ram_gb: 4,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Clifton, Karachi",
        location_lat: 24.8131,
        location_long: 67.0295,
        condition_rating: null,
        battery_health_percent: 100,
    },
    {
        id: "s2",
        brand: "Samsung",
        model: "Galaxy S21",
        price: 92000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Gulshan, Karachi",
        location_lat: 24.9237,
        location_long: 67.0892,
        condition_rating: 8,
        pta_approved: false,
        is_locally_used: false,
        battery_health_percent: 89,
    },
    {
        id: "s3",
        brand: "Google",
        model: "Pixel 6 Pro",
        price: 78000,
        phone_type: "used",
        ram_gb: 12,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Bahria Town, Karachi",
        location_lat: 24.9944,
        location_long: 67.3494,
        condition_rating: 8,
        pta_approved: true,
        is_locally_used: true,
        battery_health_percent: 92,
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
        battery_health_percent: null,
    },
    {
        id: "s5",
        brand: "Apple",
        model: "iPhone 14 Pro Max",
        price: 345000,
        phone_type: "used",
        ram_gb: 6,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "DHA, Lahore",
        location_lat: 31.4697,
        location_long: 74.3762,
        condition_rating: 9,
        pta_approved: true,
        is_locally_used: true,
        battery_health_percent: 93,
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
        location_city: "F-7, Islamabad",
        location_lat: 33.7294,
        location_long: 73.0735,
        condition_rating: 8,
        pta_approved: true,
        is_locally_used: true,
        battery_health_percent: 90,
    },
    {
        id: "s7",
        brand: "Xiaomi",
        model: "14 Ultra",
        price: 175000,
        phone_type: "new",
        ram_gb: 16,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "Faisalabad",
        location_lat: 31.4504,
        location_long: 73.135,
        condition_rating: null,
    },
    {
        id: "s8",
        brand: "Apple",
        model: "iPhone 12",
        price: 95000,
        phone_type: "used",
        ram_gb: 4,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Multan",
        location_lat: 30.1575,
        location_long: 71.5249,
        condition_rating: 7,
        pta_approved: true,
        is_locally_used: false,
        battery_health_percent: 82,
    },
    {
        id: "s9",
        brand: "OnePlus",
        model: "Nord CE 3",
        price: 52000,
        phone_type: "new",
        ram_gb: 8,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Peshawar",
        location_lat: 34.0151,
        location_long: 71.5249,
        condition_rating: null,
    },
];

const ITEMS_PER_PAGE = 6;

/* ─── RAM Options ────────────────────────── */
const RAM_OPTIONS = [4, 6, 8, 12, 16];
/* ─── Storage Options ────────────────────── */
const STORAGE_OPTIONS = [64, 128, 256, 512];

/* ═══════════════════════════════════════════
   Inner component (uses useSearchParams)
   ═══════════════════════════════════════════ */
function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const initialBrand = searchParams.get("brand") || "";

    /* ─── Listings state ────────────────── */
    const [allListings, setAllListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(initialQuery || initialBrand);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(true);

    /* ─── Filter state ──────────────────── */
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [city, setCity] = useState("");
    const [ptaApproved, setPtaApproved] = useState(false);
    const [nonPta, setNonPta] = useState(false);
    const [locallyUsed, setLocallyUsed] = useState(false);
    const [imported, setImported] = useState(false);
    const [selectedRam, setSelectedRam] = useState<number | null>(null);
    const [selectedStorage, setSelectedStorage] = useState<number[]>([]);
    const [batteryMin, setBatteryMin] = useState(0);

    /* ─── Fetch listings ────────────────── */
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                if (query) params.brand = query;

                const res = await api.get("/api/v1/listings/", { params });
                const data = res.data?.items || res.data || [];
                setAllListings(data.length > 0 ? data : MOCK_LISTINGS);
            } catch {
                setAllListings(MOCK_LISTINGS);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [query]);

    /* ─── Client-side filtering ─────────── */
    const filtered = allListings.filter((l) => {
        // Search query
        if (query) {
            const q = query.toLowerCase();
            const match =
                l.brand.toLowerCase().includes(q) ||
                l.model.toLowerCase().includes(q);
            if (!match) return false;
        }
        // Price range
        if (priceMin && l.price < Number(priceMin)) return false;
        if (priceMax && l.price > Number(priceMax)) return false;
        // City
        if (
            city &&
            l.location_city &&
            !l.location_city.toLowerCase().includes(city.toLowerCase())
        )
            return false;
        // PTA — only for used phones
        if (ptaApproved && (l.phone_type !== "used" || !l.pta_approved)) return false;
        if (nonPta && (l.phone_type !== "used" || l.pta_approved !== false)) return false;
        // Locally Used — only for used phones
        if (locallyUsed && (l.phone_type !== "used" || !l.is_locally_used)) return false;
        if (imported && (l.phone_type !== "used" || l.is_locally_used !== false)) return false;
        // RAM
        if (selectedRam && l.ram_gb !== selectedRam) return false;
        // Storage
        if (
            selectedStorage.length > 0 &&
            !selectedStorage.includes(l.storage_gb)
        )
            return false;
        // Battery
        if (
            batteryMin > 0 &&
            (l.battery_health_percent == null ||
                l.battery_health_percent < batteryMin)
        )
            return false;

        return true;
    });

    /* ─── Sorting ───────────────────────── */
    const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
            case "price_low":
                return a.price - b.price;
            case "price_high":
                return b.price - a.price;
            default:
                return 0; // newest = original order
        }
    });

    /* ─── Pagination ────────────────────── */
    const totalPages = Math.max(
        1,
        Math.ceil(sorted.length / ITEMS_PER_PAGE)
    );
    const paged = sorted.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /* ─── Clear filters ─────────────────── */
    const clearFilters = () => {
        setPriceMin("");
        setPriceMax("");
        setCity("");
        setPtaApproved(false);
        setNonPta(false);
        setLocallyUsed(false);
        setImported(false);
        setSelectedRam(null);
        setSelectedStorage([]);
        setBatteryMin(0);
        setCurrentPage(1);
    };

    const toggleStorage = (gb: number) => {
        setSelectedStorage((prev) =>
            prev.includes(gb) ? prev.filter((s) => s !== gb) : [...prev, gb]
        );
        setCurrentPage(1);
    };

    /* ─── Page numbers ──────────────────── */
    const pageNumbers: (number | "...")[] = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) pageNumbers.push("...");
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        )
            pageNumbers.push(i);
        if (currentPage < totalPages - 2) pageNumbers.push("...");
        pageNumbers.push(totalPages);
    }

    return (
        <div className="flex min-h-screen flex-col bg-secondary-100">
            <Navbar />

            <div className="flex flex-1">
                {/* ═══════ LEFT SIDEBAR FILTERS ═══════ */}
                <AnimatePresence>
                    {filtersOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 260, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="hidden flex-shrink-0 overflow-y-auto border-r border-secondary-200 bg-white lg:block"
                            style={{ width: 260 }}
                        >
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-900">
                                        Filters
                                    </h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs font-medium text-primary-500 hover:text-primary-600"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Price Range */}
                                <div className="mt-6">
                                    <label className="text-xs font-bold text-secondary-800">
                                        Price Range
                                    </label>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceMin}
                                            onChange={(e) => {
                                                setPriceMin(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="h-9 w-full rounded-lg border border-secondary-200 bg-secondary-50 px-3 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceMax}
                                            onChange={(e) => {
                                                setPriceMax(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="h-9 w-full rounded-lg border border-secondary-200 bg-secondary-50 px-3 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                                        />
                                    </div>
                                </div>

                                {/* City */}
                                <div className="mt-5">
                                    <label className="text-xs font-bold text-secondary-800">
                                        City
                                    </label>
                                    <div className="mt-2">
                                        <CitySelector
                                            value={city}
                                            onChange={(v) => {
                                                setCity(v);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="All Cities"
                                        />
                                    </div>
                                </div>

                                {/* PTA Status — used phones only */}
                                <div className="mt-5">
                                    <label className="text-xs font-bold text-secondary-800">
                                        PTA Status
                                        <span className="ml-1 text-[10px] font-normal text-secondary-400">(used only)</span>
                                    </label>
                                    <div className="mt-2 space-y-2">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={ptaApproved}
                                                onChange={(e) => {
                                                    setPtaApproved(
                                                        e.target.checked
                                                    );
                                                    if (e.target.checked)
                                                        setNonPta(false);
                                                    setCurrentPage(1);
                                                }}
                                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-secondary-700">
                                                PTA Approved
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={nonPta}
                                                onChange={(e) => {
                                                    setNonPta(
                                                        e.target.checked
                                                    );
                                                    if (e.target.checked)
                                                        setPtaApproved(false);
                                                    setCurrentPage(1);
                                                }}
                                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-secondary-700">
                                                Non-PTA
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Usage Origin — used phones only */}
                                <div className="mt-5">
                                    <label className="text-xs font-bold text-secondary-800">
                                        Usage Origin
                                        <span className="ml-1 text-[10px] font-normal text-secondary-400">(used only)</span>
                                    </label>
                                    <div className="mt-2 space-y-2">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={locallyUsed}
                                                onChange={(e) => {
                                                    setLocallyUsed(
                                                        e.target.checked
                                                    );
                                                    if (e.target.checked)
                                                        setImported(false);
                                                    setCurrentPage(1);
                                                }}
                                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-sm text-secondary-700">
                                                    Locally Used
                                                </span>
                                            </div>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={imported}
                                                onChange={(e) => {
                                                    setImported(
                                                        e.target.checked
                                                    );
                                                    if (e.target.checked)
                                                        setLocallyUsed(false);
                                                    setCurrentPage(1);
                                                }}
                                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-secondary-700">
                                                Imported
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* RAM */}
                                <div className="mt-5">
                                    <label className="text-xs font-bold text-secondary-800">
                                        RAM
                                    </label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {RAM_OPTIONS.map((ram) => (
                                            <button
                                                key={ram}
                                                onClick={() => {
                                                    setSelectedRam(
                                                        selectedRam === ram
                                                            ? null
                                                            : ram
                                                    );
                                                    setCurrentPage(1);
                                                }}
                                                className={cn(
                                                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                                                    selectedRam === ram
                                                        ? "border-primary-500 bg-primary-500 text-white"
                                                        : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300"
                                                )}
                                            >
                                                {ram} GB
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Storage */}
                                <div className="mt-5">
                                    <label className="text-xs font-bold text-secondary-800">
                                        Storage
                                    </label>
                                    <div className="mt-2 space-y-2">
                                        {STORAGE_OPTIONS.map((gb) => (
                                            <label
                                                key={gb}
                                                className="flex cursor-pointer items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStorage.includes(
                                                        gb
                                                    )}
                                                    onChange={() =>
                                                        toggleStorage(gb)
                                                    }
                                                    className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-secondary-700">
                                                    {gb} GB
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Battery Health */}
                                <div className="mt-5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-secondary-800">
                                            Battery Health
                                        </label>
                                        <span className="text-xs font-semibold text-primary-500">
                                            {batteryMin > 0
                                                ? `${batteryMin}%+`
                                                : "Any"}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={batteryMin}
                                        onChange={(e) => {
                                            setBatteryMin(
                                                Number(e.target.value)
                                            );
                                            setCurrentPage(1);
                                        }}
                                        className="slider-primary mt-3 w-full cursor-pointer"
                                        style={
                                            {
                                                "--val": batteryMin / 10,
                                            } as React.CSSProperties
                                        }
                                    />
                                </div>

                                {/* Info box */}
                                <div className="mt-6 flex items-start gap-2 rounded-xl bg-primary-50 p-3">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                                    <p className="text-[11px] leading-relaxed text-secondary-600">
                                        <span className="font-semibold text-secondary-800">
                                            All chats are moderated{" "}
                                        </span>
                                        by admins to ensure safe local pickup
                                        and secure transactions.
                                    </p>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* ═══════ MAIN CONTENT ═══════ */}
                <div className="flex-1 overflow-y-auto">
                    {/* Top bar */}
                    <div className="sticky top-0 z-20 border-b border-secondary-200 bg-white px-4 py-3 shadow-sm sm:px-6">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search input */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search for phones, brands, or models..."
                                    className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                />
                                {query && (
                                    <button
                                        onClick={() => {
                                            setQuery("");
                                            setCurrentPage(1);
                                        }}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Sort dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-10 rounded-xl border border-secondary-200 bg-white px-3 text-sm font-medium text-secondary-700 focus:border-primary-400 focus:outline-none"
                            >
                                <option value="newest">
                                    Sort: Newest First
                                </option>
                                <option value="price_low">
                                    Price: Low → High
                                </option>
                                <option value="price_high">
                                    Price: High → Low
                                </option>
                            </select>

                            {/* View toggle */}
                            <div className="flex items-center gap-1 rounded-xl bg-secondary-100 p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "rounded-lg p-2 transition-all",
                                        viewMode === "grid"
                                            ? "bg-white text-primary-600 shadow-sm"
                                            : "text-secondary-500 hover:text-secondary-700"
                                    )}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "rounded-lg p-2 transition-all",
                                        viewMode === "list"
                                            ? "bg-white text-primary-600 shadow-sm"
                                            : "text-secondary-500 hover:text-secondary-700"
                                    )}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Filters toggle (mobile) */}
                            <button
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                className="rounded-xl border border-secondary-200 p-2.5 text-secondary-500 transition-colors hover:bg-secondary-50 lg:hidden"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Results area */}
                    <div className="p-4 sm:p-6">
                        {/* Heading */}
                        <div className="mb-5">
                            <h1 className="text-xl font-bold text-secondary-900 sm:text-2xl">
                                Smartphones{city ? ` in ${city}` : ""}
                            </h1>
                            <p className="text-sm text-secondary-500">
                                Showing {sorted.length} result
                                {sorted.length !== 1 ? "s" : ""}
                                {query && (
                                    <span>
                                        {" "}
                                        for &quot;
                                        <span className="font-medium text-secondary-700">
                                            {query}
                                        </span>
                                        &quot;
                                    </span>
                                )}
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            </div>
                        ) : paged.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Search className="h-12 w-12 text-secondary-300" />
                                <p className="mt-4 text-lg font-semibold text-secondary-700">
                                    No phones found
                                </p>
                                <p className="mt-1 text-sm text-secondary-500">
                                    Try adjusting your filters or search query
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm font-semibold text-primary-500 hover:text-primary-600"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Cards grid */}
                                <div
                                    className={cn(
                                        "grid gap-4",
                                        viewMode === "grid"
                                            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                                            : "grid-cols-1"
                                    )}
                                >
                                    {paged.map((listing, i) => (
                                        <PhoneCard
                                            key={listing.id}
                                            listing={listing}
                                            index={i}
                                            variant="search"
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.max(1, p - 1)
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 disabled:opacity-40"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>

                                            {pageNumbers.map((p, i) =>
                                                p === "..." ? (
                                                    <span
                                                        key={`dots-${i}`}
                                                        className="px-1 text-secondary-400"
                                                    >
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                p as number
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                                                            currentPage === p
                                                                ? "bg-primary-500 text-white shadow-sm"
                                                                : "border border-secondary-200 text-secondary-600 hover:bg-secondary-50"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}

                                            <button
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.min(
                                                            totalPages,
                                                            p + 1
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 disabled:opacity-40"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-secondary-500">
                                            Page {currentPage} of {totalPages} (
                                            {sorted.length} results)
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating "Show on Map" button */}
            <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
                <Link href="/search?view=map">
                    <button className="flex items-center gap-2 rounded-full bg-secondary-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-secondary-800">
                        <MapIcon className="h-4 w-4" />
                        Show on Map
                    </button>
                </Link>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   Page wrapper (Suspense for useSearchParams)
   ═══════════════════════════════════════════ */
export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
