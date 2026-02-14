import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ListingWizard } from "@/components/listing/ListingWizard";

export const metadata: Metadata = {
    title: "List Your Phone — PhoneMarket",
    description:
        "Sell your phone on PhoneMarket. Upload photos, set your price, and reach verified buyers across Pakistan.",
};

export default function SellPage() {
    return (
        <RequireAuth>
            <div className="flex min-h-screen flex-col bg-secondary-200">
                <Navbar />

                {/* ─── Page Content ─────────────── */}
                <main className="flex-1 px-4 py-8 sm:px-6 lg:py-12">
                    <div className="mx-auto max-w-2xl">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
                                List Your Phone
                            </h1>
                            <p className="mt-2 text-secondary-600">
                                Create a listing in minutes and start receiving
                                offers.
                            </p>
                        </div>

                        {/* Wizard Card */}
                        <div className="rounded-3xl border border-secondary-300/60 bg-white p-6 shadow-premium sm:p-8">
                            <ListingWizard />
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </RequireAuth>
    );
}
