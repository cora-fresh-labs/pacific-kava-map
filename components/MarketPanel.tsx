"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { globalMarket, tradeFlows, kavaBarTrendData, kavaCountries } from "@/lib/kavaData";

const productionData = kavaCountries
  .map((c) => ({
    name: c.name.replace("Papua New Guinea", "PNG").replace("Hawaii (USA)", "HAW"),
    tonnes: c.productionTonnes,
  }))
  .sort((a, b) => b.tonnes - a.tonnes);

export default function MarketPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 text-tactical-green font-mono uppercase tracking-widest crt-scanlines">
      <div className="flex justify-between items-center border-b border-tactical-green-dim pb-2 pt-1">
         <h2 className="text-sm font-bold text-white shadow-tactical-green drop-shadow">MARKET_INTELLIGENCE</h2>
         <span className="text-[10px] text-tactical-amber animate-pulse border border-tactical-amber px-1">[LIVE_FEED]</span>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#001100]/80 border border-tactical-green-dim p-2 relative overflow-hidden group hover:border-tactical-green transition-colors">
          <div className="absolute top-0 right-0 w-4 h-4 bg-tactical-green/10 transform rotate-45 translate-x-2 -translate-y-2 group-hover:bg-tactical-green/30"></div>
          <div className="text-[8px] text-tactical-green-dim uppercase mb-1">MARKET_VOL_USD</div>
          <div className="text-lg font-bold text-tactical-cyan shadow-[0_0_8px_rgba(0,255,255,0.4)] inline-block">$130M</div>
          <div className="text-[8px] text-tactical-cyan/60 mt-1">/ANNUAL</div>
        </div>
        
        <div className="bg-[#001100]/80 border border-tactical-green-dim p-2 relative overflow-hidden group hover:border-tactical-green transition-colors">
          <div className="absolute top-0 right-0 w-4 h-4 bg-tactical-green/10 transform rotate-45 translate-x-2 -translate-y-2 group-hover:bg-tactical-green/30"></div>
          <div className="text-[8px] text-tactical-green-dim uppercase mb-1">GROWTH_RATE_YOY</div>
          <div className="text-lg font-bold text-tactical-green shadow-[0_0_8px_rgba(57,255,20,0.4)] inline-block">+15%</div>
          <div className="text-[8px] text-tactical-green/60 mt-1">/OVER_YEAR</div>
        </div>
        
        <div className="bg-[#001100]/80 border border-tactical-green-dim p-2 relative overflow-hidden group hover:border-tactical-amber transition-colors">
          <div className="absolute top-0 right-0 w-4 h-4 bg-tactical-amber/10 transform rotate-45 translate-x-2 -translate-y-2 group-hover:bg-tactical-amber/30"></div>
          <div className="text-[8px] text-tactical-green-dim uppercase mb-1">PRIMARY_IMPORTER</div>
          <div className="text-base font-bold text-tactical-amber shadow-[0_0_8px_rgba(255,176,0,0.4)] inline-block">UNITED STATES</div>
          <div className="text-[8px] text-tactical-amber/60 mt-1">$45M_DETECTED</div>
        </div>
        
        <div className="bg-[#001100]/80 border border-tactical-green-dim p-2 relative overflow-hidden group hover:border-tactical-red transition-colors">
          <div className="absolute top-0 right-0 w-4 h-4 bg-tactical-red/10 transform rotate-45 translate-x-2 -translate-y-2 group-hover:bg-tactical-red/30"></div>
          <div className="text-[8px] text-tactical-green-dim uppercase mb-1">US_VENUE_EXPANSION</div>
          <div className="text-lg font-bold text-tactical-red shadow-[0_0_8px_rgba(255,51,51,0.4)] inline-block">+40%</div>
          <div className="text-[8px] text-tactical-red/60 mt-1">/NAKAMAL_SITES</div>
        </div>
      </div>

      {/* Production by Country */}
      <div className="border border-tactical-green-dim bg-[#000a00] p-2">
        <div className="flex justify-between items-center mb-2 border-b border-tactical-green-dim/50 pb-1">
           <div className="text-[10px] font-bold text-white">YIELD_ANALYSIS</div>
           <div className="text-[8px] text-tactical-green-dim">UNIT:TONNES</div>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#003300" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#1d720b", fontSize: 8, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1d720b" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#1d720b", fontSize: 8, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#001100",
                  border: "1px solid #39ff14",
                  borderRadius: "0px",
                  color: "#66ff66",
                  fontSize: "10px",
                  fontFamily: "monospace"
                }}
                itemStyle={{ color: "#39ff14", textTransform: "uppercase" }}
                cursor={{ fill: "rgba(57, 255, 20, 0.1)" }}
                formatter={(value: number) => [`${value} T`, "YIELD"]}
              />
              <Bar dataKey="tonnes" fill="#0ff" radius={[0, 0, 0, 0]} name="YIELD" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kava Bar Trend */}
      <div className="border border-tactical-green-dim bg-[#000a00] p-2">
         <div className="flex justify-between items-center mb-2 border-b border-tactical-green-dim/50 pb-1">
           <div className="text-[10px] font-bold text-tactical-amber">US_RETAIL_PROLIFERATION</div>
           <div className="text-[8px] text-tactical-green-dim">TIMEFRAME:5Y</div>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kavaBarTrendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#003300" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#1d720b", fontSize: 8, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1d720b" }}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#1d720b", fontSize: 8, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#0a0000",
                  border: "1px solid #ffb000",
                  borderRadius: "0px",
                  color: "#ffb000",
                  fontSize: "10px",
                  fontFamily: "monospace"
                }}
                itemStyle={{ color: "#ffb000", textTransform: "uppercase" }}
                cursor={{ fill: "rgba(255, 176, 0, 0.1)" }}
              />
              <Bar dataKey="bars" fill="#ffb000" radius={[0, 0, 0, 0]} name="ACTIVE_SITES" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Exporters Table */}
      <div className="border border-tactical-green-dim bg-[#000a00] p-2">
        <div className="text-[10px] font-bold text-white mb-2 border-b border-tactical-green-dim/50 pb-1">GLOBAL_TRADE_ROUTING</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="border-b border-tactical-green-dim">
                <th className="pb-1 text-tactical-green-dim font-normal">ORIGIN</th>
                <th className="pb-1 text-tactical-green-dim font-normal">DESTINATION</th>
                <th className="pb-1 text-right text-tactical-green-dim font-normal">VOL.</th>
                <th className="pb-1 text-right text-tactical-green-dim font-normal">VAL.</th>
              </tr>
            </thead>
            <tbody>
              {tradeFlows.map((flow, i) => (
                <tr key={i} className="border-b border-tactical-green-dim/30 hover:bg-tactical-green/10 transition-colors">
                  <td className="py-1 text-tactical-cyan truncate max-w-[50px]">{flow.exporter.toUpperCase()}</td>
                  <td className="py-1 text-white truncate max-w-[50px]">{flow.importer.toUpperCase()}</td>
                  <td className="py-1 text-right text-tactical-green/80">{flow.volume}</td>
                  <td className="py-1 text-right text-tactical-amber font-bold">{flow.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Trend Terminal Feed */}
      <div className="bg-[#001100] border border-tactical-cyan/40 p-2 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tactical-cyan to-transparent opacity-50"></div>
        <div className="flex items-center gap-2 mb-1">
           <span className="w-1.5 h-1.5 bg-tactical-cyan shrink-0 animate-ping"></span>
           <div className="text-tactical-cyan text-[10px] font-bold">ANALYST_SUMMARY</div>
        </div>
        <p className="text-tactical-cyan/80 text-[9px] leading-relaxed relative z-10 opacity-90">
          <span className="text-tactical-cyan font-bold leading-none select-none animate-pulse">_&gt; </span> 
          {globalMarket.trend.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
