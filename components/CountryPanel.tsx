"use client";

import { KavaCountry, varietyDetails } from "@/lib/kavaData";
import { useState } from "react";

interface CountryPanelProps {
  country: KavaCountry;
  onClose: () => void;
}

const countryFlags: Record<string, string> = {
  Vanuatu: "🇻🇺",
  Fiji: "🇫🇯",
  Tonga: "🇹🇴",
  Samoa: "🇼🇸",
  "Papua New Guinea": "🇵🇬",
  "Hawaii (USA)": "🇺🇸",
};

export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);
  const flag = countryFlags[country.name] || "🌊";
  const isNoble = country.qualityGrade.toLowerCase().includes("noble");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-teal-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{flag}</span>
            <h2 className="text-xl font-bold text-white">{country.name}</h2>
          </div>
          <p className="text-teal-400 text-sm mt-1">{country.role}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isNoble
                ? "bg-emerald-900 text-emerald-300 border border-emerald-700"
                : "bg-amber-900 text-amber-300 border border-amber-700"
            }`}
          >
            {isNoble ? "✓ Noble Grade" : "⚠ Mixed Grade"}
          </span>
          {country.coraRelevant && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-teal-900 text-teal-300 border border-teal-700">
              🌱 CORA Active
            </span>
          )}
        </div>

        {/* Production */}
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Annual Production</div>
          <div className="text-2xl font-bold text-teal-400">{country.annualProduction}</div>
        </div>

        {/* Quality */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Quality Grade</div>
          <p className="text-gray-200 text-sm">{country.qualityGrade}</p>
        </div>

        {/* Cultural Note */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Cultural Significance</div>
          <p className="text-gray-200 text-sm leading-relaxed">{country.culturalNote}</p>
        </div>

        {/* Export Markets */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Export Markets</div>
          <div className="flex flex-wrap gap-2">
            {country.exportMarkets.map((market) => (
              <span
                key={market}
                className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs border border-blue-800"
              >
                {market}
              </span>
            ))}
          </div>
        </div>

        {/* Varieties */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Varieties ({country.varieties.length})
          </div>
          <div className="space-y-2">
            {country.varieties.map((variety) => (
              <div key={variety}>
                <button
                  onClick={() =>
                    setSelectedVariety(selectedVariety === variety ? null : variety)
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedVariety === variety
                      ? "bg-teal-800 text-teal-100 border border-teal-600"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {variety}
                      {variety === country.topVariety && (
                        <span className="ml-2 text-xs text-teal-400">★ Top variety</span>
                      )}
                    </span>
                    <span className="text-gray-400 text-xs">{selectedVariety === variety ? "▲" : "▼"}</span>
                  </div>
                </button>
                {selectedVariety === variety && varietyDetails[variety] && (
                  <div className="ml-2 mt-1 p-3 bg-gray-900 rounded-lg border-l-2 border-teal-600 text-xs space-y-2">
                    <div>
                      <span className="text-gray-400">Effects: </span>
                      <span className="text-gray-200">{varietyDetails[variety].effects}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Flavor: </span>
                      <span className="text-teal-300 capitalize">{varietyDetails[variety].flavor}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Export: </span>
                      <span className="text-gray-200">{varietyDetails[variety].exportStatus}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CORA CTA if relevant */}
        {country.coraRelevant && (
          <div className="bg-teal-950 border border-teal-800 rounded-lg p-3">
            <div className="text-teal-400 font-semibold text-sm mb-1">🌱 CORA Program Active</div>
            <p className="text-gray-300 text-xs">
              CORA supports smallholder kava farmers in {country.name} with soil health programs and carbon income.
            </p>
            <a
              href="https://coraprojects.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 text-xs hover:text-teal-300 mt-1 inline-block"
            >
              Learn more at coraprojects.com →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
