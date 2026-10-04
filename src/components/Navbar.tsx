import React from "react";
import { GraduationCap, BookOpen, Bot, Layers, CalendarCheck, Sparkles, FileUp, User, LogOut } from "lucide-react";
import { UserProfile } from "../types";

export type ActiveTab = "exam_answers" | "document_analysis" | "study_chat" | "notes_library" | "flashcards" | "planner";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
  flashcardsCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notesCount,
  flashcardsCount,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-sapphire-nav border-b border-sky-200/80 shadow-md shadow-sky-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab("exam_answers")}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-sky-500/30 border border-sky-300/40">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-sky-950 block leading-tight">
                Carks
              </span>
              <span className="text-[11px] text-sky-600 font-semibold hidden sm:block leading-none">
                Light Blue Academic Portal
              </span>
            </div>
          </div>

          {/* Navigation Items in Light Blue Frosted Track */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1 bg-sky-100/70 p-1.5 rounded-2xl border border-sky-200">
            <button
              onClick={() => setActiveTab("exam_answers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "exam_answers"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300"
                  : "text-slate-700 hover:text-sky-950 hover:bg-white/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exam Answers</span>
            </button>

            <button
              onClick={() => setActiveTab("document_analysis")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "document_analysis"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300"
                  : "text-slate-700 hover:text-sky-950 hover:bg-white/60"
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Document Solver</span>
            </button>

            <button
              onClick={() => setActiveTab("study_chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "study_chat"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300"
                  : "text-slate-700 hover:text-sky-950 hover:bg-white/60"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab("notes_library")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "notes_library"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300"
                  : "text-slate-700 hover:text-sky-950 hover:bg-white/60"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Notes</span>
              {notesCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-200/80 px-1.5 py-0.2 rounded-full">
                  {notesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("flashcards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "flashcards"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300"
                  : "text-slate-700 hover:text-sky-950 hover:bg-white/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 duration-150 ${
                activeTab === "planner"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-300"
                  : "text-slate-700 hover:text-sky-950 hover:bg-white/60"
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Planner & Routine</span>
            </button>
          </nav>

          {/* User Profile / Status pill */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-sky-200 hover:border-sky-400 text-xs font-medium text-slate-800 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-xs">
                    {user.name ? user.name.slice(0, 1) : "S"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-sky-950 leading-tight truncate max-w-[100px]">
                      {user.name || "Scholar"}
                    </div>
                    <div className="text-[10px] text-sky-600 leading-none">
                      Lvl {user.progress?.level || 1} · {user.progress?.xp || 0} XP
                    </div>
                  </div>
                </button>

                <button
                  onClick={onSignOut}
                  title="Sign out of student account"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Scholar Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
