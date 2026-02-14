"use client";

import React, { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Fix Leaflet Default Icon (broken in webpack/Next.js) ── */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Types ──────────────────────────────── */
export interface MapMarker {
    lat: number;
    lng: number;
    title: string;
    id?: string;
}

interface MapInnerProps {
    center: [number, number];
    markers?: MapMarker[];
    zoom?: number;
    height?: string;
    onMarkerClick?: (marker: MapMarker) => void;
}

/* ═══════════════════════════════════════════
   Inner Map (the actual Leaflet map)
   ═══════════════════════════════════════════ */
export function MapInner({
    center,
    markers = [],
    zoom = 12,
    height = "300px",
    onMarkerClick,
}: MapInnerProps) {
    return (
        <div
            className="overflow-hidden rounded-2xl border border-secondary-200 shadow-sm"
            style={{ height }}
        >
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker, i) => (
                    <Marker
                        key={marker.id || `marker-${i}`}
                        position={[marker.lat, marker.lng]}
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker),
                        }}
                    >
                        <Popup>
                            <span className="text-sm font-medium">
                                {marker.title}
                            </span>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
