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

export type VisualMode = "standard" | "nvg" | "flir";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<KavaCountry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<"market" | "country">("market");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [visualMode, setVisualMode] = useState<VisualMode>("standard");
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
    <div className="flex flex-col h-screen bg-[#020606] overflow-hidden crt text-tactical-green selection:bg-tactical-green selection:text-black">
      {/* Top System Bar */}
      <div className="bg-[#001100] border-b border-tactical-green-dim px-4 py-1.5 flex items-center justify-between shrink-0 relative z-50 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
        <div className="flex items-center gap-4">
          <span className="text-tactical-amber text-xs font-bold animate-pulse">■ LIVE</span>
          <p className="text-tactical-green text-xs font-mono uppercase tracking-wider">
            CORA INTEL // SYSTEM SECURE // SEC: PACIFIC-KAVA
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Visual Mode Toggles */}
          <div className="flex bg-[#000a00] border border-tactical-green-dim rounded overflow-hidden">
            <button
               onClick={() => setVisualMode("standard")}
               className={`px-3 py-1 text-[10px] sm:text-xs font-mono uppercase transition-colors ${visualMode === "standard" ? "bg-tactical-green text-black" : "text-tactical-green hover:bg-tactical-green-dim/30"}`}
            >
              STD
            </button>
            <button
               onClick={() => setVisualMode("nvg")}
               className={`px-3 py-1 text-[10px] sm:text-xs font-mono uppercase transition-colors border-l border-r border-tactical-green-dim ${visualMode === "nvg" ? "bg-tactical-green text-black" : "text-tactical-green hover:bg-tactical-green-dim/30"}`}
            >
              NVG
            </button>
            <button
               onClick={() => setVisualMode("flir")}
               className={`px-3 py-1 text-[10px] sm:text-xs font-mono uppercase transition-colors ${visualMode === "flir" ? "bg-tactical-amber text-black" : "text-tactical-amber hover:bg-tactical-amber/30"}`}
            >
              FLIR
            </button>
          </div>
          <button
            onClick={() => setShowLeadModal(true)}
            className="shrink-0 bg-transparent border border-tactical-cyan text-tactical-cyan hover:bg-tactical-cyan hover:text-black text-[10px] sm:text-xs px-3 py-1.5 transition-all font-mono uppercase tracking-wider shadow-[0_0_8px_rgba(0,255,255,0.4)]"
          >
            [ DECRYPT MARKET REPORT ]
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="px-4 py-3 border-b border-tactical-green-dim flex items-center justify-between shrink-0 bg-[#001500]/90 backdrop-blur-sm relative z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-tactical-green flex items-center justify-center bg-tactical-green-dim/20 shadow-[0_0_12px_rgba(57,255,20,0.3)] shrink-0">
             <span className="text-tactical-green text-sm">⌖</span>
          </div>
          <div>
            <h1 className="text-tactical-green font-bold text-lg leading-tight tracking-widest uppercase font-mono shadow-tactical-green drop-shadow-md">
              KAVA :: MAINFRAME
            </h1>
            <p className="text-tactical-green-dim text-xs font-mono uppercase tracking-widest mt-0.5">GEO-INTELLIGENCE DASHBOARD v4.0.2</p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 text-[10px] font-mono uppercase">
          <div className="flex items-center gap-4 text-tactical-green">
            <span>Market Cap: <span className="font-bold text-tactical-green drop-shadow-[0_0_4px_rgba(57,255,20,0.8)]">$130M</span></span>
            <span className="text-tactical-green-dim">|</span>
            <span>Growth: <span className="font-bold text-tactical-amber">15% YoY</span></span>
            <span className="text-tactical-green-dim">|</span>
            <span>Targets: <span className="font-bold">6 NATIONS</span></span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative border-b border-tactical-green-dim bg-black">
        {/* Globe */}
        <div className="flex-1 relative">
          <KavaMap onCountrySelect={handleCountrySelect} selectedCountry={selectedCountry} visualMode={visualMode} />

          {/* Overlay instruction */}
          {!selectedCountry && (
            <div className="absolute top-4 left-4 bg-[#001100]/80 backdrop-blur-md border border-tactical-green-dim rounded px-3 py-2 z-20 text-[10px] text-tactical-green font-mono pointer-events-none animate-fade-in shadow-[0_0_10px_rgba(0,15,0,0.8)]">
              &gt; SELECT_TARGET_REGION_TO_PROCEED... <span className="animate-pulse">_</span>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-[#001100]/90 backdrop-blur border border-tactical-green-dim rounded p-3 z-20 text-[10px] font-mono w-64 shadow-[0_0_15px_rgba(0,15,0,0.9)]">
            <div className="text-tactical-green font-bold mb-2 uppercase tracking-widest border-b border-tactical-green-dim pb-1">TACTICAL LEGEND</div>
            <div className="text-tactical-green/80 space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-tactical-cyan inline-block shadow-[0_0_4px_cyan]" />
                [ NAKAMAL / KAVA BAR ]
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-tactical-green inline-block shadow-[0_0_4px_#39ff14]" />
                [ AGROFORESTRY ZONE ]
              </div>
            </div>
          </div>

          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-1/2 -translate-y-1/2 z-30 bg-[#001100] border border-tactical-green-dim rounded-l px-1 py-6 text-tactical-green hover:text-tactical-cyan transition-all hover:bg-tactical-green-dim/30 shadow-[-2px_0_8px_rgba(57,255,20,0.1)] font-mono text-xs"
            style={{ right: sidebarOpen ? "320px" : "0px", transition: "right 0.3s ease" }}
          >
            {sidebarOpen ? "]" : "["}
          </button>
        </div>

        {/* Right Sidebar — Market Intelligence + Country Panel */}
        <div
          className="border-l border-tactical-green-dim flex flex-col shrink-0 overflow-hidden bg-[#000a00]/95 backdrop-blur-md transition-all duration-300 ease-in-out relative z-40"
          style={{ width: sidebarOpen ? "320px" : "0px" }}
        >
          {sidebarOpen && (
            <>
              {/* Sidebar tabs */}
              <div className="flex border-b border-tactical-green-dim shrink-0 bg-[#001500]">
                <button
                  onClick={() => setSidebarView("market")}
                  className={`flex-1 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-colors ${
                    sidebarView === "market"
                      ? "text-black bg-tactical-green font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
                      : "text-tactical-green hover:bg-tactical-green-dim/30"
                  }`}
                >
                  [ DATA_CORE ]
                </button>
                <button
                  onClick={() => setSidebarView("country")}
                  disabled={!selectedCountry}
                  className={`flex-1 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-colors border-l border-tactical-green-dim ${
                    sidebarView === "country"
                      ? "text-black bg-tactical-green font-bold"
                      : selectedCountry
                      ? "text-tactical-green hover:bg-tactical-green-dim/30"
                      : "text-tactical-green-dim cursor-not-allowed opacity-50"
                  }`}
                >
                  [ {selectedCountry ? selectedCountry.name.substring(0,6) + "..." : "TARGET"} ]
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
        className="border-t border-tactical-green-dim bg-[#001100]/98 backdrop-blur-md transition-all duration-300 ease-in-out shrink-0 overflow-hidden relative z-40"
        style={{ height: drawerOpen ? "280px" : "36px" }}
      >
        {/* Drawer handle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full h-9 flex items-center justify-between px-4 font-mono text-[10px] uppercase tracking-widest text-tactical-green hover:text-tactical-cyan hover:bg-tactical-green-dim/20 transition-all border-b border-tactical-green-dim/30"
        >
          <span>
            [ STRAIN_DATABASE ] 
            <span className="text-tactical-green-dim ml-4">:: 22 KNOWN VARIETALS DETECTED</span>
          </span>
          <span className="text-tactical-green transition-transform" style={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0)" }}>
            ▲
          </span>
        </button>
        {drawerOpen && (
          <div className="h-[244px] overflow-hidden animate-fade-in crt-scanlines">
            <VarietyExplorer />
          </div>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLeadModal(false);
          }}
        >
          <div className="bg-[#000a00] border-2 border-tactical-amber rounded p-1 w-full max-w-md relative shadow-[0_0_30px_rgba(255,176,0,0.3)] animate-scale-in">
             <div className="border border-tactical-amber/50 p-6 bg-[#001100]">
               <LeadCapture onClose={() => setShowLeadModal(false)} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
