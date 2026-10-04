import React, { useState } from "react";
import { 
  Sparkles, CheckCircle2, AlertTriangle, Printer, Copy, Check, 
  Volume2, Bookmark, ArrowRight, RotateCcw, ChevronDown, ChevronUp, 
  Layers, ShieldAlert, Award, Download, FileDown
} from "lucide-react";
import { MarkAllocation, ExamAnswerResult, StudyNote } from "../types";
import { speechController } from "../utils/audio";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { exportSingleNoteToPdf, exportToWordDoc } from "../utils/pdfExport";

interface ExamAnswerCreatorProps {
  onSaveToNotes: (note: Partial<StudyNote>) => void;
  onGenerateFlashcards: (content: string, title: string) => void;
  onPrintPreview: (title: string, content: string, subject: string, metadata?: any) => void;
  initialAnswer?: ExamAnswerResult | null;
}

const MARK_OPTIONS: { marks: MarkAllocation; label: string; desc: string }[] = [
  { marks: 2, label: "2 Marks", desc: "Crisp definition + 1 core fact / formula" },
  { marks: 4, label: "4 Marks", desc: "Step-by-step cause & effect mechanism" },
  { marks: 8, label: "8 Marks", desc: "Thesis, 3 analytical paragraphs & evaluation" },
  { marks: 10, label: "10 Marks", desc: "In-depth university exam model answer" },
  { marks: 16, label: "16 Marks", desc: "Extended essay with synthesis matrix" },
];

export const ExamAnswerCreator: React.FC<ExamAnswerCreatorProps> = ({
  onSaveToNotes,
  onGenerateFlashcards,
  onPrintPreview,
  initialAnswer = null,
}) => {
  const [question, setQuestion] = useState("");
  const [selectedMarks, setSelectedMarks] = useState<MarkAllocation>(8);
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<ExamAnswerResult | null>(initialAnswer);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Interaction feedback states
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showRubric, setShowRubric] = useState(true);
  const [showPitfalls, setShowPitfalls] = useState(true);

  const handleGenerateAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) {
      setErrorMsg("Please enter your question first.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-exam-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          marks: selectedMarks,
          subject: subject.trim() || "Academic",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let extractedErr = "Failed to generate answer. Please try again.";
        if (typeof errorData.error === "string") {
          extractedErr = errorData.error;
        } else if (errorData.error?.message) {
          extractedErr = errorData.error.message;
        }
        throw new Error(extractedErr);
      }

      const data: ExamAnswerResult = await res.json();
      data.id = `exam-ans-${Date.now()}`;
      data.createdAt = new Date().toISOString();
      setCurrentAnswer(data);

      // Auto-save to Notes Library upon completion
      onSaveToNotes({
        title: `[${data.marks}M] ${data.title || data.question.slice(0, 50)}`,
        subject: data.subject || "Academic",
        marksAssociated: data.marks,
        content: `# ${data.question}\n\n**Marks**: ${data.marks} Marks | **Subject**: ${data.subject}\n\n${data.modelAnswer}\n\n---\n\n### Examiner Rubric\n${data.rubric?.map((r) => `- **${r.marks}** (${r.objective}): ${r.criteria}`).join("\n")}`,
        tags: [data.subject || "Exam", `${data.marks}Marks`],
      });
      setSaved(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while generating the model answer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!currentAnswer) return;
    navigator.clipboard.writeText(currentAnswer.modelAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    if (!currentAnswer) return;
    onSaveToNotes({
      title: `[${currentAnswer.marks}M] ${currentAnswer.title || currentAnswer.question.slice(0, 50)}`,
      subject: currentAnswer.subject || "Academic",
      marksAssociated: currentAnswer.marks,
      content: `# ${currentAnswer.question}\n\n**Marks**: ${currentAnswer.marks} Marks | **Subject**: ${currentAnswer.subject}\n\n${currentAnswer.modelAnswer}\n\n---\n\n### Examiner Rubric\n${currentAnswer.rubric?.map((r) => `- **${r.marks}** (${r.objective}): ${r.criteria}`).join("\n")}`,
      tags: [currentAnswer.subject || "Exam", `${currentAnswer.marks}Marks`],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggleAudio = () => {
    if (!currentAnswer) return;
    if (isPlayingAudio) {
      speechController.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speechController.speak(currentAnswer.modelAnswer, 1.0);
      speechController.setCallback((speaking) => {
        setIsPlayingAudio(speaking);
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Examiner Model Answer Engine</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-sky-950 tracking-tight">
          Exam Question Answer Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Enter any academic question and select your mark allocation. Get the definitive model answer, examiner marking points, and common traps.
        </p>
      </div>

      {/* Light Blue Glassmorphic Input Card */}
      <div className="glass-sapphire-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden border border-sky-200">
        <form onSubmit={handleGenerateAnswer} className="space-y-6 relative z-10">
          {/* Mark Allocation Selector */}
          <div>
            <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider mb-2.5">
              Select Target Marks Allocation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {MARK_OPTIONS.map((opt) => {
                const isSelected = selectedMarks === opt.marks;
                return (
                  <button
                    key={opt.marks}
                    type="button"
                    onClick={() => setSelectedMarks(opt.marks)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 duration-150 ${
                      isSelected
                        ? "bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 border-sky-400 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300"
                        : "bg-sky-50/70 border-sky-200 text-slate-700 hover:border-sky-400 hover:bg-white"
                    }`}
                  >
                    <div className="font-mono text-sm font-bold">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? "text-sky-100" : "text-slate-500"}`}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider">
                Your Exam Question or Problem
              </label>
              <span className="text-[11px] text-sky-600 font-semibold">Required</span>
            </div>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type or paste your question here (e.g. Explain how enzymes catalyze biochemical reactions, Evaluate monetary policy to reduce inflation, Solve differential equation dy/dx = 2x...)"
              className="w-full p-4 text-xs sm:text-sm leading-relaxed rounded-2xl border border-sky-200 bg-white text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-500 transition-all resize-y shadow-xs"
            />
          </div>

          {/* Optional Subject Field */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (Optional, e.g. Biology, Economics, Physics, Chemistry, Math)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sky-200 bg-white text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-500 transition-all shadow-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating || !question.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0 active:scale-95 duration-150"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Model Answer...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-100" />
                  <span>Generate Definitive Model Answer</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAnswer}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Answer Output View (Light Blue Glassmorphic) */}
      {currentAnswer && (
        <div className="glass-sapphire rounded-3xl border border-sky-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Action Bar */}
          <div className="p-5 sm:p-6 bg-sky-50/90 border-b border-sky-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-mono font-bold bg-sky-600 text-white text-[11px] shadow-sm shadow-sky-500/20">
                  {currentAnswer.marks} Marks
                </span>
                <span className="text-sky-300">·</span>
                <span className="font-semibold text-sky-800">{currentAnswer.subject || "Academic Solution"}</span>
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-sky-950 leading-snug">
                {currentAnswer.title || currentAnswer.question}
              </h2>
            </div>

            {/* Actions: Copy, Listen, Print, Save, Make Flashcards */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAnswer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-white text-slate-700 text-xs font-medium hover:bg-sky-50 hover:text-sky-900 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-sky-600" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                  isPlayingAudio
                    ? "bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-500/30"
                    : "border-sky-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-900 shadow-xs"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{isPlayingAudio ? "Stop Audio" : "Listen"}</span>
              </button>

              {/* Download Real PDF */}
              <button
                type="button"
                onClick={() =>
                  exportSingleNoteToPdf(
                    currentAnswer.question,
                    currentAnswer.modelAnswer,
                    currentAnswer.subject,
                    currentAnswer.marks
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-300 bg-sky-100 text-sky-900 text-xs font-bold hover:bg-sky-200 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Download formatted PDF file directly"
              >
                <Download className="w-3.5 h-3.5 text-sky-700" />
                <span>Download PDF</span>
              </button>

              {/* Download Word Document (.doc) */}
              <button
                type="button"
                onClick={() => {
                  const docHtml = `
                    <div class="box">
                      <strong>Subject:</strong> ${currentAnswer.subject} | <strong>Mark Allocation:</strong> ${currentAnswer.marks} Marks
                    </div>
                    <h2>Question:</h2>
                    <p><strong>${currentAnswer.question}</strong></p>
                    <hr/>
                    <h2>Model Academic Answer:</h2>
                    <div>${currentAnswer.modelAnswer.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>
                  `;
                  exportToWordDoc(currentAnswer.question.slice(0, 40), docHtml, currentAnswer.subject);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-white text-slate-700 text-xs font-bold hover:bg-sky-50 hover:text-sky-900 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Download formatted Microsoft Word document (.doc)"
              >
                <FileDown className="w-3.5 h-3.5 text-sky-600" />
                <span>Download Word</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onPrintPreview(
                    currentAnswer.question,
                    currentAnswer.modelAnswer,
                    currentAnswer.subject,
                    { marks: currentAnswer.marks }
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-white text-slate-700 text-xs font-medium hover:bg-sky-50 hover:text-sky-900 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-sky-600" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onGenerateFlashcards(currentAnswer.modelAnswer, currentAnswer.title || currentAnswer.question);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 text-xs font-medium hover:bg-indigo-100 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Generate active recall flashcards directly from this answer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Make Flashcards</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToNotes}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold hover:from-sky-400 hover:to-blue-500 transition-all cursor-pointer shadow-md shadow-sky-500/25 active:scale-95"
              >
                <Bookmark className="w-3.5 h-3.5 text-white" />
                <span>{saved ? "Saved to Notes!" : "Save Note"}</span>
              </button>
            </div>
          </div>

          {/* Automatic Note Save Confirmation Banner */}
          <div className="mx-5 sm:mx-8 mt-4 p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-sky-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Model answer generated & automatically uploaded to your Notes Library!</span>
            </div>
            <button
              type="button"
              onClick={handleSaveToNotes}
              className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer active:scale-95 duration-150"
            >
              {saved ? "Saved to Notes" : "Save to Notes"}
            </button>
          </div>

          {/* Model Answer Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-bold uppercase tracking-wider text-sky-700">
                  Exemplary Model Answer ({currentAnswer.marks} Marks)
                </span>
                <span className="text-slate-500">
                  {currentAnswer.modelAnswer.trim().split(/\s+/).length} words · ~{Math.max(1, Math.ceil(currentAnswer.modelAnswer.trim().split(/\s+/).length / 200))} min read
                </span>
              </div>
              <div className="markdown-academic bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                <MarkdownRenderer content={currentAnswer.modelAnswer} />
              </div>
            </div>

            {/* Collapsible Examiner Marking Rubric */}
            {currentAnswer.rubric && currentAnswer.rubric.length > 0 && (
              <div className="rounded-2xl border border-sky-200 bg-white shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowRubric(!showRubric)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-sky-900 hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-sky-600" />
                    <span>Chief Examiner Marking Rubric ({currentAnswer.rubric.length} Assessment Bands)</span>
                  </div>
                  {showRubric ? <ChevronUp className="w-4 h-4 text-sky-600" /> : <ChevronDown className="w-4 h-4 text-sky-600" />}
                </button>

                {showRubric && (
                  <div className="p-4 pt-0 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentAnswer.rubric.map((r, i) => (
                        <div key={i} className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sky-700">{r.marks}</span>
                            <span className="text-[11px] font-semibold text-slate-500">{r.objective}</span>
                          </div>
                          <p className="text-slate-800 leading-snug">{r.criteria}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                            <strong>How to secure:</strong> {r.howToEarn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Common Pitfalls & Mnemonic Hook */}
            {((currentAnswer.commonPitfalls && currentAnswer.commonPitfalls.length > 0) ||
              (currentAnswer.mnemonicHooks && currentAnswer.mnemonicHooks.length > 0)) && (
              <div className="rounded-2xl border border-sky-200 bg-white shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPitfalls(!showPitfalls)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Examiner Pitfalls & Memory Mnemonic</span>
                  </div>
                  {showPitfalls ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showPitfalls && (
                  <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {currentAnswer.commonPitfalls && currentAnswer.commonPitfalls.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                        <strong className="text-[11px] uppercase tracking-wider text-rose-700 block font-bold">
                          Common Pitfalls to Avoid:
                        </strong>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          {currentAnswer.commonPitfalls.map((pit, pIdx) => (
                            <li key={pIdx}>{pit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentAnswer.mnemonicHooks && currentAnswer.mnemonicHooks.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                        <strong className="text-[11px] uppercase tracking-wider text-amber-700 block font-bold">
                          Memory Mnemonic Hook:
                        </strong>
                        {currentAnswer.mnemonicHooks.map((m, mIdx) => (
                          <div key={mIdx} className="text-[11px] space-y-0.5">
                            <span className="font-bold text-amber-800">{m.acronym}</span> ({m.expansion})
                            <p className="text-amber-800/90">{m.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
