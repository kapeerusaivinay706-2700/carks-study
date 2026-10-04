import React, { useState, useEffect } from "react";
import { 
  Sparkles, FileText, CheckCircle2, 
  Layers, Clock, Compass, BookOpen, Brain, 
  ShieldCheck, ArrowRight, Award
} from "lucide-react";

interface SapphireDocumentLoadingSkeletonProps {
  fileName?: string;
  targetMarks?: string;
  progressStep?: string;
}

const STAGES = [
  {
    id: 1,
    title: "Document Parsing & Optical Analysis",
    description: "Scanning page hierarchy, extracting problem text & mathematical expressions",
    threshold: 25,
  },
  {
    id: 2,
    title: "Question Segmentation & Mark Calibration",
    description: "Identifying every problem node, assigning syllabus topics & mark weights",
    threshold: 55,
  },
  {
    id: 3,
    title: "Model Answer Synthesis",
    description: "Formulating exhaustive university-grade solutions with derivations & mechanisms",
    threshold: 82,
  },
  {
    id: 4,
    title: "Examiner Rubric & Assessment Objectives",
    description: "Generating AO1, AO2, and AO3 criteria and common student marking pitfalls",
    threshold: 98,
  },
];

const ACADEMIC_TIPS = [
  "Examiner Insight: Highest-scoring responses explicitly address each Assessment Objective (AO1 Knowledge, AO2 Application, AO3 Evaluation).",
  "Mark-Scheme Tip: For 2-mark questions, chief examiners look for 1 rigorous formal definition plus 1 exact formula or direct fact.",
  "Analytical Tip: 8-mark and 16-mark answers must include counter-arguments and a justified evaluative conclusion.",
  "Study Advantage: Once generated, all answers can be exported directly into PDF or Microsoft Word with one click.",
  "Auto-Organization: Solved questions are automatically linked to your personal Notes Library for revision.",
];

export const SapphireDocumentLoadingSkeleton: React.FC<SapphireDocumentLoadingSkeletonProps> = ({
  fileName = "Document",
  targetMarks = "auto",
  progressStep,
}) => {
  const [progress, setProgress] = useState(12);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Smooth simulated progress progression
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + Math.floor(Math.random() * 5) + 3;
        if (prev < 65) return prev + Math.floor(Math.random() * 4) + 2;
        if (prev < 85) return prev + Math.floor(Math.random() * 2) + 1;
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 600);

    const elapsedTimer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);

    const tipTimer = setInterval(() => {
      setCurrentTipIndex((idx) => (idx + 1) % ACADEMIC_TIPS.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(elapsedTimer);
      clearInterval(tipTimer);
    };
  }, []);

  const currentStage = STAGES.find((s) => progress <= s.threshold) || STAGES[STAGES.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Main Light Blue Status & Progress Card */}
      <div className="glass-sapphire-card rounded-3xl p-6 sm:p-8 border border-sky-300 relative overflow-hidden shadow-xl bg-white">
        {/* Subtle Ambient Radial Glowing Aura */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 border border-sky-300">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-400 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-500 rounded-full border-2 border-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-sky-700">
                    AI Examiner Engine
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    Active Synthesis
                  </span>
                </div>
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-sky-950 tracking-tight">
                  Processing & Solving Exam Document
                </h2>
              </div>
            </div>

            {/* Document and Marks Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-xs flex items-center gap-2 text-slate-700 shadow-xs">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span className="font-bold text-sky-950 truncate max-w-[180px]">{fileName}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-sky-100 border border-sky-300 text-xs flex items-center gap-1.5 text-sky-900 font-mono font-bold">
                <Award className="w-3.5 h-3.5 text-sky-700" />
                <span>{targetMarks === "auto" ? "Native Document Marks" : `${targetMarks} Marks Standard`}</span>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 text-xs text-slate-500 font-mono flex items-center gap-1 shadow-xs">
                <Clock className="w-3 h-3 text-sky-600" />
                <span>{elapsedSeconds}s elapsed</span>
              </div>
            </div>
          </div>

          {/* Large Light Blue Progress Bar with Live Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                {progressStep || currentStage.title}
              </span>
              <span className="font-mono font-bold text-sm text-sky-700">
                {progress}% Complete
              </span>
            </div>

            <div className="h-3 w-full bg-sky-100 rounded-full p-0.5 border border-sky-200 overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Academic Stages Pipeline (4 Stages) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {STAGES.map((stage) => {
              const isPassed = progress > stage.threshold;
              const isCurrent = currentStage.id === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? "bg-sky-50 border-sky-400 shadow-md shadow-sky-500/10 ring-1 ring-sky-300"
                      : isPassed
                      ? "bg-white border-emerald-300 text-slate-800"
                      : "bg-slate-50/70 border-slate-200 opacity-60 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-700">
                      Stage 0{stage.id}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-sky-950 mb-1 line-clamp-1">
                    {stage.title}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {stage.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rotating Academic Examiner Tips Ticker */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-slate-700 animate-in fade-in duration-200">
            <div className="p-1.5 rounded-lg bg-sky-200 text-sky-800 shrink-0 font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 font-sans leading-relaxed transition-all duration-300">
              <span className="font-bold text-sky-900 mr-1.5">Examiner Note:</span>
              <span>{ACADEMIC_TIPS[currentTipIndex]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Light Blue Shimmer Question Skeletons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
              Generating Academic Questions & Model Solutions...
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Calibrating examiner rubrics
          </span>
        </div>

        {/* Skeleton Card 1 */}
        <div className="glass-sapphire rounded-2xl border border-sky-200 p-5 sm:p-6 space-y-4 relative overflow-hidden animate-shimmer bg-white shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-20 bg-sky-200 rounded-full animate-pulse" />
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded hidden sm:block animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-20 bg-slate-100 rounded-xl" />
              <div className="h-7 w-7 bg-slate-100 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="h-3 w-32 bg-sky-300 rounded animate-pulse" />
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-3.5 w-11/12 bg-slate-200 rounded animate-pulse" />
              <div className="h-3.5 w-4/5 bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>

          <div className="border border-sky-200 rounded-xl overflow-hidden">
            <div className="h-8 bg-sky-100 border-b border-sky-200 flex items-center px-4 gap-4">
              <div className="h-3 w-16 bg-sky-300 rounded" />
              <div className="h-3 w-28 bg-sky-300 rounded" />
              <div className="h-3 w-48 bg-sky-200 rounded hidden sm:block" />
            </div>
            <div className="p-3 bg-white space-y-2">
              <div className="flex items-center gap-4">
                <div className="h-3 w-12 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-3 flex-1 bg-slate-100 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-12 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-3 flex-1 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Card 2 */}
        <div className="glass-sapphire rounded-2xl border border-sky-200 p-5 sm:p-6 space-y-4 relative overflow-hidden animate-shimmer opacity-85 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-24 bg-sky-200 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-slate-100 rounded-xl" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 space-y-2">
            <div className="h-3.5 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-3.5 w-10/12 bg-slate-100 rounded animate-pulse" />
            <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
