import React, { useState } from "react";
import { 
  X, Award, Flame, Target, BookOpen, Layers, Clock, 
  CheckCircle2, LogOut, Sparkles, TrendingUp, ShieldCheck, Edit3 
} from "lucide-react";
import { UserProfile } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  if (!isOpen) return null;

  const progress = user.progress || {
    level: 1,
    xp: 150,
    rankTitle: "Junior Scholar",
    questionsGenerated: 2,
    documentsAnalyzed: 1,
    flashcardsMastered: 4,
    notesCreated: 2,
    focusMinutesLogged: 50,
    streakDays: 3,
    lastActiveDate: new Date().toISOString().split("T")[0],
  };

  const nextLevelXp = progress.level * 250;
  const levelProgressPercent = Math.min(100, Math.round((progress.xp / nextLevelXp) * 100));

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateUser({
        ...user,
        name: editedName.trim(),
      });
      setIsEditingName(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Profile Banner with Sapphire Blue Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold font-editorial shadow-lg border-2 border-white/20">
              {user.name.slice(0, 1).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-2 py-1 text-sm rounded bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-2.5 py-1 text-xs bg-blue-500 hover:bg-blue-400 rounded text-white font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-2xl font-bold truncate">
                      {user.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-blue-200 hover:text-white"
                      title="Edit Name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs text-blue-100 font-mono flex items-center gap-2 mt-0.5">
                <span>{user.identifier}</span>
                <span aria-hidden="true" className="text-blue-300">·</span>
                <span className="text-blue-200 uppercase tracking-wider text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                  {progress.rankTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar inside banner */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-blue-200">
                <Award className="w-4 h-4 text-blue-300" />
                <span>Level {progress.level} Scholar</span>
              </span>
              <span className="font-mono text-blue-100">
                {progress.xp} / {nextLevelXp} XP ({levelProgressPercent}%)
              </span>
            </div>

            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-300 h-full transition-all duration-700 ease-out"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress Grid Metrics */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Academic Study Milestones & Progress</span>
            </h4>
            <span className="text-[11px] text-stone-600 font-mono">
              Auto-saved to Profile
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Questions Generated */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Questions Solved</span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {progress.questionsGenerated}
              </div>
            </div>

            {/* Documents Analyzed */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Documents Solved</span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {progress.documentsAnalyzed}
              </div>
            </div>

            {/* Flashcards Mastered */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Cards Mastered</span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {progress.flashcardsMastered}
              </div>
            </div>

            {/* Notes Created */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Study Notes</span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {progress.notesCreated}
              </div>
            </div>

            {/* Focus Minutes */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Focus Minutes</span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {progress.focusMinutesLogged}m
              </div>
            </div>

            {/* Streak Days */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Active Streak</span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {progress.streakDays} Days
              </div>
            </div>
          </div>

          {/* Scholar Tip */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Progress Incentive: </strong>
              Analyzing complete exam papers or drilling 16-mark essay evaluations awards +50 XP and helps you advance toward <strong>Master Academic</strong> status.
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Profile</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
