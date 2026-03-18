"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What's the difference between noble and tudei kava?",
  "Which variety is best for relaxation?",
  "How is kava prepared in Vanuatu?",
  "Is kava legal in the US?",
  "What is the kava market worth?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "SYSTEM ONLINE. KAVA INTELLIGENCE DATABASE ACTIVE. QUERY VARIETALS, PACIFIC CULTURE, HEALTH PROFILES, REGULATIONS, OR GLOBAL MARKET DATA.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message || "ERR: UPLINK TIMEOUT. RETRY QUERY.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ERR: CONNECTION LOST. RETRY TRANSMISSION.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[2500] bg-[#001100] border-2 border-tactical-green hover:border-tactical-cyan text-tactical-green hover:text-tactical-cyan w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all font-mono text-xs uppercase"
        title="Ask Kava Intel"
      >
        {isOpen ? "[X]" : "[?]"}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[2500] w-80 sm:w-96 bg-[#000a00] border-2 border-tactical-green shadow-[0_0_30px_rgba(57,255,20,0.2)] flex flex-col overflow-hidden font-mono animate-scale-in"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-[#001500] px-4 py-3 flex items-center justify-between border-b border-tactical-green-dim">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-tactical-green rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
              <div>
                <div className="text-tactical-green font-bold text-xs uppercase tracking-widest">KAVA_INTEL</div>
                <div className="text-tactical-green-dim text-[9px] uppercase tracking-wider">AI UPLINK ACTIVE</div>
              </div>
            </div>
            <span className="text-[8px] text-tactical-amber border border-tactical-amber px-1 animate-pulse">[LIVE]</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#000800]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 text-[11px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-tactical-green/10 text-tactical-green border border-tactical-green/50"
                      : "bg-[#001100] text-tactical-green/80 border border-tactical-green-dim"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-tactical-cyan text-[9px] block mb-1">&gt; SYS_REPLY:</span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#001100] px-3 py-2 text-[11px] text-tactical-green-dim border border-tactical-green-dim">
                  <span className="animate-pulse">PROCESSING QUERY...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-[#000800] border-t border-tactical-green-dim/30">
              <div className="text-[9px] text-tactical-green-dim mb-2 uppercase tracking-wider">&gt; SUGGESTED_QUERIES:</div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[10px] bg-[#001100] hover:bg-tactical-green-dim/30 text-tactical-green px-2 py-1 border border-tactical-green-dim hover:border-tactical-green transition-all uppercase"
                  >
                    {q.length > 28 ? q.slice(0, 26) + "..." : q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-tactical-green-dim bg-[#001100]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="ENTER QUERY..."
                className="flex-1 bg-[#000a00] text-tactical-green border border-tactical-green-dim px-3 py-2 text-[11px] focus:border-tactical-cyan focus:outline-none placeholder-tactical-green-dim/40 uppercase"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="bg-tactical-green hover:bg-tactical-cyan disabled:opacity-30 disabled:cursor-not-allowed text-black px-3 py-2 text-xs transition-colors font-bold uppercase"
              >
                TX
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
