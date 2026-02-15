"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    Upload,
    ImagePlus,
    Check,
    Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitListing, type ListingFormData } from "@/lib/upload";

/* ─── Constants ──────────────────────────── */
const TOTAL_STEPS = 4;

const STEP_LABELS = ["Photos", "Identity", "Specs", "Condition"];

const BRANDS = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Google",
    "Huawei",
    "Realme",
    "Other",
];

const STORAGE_OPTIONS = ["32", "64", "128", "256", "512", "1024"];
const RAM_OPTIONS = ["2", "3", "4", "6", "8", "12", "16"];

const CONDITION_LABELS: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Fair",
    4: "Good",
    5: "Good",
    6: "Good",
    7: "Very Good",
    8: "Very Good",
    9: "Excellent",
    10: "Mint",
};

const ACCESSORY_OPTIONS = ["Original Box", "Charger", "Headphones"];

/* ─── Initial State ──────────────────────── */
const initialFormData: ListingFormData = {
    images: [],
    brand: "",
    model: "",
    price: "",
    condition: "used",
    batteryHealth: "",
    ptaApproved: false,
    isLocallyUsed: true,
    defects: "",
    warrantyPeriod: "",
    processor: "",
    storage: "",
    ram: "",
    color: "",
    physicalCondition: 7,
    accessories: [],
};

/* ─── Slide Variants ─────────────────────── */
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -80 : 80,
        opacity: 0,
    }),
};

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export function ListingWizard() {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [formData, setFormData] = useState<ListingFormData>(initialFormData);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const additionalInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    /* ─── Helpers ─────────────────────────── */
    const updateField = <K extends keyof ListingFormData>(
        key: K,
        value: ListingFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const addImage = useCallback(
        (file: File, index?: number) => {
            const url = URL.createObjectURL(file);

            setFormData((prev) => {
                const images = [...prev.images];
                if (index !== undefined) {
                    images[index] = file;
                } else {
                    images.push(file);
                }
                return { ...prev, images };
            });

            setImagePreviews((prev) => {
                const previews = [...prev];
                if (index !== undefined) {
                    // Revoke old URL
                    if (previews[index]) URL.revokeObjectURL(previews[index]);
                    previews[index] = url;
                } else {
                    previews.push(url);
                }
                return previews;
            });
        },
        []
    );

    const removeImage = useCallback((index: number) => {
        setFormData((prev) => {
            const images = [...prev.images];
            images.splice(index, 1);
            return { ...prev, images };
        });
        setImagePreviews((prev) => {
            const previews = [...prev];
            if (previews[index]) URL.revokeObjectURL(previews[index]);
            previews.splice(index, 1);
            return previews;
        });
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, index?: number) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) {
                addImage(file, index);
            }
        },
        [addImage]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
            const file = e.target.files?.[0];
            if (file) addImage(file, index);
            e.target.value = "";
        },
        [addImage]
    );

    /* ─── Navigation ─────────────────────── */
    const goNext = () => {
        if (step < TOTAL_STEPS) {
            setDirection(1);
            setStep((s) => s + 1);
        }
    };

    const goBack = () => {
        if (step > 1) {
            setDirection(-1);
            setStep((s) => s - 1);
        }
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 1:
                return formData.images.length >= 1;
            case 2:
                return !!(formData.brand && formData.model && formData.price);
            case 3:
                return !!(formData.storage && formData.ram);
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            await submitListing(formData);
            setSubmitSuccess(true);
        } catch (error) {
            console.error("Failed to publish listing:", error);
            // TODO: show toast notification
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ─── Toggle Accessory ───────────────── */
    const toggleAccessory = (item: string) => {
        setFormData((prev) => {
            const accessories = prev.accessories.includes(item)
                ? prev.accessories.filter((a) => a !== item)
                : [...prev.accessories, item];
            return { ...prev, accessories };
        });
    };

    /* ═══════════════════════════════════════
       Step Renderers
       ═══════════════════════════════════════ */

    /* ─── Step 1: Photos ─────────────────── */
    const renderPhotos = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900">
                    Upload Photos
                </h2>
                <p className="mt-1 text-sm text-secondary-600">
                    Add up to 5 photos. The first will be your cover image.
                </p>
            </div>

            {/* Cover Image */}
            <div
                className={cn(
                    "group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
                    imagePreviews[0]
                        ? "border-primary-300 bg-primary-50/30"
                        : "border-secondary-300 bg-secondary-100/50 hover:border-primary-400 hover:bg-primary-50/20"
                )}
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 0)}
            >
                {imagePreviews[0] ? (
                    <>
                        <img
                            src={imagePreviews[0]}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeImage(0);
                            }}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            Cover Photo
                        </span>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-500">
                            <Camera className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="font-semibold text-secondary-800">
                                Add Cover Photo
                            </p>
                            <p className="mt-0.5 text-xs text-secondary-500">
                                Drag & drop or click to browse
                            </p>
                        </div>
                    </div>
                )}
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 0)}
                />
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
                            imagePreviews[i]
                                ? "border-primary-300 bg-primary-50/30"
                                : "border-secondary-300 bg-secondary-100/50 hover:border-primary-400 hover:bg-primary-50/20"
                        )}
                        onClick={() =>
                            additionalInputRefs.current[i]?.click()
                        }
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, i)}
                    >
                        {imagePreviews[i] ? (
                            <>
                                <img
                                    src={imagePreviews[i]}
                                    alt={`Photo ${i + 1}`}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(i);
                                    }}
                                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <ImagePlus className="h-5 w-5 text-secondary-400" />
                                <span className="text-[10px] font-medium text-secondary-400">
                                    Photo {i + 1}
                                </span>
                            </div>
                        )}
                        <input
                            ref={(el) => {
                                additionalInputRefs.current[i] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, i)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    /* ─── Step 2: Identity ───────────────── */
    const renderIdentity = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900">
                    Phone Details
                </h2>
                <p className="mt-1 text-sm text-secondary-600">
                    Tell buyers what you&apos;re selling.
                </p>
            </div>

            {/* Brand */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-800">
                    Brand <span className="text-accent-500">*</span>
                </label>
                <div className="relative">
                    <select
                        value={formData.brand}
                        onChange={(e) => updateField("brand", e.target.value)}
                        className="h-12 w-full appearance-none rounded-xl border border-secondary-300 bg-white px-4 pr-10 text-sm text-secondary-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="">Select a brand</option>
                        {BRANDS.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-secondary-400" />
                </div>
            </div>

            {/* Model */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-800">
                    Model Name <span className="text-accent-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => updateField("model", e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="h-12 w-full rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
            </div>

            {/* Price */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-800">
                    Price <span className="text-accent-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary-500">
                        PKR
                    </span>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField("price", e.target.value)}
                        placeholder="0"
                        className="h-12 w-full rounded-xl border border-secondary-300 bg-white pl-14 pr-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                </div>
            </div>
        </div>
    );

    /* ─── Step 3: Specs ──────────────────── */
    const renderSpecs = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900">
                    Specifications
                </h2>
                <p className="mt-1 text-sm text-secondary-600">
                    Help buyers know exactly what they&apos;re getting.
                </p>
            </div>

            {/* Condition Toggle */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-800">
                    Condition
                </label>
                <div className="flex gap-2">
                    {(["new", "used"] as const).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => updateField("condition", c)}
                            className={cn(
                                "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                                formData.condition === c
                                    ? "bg-primary-500 text-white shadow-sm"
                                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                            )}
                        >
                            {c === "new" ? "✨ Brand New" : "📱 Used"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conditional: Used */}
            <AnimatePresence mode="wait">
                {formData.condition === "used" ? (
                    <motion.div
                        key="used-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 overflow-hidden"
                    >
                        {/* Battery Health */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-800">
                                Battery Health %
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={formData.batteryHealth}
                                onChange={(e) =>
                                    updateField(
                                        "batteryHealth",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. 87"
                                className="h-12 w-full rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        {/* PTA Approved Toggle */}
                        <div className="flex items-center justify-between rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-secondary-800">
                                    PTA Approved
                                </p>
                                <p className="text-xs text-secondary-500">
                                    Device is registered with PTA
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    updateField(
                                        "ptaApproved",
                                        !formData.ptaApproved
                                    )
                                }
                                className={cn(
                                    "relative h-7 w-12 rounded-full transition-colors duration-200",
                                    formData.ptaApproved
                                        ? "bg-primary-500"
                                        : "bg-secondary-300"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200",
                                        formData.ptaApproved &&
                                        "translate-x-5"
                                    )}
                                />
                            </button>
                        </div>

                        {/* Locally Used Toggle */}
                        <div className="flex items-center justify-between rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-secondary-800">
                                    Locally Used
                                </p>
                                <p className="text-xs text-secondary-500">
                                    Phone was used in Pakistan
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    updateField(
                                        "isLocallyUsed",
                                        !formData.isLocallyUsed
                                    )
                                }
                                className={cn(
                                    "relative h-7 w-12 rounded-full transition-colors duration-200",
                                    formData.isLocallyUsed
                                        ? "bg-primary-500"
                                        : "bg-secondary-300"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200",
                                        formData.isLocallyUsed &&
                                        "translate-x-5"
                                    )}
                                />
                            </button>
                        </div>

                        {/* Defects */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-800">
                                Known Defects
                            </label>
                            <textarea
                                value={formData.defects}
                                onChange={(e) =>
                                    updateField("defects", e.target.value)
                                }
                                placeholder="Describe any scratches, dents, or issues..."
                                rows={3}
                                className="w-full rounded-xl border border-secondary-300 bg-white px-4 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="new-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 overflow-hidden"
                    >
                        {/* Warranty Period */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-800">
                                Warranty Period
                            </label>
                            <input
                                type="text"
                                value={formData.warrantyPeriod}
                                onChange={(e) =>
                                    updateField(
                                        "warrantyPeriod",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. 12 months"
                                className="h-12 w-full rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </div>

                        {/* Processor */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-800">
                                Processor
                            </label>
                            <input
                                type="text"
                                value={formData.processor}
                                onChange={(e) =>
                                    updateField("processor", e.target.value)
                                }
                                placeholder="e.g. A17 Pro, Snapdragon 8 Gen 3"
                                className="h-12 w-full rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
                {/* Storage */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-800">
                        Storage (GB) <span className="text-accent-500">*</span>
                    </label>
                    <select
                        value={formData.storage}
                        onChange={(e) =>
                            updateField("storage", e.target.value)
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="">Select</option>
                        {STORAGE_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {parseInt(s) >= 1024
                                    ? `${parseInt(s) / 1024} TB`
                                    : `${s} GB`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* RAM */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-800">
                        RAM (GB) <span className="text-accent-500">*</span>
                    </label>
                    <select
                        value={formData.ram}
                        onChange={(e) =>
                            updateField("ram", e.target.value)
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="">Select</option>
                        {RAM_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                                {r} GB
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-800">
                    Color
                </label>
                <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    placeholder="e.g. Midnight Black, Sierra Blue"
                    className="h-12 w-full rounded-xl border border-secondary-300 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
            </div>
        </div>
    );

    /* ─── Step 4: Condition & Accessories ── */
    const renderCondition = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900">
                    Condition & Accessories
                </h2>
                <p className="mt-1 text-sm text-secondary-600">
                    Rate the physical condition and included accessories.
                </p>
            </div>

            {/* Physical Condition Slider */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-secondary-800">
                        Physical Condition
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary-500">
                            {formData.physicalCondition}
                        </span>
                        <span className="text-xs font-medium text-secondary-500">
                            / 10
                        </span>
                    </div>
                </div>

                {/* Slider */}
                <div className="relative px-1">
                    <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={formData.physicalCondition}
                        onChange={(e) =>
                            updateField(
                                "physicalCondition",
                                parseInt(e.target.value)
                            )
                        }
                        className="slider-primary w-full cursor-pointer"
                    />
                    <div className="mt-2 flex justify-between px-0.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <span
                                key={n}
                                className={cn(
                                    "text-[10px] font-medium transition-colors",
                                    n === formData.physicalCondition
                                        ? "text-primary-500"
                                        : "text-secondary-400"
                                )}
                            >
                                {n}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Condition Label */}
                <div
                    className={cn(
                        "rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                        formData.physicalCondition >= 9
                            ? "bg-success-50 text-success-700"
                            : formData.physicalCondition >= 6
                                ? "bg-primary-50 text-primary-600"
                                : formData.physicalCondition >= 4
                                    ? "bg-warning-50 text-warning-700"
                                    : "bg-accent-50 text-accent-600"
                    )}
                >
                    {CONDITION_LABELS[formData.physicalCondition]}
                </div>
            </div>

            {/* Accessories Checkboxes */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-secondary-800">
                    Included Accessories
                </label>
                <div className="space-y-2">
                    {ACCESSORY_OPTIONS.map((item) => {
                        const isChecked =
                            formData.accessories.includes(item);
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => toggleAccessory(item)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                                    isChecked
                                        ? "border-primary-300 bg-primary-50/50 shadow-sm"
                                        : "border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                                        isChecked
                                            ? "border-primary-500 bg-primary-500"
                                            : "border-secondary-300"
                                    )}
                                >
                                    {isChecked && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        isChecked
                                            ? "text-secondary-900"
                                            : "text-secondary-600"
                                    )}
                                >
                                    {item}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    /* ─── Success Screen ─────────────────── */
    if (submitSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                    }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-50"
                >
                    <Check className="h-10 w-10 text-success-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-secondary-900">
                    Listing Published!
                </h2>
                <p className="mt-2 text-secondary-600">
                    Your phone has been listed. Buyers can now view it.
                </p>
                <Button
                    size="lg"
                    className="mt-8"
                    onClick={() => {
                        setFormData(initialFormData);
                        setImagePreviews([]);
                        setStep(1);
                        setSubmitSuccess(false);
                    }}
                >
                    List Another Phone
                </Button>
            </div>
        );
    }

    /* ═══════════════════════════════════════
       Main Render
       ═══════════════════════════════════════ */
    return (
        <div className="mx-auto max-w-lg">
            {/* ─── Progress Bar ────────────── */}
            <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-secondary-900">
                        Step {step} of {TOTAL_STEPS}
                    </span>
                    <span className="text-xs font-medium text-secondary-500">
                        {STEP_LABELS[step - 1]}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                i < step
                                    ? "bg-primary-500"
                                    : "bg-secondary-200"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* ─── Step Content ─────────────── */}
            <div className="relative min-h-[400px] overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        {step === 1 && renderPhotos()}
                        {step === 2 && renderIdentity()}
                        {step === 3 && renderSpecs()}
                        {step === 4 && renderCondition()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ─── Navigation Buttons ──────── */}
            <div className="mt-8 flex items-center gap-3">
                {step > 1 && (
                    <Button
                        variant="ghost"
                        size="lg"
                        leftIcon={<ChevronLeft className="h-4 w-4" />}
                        onClick={goBack}
                        className="flex-1"
                    >
                        Back
                    </Button>
                )}

                {step < TOTAL_STEPS ? (
                    <Button
                        size="lg"
                        rightIcon={<ChevronRight className="h-4 w-4" />}
                        onClick={goNext}
                        disabled={!canProceed()}
                        className="flex-1"
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        leftIcon={<Upload className="h-4 w-4" />}
                        onClick={handlePublish}
                        isLoading={isSubmitting}
                        className="flex-1"
                    >
                        Publish Listing
                    </Button>
                )}
            </div>
        </div>
    );
}
