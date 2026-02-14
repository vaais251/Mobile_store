"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Smartphone,
    Phone,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    User,
    Shield,
    Store,
    MapPin,
    Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ─── Types ──────────────────────────────── */
type Tab = "login" | "register";
type Role = "buyer" | "seller";

export default function LoginPage() {
    const router = useRouter();

    const [tab, setTab] = useState<Tab>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ─── Login fields ───────────────────── */
    const [loginPhone, setLoginPhone] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    /* ─── Register fields ────────────────── */
    const [regName, setRegName] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regRole, setRegRole] = useState<Role>("buyer");
    const [regAddress, setRegAddress] = useState("");
    const [regCity, setRegCity] = useState("");

    /* ─── Login Handler ──────────────────── */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await api.post("/api/v1/auth/login", {
                phone: loginPhone,
                password: loginPassword,
            });

            const { access_token } = res.data;
            localStorage.setItem("access_token", access_token);

            router.push("/");
            // Force full reload so navbar picks up the new token
            window.location.href = "/";
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (typeof detail === "string") {
                setError(detail);
            } else if (Array.isArray(detail)) {
                setError(detail.map((e: any) => e.msg).join(", "));
            } else {
                setError("Invalid phone number or password");
            }
        } finally {
            setLoading(false);
        }
    };

    /* ─── Register Handler ───────────────── */
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Register
            await api.post("/api/v1/auth/register", {
                name: regName,
                phone: regPhone,
                password: regPassword,
                role: regRole,
                address_street: regAddress,
                address_city: regCity,
            });

            // Auto-login after register
            const res = await api.post("/api/v1/auth/login", {
                phone: regPhone,
                password: regPassword,
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
                setError("Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary-100 via-white to-primary-50 px-4">
            {/* Background blobs */}
            <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-primary-100/30 blur-3xl" />
            <div className="absolute -right-32 bottom-20 h-64 w-64 rounded-full bg-primary-50/40 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="mb-8 flex items-center justify-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-200">
                        <Smartphone className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-secondary-900">
                        Phone<span className="text-primary-500">ly</span>
                    </span>
                </div>

                {/* Card */}
                <div className="rounded-3xl bg-white p-8 shadow-premium-lg ring-1 ring-secondary-200/60">
                    {/* Tabs */}
                    <div className="mb-6 flex gap-1 rounded-xl bg-secondary-100 p-1">
                        {(["login", "register"] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setTab(t);
                                    setError(null);
                                }}
                                className={cn(
                                    "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                                    tab === t
                                        ? "bg-white text-primary-600 shadow-sm"
                                        : "text-secondary-500 hover:text-secondary-700"
                                )}
                            >
                                {t === "login" ? "Login" : "Register"}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 rounded-xl bg-accent-50 px-4 py-3 text-sm font-medium text-accent-600"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    {tab === "login" && (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            {/* Phone */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={loginPhone}
                                        onChange={(e) =>
                                            setLoginPhone(e.target.value)
                                        }
                                        placeholder="0300-1234567"
                                        required
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
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
                                        value={loginPassword}
                                        onChange={(e) =>
                                            setLoginPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter password"
                                        required
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3. top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                isLoading={loading}
                                leftIcon={<LogIn className="h-4 w-4" />}
                                className="w-full"
                            >
                                Login
                            </Button>
                        </motion.form>
                    )}

                    {/* Register Form */}
                    {tab === "register" && (
                        <motion.form
                            key="register"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleRegister}
                            className="space-y-4"
                        >
                            {/* Name */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={regName}
                                        onChange={(e) =>
                                            setRegName(e.target.value)
                                        }
                                        placeholder="John Doe"
                                        required
                                        minLength={2}
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={regPhone}
                                        onChange={(e) =>
                                            setRegPhone(e.target.value)
                                        }
                                        placeholder="0300-1234567"
                                        required
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
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
                                        value={regPassword}
                                        onChange={(e) =>
                                            setRegPassword(e.target.value)
                                        }
                                        placeholder="Min 8 characters"
                                        required
                                        minLength={8}
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
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

                            {/* Address */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={regAddress}
                                        onChange={(e) =>
                                            setRegAddress(e.target.value)
                                        }
                                        placeholder="Street address"
                                        required
                                        minLength={2}
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* City */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    City
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={regCity}
                                        onChange={(e) =>
                                            setRegCity(e.target.value)
                                        }
                                        placeholder="e.g. Lahore, Karachi"
                                        required
                                        minLength={2}
                                        className="h-11 w-full rounded-xl border border-secondary-200 bg-secondary-50 pl-10 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>
                            </div>

                            {/* Role Picker */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                                    I want to
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRegRole("buyer")}
                                        className={cn(
                                            "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                                            regRole === "buyer"
                                                ? "border-primary-500 bg-primary-50 text-primary-600"
                                                : "border-secondary-200 text-secondary-500 hover:border-secondary-300"
                                        )}
                                    >
                                        <User className="h-4 w-4" />
                                        Buy Phones
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRegRole("seller")
                                        }
                                        className={cn(
                                            "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                                            regRole === "seller"
                                                ? "border-primary-500 bg-primary-50 text-primary-600"
                                                : "border-secondary-200 text-secondary-500 hover:border-secondary-300"
                                        )}
                                    >
                                        <Store className="h-4 w-4" />
                                        Sell Phones
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                isLoading={loading}
                                leftIcon={
                                    <UserPlus className="h-4 w-4" />
                                }
                                className="w-full"
                            >
                                Create Account
                            </Button>
                        </motion.form>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-secondary-400">
                    By continuing, you agree to our Terms of Service.
                </p>
            </motion.div>
        </div>
    );
}
