"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { MapMarker } from "./MapInner";

/* ─── SSR-safe dynamic import ────────────── */
const MapInner = dynamic(
    () => import("./MapInner").then((mod) => mod.MapInner),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center rounded-2xl border border-secondary-200 bg-secondary-100"
                style={{ height: "300px" }}>
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        ),
    }
);

/* ─── Wrapper ────────────────────────────── */
interface MapProps {
    center: [number, number];
    markers?: MapMarker[];
    zoom?: number;
    height?: string;
    onMarkerClick?: (marker: MapMarker) => void;
}

export function Map(props: MapProps) {
    return <MapInner {...props} />;
}

export type { MapMarker };
