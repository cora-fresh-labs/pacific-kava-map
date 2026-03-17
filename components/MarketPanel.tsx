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
import { globalMarket, tradeFlows, kavaBarTrendData } from "@/lib/kavaData";

export default function MarketPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <h2 className="text-lg font-bold text-white">Market Intelligence</h2>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Market Size</div>
          <div className="text-xl font-bold text-teal-400">$130M</div>
          <div className="text-xs text-gray-500">USD annually</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Growth Rate</div>
          <div className="text-xl font-bold text-emerald-400">15%</div>
          <div className="text-xs text-gray-500">Year over year</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Top Importer</div>
          <div className="text-lg font-bold text-blue-400">USA</div>
          <div className="text-xs text-gray-500">$45M imports</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kava Bar Growth</div>
          <div className="text-xl font-bold text-amber-400">40%</div>
          <div className="text-xs text-gray-500">Annual in USA</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div>
        <div className="text-sm font-semibold text-gray-300 mb-3">US Kava Bar Growth</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kavaBarTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3a2e" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #065f46",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#52B788" }}
              />
              <Bar dataKey="bars" fill="#52B788" radius={[4, 4, 0, 0]} name="Kava Bars" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">Number of kava bars in USA</div>
      </div>

      {/* Trade Flows */}
      <div>
        <div className="text-sm font-semibold text-gray-300 mb-3">Trade Flows</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 pb-2 font-medium">Exporter</th>
                <th className="text-left text-gray-400 pb-2 font-medium">Importer</th>
                <th className="text-right text-gray-400 pb-2 font-medium">Volume</th>
                <th className="text-right text-gray-400 pb-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {tradeFlows.map((flow, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2 text-teal-400">{flow.exporter}</td>
                  <td className="py-2 text-gray-300">{flow.importer}</td>
                  <td className="py-2 text-right text-gray-400">{flow.volume}</td>
                  <td className="py-2 text-right text-emerald-400 font-medium">{flow.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend context */}
      <div className="bg-teal-950 border border-teal-800 rounded-lg p-3">
        <div className="text-teal-400 text-xs font-semibold mb-1">Market Trend</div>
        <p className="text-gray-300 text-xs leading-relaxed">{globalMarket.trend}</p>
      </div>
    </div>
  );
}
