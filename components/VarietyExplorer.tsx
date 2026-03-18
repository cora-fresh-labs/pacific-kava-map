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
  classification: string;
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
      classification: varietyDetails[v]?.classification || "noble",
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
    <div className="h-full flex">
      {/* Filters — left column */}
      <div className="w-52 shrink-0 p-3 border-r border-gray-800/40 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-300 mb-1">Filters</div>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value as FilterGrade)}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
        >
          <option value="all">All Grades</option>
          <option value="noble">Noble</option>
          <option value="mixed">Mixed</option>
        </select>
        <select
          value={filterFlavor}
          onChange={(e) => setFilterFlavor(e.target.value as FilterFlavor)}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
        >
          <option value="all">All Flavors</option>
          <option value="earthy">Earthy</option>
          <option value="peppery">Peppery</option>
          <option value="sweet">Sweet</option>
        </select>
        <div className="text-xs text-gray-500 pt-1">{filtered.length} varieties</div>
      </div>

      {/* Cards — horizontal scroll */}
      <div className="flex-1 overflow-x-auto p-3">
        <div className="flex gap-3 h-full">
          {filtered.map((variety, i) => (
            <div
              key={`${variety.name}-${i}`}
              className="bg-gray-800/80 border border-gray-700/60 hover:border-teal-700 rounded-lg p-3 transition-all w-56 shrink-0 flex flex-col"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <span className="text-white font-medium text-sm">{variety.name}</span>
                  {variety.isTop && <span className="ml-1.5 text-xs text-teal-400">&#9733;</span>}
                </div>
                <div className="flex gap-1">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      variety.classification === "noble"
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-amber-900/50 text-amber-300"
                    }`}
                  >
                    {variety.classification}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      variety.flavor === "earthy"
                        ? "bg-amber-900/40 text-amber-300"
                        : variety.flavor === "peppery"
                        ? "bg-red-900/40 text-red-300"
                        : "bg-green-900/40 text-green-300"
                    }`}
                  >
                    {variety.flavor}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-teal-400 mb-1.5">{variety.country}</div>
              <div className="text-xs text-gray-400 leading-relaxed flex-1">{variety.effects}</div>
              <div className="text-[10px] text-gray-500 mt-2 pt-1.5 border-t border-gray-700/40">
                Export: {variety.exportStatus}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
