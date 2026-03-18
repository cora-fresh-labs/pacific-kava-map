"use client";

import { useState } from "react";

export default function LeadCapture({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("researcher");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">🌿</div>
        <h3 className="text-xl font-bold text-white mb-2">You&apos;re in!</h3>
        <p className="text-gray-300 text-sm mb-4">
          The Pacific Kava Market Report is on its way to your inbox.
        </p>
        <button
          onClick={onClose}
          className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg text-sm transition-colors"
        >
          Back to the map
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        ✕
      </button>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-bold text-white">Pacific Kava Market Report</h3>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Free report: $130M market analysis, export opportunities, variety guide, and trade flow data.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:outline-none placeholder-gray-500"
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:outline-none placeholder-gray-500"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="buyer">I am a: Buyer</option>
          <option value="grower">I am a: Grower</option>
          <option value="investor">I am a: Investor</option>
          <option value="researcher">I am a: Researcher</option>
        </select>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
        >
          {status === "loading" ? "Sending..." : "Get Free Report →"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-red-400 text-xs mt-2 text-center">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="text-gray-500 text-xs text-center mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
