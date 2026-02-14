import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ListingDetailLoading() {
    return (
        <div className="flex min-h-screen flex-col bg-secondary-200">
            <Navbar />

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Back button skeleton */}
                    <div className="mb-6 h-5 w-32 animate-pulse rounded-md bg-secondary-300/60" />

                    {/* Two-column grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                        {/* LEFT: Gallery Skeleton */}
                        <div className="lg:col-span-3">
                            <div className="overflow-hidden rounded-2xl bg-white premium-shadow">
                                {/* Main image */}
                                <div className="aspect-[4/3] animate-pulse bg-secondary-200" />
                                {/* Thumbnails */}
                                <div className="flex gap-2 p-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="aspect-square w-16 animate-pulse rounded-lg bg-secondary-200 sm:w-20"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Description skeleton */}
                            <div className="mt-6 rounded-2xl bg-white p-6 premium-shadow">
                                <div className="mb-4 h-5 w-28 animate-pulse rounded bg-secondary-200" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full animate-pulse rounded bg-secondary-200" />
                                    <div className="h-3 w-5/6 animate-pulse rounded bg-secondary-200" />
                                    <div className="h-3 w-4/6 animate-pulse rounded bg-secondary-200" />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Info Panel Skeleton */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Header card */}
                            <div className="rounded-2xl bg-white p-6 premium-shadow">
                                <div className="mb-3 flex gap-2">
                                    <div className="h-6 w-20 animate-pulse rounded-lg bg-secondary-200" />
                                    <div className="h-6 w-24 animate-pulse rounded-lg bg-secondary-200" />
                                </div>
                                <div className="mb-2 h-7 w-3/4 animate-pulse rounded bg-secondary-200" />
                                <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-secondary-200" />
                                <div className="h-9 w-40 animate-pulse rounded bg-secondary-200" />
                            </div>

                            {/* Specs grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 premium-shadow"
                                    >
                                        <div className="h-10 w-10 animate-pulse rounded-xl bg-secondary-200" />
                                        <div className="h-5 w-10 animate-pulse rounded bg-secondary-200" />
                                        <div className="h-3 w-12 animate-pulse rounded bg-secondary-200" />
                                    </div>
                                ))}
                            </div>

                            {/* Button skeleton */}
                            <div className="h-14 w-full animate-pulse rounded-2xl bg-secondary-300" />

                            {/* Seller card skeleton */}
                            <div className="rounded-2xl bg-white p-5 premium-shadow">
                                <div className="mb-3 h-4 w-32 animate-pulse rounded bg-secondary-200" />
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 animate-pulse rounded-full bg-secondary-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-28 animate-pulse rounded bg-secondary-200" />
                                        <div className="h-3 w-20 animate-pulse rounded bg-secondary-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Location skeleton */}
                            <div className="overflow-hidden rounded-2xl bg-white premium-shadow">
                                <div className="h-36 animate-pulse bg-secondary-200" />
                                <div className="p-4">
                                    <div className="h-4 w-40 animate-pulse rounded bg-secondary-200" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Similar listings skeleton */}
                    <div className="mt-12">
                        <div className="mb-6 h-6 w-36 animate-pulse rounded bg-secondary-200" />
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="overflow-hidden rounded-2xl bg-white premium-shadow"
                                >
                                    <div className="aspect-[4/3] animate-pulse bg-secondary-200" />
                                    <div className="space-y-2 p-4">
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary-200" />
                                        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary-200" />
                                        <div className="h-5 w-1/3 animate-pulse rounded bg-secondary-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
