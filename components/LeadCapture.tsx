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
      <div className="text-center py-4 font-mono">
        <div className="text-tactical-green text-3xl mb-3">[OK]</div>
        <h3 className="text-xl font-bold text-tactical-green mb-2 uppercase tracking-widest">UPLINK ESTABLISHED</h3>
        <p className="text-tactical-green/70 text-xs mb-4 uppercase tracking-wider">
          INTEL PACKAGE EN ROUTE TO YOUR INBOX. STAND BY.
        </p>
        <button
          onClick={onClose}
          className="bg-transparent border border-tactical-green text-tactical-green hover:bg-tactical-green hover:text-black px-6 py-2 text-xs transition-all font-mono uppercase tracking-widest"
        >
          [ RETURN TO MAP ]
        </button>
      </div>
    );
  }

  return (
    <div className="font-mono">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-tactical-green-dim hover:text-tactical-amber transition-colors p-1 text-xs"
      >
        [X]
      </button>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-tactical-amber text-sm animate-pulse">[!]</span>
        <h3 className="text-base font-bold text-tactical-amber uppercase tracking-widest">CLASSIFIED INTEL</h3>
      </div>
      <p className="text-tactical-green/60 text-[10px] mb-4 uppercase tracking-wider">
        DECRYPT: $130M MARKET ANALYSIS // EXPORT OPS // VARIETAL GUIDE // TRADE FLOW DATA
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[9px] text-tactical-green-dim uppercase tracking-widest block mb-1">CALLSIGN</label>
          <input
            type="text"
            placeholder="Enter name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-[#001100] text-tactical-green border border-tactical-green-dim px-3 py-2 text-xs focus:border-tactical-cyan focus:outline-none placeholder-tactical-green-dim/50 font-mono uppercase"
          />
        </div>
        <div>
          <label className="text-[9px] text-tactical-green-dim uppercase tracking-widest block mb-1">SECURE_CHANNEL</label>
          <input
            type="email"
            placeholder="Enter email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#001100] text-tactical-green border border-tactical-green-dim px-3 py-2 text-xs focus:border-tactical-cyan focus:outline-none placeholder-tactical-green-dim/50 font-mono uppercase"
          />
        </div>
        <div>
          <label className="text-[9px] text-tactical-green-dim uppercase tracking-widest block mb-1">ROLE_CLASS</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-[#001100] text-tactical-green border border-tactical-green-dim px-3 py-2 text-xs focus:border-tactical-cyan focus:outline-none font-mono uppercase"
          >
            <option value="buyer">[ BUYER ]</option>
            <option value="grower">[ GROWER ]</option>
            <option value="investor">[ INVESTOR ]</option>
            <option value="researcher">[ RESEARCHER ]</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-tactical-amber hover:bg-tactical-amber/80 disabled:opacity-50 text-black py-2.5 text-xs font-bold transition-colors font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(255,176,0,0.3)]"
        >
          {status === "loading" ? "DECRYPTING..." : "[ INITIATE DECRYPT ]"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-tactical-red text-[10px] mt-2 text-center uppercase tracking-wider animate-pulse">
          [ERR] UPLINK FAILED. RETRY TRANSMISSION.
        </p>
      )}

      <p className="text-tactical-green-dim/50 text-[9px] text-center mt-3 uppercase tracking-wider">
        NO SPAM. UNSUBSCRIBE ANYTIME. SEC_LEVEL: STANDARD.
      </p>
    </div>
  );
}
