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
    <div className="h-full flex text-tactical-green font-mono uppercase tracking-widest">
      {/* Filters — left column */}
      <div className="w-52 shrink-0 p-3 border-r border-tactical-green-dim space-y-2 overflow-y-auto bg-[#000a00]">
        <div className="text-[10px] font-bold text-tactical-green-dim mb-2 border-b border-tactical-green-dim pb-1">FILTER_PARAMS</div>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="w-full bg-[#001100] text-tactical-green border border-tactical-green-dim px-2 py-1.5 text-[10px] focus:border-tactical-cyan focus:outline-none uppercase"
        >
          <option value="all">[ ALL_REGIONS ]</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              [ {c.substring(0,12)} ]
            </option>
          ))}
        </select>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value as FilterGrade)}
          className="w-full bg-[#001100] text-tactical-green border border-tactical-green-dim px-2 py-1.5 text-[10px] focus:border-tactical-cyan focus:outline-none uppercase"
        >
          <option value="all">[ ALL_GRADES ]</option>
          <option value="noble">[ SECURE: NOBLE ]</option>
          <option value="mixed">[ WARN: MIXED ]</option>
        </select>
        <select
          value={filterFlavor}
          onChange={(e) => setFilterFlavor(e.target.value as FilterFlavor)}
          className="w-full bg-[#001100] text-tactical-green border border-tactical-green-dim px-2 py-1.5 text-[10px] focus:border-tactical-cyan focus:outline-none uppercase"
        >
          <option value="all">[ ALL_PROFILES ]</option>
          <option value="earthy">[ EARTHY ]</option>
          <option value="peppery">[ PEPPERY ]</option>
          <option value="sweet">[ SWEET ]</option>
        </select>
        <div className="text-[9px] text-tactical-green-dim pt-2 animate-pulse">&gt; {filtered.length} MATCHES FOUND_</div>
      </div>

      {/* Cards — horizontal scroll */}
      <div className="flex-1 overflow-x-auto p-4 bg-[#001100]/50 relative">
        <div className="flex gap-4 h-full relative z-10">
          {filtered.map((variety, i) => (
            <div
              key={`${variety.name}-${i}`}
              className="bg-[#000a00] border border-tactical-green-dim hover:border-tactical-green p-3 transition-colors w-60 shrink-0 flex flex-col relative group"
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tactical-green-dim group-hover:border-tactical-green transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tactical-green-dim group-hover:border-tactical-green transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tactical-green-dim group-hover:border-tactical-green transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tactical-green-dim group-hover:border-tactical-green transition-colors"></div>

              <div className="flex items-start justify-between mb-2 pb-1 border-b border-tactical-green-dim/50">
                <div className="max-w-[70%]">
                  <span className="text-white font-bold text-xs truncate block">{variety.name}</span>
                  {variety.isTop && <span className="text-[9px] text-tactical-amber bg-tactical-amber/10 border border-tactical-amber px-1 mt-1 inline-block">[PRIORITY_ASSET]</span>}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`text-[8px] px-1 border ${
                      variety.classification === "noble"
                        ? "border-tactical-green text-tactical-green"
                        : "border-tactical-amber text-tactical-amber"
                    }`}
                  >
                    [{variety.classification}]
                  </span>
                  <span className="text-[8px] text-tactical-cyan">
                    [{variety.flavor}]
                  </span>
                </div>
              </div>
              <div className="text-[9px] text-tactical-cyan mb-2">&gt; LOC: {variety.country}</div>
              <div className="text-[10px] text-tactical-green/80 leading-relaxed flex-1 opacity-90">{variety.effects}</div>
              
              <div className="text-[9px] text-tactical-green-dim mt-2 pt-2 border-t border-tactical-green-dim flex justify-between">
                <span>EXP_STATUS:</span>
                <span className="text-white">{variety.exportStatus}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
             <div className="text-tactical-red text-xs mt-10 ml-4 animate-pulse">
                [!] NO_DATA_FOUND_MATCHING_PARAMETERS
             </div>
          )}
        </div>
        
        {/* Background purely aesthetic scanline grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5" 
             style={{ backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
        </div>
      </div>
    </div>
  );
}
