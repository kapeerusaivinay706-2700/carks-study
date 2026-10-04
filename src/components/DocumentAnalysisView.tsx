import React, { useState, useMemo } from "react";
import { 
  FileUp, FileText, CheckCircle2, XCircle, Printer, FileDown, 
  Sparkles, AlertCircle, Bookmark, Layers, Volume2, 
  ChevronDown, ChevronUp, Check, Copy, ArrowRight, BookOpen, Clock, Download,
  CheckSquare, Square, RefreshCw, Filter, BarChart3, ListFilter, SlidersHorizontal
} from "lucide-react";
import { DocumentAnalysisResult, DocumentQuestionAnswer, StudyNote } from "../types";
import { speechController } from "../utils/audio";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { exportDocumentAnalysisToPdf, exportToWordDoc, exportSingleNoteToPdf } from "../utils/pdfExport";
import { SapphireDocumentLoadingSkeleton } from "./SapphireDocumentLoadingSkeleton";

interface DocumentAnalysisViewProps {
  onSaveToNotes: (note: Partial<StudyNote>) => void;
  onGenerateFlashcards: (content: string, title: string) => void;
  onPrintPreview: (title: string, content: string, subject: string, metadata?: any) => void;
  onBatchPrintPreview: (notes: StudyNote[]) => void;
}

const MARK_DEPTH_OPTIONS = [
  {
    id: "auto",
    title: "Preserve Document Marks",
    desc: "Auto-detect exact marks as specified in your test/paper (2M, 4M, 8M, 10M, 16M...)",
    badge: "Auto Detect",
    icon: "🎯",
  },
  {
    id: "2",
    title: "2-Mark Precision",
    desc: "High-yield definitions, exact formulas, and core factual keywords",
    badge: "2 Marks",
    icon: "⚡",
  },
  {
    id: "4",
    title: "4-Mark Explanations",
    desc: "Sequential cause-and-effect mechanisms and step-by-step logic",
    badge: "4 Marks",
    icon: "💡",
  },
  {
    id: "8",
    title: "8-Mark Analysis",
    desc: "Multi-factor analytical breakdowns with contextual theory and links",
    badge: "8 Marks",
    icon: "📊",
  },
  {
    id: "10",
    title: "10-Mark Model Answers",
    desc: "Standard university and board examination answers with full rubrics",
    badge: "10 Marks",
    icon: "🏆",
  },
  {
    id: "16",
    title: "16-Mark Evaluative Essays",
    desc: "Exhaustive academic essays with thesis, counter-arguments, and synthesis",
    badge: "16 Marks",
    icon: "🌟",
  },
];

const STANDARD_MARKS = [2, 4, 8, 10, 16];

export const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({
  onSaveToNotes,
  onGenerateFlashcards,
  onPrintPreview,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedMarkDepth, setSelectedMarkDepth] = useState<string>("auto");
  const [autoSaveToNotes, setAutoSaveToNotes] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Completed Analysis Result
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [copiedQId, setCopiedQId] = useState<string | null>(null);
  const [savedQId, setSavedQId] = useState<string | null>(null);
  const [hasPromptedSave, setHasPromptedSave] = useState(false);
  const [batchSavedNotice, setBatchSavedNotice] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Marks-Wise Filter & Grouping State
  const [selectedMarkFilter, setSelectedMarkFilter] = useState<string>("all");
  const [groupByMarks, setGroupByMarks] = useState<boolean>(false);
  const [editingMarksForQId, setEditingMarksForQId] = useState<string | null>(null);

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg(null);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFileBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMsg(null);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFileBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze document with chosen Mark Allocation standard
  const handleStartAnalysis = async () => {
    if (!selectedFile || !fileBase64) {
      setErrorMsg("Please select a PDF or Word document (.docx/.doc) to upload.");
      return;
    }

    let fileName = selectedFile.name;
    let fileType: "pdf" | "docx" | "doc" | "txt" = "pdf";
    if (fileName.endsWith(".docx")) fileType = "docx";
    else if (fileName.endsWith(".doc")) fileType = "doc";
    else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) fileType = "txt";
    else fileType = "pdf";

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisProgressStep(
      selectedMarkDepth === "auto"
        ? "Extracting all questions with exact document mark schemes..."
        : `Calibrating all questions to ${selectedMarkDepth} Marks standard...`
    );

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64,
          fileName,
          fileType,
          customInstructions,
          targetMarks: selectedMarkDepth,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let extractedErr = "Failed to analyze document. Please check the file and try again.";
        if (typeof errorData.error === "string") {
          extractedErr = errorData.error;
        } else if (errorData.error?.message) {
          extractedErr = errorData.error.message;
        }
        throw new Error(extractedErr);
      }

      setAnalysisProgressStep("Finalizing marks-wise solutions and rubrics...");
      const data: DocumentAnalysisResult = await response.json();

      // Ensure every question has approved status and numeric marks
      if (data.questions) {
        const forcedM = selectedMarkDepth !== "auto" ? Number(selectedMarkDepth) : null;
        data.questions = data.questions.map((q, idx) => {
          let m = forcedM || Number(q.marks);
          if (isNaN(m) || m <= 0) m = 8;
          return {
            ...q,
            id: q.id || `doc-q-${idx}-${Date.now()}`,
            marks: m,
            isApprovedByUser: true,
          };
        });
      }

      setResult(data);
      // Auto-expand all questions for instant review
      setExpandedQuestionIds(new Set(data.questions.map((q) => q.id)));
      setHasPromptedSave(true);
      setSelectedMarkFilter("all");

      // AUTO-SAVE TO NOTES FEATURE:
      if (autoSaveToNotes && data.questions && data.questions.length > 0) {
        data.questions.forEach((q) => {
          onSaveToNotes({
            title: `[${q.marks}M] ${q.questionNumber || "Question"} - ${q.questionText.slice(0, 50)}`,
            subject: data.subject || "Document Study",
            marksAssociated: q.marks as any,
            content: `# ${q.questionNumber}: ${q.questionText}\n\n**Marks Allocated**: ${q.marks} Marks\n\n${q.modelAnswer}\n\n---\n\n### Examiner Marking Rubric\n${q.rubric?.map((r) => `- **${r.marks}** (${r.objective}): ${r.criteria} — *${r.howToEarn}*`).join("\n")}`,
            tags: [data.subject || "Document", `${q.marks}Marks`, "AutoSaved"],
          });
        });
        setBatchSavedNotice(true);
        setTimeout(() => setBatchSavedNotice(false), 4500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while analyzing the document.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressStep("");
    }
  };

  const toggleExpand = (qId: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleToggleApproval = (qId: string) => {
    if (!result) return;
    setResult({
      ...result,
      questions: result.questions.map((q) =>
        q.id === qId ? { ...q, isApprovedByUser: !q.isApprovedByUser } : q
      ),
    });
  };

  const handleToggleAll = (approve: boolean) => {
    if (!result) return;
    setResult({
      ...result,
      questions: result.questions.map((q) => ({
        ...q,
        isApprovedByUser: approve,
      })),
    });
  };

  const handleUpdateQuestionMarks = (qId: string, newMarks: number) => {
    if (!result) return;
    setResult({
      ...result,
      questions: result.questions.map((q) =>
        q.id === qId ? { ...q, marks: newMarks } : q
      ),
    });
    setEditingMarksForQId(null);
  };

  const handleSaveQuestionAsNote = (q: DocumentQuestionAnswer) => {
    onSaveToNotes({
      title: `[${q.marks}M] ${q.questionNumber} - ${q.questionText.slice(0, 50)}`,
      subject: result?.subject || "Document Study",
      marksAssociated: q.marks as any,
      content: `# ${q.questionNumber}: ${q.questionText}\n\n**Marks**: ${q.marks} Marks\n\n${q.modelAnswer}\n\n---\n\n### Examiner Rubric\n${q.rubric?.map((r) => `- **${r.marks}** (${r.objective}): ${r.criteria} — *${r.howToEarn}*`).join("\n")}`,
      tags: [result?.subject || "Document", `${q.marks}Marks`],
    });
    setSavedQId(q.id);
    setTimeout(() => setSavedQId(null), 2500);
  };

  const handleSaveAllApprovedNotes = () => {
    if (!result) return;
    const approved = result.questions.filter((q) => q.isApprovedByUser);
    if (approved.length === 0) return;

    approved.forEach((q) => {
      onSaveToNotes({
        title: `[${q.marks}M] ${q.questionNumber} - ${q.questionText.slice(0, 50)}`,
        subject: result.subject || "Document Study",
        marksAssociated: q.marks as any,
        content: `# ${q.questionNumber}: ${q.questionText}\n\n**Marks**: ${q.marks} Marks\n\n${q.modelAnswer}\n\n---\n\n### Examiner Rubric Breakdown\n${q.rubric?.map((r) => `- **${r.marks}** (${r.objective}): ${r.criteria} — *${r.howToEarn}*`).join("\n")}`,
        tags: [result.subject || "Document", `${q.marks}Marks`],
      });
    });

    setBatchSavedNotice(true);
    setTimeout(() => setBatchSavedNotice(false), 4000);
  };

  const handleCopyAnswer = (qId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQId(qId);
    setTimeout(() => setCopiedQId(null), 2000);
  };

  const handleDownloadRealPdf = () => {
    if (!result) return;
    const approved = result.questions.filter((q) => q.isApprovedByUser);
    if (approved.length === 0) {
      alert("Please select at least one question to download.");
      return;
    }

    try {
      exportDocumentAnalysisToPdf(
        result.documentTitle || "Exam Solutions",
        result.subject || "Academic Revision",
        result.fileName || "Document",
        approved
      );
      setDownloadSuccessNotice("PDF document (.pdf) downloaded successfully!");
      setTimeout(() => setDownloadSuccessNotice(null), 3500);
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate PDF: " + err.message);
    }
  };

  const handleDownloadWordDoc = () => {
    if (!result) return;
    const approved = result.questions.filter((q) => q.isApprovedByUser);
    if (approved.length === 0) {
      alert("Please select at least one question to download.");
      return;
    }

    let docHtml = `
      <div class="meta">
        <strong>Subject:</strong> ${result.subject} | <strong>Source Document:</strong> ${result.fileName} | <strong>Questions:</strong> ${approved.length}
      </div>
      <p><em>${result.overview || ""}</em></p>
      <hr/>
    `;

    approved.forEach((q, idx) => {
      docHtml += `
        <div class="${idx > 0 ? "page-break" : ""}">
          <h2>${q.questionNumber}: ${q.questionText} (${q.marks} Marks)</h2>
          <div class="box">
            <strong>Syllabus Topic:</strong> ${q.topic || "Core Curriculum"}<br/>
            <strong>Allocated Marks:</strong> ${q.marks} Marks
          </div>
          <h3>Model Academic Answer:</h3>
          <div>${q.modelAnswer.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>
          <br/>
          <h3>Examiner Rubric Breakdown:</h3>
          <table>
            <tr><th>Mark Allocation</th><th>Assessment Objective</th><th>Criteria & How to Secure Marks</th></tr>
            ${(q.rubric || [])
              .map(
                (r) =>
                  `<tr><td><strong>${r.marks}</strong></td><td>${r.objective}</td><td>${r.criteria} — <em>${r.howToEarn}</em></td></tr>`
              )
              .join("")}
          </table>
        </div>
      `;
    });

    try {
      exportToWordDoc(
        result.documentTitle || "Exam Solutions",
        docHtml,
        result.subject || "Academic Revision",
        result.fileName
      );
      setDownloadSuccessNotice("Word document (.doc) downloaded successfully!");
      setTimeout(() => setDownloadSuccessNotice(null), 3500);
    } catch (err: any) {
      console.error(err);
      alert("Failed to export Word document: " + err.message);
    }
  };

  const marksSummary = useMemo(() => {
    if (!result || !result.questions) return [];
    const map = new Map<number, number>();
    result.questions.forEach((q) => {
      const m = q.marks || 8;
      map.set(m, (map.get(m) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([marks, count]) => ({ marks, count }));
  }, [result]);

  const totalMarksSum = useMemo(() => {
    if (!result || !result.questions) return 0;
    return result.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }, [result]);

  const filteredQuestions = useMemo(() => {
    if (!result || !result.questions) return [];
    if (selectedMarkFilter === "all") return result.questions;
    const target = Number(selectedMarkFilter);
    return result.questions.filter((q) => q.marks === target);
  }, [result, selectedMarkFilter]);

  const groupedQuestions = useMemo(() => {
    if (!result || !result.questions) return [];
    const groups = new Map<number, DocumentQuestionAnswer[]>();
    
    filteredQuestions.forEach((q) => {
      const m = q.marks || 8;
      if (!groups.has(m)) groups.set(m, []);
      groups.get(m)!.push(q);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([marks, items]) => ({ marks, items }));
  }, [filteredQuestions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-xs">
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>Full Document Exam & Marks Solver</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-sky-950 tracking-tight">
          PDF & Document Question Solver
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Upload any PDF or Word question paper. Select your marks allocation standard or preserve document marks. Every single question is solved with examiner rubrics, download ready in PDF & Word.
        </p>
      </div>

      {/* Upload & Mark Selection Card (Light Blue) */}
      <div className="glass-sapphire-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden border border-sky-200">
        {/* Step 1: Document Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider">
              Step 1: Upload Question Paper or Notes (PDF, DOCX, TXT)
            </label>
            {selectedFile && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
              selectedFile
                ? "border-sky-400 bg-sky-50/80"
                : "border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50/80 cursor-pointer"
            }`}
          >
            <input
              type="file"
              id="doc-upload-input"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="doc-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-300 shadow-xs">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-sky-950">
                {selectedFile ? selectedFile.name : "Click to browse or drop your exam paper / PDF here"}
              </div>
              <div className="text-xs text-slate-500">
                Supports PDF question papers, Word documents (.docx/.doc), or syllabus notes
              </div>
            </label>
          </div>
        </div>

        {/* Step 2: Mark Depth Allocation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider">
              Step 2: Choose Marks Allocation Standard
            </label>
            <span className="text-[11px] text-sky-600 font-medium">
              Select specific mark weight or auto-detect from exam paper
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MARK_DEPTH_OPTIONS.map((opt) => {
              const isSelected = selectedMarkDepth === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedMarkDepth(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 border-sky-400 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-300"
                      : "bg-white border-sky-200 text-slate-700 hover:border-sky-400 hover:bg-sky-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{opt.icon}</span>
                      <span className={`font-bold text-xs sm:text-sm ${isSelected ? "text-white" : "text-sky-950"}`}>{opt.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isSelected
                          ? "bg-white text-sky-900"
                          : "bg-sky-100 text-sky-800 border border-sky-300"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? "text-sky-100" : "text-slate-500"}`}>
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Instructions & Auto-Save */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider mb-1.5">
              Custom Exam Focus or Board Standard (Optional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. CBSE / Cambridge IGCSE format, focus on numerical derivations, include diagrams..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-sky-200 bg-white text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-500 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider mb-1.5">
              Notes Section Integration
            </label>
            <button
              type="button"
              onClick={() => setAutoSaveToNotes(!autoSaveToNotes)}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer active:scale-95 shadow-xs ${
                autoSaveToNotes
                  ? "bg-sky-100 border-sky-300 text-sky-900 font-bold"
                  : "bg-white border-sky-200 text-slate-500 hover:text-slate-700"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[11px]">Auto-Save to Notes</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-200/80 text-sky-800">
                {autoSaveToNotes ? "Enabled" : "Off"}
              </span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedFile || isAnalyzing}
            onClick={handleStartAnalysis}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{analysisProgressStep || "Processing Entire Document..."}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-100" />
                <span>
                  Extract & Solve All Questions in Document (
                  {MARK_DEPTH_OPTIONS.find((m) => m.id === selectedMarkDepth)?.badge}
                  )
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Floating Success Notifications */}
      {batchSavedNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-sky-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <span className="font-bold">Saved to Notes Library!</span> All approved questions & answers have been added to your Notes section.
          </div>
        </div>
      )}

      {downloadSuccessNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-sky-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-600 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Download className="w-5 h-5 text-sky-200" />
          <div className="text-xs font-semibold">{downloadSuccessNotice}</div>
        </div>
      )}

      {/* SAPPHIRE GLOBAL LOADING SKELETON & PROGRESS INDICATOR */}
      {isAnalyzing && (
        <SapphireDocumentLoadingSkeleton
          fileName={selectedFile?.name || "Document"}
          targetMarks={selectedMarkDepth}
          progressStep={analysisProgressStep}
        />
      )}

      {/* ANALYSIS RESULT PRESENTATION */}
      {result && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Completion & Export Toolbar Card */}
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-400/40 relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest border border-white/30 backdrop-blur-xs">
                      {result.subject || "Academic"} · {result.questions.length} Questions Solved
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-300/30 text-white text-[11px] font-mono font-bold border border-white/30">
                      Σ {totalMarksSum} Marks Total
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                    {result.documentTitle || "Document Solutions Dossier"}
                  </h2>
                  <p className="text-xs text-sky-100 mt-1 max-w-2xl leading-relaxed">
                    {result.overview || "Every question has been fully extracted and solved with calibrated marks and examiner marking schemes."}
                  </p>
                </div>

                {/* Primary Export Actions: PDF, Word, Notes */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadRealPdf}
                    className="px-4 py-2.5 rounded-xl bg-white text-sky-950 font-bold text-xs hover:bg-sky-50 flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadWordDoc}
                    className="px-4 py-2.5 rounded-xl bg-sky-700/80 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 border border-sky-400/50 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5 text-sky-200" />
                    <span>Download Word (.doc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllApprovedNotes}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save All to Notes</span>
                  </button>
                </div>
              </div>

              {/* Marks Distribution Quick Breakdown Bar */}
              <div className="pt-2 border-t border-sky-400/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-sky-100 font-semibold">
                    <BarChart3 className="w-3.5 h-3.5 text-sky-200" />
                    <span>Marks Distribution Breakdown:</span>
                  </div>
                  <span className="text-[11px] text-sky-100/90 font-medium">Click any mark tier to filter</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMarkFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      selectedMarkFilter === "all"
                        ? "bg-white text-sky-950 shadow-md border border-white"
                        : "bg-sky-700/60 text-sky-100 hover:bg-sky-700 border border-sky-400/40"
                    }`}
                  >
                    All Marks ({result.questions.length}Q)
                  </button>

                  {marksSummary.map((m) => (
                    <button
                      key={m.marks}
                      type="button"
                      onClick={() => setSelectedMarkFilter(selectedMarkFilter === String(m.marks) ? "all" : String(m.marks))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        selectedMarkFilter === String(m.marks)
                          ? "bg-white text-sky-950 shadow-md border border-white font-bold"
                          : "bg-sky-700/60 text-sky-100 hover:bg-sky-700 border border-sky-400/40"
                      }`}
                    >
                      <span>{m.marks} Marks</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${selectedMarkFilter === String(m.marks) ? "bg-sky-100 text-sky-900" : "bg-sky-800 text-white"}`}>
                        {m.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Prompt Alert */}
              {hasPromptedSave && (
                <div className="bg-sky-800/60 border border-sky-400/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>
                      Would you like to store these questions in your private <strong>Notes Section</strong> for future revision?
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAllApprovedNotes}
                      className="px-3 py-1.5 rounded-lg bg-white text-sky-900 font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Save to Notes Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasPromptedSave(false)}
                      className="text-xs text-sky-100 hover:text-white px-2 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question List Control Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-sky-950">
                Showing {filteredQuestions.length} of {result.questions.length} questions
                {selectedMarkFilter !== "all" && ` (${selectedMarkFilter} Marks only)`}
              </span>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-sky-200 text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => setGroupByMarks(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    !groupByMarks ? "bg-sky-600 text-white font-bold" : "text-slate-600 hover:text-sky-900"
                  }`}
                >
                  Sequential List
                </button>
                <button
                  type="button"
                  onClick={() => setGroupByMarks(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    groupByMarks ? "bg-sky-600 text-white font-bold" : "text-slate-600 hover:text-sky-900"
                  }`}
                >
                  Group by Marks
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                className="text-sky-600 hover:text-sky-800 font-bold cursor-pointer active:scale-95"
              >
                Include All
              </button>
              <span className="text-sky-300">|</span>
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* List of Questions with answers and rubrics */}
          {groupByMarks ? (
            <div className="space-y-8">
              {groupedQuestions.map((group) => (
                <div key={group.marks} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-200 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-bold text-xs shadow-sm">
                        {group.marks} Marks Section
                      </span>
                      <h3 className="font-editorial text-lg font-bold text-sky-950">
                        {group.marks <= 2
                          ? "Definitions & Core Formulas"
                          : group.marks <= 4
                          ? "Explanatory Mechanisms & Step-by-Step Logic"
                          : group.marks <= 8
                          ? "Analytical Reasoning & Multi-Factor Evaluations"
                          : group.marks <= 10
                          ? "University Standard Exam Problems"
                          : "Exhaustive Academic Essays"}
                      </h3>
                    </div>
                    <span className="text-xs text-sky-700 font-mono font-bold">
                      {group.items.length} {group.items.length === 1 ? "question" : "questions"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {group.items.map((q, idx) => renderQuestionCard(q, idx))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => renderQuestionCard(q, idx))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderQuestionCard(q: DocumentQuestionAnswer, idx: number) {
    const isExpanded = expandedQuestionIds.has(q.id);
    const isSaved = savedQId === q.id;
    const isCopied = copiedQId === q.id;
    const isEditingMarks = editingMarksForQId === q.id;

    return (
      <div
        key={q.id || idx}
        className={`glass-sapphire rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
          q.isApprovedByUser
            ? "border-sky-200 hover:border-sky-400"
            : "border-slate-200 opacity-60 bg-slate-50"
        }`}
      >
        {/* Question Header Bar */}
        <div className="p-4 sm:p-5 flex items-start justify-between gap-3 bg-sky-50/80 border-b border-sky-200">
          <div className="flex items-start gap-3 flex-1">
            <button
              type="button"
              onClick={() => handleToggleApproval(q.id)}
              className="mt-0.5 text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
            >
              {q.isApprovedByUser ? (
                <CheckSquare className="w-5 h-5 text-sky-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5 relative">
                {/* Marks Badge */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditingMarksForQId(isEditingMarks ? null : q.id)}
                    title="Click to adjust marks for this question"
                    className="px-2.5 py-0.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>{q.marks} Marks</span>
                    <ChevronDown className="w-3 h-3 text-sky-200" />
                  </button>

                  {isEditingMarks && (
                    <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-sky-300 rounded-xl p-1.5 shadow-xl flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                      {STANDARD_MARKS.map((mVal) => (
                        <button
                          key={mVal}
                          type="button"
                          onClick={() => handleUpdateQuestionMarks(q.id, mVal)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            q.marks === mVal
                              ? "bg-sky-600 text-white"
                              : "bg-sky-50 text-slate-700 hover:bg-sky-100"
                          }`}
                        >
                          {mVal}M
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-xs font-bold text-sky-900">
                  {q.questionNumber || `Question ${idx + 1}`}
                </span>
                {q.topic && (
                  <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-sky-200 font-medium">
                    {q.topic}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-sky-950 leading-snug">
                {q.questionText}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Save to Notes */}
            <button
              type="button"
              onClick={() => handleSaveQuestionAsNote(q)}
              title="Save this question to Notes"
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                isSaved
                  ? "bg-sky-100 border-sky-300 text-sky-900"
                  : "bg-white border-sky-200 text-slate-700 hover:bg-sky-50 hover:text-sky-900"
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-sky-600" />}
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save Note"}</span>
            </button>

            {/* Expand / Collapse */}
            <button
              type="button"
              onClick={() => toggleExpand(q.id)}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-900 hover:bg-sky-100 transition-all cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 text-sky-600" /> : <ChevronDown className="w-4 h-4 text-sky-600" />}
            </button>
          </div>
        </div>

        {/* Expanded Body: Model Answer & Rubric */}
        {isExpanded && (
          <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200 bg-white">
            {/* Model Answer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Exemplary Academic Model Answer ({q.marks} Marks Standard)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speechController.speak(q.modelAnswer)}
                    className="text-xs text-slate-600 hover:text-sky-900 flex items-center gap-1 p-1 hover:bg-sky-50 rounded cursor-pointer font-medium"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden sm:inline">Listen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyAnswer(q.id, q.modelAnswer)}
                    className="text-xs text-slate-600 hover:text-sky-900 flex items-center gap-1 p-1 hover:bg-sky-50 rounded cursor-pointer font-medium"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-600" />}
                    <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="bg-sky-50/40 rounded-2xl p-4 sm:p-5 border border-sky-100">
                <MarkdownRenderer content={q.modelAnswer} />
              </div>
            </div>

            {/* Examiner Marking Rubric */}
            {q.rubric && q.rubric.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-2">
                  Examiner Marking Scheme & Assessment Objectives ({q.marks} Marks Total)
                </div>
                <div className="overflow-x-auto rounded-xl border border-sky-200 shadow-xs">
                  <table className="min-w-full text-xs text-left divide-y divide-sky-200">
                    <thead className="bg-sky-100 text-sky-900 font-bold">
                      <tr>
                        <th className="px-3 py-2 w-28">Marks</th>
                        <th className="px-3 py-2 w-44">Objective</th>
                        <th className="px-3 py-2">Criteria & How to Earn Full Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 bg-white">
                      {q.rubric.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-sky-50/50">
                          <td className="px-3 py-2 font-bold text-sky-700">{r.marks}</td>
                          <td className="px-3 py-2 text-slate-900 font-semibold">{r.objective}</td>
                          <td className="px-3 py-2 text-slate-700 leading-relaxed">
                            {r.criteria} — <em className="text-sky-700 font-medium">{r.howToEarn}</em>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
};
