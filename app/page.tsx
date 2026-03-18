"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { KavaCountry } from "@/lib/kavaData";
import CountryPanel from "@/components/CountryPanel";
import VarietyExplorer from "@/components/VarietyExplorer";
import MarketPanel from "@/components/MarketPanel";
import ChatWidget from "@/components/ChatWidget";
import LeadCapture from "@/components/LeadCapture";

const KavaMap = dynamic(() => import("@/components/KavaMap"), { ssr: false });

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<KavaCountry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<"market" | "country">("market");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const autoModalShown = useRef(false);

  // 30-second auto-trigger for lead capture
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autoModalShown.current) {
        autoModalShown.current = true;
        setShowLeadModal(true);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleCountrySelect = (country: KavaCountry | null) => {
    setSelectedCountry(country);
    if (country) {
      setSidebarView("country");
      setSidebarOpen(true);
    } else {
      setSidebarView("market");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#060d1a] overflow-hidden">
      {/* CORA Banner */}
      <div className="bg-teal-900/80 border-b border-teal-700/50 px-4 py-2 flex items-center justify-between shrink-0">
        <p className="text-teal-200 text-xs sm:text-sm">
          <strong>CORA</strong> supports smallholder kava farmers in Vanuatu &amp; PNG with soil health
          programs and carbon income.{" "}
          <a
            href="https://coraprojects.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-teal-300 hover:text-white transition-colors"
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
      <header className="px-4 py-3 border-b border-gray-800/60 flex items-center justify-between shrink-0 bg-[#0a1628]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
              Pacific Kava Map
            </h1>
            <p className="text-gray-400 text-xs">Interactive explorer — varieties, culture, markets</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
          <span className="text-teal-400 font-medium">$130M market</span>
          <span className="text-gray-600">|</span>
          <span className="text-emerald-400 font-medium">15% YoY growth</span>
          <span className="text-gray-600">|</span>
          <span className="text-blue-400 font-medium">6 producing nations</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Globe */}
        <div className="flex-1 relative">
          <KavaMap onCountrySelect={handleCountrySelect} selectedCountry={selectedCountry} />

          {/* Overlay instruction */}
          {!selectedCountry && (
            <div className="absolute top-4 left-4 bg-gray-900/85 backdrop-blur border border-teal-900/50 rounded-lg px-3 py-2 z-20 text-xs text-gray-300 pointer-events-none animate-fade-in">
              Click a glowing marker to explore a country
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-gray-900/85 backdrop-blur border border-teal-900/50 rounded-lg p-3 z-20 text-xs">
            <div className="text-teal-300 font-semibold mb-1.5">Pacific Kava Biome</div>
            <div className="text-gray-400 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
                Dense sprites = production core
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400/50 inline-block" />
                Coral accents = reef zones
              </div>
            </div>
          </div>

          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-1/2 -translate-y-1/2 z-30 bg-gray-900/90 border border-teal-800/50 rounded-l-lg px-1 py-4 text-teal-400 hover:text-teal-300 transition-all hover:bg-gray-800/90"
            style={{ right: sidebarOpen ? "320px" : "0px", transition: "right 0.3s ease" }}
          >
            {sidebarOpen ? "\u203A" : "\u2039"}
          </button>
        </div>

        {/* Right Sidebar — Market Intelligence + Country Panel */}
        <div
          className="border-l border-gray-800/60 flex flex-col shrink-0 overflow-hidden bg-[#0a1228]/95 backdrop-blur-sm transition-all duration-300 ease-in-out"
          style={{ width: sidebarOpen ? "320px" : "0px" }}
        >
          {sidebarOpen && (
            <>
              {/* Sidebar tabs */}
              <div className="flex border-b border-gray-800/60 shrink-0">
                <button
                  onClick={() => setSidebarView("market")}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    sidebarView === "market"
                      ? "text-teal-400 border-b-2 border-teal-400 bg-teal-900/10"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Market Intel
                </button>
                <button
                  onClick={() => setSidebarView("country")}
                  disabled={!selectedCountry}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    sidebarView === "country"
                      ? "text-teal-400 border-b-2 border-teal-400 bg-teal-900/10"
                      : selectedCountry
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {selectedCountry ? selectedCountry.name : "Country"}
                </button>
              </div>

              {/* Sidebar content */}
              <div className="flex-1 overflow-hidden">
                {sidebarView === "country" && selectedCountry ? (
                  <div className="animate-slide-in-right h-full">
                    <CountryPanel
                      country={selectedCountry}
                      onClose={() => {
                        setSelectedCountry(null);
                        setSidebarView("market");
                      }}
                    />
                  </div>
                ) : (
                  <MarketPanel />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Drawer — Variety Explorer */}
      <div
        className="border-t border-gray-800/60 bg-[#0a1228]/98 backdrop-blur-sm transition-all duration-300 ease-in-out shrink-0 overflow-hidden"
        style={{ height: drawerOpen ? "280px" : "40px" }}
      >
        {/* Drawer handle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full h-10 flex items-center justify-between px-4 text-xs font-medium text-teal-300 hover:text-teal-200 transition-colors border-b border-gray-800/30"
        >
          <span>
            Variety Explorer
            <span className="text-gray-500 ml-2">— 22 varieties across 6 nations</span>
          </span>
          <span className="text-gray-400 transition-transform" style={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0)" }}>
            &#9650;
          </span>
        </button>
        {drawerOpen && (
          <div className="h-[240px] overflow-hidden animate-fade-in">
            <VarietyExplorer />
          </div>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLeadModal(false);
          }}
        >
          <div className="bg-gray-900 border border-teal-800/60 rounded-xl p-6 w-full max-w-md relative shadow-2xl shadow-teal-900/20 animate-scale-in">
            <LeadCapture onClose={() => setShowLeadModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
