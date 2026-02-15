import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ListingDetails } from "@/components/listing/ListingDetails";
import { SimilarListings } from "@/components/listing/SimilarListings";
import type { ListingData } from "@/components/PhoneCard";

/* ─── Data Fetcher ───────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Transform raw backend response into the shape ListingDetails expects.
 * Maps field-name differences and normalises nested objects.
 */
function transformListing(raw: Record<string, unknown>): ListingData {
    const imgs: string[] = [];
    const additional = raw.additional_images as
        | { urls?: string[] }
        | null
        | undefined;
    if (additional?.urls) imgs.push(...additional.urls);
    else if (raw.thumbnail_image) imgs.push(raw.thumbnail_image as string);

    return {
        ...(raw as unknown as ListingData),
        images: imgs,
        camera_mp:
            (raw.camera_resolution_mp as number | null) ??
            (raw.camera_mp as number | null) ??
            null,
        processor:
            (raw.processor_name as string | null) ??
            (raw.processor as string | null) ??
            null,
        defects:
            (raw.defects_description as string | null) ??
            (raw.defects as string | null) ??
            null,
    };
}

async function getListing(id: string): Promise<ListingData | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/listings/${id}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const raw = await res.json();
        return transformListing(raw);
    } catch {
        return null;
    }
}

/* ─── Dynamic Metadata ───────────────────── */
type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        return {
            title: "Listing Not Found — Phonely",
        };
    }

    return {
        title: `${listing.brand} ${listing.model} — Phonely`,
        description: `Buy ${listing.brand} ${listing.model} (${listing.storage_gb}GB, ${listing.ram_gb}GB RAM) for PKR ${listing.price.toLocaleString("en-PK")} on Phonely. ${listing.pta_approved ? "PTA Approved. " : ""}${listing.location_city || ""}`,
    };
}

/* ─── Page Component ─────────────────────── */
export default async function ListingDetailPage({
    params,
}: PageProps) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f5f7fa]">
            <Navbar />

            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <ListingDetails listing={listing} />
                    <SimilarListings
                        brand={listing.brand}
                        currentId={listing.id}
                        phoneType={listing.phone_type}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
