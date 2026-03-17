"use client";

import { useEffect, useRef } from "react";
import { kavaCountries, KavaCountry } from "@/lib/kavaData";

interface KavaMapProps {
  onCountrySelect: (country: KavaCountry | null) => void;
  selectedCountry?: KavaCountry | null;
}

export default function KavaMap({ onCountrySelect }: KavaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapRef.current) return;

      // Pacific-centered map
      const map = L.map(mapRef.current, {
        center: [-15, 170],
        zoom: 4,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Dark ocean tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Add attribution manually
      L.control.attribution({ position: "bottomleft" }).addTo(map);

      // Add markers for each country
      kavaCountries.forEach((country) => {
        const radius = Math.max(8, Math.min(30, country.productionTonnes / 80));
        const isNoble = country.qualityGrade.toLowerCase().includes("noble");
        const color = isNoble ? "#52B788" : "#F59E0B";

        const marker = L.circleMarker([country.lat, country.lng], {
          radius,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map);

        // Country label
        const label = L.divIcon({
          className: "",
          html: `<div style="color: #e2e8f0; font-size: 11px; font-weight: 600; white-space: nowrap; text-shadow: 0 1px 3px rgba(0,0,0,0.8); margin-top: ${radius + 4}px; margin-left: -40px; text-align: center; width: 80px;">${country.name}</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 0],
        });
        L.marker([country.lat, country.lng], { icon: label, interactive: false }).addTo(map);

        marker.on("click", () => {
          onCountrySelect(country);
        });

        marker.on("mouseover", () => {
          marker.setStyle({ fillOpacity: 1, weight: 3 });
        });

        marker.on("mouseout", () => {
          marker.setStyle({ fillOpacity: 0.85, weight: 2 });
        });

        markersRef.current.push(marker);
      });

      // Click on map background deselects
      map.on("click", (e) => {
        const target = e.originalEvent.target as HTMLElement;
        if (target.tagName === "path" || target.tagName === "canvas") return;
        onCountrySelect(null);
      });
    };

    initMap();
  }, [onCountrySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-8 right-4 bg-gray-900/90 backdrop-blur border border-teal-900 rounded-lg p-3 z-[1000] text-xs">
        <div className="text-teal-400 font-semibold mb-2">Quality Grade</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-300">Noble</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-300">Mixed</span>
        </div>
        <div className="text-teal-400 font-semibold mb-1">Marker Size</div>
        <div className="text-gray-400">= Production volume</div>
      </div>
    </div>
  );
}
