"use client";

import { KavaCountry, varietyDetails } from "@/lib/kavaData";
import { useState } from "react";

interface CountryPanelProps {
  country: KavaCountry;
  onClose: () => void;
}

const countryFlags: Record<string, string> = {
  Vanuatu: "VU",
  Fiji: "FJ",
  Tonga: "TO",
  Samoa: "WS",
  "Papua New Guinea": "PG",
  "Hawaii (USA)": "US",
};

export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);
  const flagCode = countryFlags[country.name] || "**";
  const isNoble = country.qualityGrade.toLowerCase().includes("noble");

  return (
    <div className="h-full flex flex-col overflow-hidden text-tactical-green font-mono">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-tactical-green-dim bg-[#001100]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-tactical-green-dim font-bold">[{flagCode}]</span>
            <h2 className="text-xl font-bold uppercase tracking-widest">{country.name}</h2>
          </div>
          <p className="text-tactical-green-dim text-xs mt-1 uppercase tracking-widest">:: {country.role}</p>
        </div>
        <button
          onClick={onClose}
          className="text-tactical-green-dim hover:text-tactical-amber transition-colors p-1"
        >
          [X]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 crt-scanlines">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 text-[10px] tracking-widest uppercase">
          <span
            className={`px-2 py-1 border ${
              isNoble
                ? "bg-tactical-green/10 text-tactical-green border-tactical-green"
                : "bg-tactical-amber/10 text-tactical-amber border-tactical-amber"
            }`}
          >
            {isNoble ? "[SECURE: NOBLE]" : "[WARN: MIXED_GRADE]"}
          </span>
          {country.coraRelevant && (
            <span className="px-2 py-1 bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan">
              [CORA_UPLINK_ACTIVE]
            </span>
          )}
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-2">
           <div className="border border-tactical-green-dim p-2 bg-[#001100]/50">
             <div className="text-[9px] text-tactical-green-dim uppercase tracking-widest mb-1">ANNUAL_YIELD</div>
             <div className="text-lg font-bold">{country.annualProduction}</div>
           </div>
           
           <div className="border border-tactical-green-dim p-2 bg-[#001100]/50">
             <div className="text-[9px] text-tactical-green-dim uppercase tracking-widest mb-1">QUALITY_INDEX</div>
             <div className="text-xs mt-1 truncate">{country.qualityGrade}</div>
           </div>
        </div>

        {/* Cultural Intel */}
        <div className="border border-tactical-green-dim p-3 bg-[#000a00]">
          <div className="flex justify-between items-center mb-2 border-b border-tactical-green-dim pb-1">
             <div className="text-[10px] text-tactical-green font-bold uppercase tracking-widest">CULTURAL_INTEL</div>
             <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse"></div>
          </div>
          <p className="text-tactical-green/80 text-xs leading-relaxed opacity-90">{country.culturalNote}</p>
        </div>

        {/* Export Routes */}
        <div>
          <div className="text-[10px] text-tactical-green-dim uppercase tracking-widest mb-2">TARGET_MARKETS</div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            {country.exportMarkets.map((market) => (
              <span
                key={market}
                className="px-2 py-0.5 border border-tactical-cyan text-tactical-cyan bg-tactical-cyan/10"
              >
                &gt; {market}
              </span>
            ))}
          </div>
        </div>

        {/* Chemotype Database (Varieties) */}
        <div>
          <div className="text-[10px] text-tactical-green-dim uppercase tracking-widest mb-2 flex justify-between">
            <span>CHEMOTYPE_DB</span>
            <span>[{country.varieties.length} RECORDS]</span>
          </div>
          <div className="space-y-1">
            {country.varieties.map((variety) => {
              const isActive = selectedVariety === variety;
              return (
                <div key={variety} className="border border-tactical-green-dim">
                  <button
                    onClick={() => setSelectedVariety(isActive ? null : variety)}
                    className={`w-full text-left px-2 py-1.5 text-xs transition-all uppercase tracking-wider flex justify-between items-center ${
                      isActive
                        ? "bg-tactical-green text-black font-bold"
                        : "bg-[#001100] text-tactical-green hover:bg-tactical-green-dim/30"
                    }`}
                  >
                    <span>
                      {variety}
                      {variety === country.topVariety && (
                        <span className={`ml-2 text-[9px] ${isActive ? 'text-black' : 'text-tactical-amber'}`}>*PRIORITY</span>
                      )}
                    </span>
                    <span className="text-[10px]">{isActive ? "[-]" : "[+]"}</span>
                  </button>
                  
                  {isActive && varietyDetails[variety] && (
                    <div className="p-3 bg-[#000a00] border-t border-tactical-green-dim text-[10px] space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-tactical-cyan rounded-full animate-ping"></span>
                          <span className="text-tactical-cyan">DECRYPTING CHEMOTYPE DATA...</span>
                       </div>
                      <div className="grid grid-cols-[80px_1fr] gap-1 mt-2">
                        <span className="text-tactical-green-dim">EFFECT_PRFL:</span>
                        <span className="text-tactical-green">{varietyDetails[variety].effects}</span>
                        
                        <span className="text-tactical-green-dim">TASTE_PRFL:</span>
                        <span className="text-tactical-amber uppercase">{varietyDetails[variety].flavor}</span>
                        
                        <span className="text-tactical-green-dim">EXP_STATUS:</span>
                        <span className="text-tactical-green">{varietyDetails[variety].exportStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

