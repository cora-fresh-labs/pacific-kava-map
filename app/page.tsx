"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { KavaCountry } from "@/lib/kavaData";
import CountryPanel from "@/components/CountryPanel";
import VarietyExplorer from "@/components/VarietyExplorer";
import MarketPanel from "@/components/MarketPanel";
import ChatWidget from "@/components/ChatWidget";
import LeadCapture from "@/components/LeadCapture";

// Load map client-side only (Leaflet requires window)
const KavaMap = dynamic(() => import("@/components/KavaMap"), { ssr: false });

type SidePanel = "country" | "varieties" | "market" | null;

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<KavaCountry | null>(null);
  const [activePanel, setActivePanel] = useState<SidePanel>("varieties");
  const [showLeadModal, setShowLeadModal] = useState(false);

  const handleCountrySelect = (country: KavaCountry | null) => {
    setSelectedCountry(country);
    if (country) {
      setActivePanel("country");
    }
  };

  const handlePanelTab = (panel: SidePanel) => {
    if (panel === "country" && !selectedCountry) return;
    setActivePanel(panel);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a1628] overflow-hidden">
      {/* CORA Banner */}
      <div className="bg-teal-900/80 border-b border-teal-700 px-4 py-2 flex items-center justify-between shrink-0">
        <p className="text-teal-200 text-xs sm:text-sm">
          🌱 <strong>CORA</strong> supports smallholder kava farmers in Vanuatu and PNG with soil health programs and carbon income.{" "}
          <a
            href="https://coraprojects.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-teal-300 hover:text-white"
          >
            coraprojects.com
          </a>
        </p>
        <button
          onClick={() => setShowLeadModal(true)}
          className="ml-4 shrink-0 bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          Get Market Report
        </button>
      </div>

      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Pacific Kava Map</h1>
            <p className="text-gray-400 text-xs">Interactive explorer — varieties, culture, markets</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
          <span className="text-teal-400 font-medium">$130M market</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">15% YoY growth</span>
          <span>•</span>
          <span className="text-blue-400 font-medium">6 producing nations</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <KavaMap onCountrySelect={handleCountrySelect} selectedCountry={selectedCountry} />
          {/* Map overlay instructions */}
          {!selectedCountry && (
            <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur border border-teal-900 rounded-lg px-3 py-2 z-[1000] text-xs text-gray-300 pointer-events-none">
              Click a marker to explore a country
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-gray-800 flex flex-col shrink-0 overflow-hidden">
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-800 shrink-0">
            <button
              onClick={() => handlePanelTab("country")}
              disabled={!selectedCountry}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activePanel === "country"
                  ? "text-teal-400 border-b-2 border-teal-400"
                  : selectedCountry
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            >
              Country
            </button>
            <button
              onClick={() => handlePanelTab("varieties")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activePanel === "varieties"
                  ? "text-teal-400 border-b-2 border-teal-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Varieties
            </button>
            <button
              onClick={() => handlePanelTab("market")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activePanel === "market"
                  ? "text-teal-400 border-b-2 border-teal-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Market
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === "country" && selectedCountry && (
              <CountryPanel
                country={selectedCountry}
                onClose={() => {
                  setSelectedCountry(null);
                  setActivePanel("varieties");
                }}
              />
            )}
            {activePanel === "varieties" && <VarietyExplorer />}
            {activePanel === "market" && <MarketPanel />}
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLeadModal(false);
          }}
        >
          <div className="bg-gray-900 border border-teal-800 rounded-xl p-6 w-full max-w-md relative">
            <LeadCapture onClose={() => setShowLeadModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
