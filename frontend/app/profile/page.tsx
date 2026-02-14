"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    MapPin,
    Lock,
    Eye,
    EyeOff,
    Save,
    Phone,
    Mail,
    Building2,
    Shield,
    Store,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Settings,
    UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/CitySelector";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
interface UserProfile {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    shop_name: string | null;
    is_individual: boolean;
    address_street: string;
    address_city: string;
    location_lat: number | null;
    location_long: number | null;
    created_at: string;
}

type Tab = "profile" | "settings";

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get("tab") as Tab) || "profile";

    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    /* ─── Form fields (profile) ─────────── */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [addressStreet, setAddressStreet] = useState("");
    const [addressCity, setAddressCity] = useState("");
    const [shopName, setShopName] = useState("");

    /* ─── Form fields (password) ────────── */
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    /* ─── Fetch profile ─────────────────── */
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/v1/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data;
                setProfile(data);
                setName(data.name || "");
                setEmail(data.email || "");
                setAddressStreet(data.address_street || "");
                setAddressCity(data.address_city || "");
                setShopName(data.shop_name || "");
            } catch {
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    /* ─── Save profile ──────────────────── */
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("access_token");
            const res = await api.put(
                "/api/v1/auth/me",
                {
                    name,
                    email: email || null,
                    address_street: addressStreet,
                    address_city: addressCity,
                    shop_name: shopName || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile(res.data);
            setSuccess("Profile updated successfully!");

            // Update the JWT so navbar reflects the new name
            const loginRes = await api.post("/api/v1/auth/login", {
                phone: profile?.phone,
                password: currentPassword || undefined,
            }).catch(() => null);

            if (loginRes?.data?.access_token) {
                localStorage.setItem("access_token", loginRes.data.access_token);
            }

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === "string" ? detail : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    /* ─── Change password ───────────────── */
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem("access_token");
            await api.put(
                "/api/v1/auth/me",
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === "string" ? detail : "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!profile) return null;

    const userInitial = profile.name?.charAt(0)?.toUpperCase() || "U";
    const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-secondary-500 transition-colors hover:text-secondary-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white shadow-lg"
            >
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40">
                        <span className="text-3xl font-bold">{userInitial}</span>
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80 sm:justify-start">
                            <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {profile.phone}
                            </span>
                            {profile.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {profile.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold capitalize">
                                <Shield className="h-3 w-3" />
                                {profile.role}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-white/60">
                            Member since {joinDate}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl bg-secondary-100 p-1">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                        activeTab === "profile"
                            ? "bg-white text-primary-600 shadow-sm"
                            : "text-secondary-500 hover:text-secondary-700"
                    )}
                >
                    <UserCircle className="h-4 w-4" />
                    Profile Info
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                        activeTab === "settings"
                            ? "bg-white text-primary-600 shadow-sm"
                            : "text-secondary-500 hover:text-secondary-700"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    Security
                </button>
            </div>

            {/* Alerts */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                >
                    <CheckCircle className="h-4 w-4" />
                    {success}
                </motion.div>
            )}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                    {error}
                </motion.div>
            )}

            {/* ─── Profile Info Tab ──────────── */}
            {activeTab === "profile" && (
                <motion.form
                    key="profile"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSaveProfile}
                    className="space-y-6"
                >
                    {/* Personal Info Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-200/60">
                        <h2 className="mb-4 text-sm font-bold text-secondary-900">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        minLength={2}
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="your@email.com"
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* Phone (read-only) */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={profile.phone}
                                        readOnly
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-100 pl-10 pr-4 text-sm text-secondary-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="mt-1 text-[10px] text-secondary-400">
                                    Phone number cannot be changed
                                </p>
                            </div>

                            {/* Role (read-only) */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Account Role
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                                        readOnly
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-100 pl-10 pr-4 text-sm text-secondary-500 capitalize cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-200/60">
                        <h2 className="mb-4 text-sm font-bold text-secondary-900">
                            Address & Location
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Street */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Street Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={addressStreet}
                                        onChange={(e) =>
                                            setAddressStreet(e.target.value)
                                        }
                                        placeholder="Street address"
                                        required
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* City */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    City
                                </label>
                                <CitySelector
                                    value={addressCity}
                                    onChange={setAddressCity}
                                    required
                                />
                            </div>

                            {/* Shop Name (for sellers) */}
                            {(profile.role === "seller" || profile.role === "admin") && (
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                        Shop Name
                                    </label>
                                    <div className="relative">
                                        <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                        <input
                                            type="text"
                                            value={shopName}
                                            onChange={(e) =>
                                                setShopName(e.target.value)
                                            }
                                            placeholder="Your shop name"
                                            className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={saving}
                            leftIcon={<Save className="h-4 w-4" />}
                        >
                            Save Changes
                        </Button>
                    </div>
                </motion.form>
            )}

            {/* ─── Security Tab ──────────────── */}
            {activeTab === "settings" && (
                <motion.form
                    key="settings"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleChangePassword}
                    className="space-y-6"
                >
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-200/60">
                        <h2 className="mb-1 text-sm font-bold text-secondary-900">
                            Change Password
                        </h2>
                        <p className="mb-4 text-xs text-secondary-500">
                            Update your password to keep your account secure
                        </p>
                        <div className="max-w-md space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type={
                                            showCurrentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        required
                                        placeholder="Enter current password"
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                !showCurrentPassword
                                            )
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        required
                                        minLength={8}
                                        placeholder="Min 8 characters"
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                        minLength={8}
                                        placeholder="Re-enter new password"
                                        className={cn(
                                            "h-11 w-full rounded-xl border bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:bg-white focus:outline-none focus:ring-2",
                                            confirmPassword &&
                                                confirmPassword !==
                                                newPassword
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-secondary-200 focus:border-primary-400 focus:ring-primary-100"
                                        )}
                                    />
                                </div>
                                {confirmPassword &&
                                    confirmPassword !== newPassword && (
                                        <p className="mt-1 text-xs text-red-500">
                                            Passwords don&apos;t match
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={saving}
                            leftIcon={<Lock className="h-4 w-4" />}
                            disabled={
                                !currentPassword ||
                                !newPassword ||
                                newPassword !== confirmPassword
                            }
                        >
                            Change Password
                        </Button>
                    </div>
                </motion.form>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
            }
        >
            <ProfileContent />
        </Suspense>
    );
}
