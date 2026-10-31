"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Info } from "lucide-react";

export function AddisMap({
  latitude = 8.995,
  longitude = 38.789,
  zoom = 13,
  title = "Pickup Location",
  neighbourhood = "Bole",
  height = "320px",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Clean up previous instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        // Add OpenStreetMap Tile Layer
        const tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        );

        tileLayer.on("tileerror", () => {
          if (isMounted) setTileError(true);
        });

        tileLayer.addTo(map);

        // Custom Leaflet DivIcon for luxury styled marker
        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="background-color: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.5); border: 2px solid white; transform: translate(-50%, -50%);">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

        marker
          .bindPopup(
            `
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
              <strong style="display: block; font-size: 13px; color: #0284c7; margin-bottom: 2px;">${title}</strong>
              <span>Neighbourhood: <strong>${neighbourhood}</strong>, Addis Ababa</span>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Seeded Demo Coordinates: [${latitude}, ${longitude}]</div>
            </div>
          `
          )
          .openPopup();

        mapInstanceRef.current = map;
        if (isMounted) setMapLoaded(true);
      } catch (err) {
        console.warn("[Addis Wheels Map] Leaflet dynamic loading failed:", err);
        if (isMounted) setTileError(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, title, neighbourhood]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Map Header / Location Bar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs z-10 relative">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>
            {neighbourhood}, Addis Ababa{" "}
            <span className="text-slate-400 font-normal">
              ({latitude.toFixed(3)}, {longitude.toFixed(3)})
            </span>
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Seeded Coordinates
        </span>
      </div>

      {/* Leaflet Map Target */}
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="z-0 relative"
      />

      {/* Non-map Address / Fallback Panel */}
      {tileError && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
            <Navigation className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900">
            {neighbourhood} Pickup Location
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            Vehicle stationed in <strong>{neighbourhood}</strong>, Addis Ababa.
            Coordinates: [{latitude}, {longitude}]. Full address details provided
            upon confirmed booking.
          </p>
        </div>
      )}
    </div>
  );
}
