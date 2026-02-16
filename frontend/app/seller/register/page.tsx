"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Smartphone,
    User,
    Store,
    Phone,
    MapPin,
    Navigation,
    ChevronDown,
    ArrowRight,
    ShieldCheck,
    MessageSquareMore,
    Video,
    Building2,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
type TabType = "details" | "verification";
type SellerType = "individual" | "shop";

/* ─── Trust Badge Data ───────────────────── */
const trustBadges = [
    {
        icon: ShieldCheck,
        label: "VERIFIED SELLERS",
        color: "text-primary-500",
    },
    {
        icon: MessageSquareMore,
        label: "MODERATED CHAT",
        color: "text-secondary-700",
    },
    {
        icon: Video,
        label: "LOCAL PICKUP",
        color: "text-secondary-700",
    },
];

export default function SellerRegisterPage() {
    const router = useRouter();

    /* ─── Tab State ─────────────────────── */
    const [activeTab, setActiveTab] = useState<TabType>("details");

    /* ─── Form State ────────────────────── */
    const [sellerType, setSellerType] = useState<SellerType>("individual");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLong, setLocationLong] = useState<number | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    /* ─── UI State ──────────────────────── */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    /* ─── Auto-fetch Location ───────────── */
    const handleAutoFetchLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationLat(position.coords.latitude);
                setLocationLong(position.coords.longitude);
                setFetchingLocation(false);
            },
            (err) => {
                setError("Unable to fetch location. Please enter it manually.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    /* ─── Submit Handler ────────────────── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!agreedToTerms) {
            setError("Please agree to the Terms of Service to continue.");
            return;
        }

        setLoading(true);

        try {
            // Register as seller
            await api.post("/api/v1/auth/register", {
                name,
                phone: phoneNumber,
                password,
                role: "seller",
                is_individual: sellerType === "individual",
                shop_name: sellerType === "shop" ? name : undefined,
                address_street: streetAddress,
                address_city: city,
                location_lat: locationLat,
                location_long: locationLong,
            });

            // Auto-login after registration
            const res = await api.post("/api/v1/auth/login", {
                phone: phoneNumber,
                password,
            });

            const { access_token } = res.data;
            localStorage.setItem("access_token", access_token);
            window.location.href = "/";
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (typeof detail === "string") {
                setError(detail);
            } else if (Array.isArray(detail)) {
                setError(detail.map((e: any) => e.msg).join(", "));
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-secondary-100">
            <Navbar />

            {/* ─── Page Content ─────────────── */}
            <main className="flex-1 px-4 py-10 sm:px-6 lg:py-14">
                <div className="mx-auto max-w-2xl">
                    {/* ─── Header ─────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8 text-center"
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
                            Join our Marketplace
                        </h1>
                        <p className="mt-3 text-secondary-500">
                            Start selling your phones to local buyers today.
                            Registration takes less than 2 minutes.
                        </p>
                    </motion.div>

                    {/* ─── Card ───────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl border border-secondary-300/60 bg-white shadow-premium"
                    >
                        {/* ─── Tabs ──────────── */}
                        <div className="flex border-b border-secondary-200">
                            <button
                                type="button"
                                onClick={() => setActiveTab("details")}
                                className={cn(
                                    "flex-1 py-4 text-center text-sm font-semibold transition-all relative",
                                    activeTab === "details"
                                        ? "text-primary-500"
                                        : "text-secondary-400 hover:text-secondary-600"
                                )}
                            >
                                Seller Details
                                {activeTab === "details" && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-500 rounded-t-full"
                                    />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("verification")}
                                className={cn(
                                    "flex-1 py-4 text-center text-sm font-semibold transition-all relative",
                                    activeTab === "verification"
                                        ? "text-primary-500"
                                        : "text-secondary-400 hover:text-secondary-600"
                                )}
                            >
                                Verification
                                {activeTab === "verification" && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-500 rounded-t-full"
                                    />
                                )}
                            </button>
                        </div>

                        {/* ─── Tab Content ──── */}
                        <div className="p-6 sm:p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === "details" && (
                                    <motion.form
                                        key="details"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.25 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        {/* ─── Error ──────── */}
                                        {error && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: -8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-medium text-accent-600"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        {/* ─── Seller Type ── */}
                                        <div>
                                            <label className="mb-3 block text-sm font-medium text-secondary-700">
                                                I am registering as an:
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSellerType(
                                                            "individual"
                                                        )
                                                    }
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all",
                                                        sellerType ===
                                                            "individual"
                                                            ? "border-primary-500 bg-primary-50/50 text-primary-600"
                                                            : "border-secondary-200 text-secondary-500 hover:border-secondary-300"
                                                    )}
                                                >
                                                    <User className="h-6 w-6" />
                                                    <span className="text-sm font-semibold">
                                                        Individual
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSellerType("shop")
                                                    }
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all",
                                                        sellerType === "shop"
                                                            ? "border-primary-500 bg-primary-50/50 text-primary-600"
                                                            : "border-secondary-200 text-secondary-500 hover:border-secondary-300"
                                                    )}
                                                >
                                                    <Store className="h-6 w-6" />
                                                    <span className="text-sm font-semibold">
                                                        Shop / Business
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* ─── Name & Phone ─ */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Name */}
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-secondary-700">
                                                    Full Name / Business Name
                                                </label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) =>
                                                            setName(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. John Doe or TechHub Ltd"
                                                        required
                                                        minLength={2}
                                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-secondary-700">
                                                    Phone Number
                                                </label>
                                                <div className="flex gap-2">
                                                    {/* Country code prefix */}
                                                    <div className="flex h-11 items-center gap-1 rounded-xl border border-secondary-200 bg-secondary-50 px-3 text-sm text-secondary-600">
                                                        <ChevronDown className="h-3.5 w-3.5 text-secondary-400" />
                                                        <span>🇵🇰</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={phoneNumber}
                                                        onChange={(e) =>
                                                            setPhoneNumber(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="700 000 0000"
                                                        required
                                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-secondary-400">
                                                    Used for pickup coordination
                                                    and SMS alerts.
                                                </p>
                                            </div>
                                        </div>

                                        {/* ─── Password ──── */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-secondary-700">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Min 8 characters"
                                                    required
                                                    minLength={8}
                                                    className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* ─── Location Section ── */}
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-secondary-700">
                                                    Location Information
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleAutoFetchLocation
                                                    }
                                                    disabled={fetchingLocation}
                                                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors hover:text-primary-600 disabled:opacity-50"
                                                >
                                                    <Navigation className="h-3.5 w-3.5" />
                                                    {fetchingLocation
                                                        ? "Fetching..."
                                                        : "AUTO-FETCH LOCATION"}
                                                </button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {/* Street Address */}
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                                        Street Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={streetAddress}
                                                        onChange={(e) =>
                                                            setStreetAddress(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="123 Market Square"
                                                        required
                                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    />
                                                </div>

                                                {/* City */}
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={city}
                                                        onChange={(e) =>
                                                            setCity(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="San Francisco"
                                                        required
                                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ─── Map Preview ─── */}
                                        <div className="overflow-hidden rounded-xl border border-secondary-200">
                                            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary-50/80 via-secondary-100 to-primary-50/40">
                                                {/* Map grid pattern */}
                                                <div className="absolute inset-0 opacity-20">
                                                    <svg
                                                        className="h-full w-full"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <defs>
                                                            <pattern
                                                                id="mapGrid"
                                                                width="40"
                                                                height="40"
                                                                patternUnits="userSpaceOnUse"
                                                            >
                                                                <path
                                                                    d="M 40 0 L 0 0 0 40"
                                                                    fill="none"
                                                                    stroke="#007AFF"
                                                                    strokeWidth="0.5"
                                                                />
                                                            </pattern>
                                                        </defs>
                                                        <rect
                                                            width="100%"
                                                            height="100%"
                                                            fill="url(#mapGrid)"
                                                        />
                                                    </svg>
                                                </div>
                                                {/* Simulated road lines */}
                                                <div className="absolute left-0 right-0 top-1/2 h-px bg-secondary-300/60" />
                                                <div className="absolute bottom-0 left-1/3 top-0 w-px bg-secondary-300/60" />
                                                <div className="absolute bottom-0 left-2/3 top-0 w-px bg-secondary-300/60" />

                                                {/* Pin + Label */}
                                                <div className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-200">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-600 shadow-sm backdrop-blur-sm">
                                                        Map Preview
                                                    </span>
                                                </div>

                                                {/* Location indicator if fetched */}
                                                {locationLat &&
                                                    locationLong && (
                                                        <div className="absolute bottom-2 right-3 rounded-lg bg-success-50 px-2.5 py-1 text-[10px] font-semibold text-success-700">
                                                            📍 Location captured
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* ─── Terms ──────── */}
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                checked={agreedToTerms}
                                                onChange={(e) =>
                                                    setAgreedToTerms(
                                                        e.target.checked
                                                    )
                                                }
                                                className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <label
                                                htmlFor="terms"
                                                className="text-sm leading-relaxed text-secondary-600"
                                            >
                                                I agree to the{" "}
                                                <Link
                                                    href="/terms"
                                                    className="font-semibold text-primary-500 hover:text-primary-600"
                                                >
                                                    Terms of Service
                                                </Link>{" "}
                                                and acknowledge that all
                                                transactions are protected by
                                                our{" "}
                                                <span className="font-semibold text-secondary-900">
                                                    Admin-moderated chat system
                                                </span>{" "}
                                                for my safety.
                                            </label>
                                        </div>

                                        {/* ─── Submit ─────── */}
                                        <Button
                                            type="submit"
                                            size="xl"
                                            isLoading={loading}
                                            rightIcon={
                                                <ArrowRight className="h-5 w-5" />
                                            }
                                            className="w-full"
                                        >
                                            Register as Seller
                                        </Button>

                                        {/* ─── Login Link ─── */}
                                        <p className="text-center text-sm text-secondary-500">
                                            Already have a seller account?{" "}
                                            <Link
                                                href="/login"
                                                className="font-semibold text-secondary-900 underline underline-offset-2 hover:text-primary-500"
                                            >
                                                Log in here
                                            </Link>
                                        </p>
                                    </motion.form>
                                )}

                                {activeTab === "verification" && (
                                    <motion.div
                                        key="verification"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25 }}
                                        className="flex flex-col items-center justify-center py-16 text-center"
                                    >
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                                            <ShieldCheck className="h-8 w-8 text-primary-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-secondary-900">
                                            Verification Coming Soon
                                        </h3>
                                        <p className="mt-2 max-w-sm text-sm text-secondary-500">
                                            After completing your registration,
                                            our team will verify your account
                                            within 24 hours. You&apos;ll receive
                                            an SMS confirmation.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("details")
                                            }
                                            className="mt-6 text-sm font-semibold text-primary-500 hover:text-primary-600"
                                        >
                                            ← Back to Seller Details
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* ─── Trust Badges ───────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="mt-10 flex items-center justify-center gap-10 sm:gap-16"
                    >
                        {trustBadges.map((badge) => (
                            <div
                                key={badge.label}
                                className="flex flex-col items-center gap-2"
                            >
                                <badge.icon
                                    className={cn("h-6 w-6", badge.color)}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500">
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
