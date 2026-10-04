import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, X, Send, Sparkles, Volume2, Copy, Check, 
  Bookmark, Minimize2, Maximize2, HelpCircle, ArrowRight 
} from "lucide-react";
import { ChatMessage, StudyNote } from "../types";
import { speechController } from "../utils/audio";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface FloatingAssistantBotProps {
  onSaveToNotes: (note: Partial<StudyNote>) => void;
}

export const FloatingAssistantBot: React.FC<FloatingAssistantBotProps> = ({ onSaveToNotes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "bot-welcome",
      role: "assistant",
      content: `Hello! I am your **Carks AI Assistant**. 

I can answer any academic question, solve doubts, summarize topics, or help you structure your exam answers. What can I help you learn right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInputMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/study-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          mode: "doubt_solver",
          subject: "Academic Assistance",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to receive response");
      }

      const botMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: `I encountered an issue: ${err.message || "Please try again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (id: string, text: string) => {
    const firstLine = text.split("\n")[0].replace(/^#+\s*/, "").slice(0, 50) || "AI Assistant Note";
    onSaveToNotes({
      title: `Assistant Note: ${firstLine}`,
      subject: "AI Assistant",
      content: text,
      tags: ["Assistant", "QuickNotes"],
    });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
      {/* Floating Trigger Button with Shading Blue Theme & Glow */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full shadow-2xl border border-blue-400/40 transition-all hover:scale-105 cursor-pointer animate-blue-glow"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold pr-1">Ask AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-editorial text-base font-bold">Carks Assistant</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-blue-100">Always ready to solve any doubt</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 text-xs">
            {messages.map((m) => {
              const isAI = m.role === "assistant";
              return (
                <div key={m.id} className={`flex gap-2.5 ${isAI ? "items-start" : "items-start justify-end"}`}>
                  {isAI && (
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isAI ? "" : "text-right"}`}>
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        isAI
                          ? "bg-white border border-stone-200 text-stone-800 shadow-sm"
                          : "bg-stone-900 text-white shadow-sm"
                      }`}
                    >
                      {isAI ? (
                        <MarkdownRenderer content={m.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>

                    {isAI && (
                      <div className="flex items-center gap-2 text-[10px] text-stone-600 px-1">
                        <button
                          type="button"
                          onClick={() => speechController.speak(m.content, 1.0)}
                          className="hover:text-stone-900 flex items-center gap-0.5"
                        >
                          <Volume2 className="w-3 h-3 text-amber-700" />
                          <span>Listen</span>
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-stone-900 flex items-center gap-0.5"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => handleSave(m.id, m.content)}
                          className="hover:text-stone-900 flex items-center gap-0.5"
                        >
                          <Bookmark className="w-3 h-3 text-amber-700" />
                          <span>{savedId === m.id ? "Saved" : "Save"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-2xl text-stone-600 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1 font-mono">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length <= 2 && (
            <div className="p-2 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => handleSendMessage("Explain photosynthesis light-dependent reaction simply")}
                className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap"
              >
                Photosynthesis
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("How do I structure a 16-mark essay?")}
                className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap"
              >
                16-Mark Structure
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("What is the formula for kinetic energy and momentum?")}
                className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap"
              >
                Physics Formulas
              </button>
            </div>
          )}

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask anything (e.g. solve a doubt, explain formula)..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isLoading}
              className="p-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
