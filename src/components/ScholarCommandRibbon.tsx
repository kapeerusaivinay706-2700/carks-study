import React from "react";
import { 
  Sparkles, Award, Flame, BookOpen, Layers, 
  Clock, ArrowUpRight, Compass, CheckCircle2 
} from "lucide-react";
import { UserProfile } from "../types";
import { ActiveTab } from "./Navbar";

interface ScholarCommandRibbonProps {
  user: UserProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
  flashcardsCount: number;
  onOpenProfile: () => void;
}

export const ScholarCommandRibbon: React.FC<ScholarCommandRibbonProps> = ({
  user,
  activeTab,
  setActiveTab,
  notesCount,
  flashcardsCount,
  onOpenProfile,
}) => {
  const progress = user.progress || {
    level: 1,
    xp: 100,
    rankTitle: "Junior Scholar",
    questionsGenerated: 0,
    streakDays: 1,
  };

  const nextLevelXp = progress.level * 250;
  const currentLevelBaseXp = (progress.level - 1) * 250;
  const xpInCurrentLevel = Math.max(0, progress.xp - currentLevelBaseXp);
  const xpRequiredForNext = 250;
  const percentProgress = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNext) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 relative z-10 animate-in fade-in duration-300">
      <div className="glass-sapphire rounded-3xl p-5 sm:p-6 border border-sky-200/90 relative overflow-hidden transition-all duration-300 shadow-lg shadow-sky-900/5">
        {/* Subtle decorative inner corner aura */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-sky-300/30 blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Scholar Identity & Academic Greeting */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-sky-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>Scholar Study Portal</span>
              <span aria-hidden="true" className="text-sky-300">·</span>
              <span className="text-sky-800">{progress.rankTitle}</span>
              <span aria-hidden="true" className="text-sky-300">·</span>
              <span className="text-amber-600 flex items-center gap-1 font-mono font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {progress.streakDays || 1}d Streak
              </span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-sky-950 tracking-tight flex items-center gap-2">
              <span>{user.name}</span>
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-xs font-sans font-bold text-sky-700 hover:text-sky-900 bg-sky-100 hover:bg-sky-200 px-3 py-1 rounded-full border border-sky-300 transition-all flex items-center gap-1 cursor-pointer"
                title="View Scholar Profile & Analytics"
              >
                <span>Level {progress.level}</span>
                <ArrowUpRight className="w-3 h-3 text-sky-600" />
              </button>
            </h1>

            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Synthesize mark-allocated model answers, solve full exam papers, and curate your private academic library.
            </p>
          </div>

          {/* Right: XP Progress & Quick Metrics Cards */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
            {/* Level XP Widget */}
            <div
              onClick={onOpenProfile}
              className="bg-white/90 hover:bg-white border border-sky-200 hover:border-sky-400 rounded-2xl p-3.5 min-w-[200px] flex-1 sm:flex-none transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>Scholar XP</span>
                </span>
                <span className="font-mono text-sky-700 font-bold">
                  {progress.xp} <span className="text-[10px] text-slate-500 font-normal">/ {nextLevelXp}</span>
                </span>
              </div>

              {/* Progress bar with Light Blue gradient fill */}
              <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden p-0.5 border border-sky-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 shadow-sm transition-all duration-500"
                  style={{ width: `${percentProgress}%` }}
                />
              </div>

              <div className="text-[10px] text-sky-600 mt-1.5 flex items-center justify-between">
                <span>Next Tier Unlock</span>
                <span className="font-bold">{percentProgress}%</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("document_analysis")}
                className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-950 font-bold text-xs border border-sky-200 hover:border-sky-400 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Upload Paper</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notes_library")}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Notes ({notesCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
