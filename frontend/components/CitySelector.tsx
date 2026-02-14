"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check, Search, X } from "lucide-react";
import { PAKISTANI_CITIES, ALL_CITIES } from "@/lib/pakistani-cities";
import { cn } from "@/lib/utils";

interface CitySelectorProps {
    value: string;
    onChange: (city: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export function CitySelector({
    value,
    onChange,
    placeholder = "Select your city",
    required = false,
    className,
}: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Focus search when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const filteredCities = search.trim()
        ? ALL_CITIES.filter((c) =>
            c.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const groupedResults = search.trim()
        ? PAKISTANI_CITIES.map((group) => ({
            ...group,
            cities: group.cities.filter((c) =>
                c.toLowerCase().includes(search.toLowerCase())
            ),
        })).filter((g) => g.cities.length > 0)
        : PAKISTANI_CITIES;

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-11 w-full items-center gap-2 rounded-xl border bg-secondary-50 px-3.5 text-sm transition-all",
                    isOpen
                        ? "border-primary-400 bg-white ring-2 ring-primary-100"
                        : "border-secondary-200 hover:border-secondary-300",
                    !value && "text-secondary-400"
                )}
            >
                <MapPin className="h-4 w-4 shrink-0 text-secondary-400" />
                <span className="flex-1 truncate text-left">
                    {value || placeholder}
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-secondary-400 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Hidden input for form required validation */}
            {required && (
                <input
                    type="text"
                    value={value}
                    required
                    onChange={() => { }}
                    className="absolute opacity-0 h-0 w-0"
                    tabIndex={-1}
                />
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-lg">
                    {/* Search bar */}
                    <div className="flex items-center gap-2 border-b border-secondary-100 px-3 py-2">
                        <Search className="h-4 w-4 shrink-0 text-secondary-400" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search city..."
                            className="flex-1 bg-transparent text-sm text-secondary-900 placeholder:text-secondary-400 outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="text-secondary-400 hover:text-secondary-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* City list */}
                    <div className="max-h-56 overflow-y-auto scrollbar-thin py-1">
                        {groupedResults.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-secondary-400">
                                No cities found for &quot;{search}&quot;
                            </div>
                        ) : (
                            groupedResults.map((group) => (
                                <div key={group.province}>
                                    <div className="sticky top-0 bg-secondary-50 px-3 py-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">
                                            {group.province}
                                        </span>
                                    </div>
                                    {group.cities.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            onClick={() => {
                                                onChange(city);
                                                setIsOpen(false);
                                                setSearch("");
                                            }}
                                            className={cn(
                                                "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
                                                value === city
                                                    ? "bg-primary-50 text-primary-700 font-medium"
                                                    : "text-secondary-700 hover:bg-secondary-50"
                                            )}
                                        >
                                            <span className="flex-1 text-left">
                                                {city}
                                            </span>
                                            {value === city && (
                                                <Check className="h-4 w-4 text-primary-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
