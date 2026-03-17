"use client";

import { useState } from "react";
import { kavaCountries, varietyDetails } from "@/lib/kavaData";

type FilterCountry = "all" | string;
type FilterGrade = "all" | "noble" | "mixed";
type FilterFlavor = "all" | "earthy" | "peppery" | "sweet";

interface VarietyItem {
  name: string;
  country: string;
  qualityGrade: string;
  effects: string;
  flavor: string;
  exportStatus: string;
  isTop: boolean;
}

export default function VarietyExplorer() {
  const [filterCountry, setFilterCountry] = useState<FilterCountry>("all");
  const [filterGrade, setFilterGrade] = useState<FilterGrade>("all");
  const [filterFlavor, setFilterFlavor] = useState<FilterFlavor>("all");

  const allVarieties: VarietyItem[] = kavaCountries.flatMap((country) =>
    country.varieties.map((v) => ({
      name: v,
      country: country.name,
      qualityGrade: country.qualityGrade,
      effects: varietyDetails[v]?.effects || "Traditional variety",
      flavor: varietyDetails[v]?.flavor || "earthy",
      exportStatus: varietyDetails[v]?.exportStatus || "Local",
      isTop: v === country.topVariety,
    }))
  );

  const filtered = allVarieties.filter((v) => {
    if (filterCountry !== "all" && v.country !== filterCountry) return false;
    if (filterGrade === "noble" && !v.qualityGrade.toLowerCase().includes("noble")) return false;
    if (filterGrade === "mixed" && !v.qualityGrade.toLowerCase().includes("mixed")) return false;
    if (filterFlavor !== "all" && v.flavor !== filterFlavor) return false;
    return true;
  });

  const countries = Array.from(new Set(kavaCountries.map((c) => c.name)));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-teal-900">
        <h2 className="text-lg font-bold text-white mb-3">Variety Explorer</h2>
        <div className="space-y-2">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value as FilterGrade)}
              className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Grades</option>
              <option value="noble">Noble</option>
              <option value="mixed">Mixed</option>
            </select>
            <select
              value={filterFlavor}
              onChange={(e) => setFilterFlavor(e.target.value as FilterFlavor)}
              className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Flavors</option>
              <option value="earthy">Earthy</option>
              <option value="peppery">Peppery</option>
              <option value="sweet">Sweet</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">{filtered.length} varieties</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((variety, i) => (
          <div
            key={`${variety.name}-${i}`}
            className="bg-gray-800 border border-gray-700 hover:border-teal-700 rounded-lg p-3 transition-all"
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="text-white font-medium text-sm">{variety.name}</span>
                {variety.isTop && (
                  <span className="ml-2 text-xs text-teal-400">★</span>
                )}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  variety.flavor === "earthy"
                    ? "bg-amber-900/50 text-amber-300"
                    : variety.flavor === "peppery"
                    ? "bg-red-900/50 text-red-300"
                    : "bg-green-900/50 text-green-300"
                }`}
              >
                {variety.flavor}
              </span>
            </div>
            <div className="text-xs text-teal-400 mb-1">{variety.country}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{variety.effects}</div>
            <div className="text-xs text-gray-500 mt-1">Export: {variety.exportStatus}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
