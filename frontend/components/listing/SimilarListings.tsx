"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PhoneCard, type ListingData } from "@/components/PhoneCard";
import api from "@/lib/api";

/* ═══════════════════════════════════════════ */
interface SimilarListingsProps {
    brand: string;
    currentId: string;
    phoneType?: "new" | "used";
}

export function SimilarListings({
    brand,
    currentId,
    phoneType = "used",
}: SimilarListingsProps) {
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
                setListings(filtered);
            } catch {
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSimilar();
    }, [brand, currentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (listings.length === 0) return null;

    const heading =
        phoneType === "new"
            ? "Similar New Devices"
            : "Similar Listings Nearby";

    return (
        <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
                {heading}
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
