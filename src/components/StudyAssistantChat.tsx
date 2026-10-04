import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Send, User, Copy, Check, Bookmark, Volume2, 
  VolumeX, Sparkles, HelpCircle, GraduationCap, Award, Compass, RefreshCw
} from "lucide-react";
import { ChatMode, ChatMessage, StudyNote } from "../types";
import { speechController } from "../utils/audio";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface StudyAssistantChatProps {
  onSaveToNotes: (note: Partial<StudyNote>) => void;
}

const ACADEMIC_MODES: {
  id: ChatMode;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  starterPrompts: string[];
}[] = [
  {
    id: "socratic_tutor",
    name: "Socratic Tutor",
    badge: "Interactive Inquiry",
    description: "Guides your discovery with probing diagnostic questions and hints without immediately giving the answer away.",
    icon: <Compass className="w-4 h-4 text-emerald-600" />,
    starterPrompts: [
      "Why does a monopsony in the labor market cause a deadweight welfare loss?",
      "How does the law of conservation of momentum relate to Newton's third law?",
      "Can you guide me to derive the quadratic formula using completing the square?",
      "Help me understand why action potentials propagate without decrement along myelinated axons.",
    ],
  },
  {
    id: "exam_evaluator",
    name: "Exam Evaluator",
    badge: "Rigorous Marking",
    description: "Strictly marks your written answer against examination rubrics, predicts your grade/mark, and points out lost marks.",
    icon: <Award className="w-4 h-4 text-amber-600" />,
    starterPrompts: [
      "Here is my 8-mark draft on fiscal policy crowding-out. Can you mark it according to A-Level standards?",
      "Evaluate my explanation of the SN1 mechanism for a tertiary haloalkane (4 marks).",
      "Grade this paragraph on the significance of the 1929 Wall Street Crash for the Weimar Republic (12 marks).",
      "Check my solution to this calculus optimization problem and highlight any missing steps.",
    ],
  },
  {
    id: "concept_explainer",
    name: "Concept Explainer",
    badge: "Intuitive Feynman Models",
    description: "Breaks down elusive academic theories into vivid physical analogies, mental models, and intuitive breakdowns.",
    icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    starterPrompts: [
      "Explain the second law of thermodynamics and entropy like I am 12, then build up to the statistical mechanics definition.",
      "What is the intuitive physical meaning of eigenvalues and eigenvectors in linear algebra?",
      "Explain the Marshall-Lerner condition and the J-curve effect with a visual analogy.",
      "How do Transformer neural network attention heads actually work intuitively?",
    ],
  },
  {
    id: "doubt_solver",
    name: "Instant Doubt Solver",
    badge: "Rapid Clarification",
    description: "Direct, authoritative, step-by-step resolution of confusing syllabus doubts with equations and counter-examples.",
    icon: <HelpCircle className="w-4 h-4 text-sky-600" />,
    starterPrompts: [
      "Why is the resting potential of a neuron -70 mV instead of the potassium equilibrium potential -90 mV?",
      "What is the difference between comparative advantage and absolute advantage?",
      "In organic chemistry, why does resonance stabilization make carboxylic acids more acidic than alcohols?",
      "Why does light bend towards the normal when passing into a denser medium?",
    ],
  },
];

export const StudyAssistantChat: React.FC<StudyAssistantChatProps> = ({ onSaveToNotes }) => {
  const [selectedMode, setSelectedMode] = useState<ChatMode>("socratic_tutor");
  const [subject, setSubject] = useState("Multidisciplinary");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content: `Hello! I am your **Carks Academic Study Assistant**.

I am currently in **Socratic Tutor Mode**. Instead of simply giving you solutions, I will ask targeted questions to test your intuition, expose assumptions, and scaffold your understanding.

Select any of the 4 academic modes above or send me a question or draft answer below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode: "socratic_tutor",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    speechController.setCallback((speaking) => {
      if (!speaking) {
        setActiveSpeechMsgId(null);
      }
    });

    return () => {
      speechController.stop();
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/study-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          mode: selectedMode,
          subject,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to receive response");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: selectedMode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: `**Academic Connection Notice**: ${err.message || "Failed to contact the study engine."} Please check your request or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: selectedMode,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotesClick = (id: string, content: string) => {
    const firstLine = content.split("\n")[0].replace(/^#+\s*/, "").slice(0, 50) || "Study Assistant Insight";
    onSaveToNotes({
      title: `Chat Note: ${firstLine}`,
      subject: subject || "Academic Study",
      content: content,
      tags: ["StudyChat", selectedMode],
    });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleToggleAudio = (msg: ChatMessage) => {
    if (activeSpeechMsgId === msg.id) {
      speechController.stop();
      setActiveSpeechMsgId(null);
    } else {
      speechController.stop();
      setActiveSpeechMsgId(msg.id);
      speechController.speak(msg.content, speechSpeed, () => {
        setActiveSpeechMsgId(null);
      });
    }
  };

  const handleClearChat = () => {
    speechController.stop();
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: "assistant",
        content: `Chat history reset. Selected mode: **${ACADEMIC_MODES.find((m) => m.id === selectedMode)?.name}**. How can I assist your study today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: selectedMode,
      },
    ]);
  };

  const currentModeObj = ACADEMIC_MODES.find((m) => m.id === selectedMode) || ACADEMIC_MODES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Multi-Modal AI Academic Tutor</span>
          </div>
          <h1 className="text-3xl font-editorial font-bold text-stone-900 tracking-tight">
            Conversational Study Assistant
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Switch between Socratic exploration, rigorous exam marking, intuitive concept breakdowns, and instant doubt resolution.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {ACADEMIC_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSelectedMode(mode.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/50 border-blue-600 shadow-sm ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-blue-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl ${isSelected ? "bg-blue-100 text-blue-800" : "bg-slate-100"}`}>
                    {mode.icon}
                  </div>
                  <span className={`font-semibold text-xs ${isSelected ? "text-blue-900 font-bold" : "text-slate-900"}`}>{mode.name}</span>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {mode.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header Status */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">
              Active Mode: {currentModeObj.name}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-blue-700 font-medium">{currentModeObj.badge}</span>
          </div>

          {/* Speech speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-700">Audio Speed:</span>
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setSpeechSpeed(rate)}
                className={`px-2 py-0.5 rounded-lg font-mono text-[10px] ${
                  speechSpeed === rate
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isAI = msg.role === "assistant";
            const isSpeakingThis = activeSpeechMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isAI ? "items-start" : "items-start justify-end"}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isAI ? "" : "text-right"}`}>
                  <div
                    className={`rounded-2xl p-4.5 text-xs sm:text-sm leading-relaxed ${
                      isAI
                        ? "bg-stone-50 border border-stone-200/80 text-stone-800"
                        : "bg-stone-900 text-white shadow-sm"
                    }`}
                  >
                    {isAI ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>

                  {/* Message Action bar */}
                  <div
                    className={`flex items-center gap-2 text-[11px] text-stone-700 px-1 ${
                      isAI ? "justify-start" : "justify-end"
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {isAI && (
                      <>
                        <span aria-hidden="true">·</span>
                        {/* Audio readout */}
                        <button
                          type="button"
                          onClick={() => handleToggleAudio(msg)}
                          className={`flex items-center gap-1 hover:text-stone-900 transition-colors ${
                            isSpeakingThis ? "text-amber-600 font-bold" : ""
                          }`}
                        >
                          {isSpeakingThis ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        <span aria-hidden="true">·</span>
                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-stone-900 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <span aria-hidden="true">·</span>
                        {/* Save to Notes */}
                        <button
                          type="button"
                          onClick={() => handleSaveToNotesClick(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-stone-900 transition-colors"
                        >
                          {savedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-amber-600" />
                              <span className="text-amber-600 font-medium">Saved to Notes</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3 text-amber-600" />
                              <span>Save to Notes</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-500 text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-mono">Analyzing academic question...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts Bar (when only initial message or user wants inspiration) */}
        {messages.length <= 3 && (
          <div className="px-6 py-2.5 bg-stone-50/50 border-t border-stone-100 overflow-x-auto flex items-center gap-2">
            <span className="text-[11px] font-medium text-stone-700 shrink-0">
              Try Starter Prompt:
            </span>
            {currentModeObj.starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-md text-[11px] bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 whitespace-nowrap transition-colors"
              >
                {prompt.length > 55 ? `${prompt.slice(0, 55)}...` : prompt}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-4 border-t border-stone-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask in ${currentModeObj.name} mode (e.g. Ask for hints, paste a draft answer to grade, or solve a doubt)...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 bg-stone-50/50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-stone-900 text-white font-medium text-xs sm:text-sm hover:bg-stone-800 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
