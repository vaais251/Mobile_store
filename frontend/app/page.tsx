"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Loader2,
    MapPin,
    Smartphone,
    Search,
    SlidersHorizontal,
    X,
    ShieldCheck,
    LayoutGrid,
    List,
    Sparkles,
    TrendingUp,
    Filter,
    Zap,
    Star,
    ArrowRight,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import { Footer } from "@/components/Footer";
import { CitySelector } from "@/components/CitySelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Brand data ───────────────────────────── */
const brands = [
    { name: "Apple", icon: "🍎", query: "apple", gradient: "from-gray-900 to-gray-700" },
    { name: "Samsung", icon: "📱", query: "samsung", gradient: "from-blue-600 to-blue-400" },
    { name: "Google", icon: "🔍", query: "google", gradient: "from-red-500 to-yellow-400" },
    { name: "Xiaomi", icon: "📲", query: "xiaomi", gradient: "from-orange-500 to-orange-300" },
    { name: "OnePlus", icon: "⚡", query: "oneplus", gradient: "from-red-600 to-red-400" },
    { name: "Other", icon: "➕", query: "", gradient: "from-secondary-600 to-secondary-400" },
];

/* ─── Filter Options ───────────────────────── */
const RAM_OPTIONS = [4, 6, 8, 12, 16];
const STORAGE_OPTIONS = [64, 128, 256, 512];

/* ─── Mock Data ─────────────────────────────── */
const MOCK_LISTINGS: ListingData[] = [
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
        is_locally_used: true,
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
        is_locally_used: false,
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
        is_locally_used: true,
        battery_health_percent: 88,
    },
    {
        id: "l1",
        brand: "Apple",
        model: "iPhone 14 Pro Max",
        price: 435000,
        phone_type: "used",
        ram_gb: 6,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Lahore",
        condition_rating: 9,
        pta_approved: null,
        is_locally_used: true,
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
        is_locally_used: false,
        battery_health_percent: 85,
    },
    {
        id: "l4",
        brand: "OnePlus",
        model: "12R",
        price: 125000,
        phone_type: "new",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Faisalabad",
        condition_rating: null,
    },
    {
        id: "l5",
        brand: "Xiaomi",
        model: "14 Ultra",
        price: 175000,
        phone_type: "new",
        ram_gb: 16,
        storage_gb: 512,
        thumbnail_image: null,
        location_city: "Multan",
        condition_rating: null,
    },
    {
        id: "l6",
        brand: "Samsung",
        model: "Galaxy Z Flip 5",
        price: 195000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "F-7, Islamabad",
        condition_rating: 8,
        pta_approved: true,
        is_locally_used: true,
        battery_health_percent: 90,
    },
    {
        id: "l7",
        brand: "Apple",
        model: "iPhone 12",
        price: 95000,
        phone_type: "used",
        ram_gb: 4,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Peshawar",
        condition_rating: 7,
        pta_approved: true,
        is_locally_used: false,
        battery_health_percent: 82,
    },
    {
        id: "l8",
        brand: "OnePlus",
        model: "Nord CE 3",
        price: 52000,
        phone_type: "new",
        ram_gb: 8,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Hyderabad",
        condition_rating: null,
    },
];

const ITEMS_PER_PAGE = 8;

/* ─── Stats data ───────────────────────────── */
const stats = [
    { label: "Active Listings", value: "12K+", icon: Smartphone },
    { label: "Verified Sellers", value: "3.5K+", icon: ShieldCheck },
    { label: "Cities Covered", value: "50+", icon: MapPin },
    { label: "Happy Buyers", value: "25K+", icon: Star },
];

/* ─── Page Component ──────────────────────── */
export default function HomePage() {
    const [allListings, setAllListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);

    /* ─── Filter state ──────────────────── */
    const [activeType, setActiveType] = useState<"used" | "new" | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
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
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [activeBrand, setActiveBrand] = useState<string | null>(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get("/api/v1/listings/");
                const items = res.data?.items || [];
                if (items.length > 0) {
                    setAllListings(items);
                } else {
                    setAllListings(MOCK_LISTINGS);
                }
            } catch {
                setAllListings(MOCK_LISTINGS);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    /* ─── Filtering ─────────────────────── */
    const filtered = useMemo(() => {
        return allListings.filter((l) => {
            // Phone type toggle (new/used)
            if (activeType && l.phone_type !== activeType) return false;
            // Brand filter
            if (activeBrand && l.brand.toLowerCase() !== activeBrand.toLowerCase()) return false;
            // Search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match =
                    l.brand.toLowerCase().includes(q) ||
                    l.model.toLowerCase().includes(q);
                if (!match) return false;
            }
            // Price range
            if (priceMin && l.price < Number(priceMin)) return false;
            if (priceMax && l.price > Number(priceMax)) return false;
            // City
            if (city && l.location_city && !l.location_city.toLowerCase().includes(city.toLowerCase())) return false;
            // PTA — only applies to used phones
            if (ptaApproved && (l.phone_type !== "used" || !l.pta_approved)) return false;
            if (nonPta && (l.phone_type !== "used" || l.pta_approved !== false)) return false;
            // Locally Used — only applies to used phones
            if (locallyUsed && (l.phone_type !== "used" || !l.is_locally_used)) return false;
            if (imported && (l.phone_type !== "used" || l.is_locally_used !== false)) return false;
            // RAM
            if (selectedRam && l.ram_gb !== selectedRam) return false;
            // Storage
            if (selectedStorage.length > 0 && !selectedStorage.includes(l.storage_gb)) return false;
            // Battery
            if (batteryMin > 0 && (l.battery_health_percent == null || l.battery_health_percent < batteryMin)) return false;
            return true;
        });
    }, [allListings, activeType, activeBrand, searchQuery, priceMin, priceMax, city, ptaApproved, nonPta, locallyUsed, imported, selectedRam, selectedStorage, batteryMin]);

    /* ─── Sorting ───────────────────────── */
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "price_low": return a.price - b.price;
                case "price_high": return b.price - a.price;
                default: return 0;
            }
        });
    }, [filtered, sortBy]);

    /* ─── Pagination ────────────────────── */
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    /* ─── Active filter count ───────────── */
    const activeFilterCount = [
        activeType,
        activeBrand,
        priceMin,
        priceMax,
        city,
        ptaApproved,
        nonPta,
        locallyUsed,
        imported,
        selectedRam,
        selectedStorage.length > 0,
        batteryMin > 0,
    ].filter(Boolean).length;

    /* ─── Clear filters ─────────────────── */
    const clearFilters = () => {
        setActiveType(null);
        setActiveBrand(null);
        setSearchQuery("");
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
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
            pageNumbers.push(i);
        if (currentPage < totalPages - 2) pageNumbers.push("...");
        pageNumbers.push(totalPages);
    }

    /* ─── Filter Sidebar Content ────────── */
    const FilterContent = () => (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                        <Filter className="h-4 w-4 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-bold text-secondary-900">
                        Filters
                    </h3>
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                    Clear All
                </button>
            </div>

            {/* Phone Type */}
            <div>
                <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    Condition
                </label>
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={() => {
                            setActiveType(activeType === "new" ? null : "new");
                            // Reset used-only filters when switching to New
                            setPtaApproved(false); setNonPta(false);
                            setLocallyUsed(false); setImported(false);
                            setCurrentPage(1);
                        }}
                        className={cn(
                            "flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200",
                            activeType === "new"
                                ? "border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                : "border-secondary-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-primary-50"
                        )}
                    >
                        ✨ New
                    </button>
                    <button
                        onClick={() => { setActiveType(activeType === "used" ? null : "used"); setCurrentPage(1); }}
                        className={cn(
                            "flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200",
                            activeType === "used"
                                ? "border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                : "border-secondary-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-primary-50"
                        )}
                    >
                        🔄 Used
                    </button>
                </div>
            </div>

            {/* Price Range */}
            <div>
                <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    Price Range
                </label>
                <div className="mt-2 flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-secondary-400">Rs.</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
                            className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-9 pr-3 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                    <span className="flex items-center text-secondary-400">—</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-secondary-400">Rs.</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
                            className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-9 pr-3 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* City */}
            <div>
                <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    City
                </label>
                <div className="mt-2">
                    <CitySelector
                        value={city}
                        onChange={(v) => { setCity(v); setCurrentPage(1); }}
                        placeholder="All Cities"
                    />
                </div>
            </div>

            {/* PTA Status — only for used phones */}
            {activeType !== "new" && (
                <div>
                    <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                        PTA Status
                        <span className="ml-1 text-[10px] font-normal text-secondary-400">(used only)</span>
                    </label>
                    <div className="mt-2 space-y-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary-50">
                            <input
                                type="checkbox"
                                checked={ptaApproved}
                                onChange={(e) => {
                                    setPtaApproved(e.target.checked);
                                    if (e.target.checked) setNonPta(false);
                                    setCurrentPage(1);
                                }}
                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-sm text-secondary-700">PTA Approved</span>
                            </div>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary-50">
                            <input
                                type="checkbox"
                                checked={nonPta}
                                onChange={(e) => {
                                    setNonPta(e.target.checked);
                                    if (e.target.checked) setPtaApproved(false);
                                    setCurrentPage(1);
                                }}
                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-700">Non-PTA</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Locally Used / Imported — only for used phones */}
            {activeType !== "new" && (
                <div>
                    <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                        Usage Origin
                        <span className="ml-1 text-[10px] font-normal text-secondary-400">(used only)</span>
                    </label>
                    <div className="mt-2 space-y-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary-50">
                            <input
                                type="checkbox"
                                checked={locallyUsed}
                                onChange={(e) => {
                                    setLocallyUsed(e.target.checked);
                                    if (e.target.checked) setImported(false);
                                    setCurrentPage(1);
                                }}
                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-sm text-secondary-700">Locally Used</span>
                            </div>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary-50">
                            <input
                                type="checkbox"
                                checked={imported}
                                onChange={(e) => {
                                    setImported(e.target.checked);
                                    if (e.target.checked) setLocallyUsed(false);
                                    setCurrentPage(1);
                                }}
                                className="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-700">Imported</span>
                        </label>
                    </div>
                </div>
            )}

            {/* RAM */}
            <div>
                <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    RAM
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {RAM_OPTIONS.map((ram) => (
                        <button
                            key={ram}
                            onClick={() => { setSelectedRam(selectedRam === ram ? null : ram); setCurrentPage(1); }}
                            className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                                selectedRam === ram
                                    ? "border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                    : "border-secondary-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-primary-50"
                            )}
                        >
                            {ram} GB
                        </button>
                    ))}
                </div>
            </div>

            {/* Storage */}
            <div>
                <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                    Storage
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {STORAGE_OPTIONS.map((gb) => (
                        <button
                            key={gb}
                            onClick={() => toggleStorage(gb)}
                            className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                                selectedStorage.includes(gb)
                                    ? "border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                    : "border-secondary-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-primary-50"
                            )}
                        >
                            {gb} GB
                        </button>
                    ))}
                </div>
            </div>

            {/* Battery Health */}
            <div>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-secondary-800 uppercase tracking-wider">
                        Battery Health
                    </label>
                    <span className="text-xs font-semibold text-primary-500">
                        {batteryMin > 0 ? `${batteryMin}%+` : "Any"}
                    </span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={batteryMin}
                    onChange={(e) => { setBatteryMin(Number(e.target.value)); setCurrentPage(1); }}
                    className="slider-primary mt-3 w-full cursor-pointer"
                    style={{ "--val": batteryMin / 10 } as React.CSSProperties}
                />
                <div className="mt-1 flex justify-between text-[10px] text-secondary-400">
                    <span>Any</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 p-3.5 ring-1 ring-primary-100">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <p className="text-[11px] leading-relaxed text-secondary-600">
                    <span className="font-semibold text-secondary-800">
                        All chats are moderated{" "}
                    </span>
                    by admins to ensure safe local pickup and secure transactions.
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col bg-secondary-100">
            <Navbar />

            <main className="flex-1">
                {/* ─── Hero ────────────────────────── */}
                <HeroSection
                    onSearch={(q) => {
                        setSearchQuery(q);
                        setCurrentPage(1);
                    }}
                    onTypeSelect={(type) => {
                        setActiveType(type);
                        if (type === "new") {
                            setPtaApproved(false); setNonPta(false);
                            setLocallyUsed(false); setImported(false);
                        }
                        setCurrentPage(1);
                    }}
                />

                {/* ─── Stats Bar ───────────────────── */}
                <section className="relative -mt-6 z-10">
                    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
                        >
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                                    className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-premium ring-1 ring-secondary-200/50 transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-0.5"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100">
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-secondary-900">{stat.value}</p>
                                        <p className="text-[11px] text-secondary-500">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ─── Browse by Brand ─────────────── */}
                <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md shadow-primary-500/20">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary-900 sm:text-xl">
                                    Browse by Brand
                                </h2>
                                <p className="text-xs text-secondary-500">Find your favorite brand</p>
                            </div>
                        </div>
                        <Link
                            href="/search"
                            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors group"
                        >
                            View all
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
                        {brands.map((brand, i) => (
                            <motion.div
                                key={brand.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.06, duration: 0.35 }}
                                className="relative"
                            >
                                <button
                                    onClick={() => {
                                        const newBrand = activeBrand === brand.query ? null : brand.query;
                                        setActiveBrand(newBrand || null);
                                        setCurrentPage(1);
                                        document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                    className={cn(
                                        "group flex w-full flex-col items-center gap-2.5 rounded-2xl p-5 ring-1 transition-all duration-300",
                                        activeBrand === brand.query
                                            ? "bg-primary-50 ring-primary-300 shadow-premium-lg -translate-y-1"
                                            : "bg-white ring-secondary-200/80 hover:ring-primary-200 hover:shadow-premium hover:-translate-y-1"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                                        brand.gradient
                                    )}>
                                        <span className="text-2xl filter drop-shadow-sm">
                                            {brand.icon}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold transition-colors",
                                        activeBrand === brand.query
                                            ? "text-primary-600"
                                            : "text-secondary-700 group-hover:text-primary-600"
                                    )}>
                                        {brand.name}
                                    </span>
                                    {activeBrand === brand.query && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white"
                                        >
                                            <X className="h-3 w-3" />
                                        </motion.div>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ─── Main Listings Section with Filters ─────── */}
                <section id="listings-section" className="container mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 scroll-mt-4">
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary-900 sm:text-xl">
                                    Explore Listings
                                </h2>
                                <p className="text-xs text-secondary-500">
                                    {sorted.length} phones available
                                    {activeType && ` · ${activeType === "new" ? "Brand New" : "Pre-owned"}`}
                                    {city && ` · in ${city}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Desktop filter toggle */}
                            <button
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                className={cn(
                                    "hidden lg:flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                    filtersOpen
                                        ? "border-primary-500 bg-primary-50 text-primary-600"
                                        : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300"
                                )}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                            {/* Mobile filter toggle */}
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className={cn(
                                    "lg:hidden flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                                    "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300"
                                )}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Search bar + Sort + View */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search for phones, brands, or models..."
                                className="h-11 w-full rounded-xl border border-secondary-200 bg-white pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* New / Used pills */}
                        <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-secondary-200 shadow-sm">
                            <button
                                onClick={() => {
                                    setActiveType(activeType === "new" ? null : "new");
                                    // Reset used-only filters when switching to New
                                    setPtaApproved(false); setNonPta(false);
                                    setLocallyUsed(false); setImported(false);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200",
                                    activeType === "new"
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                )}
                            >
                                New
                            </button>
                            <button
                                onClick={() => { setActiveType(activeType === "used" ? null : "used"); setCurrentPage(1); }}
                                className={cn(
                                    "rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200",
                                    activeType === "used"
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-600 hover:bg-secondary-50"
                                )}
                            >
                                Used
                            </button>
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-11 rounded-xl border border-secondary-200 bg-white px-3 text-sm font-medium text-secondary-700 focus:border-primary-400 focus:outline-none shadow-sm cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low → High</option>
                            <option value="price_high">Price: High → Low</option>
                        </select>

                        {/* View toggle */}
                        <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-secondary-200 shadow-sm">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "rounded-lg p-2 transition-all",
                                    viewMode === "grid"
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50"
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "rounded-lg p-2 transition-all",
                                    viewMode === "list"
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content area with sidebar */}
                    <div className="flex gap-6">
                        {/* ─── Desktop Filter Sidebar ───── */}
                        <AnimatePresence>
                            {filtersOpen && (
                                <motion.aside
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 280, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="hidden lg:block flex-shrink-0 overflow-hidden"
                                >
                                    <div className="w-[280px] rounded-2xl bg-white p-5 shadow-premium ring-1 ring-secondary-200/50 sticky top-4">
                                        <FilterContent />
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>

                        {/* ─── Mobile Filter Drawer ─────── */}
                        <AnimatePresence>
                            {mobileFiltersOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: 0 }}
                                        exit={{ x: "-100%" }}
                                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                        className="fixed left-0 top-0 z-50 h-full w-[320px] overflow-y-auto bg-white p-5 shadow-2xl lg:hidden"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-base font-bold text-secondary-900">Filters</h3>
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-100 text-secondary-500 hover:bg-secondary-200 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <FilterContent />
                                        <div className="mt-5 pt-4 border-t border-secondary-200">
                                            <Button
                                                size="lg"
                                                className="w-full"
                                                onClick={() => setMobileFiltersOpen(false)}
                                            >
                                                Show {sorted.length} Results
                                            </Button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* ─── Listings Grid ────────────── */}
                        <div className="flex-1 min-w-0">
                            {/* Active filter tags */}
                            {activeFilterCount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-4 flex flex-wrap items-center gap-2"
                                >
                                    <span className="text-xs text-secondary-500">Active:</span>
                                    {activeType && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
                                            {activeType === "new" ? "✨ New" : "🔄 Used"}
                                            <button onClick={() => setActiveType(null)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {activeBrand && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                                            {brands.find(b => b.query === activeBrand)?.name || activeBrand}
                                            <button onClick={() => setActiveBrand(null)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {city && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                                            <MapPin className="h-3 w-3" />
                                            {city}
                                            <button onClick={() => setCity("")}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {(priceMin || priceMax) && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                                            Rs. {priceMin || "0"} – {priceMax || "∞"}
                                            <button onClick={() => { setPriceMin(""); setPriceMax(""); }}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {ptaApproved && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                                            <ShieldCheck className="h-3 w-3" />
                                            PTA Approved
                                            <button onClick={() => setPtaApproved(false)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {nonPta && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100">
                                            Non-PTA
                                            <button onClick={() => setNonPta(false)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {locallyUsed && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                                            <MapPin className="h-3 w-3" />
                                            Locally Used
                                            <button onClick={() => setLocallyUsed(false)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {imported && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                                            Imported
                                            <button onClick={() => setImported(false)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedRam && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
                                            {selectedRam}GB RAM
                                            <button onClick={() => setSelectedRam(null)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedStorage.length > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
                                            {selectedStorage.map(s => `${s}GB`).join(", ")} Storage
                                            <button onClick={() => setSelectedStorage([])}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {batteryMin > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-100">
                                            Battery ≥{batteryMin}%
                                            <button onClick={() => setBatteryMin(0)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs font-medium text-primary-500 hover:text-primary-600 ml-1"
                                    >
                                        Clear all
                                    </button>
                                </motion.div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-secondary-500">Loading listings...</p>
                                </div>
                            ) : paged.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary-100">
                                        <Search className="h-10 w-10 text-secondary-300" />
                                    </div>
                                    <p className="mt-4 text-lg font-semibold text-secondary-700">
                                        No phones found
                                    </p>
                                    <p className="mt-1 text-sm text-secondary-500 max-w-xs">
                                        Try adjusting your filters or search query to find what you&apos;re looking for
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={cn(
                                            "grid gap-4",
                                            viewMode === "grid"
                                                ? filtersOpen
                                                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                                                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                                : "grid-cols-1"
                                        )}
                                    >
                                        {paged.map((listing, i) => (
                                            <PhoneCard
                                                key={listing.id}
                                                listing={listing}
                                                index={i}
                                                variant="grid"
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-8 flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 bg-white text-secondary-500 transition-all hover:bg-secondary-50 disabled:opacity-40 shadow-sm"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>

                                                {pageNumbers.map((p, i) =>
                                                    p === "..." ? (
                                                        <span key={`dots-${i}`} className="px-2 text-secondary-400">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => setCurrentPage(p as number)}
                                                            className={cn(
                                                                "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                                                                currentPage === p
                                                                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                                                                    : "border border-secondary-200 bg-white text-secondary-600 hover:bg-secondary-50 shadow-sm"
                                                            )}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )}

                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 bg-white text-secondary-500 transition-all hover:bg-secondary-50 disabled:opacity-40 shadow-sm"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-secondary-500">
                                                Page {currentPage} of {totalPages} ({sorted.length} results)
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── Map CTA ─────────────────────── */}
                <section className="container mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 p-8 sm:p-12">
                        {/* Decorative grid */}
                        <div className="absolute inset-0 opacity-[0.07]">
                            <div className="h-full w-full" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                                `,
                                backgroundSize: "40px 40px",
                            }} />
                        </div>

                        {/* Decorative glow */}
                        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-500/20 blur-3xl" />
                        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-primary-400/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="max-w-lg">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm ring-1 ring-white/10">
                                    <Zap className="h-3 w-3" />
                                    Location-based search
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                                    Find local deals in your
                                    <br />
                                    <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                                        neighborhood
                                    </span>
                                </h3>
                                <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-md">
                                    Switch to map view to see exact locations of verified
                                    sellers. Meeting up in public places has never been
                                    easier.
                                </p>
                            </div>
                            <Link href="/search?view=map">
                                <Button
                                    size="lg"
                                    leftIcon={<MapPin className="h-5 w-5" />}
                                    rightIcon={<ArrowRight className="h-4 w-4" />}
                                    className="bg-white text-secondary-900 hover:bg-white/90 shadow-xl"
                                >
                                    Explore on Map
                                </Button>
                            </Link>
                        </div>

                        {/* Decorative location pins */}
                        <div className="absolute right-12 top-8 hidden sm:block">
                            <div className="flex flex-col gap-6">
                                {[
                                    { x: 0, y: 0, size: "h-4 w-4", opacity: "opacity-60" },
                                    { x: 40, y: 20, size: "h-3 w-3", opacity: "opacity-40" },
                                    { x: -20, y: 50, size: "h-5 w-5", opacity: "opacity-80" },
                                    { x: 30, y: 70, size: "h-3 w-3", opacity: "opacity-30" },
                                ].map((dot, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                                        className={cn("rounded-full bg-primary-400", dot.size, dot.opacity)}
                                        style={{ transform: `translate(${dot.x}px, ${dot.y}px)` }}
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
