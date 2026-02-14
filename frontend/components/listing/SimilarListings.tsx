"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import api from "@/lib/api";

/* ─── Mock Fallback ──────────────────────── */
const MOCK_SIMILAR: ListingData[] = [
    {
        id: "s1",
        brand: "Apple",
        model: "iPhone 14 Pro",
        price: 310000,
        phone_type: "used",
        ram_gb: 6,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Lahore",
        condition_rating: 8,
        pta_approved: true,
    },
    {
        id: "s2",
        brand: "Samsung",
        model: "Galaxy S23 Ultra",
        price: 245000,
        phone_type: "used",
        ram_gb: 12,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Karachi",
        condition_rating: 7,
        pta_approved: true,
    },
    {
        id: "s3",
        brand: "Apple",
        model: "iPhone 15",
        price: 275000,
        phone_type: "new",
        ram_gb: 6,
        storage_gb: 128,
        thumbnail_image: null,
        location_city: "Islamabad",
        condition_rating: null,
        pta_approved: null,
    },
    {
        id: "s4",
        brand: "Samsung",
        model: "Galaxy Z Flip 5",
        price: 195000,
        phone_type: "used",
        ram_gb: 8,
        storage_gb: 256,
        thumbnail_image: null,
        location_city: "Rawalpindi",
        condition_rating: 9,
        pta_approved: true,
    },
];

/* ═══════════════════════════════════════════ */
interface SimilarListingsProps {
    brand: string;
    currentId: string;
}

export function SimilarListings({ brand, currentId }: SimilarListingsProps) {
    const [listings, setListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const res = await api.get("/api/v1/listings/", {
                    params: { brand },
                });
                const items: ListingData[] = res.data?.items || res.data || [];
                const filtered = items
                    .filter((l) => l.id !== currentId)
                    .slice(0, 4);
                if (filtered.length > 0) {
                    setListings(filtered);
                } else {
                    setListings(
                        MOCK_SIMILAR.filter((l) => l.brand === brand).slice(
                            0,
                            4
                        )
                    );
                }
            } catch {
                // Fallback to mock data
                setListings(
                    MOCK_SIMILAR.filter((l) => l.brand === brand).length > 0
                        ? MOCK_SIMILAR.filter((l) => l.brand === brand).slice(
                            0,
                            4
                        )
                        : MOCK_SIMILAR.slice(0, 4)
                );
            } finally {
                setLoading(false);
            }
        };
        fetchSimilar();
    }, [brand, currentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        );
    }

    if (listings.length === 0) return null;

    return (
        <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-secondary-900">
                Similar Phones
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {listings.map((listing, i) => (
                    <a key={listing.id} href={`/listings/${listing.id}`}>
                        <PhoneCard listing={listing} index={i} />
                    </a>
                ))}
            </div>
        </section>
    );
}
