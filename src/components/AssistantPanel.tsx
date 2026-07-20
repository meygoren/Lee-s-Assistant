"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useVoice } from "@/lib/useVoice";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantPanel() {
  const { dict, lang } = useLanguage();
  const { supported, listening, startListening, speak } = useVoice(lang);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: dict.home.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = async (text: string, viaVoice: boolean) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lang }),
      });
      const data = await res.json();
      const reply = data.reply ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (viaVoice && reply) speak(reply);
    } finally {
      setThinking(false);
    }
  };

  const handleMic = () => {
    if (!supported) return;
    startListening((transcript) => {
      sendMessage(transcript, true);
    });
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-cyan-500/20 text-cyan-100"
                : "bg-zinc-800/80 text-zinc-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        {thinking && (
          <div className="max-w-[85%] rounded-xl bg-zinc-800/80 px-3 py-2 text-sm text-zinc-400">
            {dict.home.thinking}
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input, false);
        }}
        className="flex items-center gap-2 border-t border-zinc-800 p-3"
      >
        <button
          type="button"
          onClick={handleMic}
          disabled={!supported}
          title={supported ? dict.home.speak : dict.home.noSpeechSupport}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-30 ${
            listening ? "animate-pulse bg-red-500 text-white" : "bg-zinc-800 text-cyan-300 hover:bg-zinc-700"
          }`}
        >
          <Mic size={16} strokeWidth={2} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? dict.home.listening : dict.home.askPlaceholder}
          className="flex-1 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={input.trim().length === 0}
          className="flex items-center gap-1.5 rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {dict.home.send}
          <Send size={14} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
