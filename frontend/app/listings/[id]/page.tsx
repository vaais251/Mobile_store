import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ListingDetails } from "@/components/listing/ListingDetails";
import { SimilarListings } from "@/components/listing/SimilarListings";
import type { ListingData } from "@/components/PhoneCard";

/* ─── Mock Data (fallback when backend is unreachable) ── */
const MOCK_LISTING: ListingData = {
    id: "1",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    price: 420000,
    phone_type: "used",
    ram_gb: 8,
    storage_gb: 256,
    thumbnail_image: null,
    images: [],
    location_city: "Lahore",
    location_address: "Johar Town, Lahore, Punjab",
    location_lat: 31.4697,
    location_long: 74.2728,
    distance_km: 2.4,
    condition_rating: 9,
    pta_approved: true,
    battery_health_percent: 92,
    camera_mp: 48,
    color: "Natural Titanium",
    seller_name: "Ali Hassan",
    seller_rating: 4.8,
    seller_verified: true,
    status: "available",
    description:
        "iPhone 15 Pro Max in excellent condition. Used for only 6 months with the original charger and box included. No scratches or dents. Battery health is at 92%. PTA approved and ready to transfer. Genuine Apple warranty card available.\n\nHighlights:\n• A17 Pro chip, the fastest ever in a smartphone\n• 48MP main camera with 5x optical zoom\n• Titanium design, incredibly lightweight\n• USB-C with USB 3 speeds\n• Action Button for quick access",
    processor: "A17 Pro",
    defects: null,
    warranty_period: null,
};

/* ─── Data Fetcher ───────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function getListing(id: string): Promise<ListingData | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/listings/${id}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        // Backend not reachable — return mock if id matches
        if (id === "1" || id === MOCK_LISTING.id) return MOCK_LISTING;
        // Return the mock for any ID so the page can render during dev
        return { ...MOCK_LISTING, id };
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
            title: "Listing Not Found — PhoneMarket",
        };
    }

    return {
        title: `${listing.brand} ${listing.model} — PhoneMarket`,
        description: `Buy ${listing.brand} ${listing.model} (${listing.storage_gb}GB, ${listing.ram_gb}GB RAM) for PKR ${listing.price.toLocaleString("en-PK")} on PhoneMarket. ${listing.pta_approved ? "PTA Approved. " : ""}${listing.location_city || ""}`,
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
        <div className="flex min-h-screen flex-col bg-secondary-200">
            <Navbar />

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <ListingDetails listing={listing} />
                    <SimilarListings
                        brand={listing.brand}
                        currentId={listing.id}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
