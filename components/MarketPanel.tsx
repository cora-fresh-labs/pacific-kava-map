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
    name: c.name.replace("Papua New Guinea", "PNG").replace("Hawaii (USA)", "Hawaii"),
    tonnes: c.productionTonnes,
  }))
  .sort((a, b) => b.tonnes - a.tonnes);

export default function MarketPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      <h2 className="text-base font-bold text-white">Market Intelligence</h2>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gray-900/80 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Market Size</div>
          <div className="text-xl font-bold text-teal-400">$130M</div>
          <div className="text-[10px] text-gray-500">USD annually</div>
        </div>
        <div className="bg-gray-900/80 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Growth Rate</div>
          <div className="text-xl font-bold text-emerald-400">15%</div>
          <div className="text-[10px] text-gray-500">Year over year</div>
        </div>
        <div className="bg-gray-900/80 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Top Importer</div>
          <div className="text-lg font-bold text-blue-400">USA</div>
          <div className="text-[10px] text-gray-500">$45M imports</div>
        </div>
        <div className="bg-gray-900/80 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Kava Bar Growth</div>
          <div className="text-xl font-bold text-amber-400">40%</div>
          <div className="text-[10px] text-gray-500">Annual in USA</div>
        </div>
      </div>

      {/* Production by Country */}
      <div>
        <div className="text-sm font-semibold text-gray-300 mb-2">Production by Country</div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2e24" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="t"
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #065f46",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#52B788" }}
                formatter={(value: number) => [`${value} tonnes`, "Production"]}
              />
              <Bar dataKey="tonnes" fill="#2D9B83" radius={[4, 4, 0, 0]} name="Production" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kava Bar Trend */}
      <div>
        <div className="text-sm font-semibold text-gray-300 mb-2">US Kava Bar Growth</div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kavaBarTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2e24" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #065f46",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#52B788" }}
              />
              <Bar dataKey="bars" fill="#52B788" radius={[4, 4, 0, 0]} name="Kava Bars" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[10px] text-gray-500 text-center mt-1">Number of kava bars in USA</div>
      </div>

      {/* Top Exporters Table */}
      <div>
        <div className="text-sm font-semibold text-gray-300 mb-2">Trade Flows</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700/60">
                <th className="text-left text-gray-400 pb-1.5 font-medium">Exporter</th>
                <th className="text-left text-gray-400 pb-1.5 font-medium">Importer</th>
                <th className="text-right text-gray-400 pb-1.5 font-medium">Vol</th>
                <th className="text-right text-gray-400 pb-1.5 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {tradeFlows.map((flow, i) => (
                <tr key={i} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                  <td className="py-1.5 text-teal-400">{flow.exporter}</td>
                  <td className="py-1.5 text-gray-300">{flow.importer}</td>
                  <td className="py-1.5 text-right text-gray-400">{flow.volume}</td>
                  <td className="py-1.5 text-right text-emerald-400 font-medium">{flow.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Trend */}
      <div className="bg-teal-950/60 border border-teal-800/40 rounded-lg p-3">
        <div className="text-teal-400 text-xs font-semibold mb-1">Market Trend</div>
        <p className="text-gray-300 text-xs leading-relaxed">{globalMarket.trend}</p>
      </div>
    </div>
  );
}
