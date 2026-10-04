import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  Layers, Rotate3d, CheckCircle2, XCircle, Sparkles, 
  Shuffle, ArrowLeft, ArrowRight, Lightbulb, Trophy, RotateCcw, Plus 
} from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  onUpdateFlashcards: (cards: Flashcard[]) => void;
  onGenerateFromTopic: (topic: string, subject?: string) => Promise<void>;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  onUpdateFlashcards,
  onGenerateFromTopic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [filterMastery, setFilterMastery] = useState<string>("All");

  // Generator modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genSubject, setGenSubject] = useState("Economics");
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // Filtered Deck
  const filteredCards = flashcards.filter((card) => {
    const matchDiff = filterDifficulty === "All" || card.difficulty === filterDifficulty;
    const matchMastery = filterMastery === "All" || card.masteryStatus === filterMastery;
    return matchDiff && matchMastery;
  });

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  // Stats
  const masteredCount = flashcards.filter((c) => c.masteryStatus === "mastered").length;
  const learningCount = flashcards.filter((c) => c.masteryStatus === "learning").length;
  const newCount = flashcards.filter((c) => c.masteryStatus === "new").length;

  // Flip card
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Next / Prev
  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed deck!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Mastery updates
  const handleMarkStatus = (status: "learning" | "mastered") => {
    if (!currentCard) return;

    const updated = flashcards.map((c) =>
      c.id === currentCard.id
        ? {
            ...c,
            masteryStatus: status,
            reviewCount: c.reviewCount + 1,
          }
        : c
    );

    onUpdateFlashcards(updated);
    handleNext();
  };

  // Shuffle Deck
  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    onUpdateFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Reset Deck Progress
  const handleResetProgress = () => {
    const reset = flashcards.map((c) => ({
      ...c,
      masteryStatus: "new" as const,
      reviewCount: 0,
    }));
    onUpdateFlashcards(reset);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // AI Generator Submit
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setIsGeneratingCards(true);
    try {
      await onGenerateFromTopic(genTopic, genSubject);
      setShowGenerateModal(false);
      setGenTopic("");
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      alert(err.message || "Failed to generate flashcards.");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Spaced Repetition & Cognitive Recall</span>
          </div>
          <h1 className="text-3xl font-editorial font-bold text-stone-900 tracking-tight">
            Active Recall Flashcards
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Test key derivations, exam distinctions, and mechanisms with interactive 3D cards and mastery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Flashcard Deck</span>
          </button>
        </div>
      </div>

      {/* Mastery Progress Bar & Stats */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              {masteredCount} Mastered
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
              {learningCount} Learning
            </span>
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              {newCount} Unseen
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-600 font-mono">
            <span>Total Cards: {flashcards.length}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleResetProgress}
              className="text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Deck</span>
            </button>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${flashcards.length ? (masteredCount / flashcards.length) * 100 : 0}%` }}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${flashcards.length ? (learningCount / flashcards.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard 3D Stage */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-6">
          {/* Card Meta Indicator */}
          <div className="flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium px-2 py-0.5 bg-stone-100 rounded text-stone-800">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              <span className="text-stone-600 font-medium">
                {currentCard.subtopic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentCard.difficulty === "Advanced"
                  ? "bg-rose-100 text-rose-800"
                  : currentCard.difficulty === "Intermediate"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {currentCard.difficulty}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                currentCard.masteryStatus === "mastered"
                  ? "bg-emerald-100 text-emerald-800"
                  : currentCard.masteryStatus === "learning"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-stone-100 text-stone-600"
              }`}>
                {currentCard.masteryStatus === "mastered" ? "Mastered" : currentCard.masteryStatus === "learning" ? "Reviewing" : "New"}
              </span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="relative w-full h-[360px] sm:h-[400px] cursor-pointer perspective-1000 select-none"
          >
            <div
              className={`w-full h-full relative transition-transform duration-500 preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of Card (Question) */}
              <div className="absolute inset-0 backface-hidden bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col justify-between hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span className="uppercase tracking-wider font-semibold">Prompt / Question</span>
                  <span className="flex items-center gap-1 text-purple-600 font-medium">
                    <Rotate3d className="w-4 h-4" />
                    <span>Click card to reveal answer</span>
                  </span>
                </div>

                <div className="my-auto text-center px-4">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="flex items-center justify-center text-xs text-stone-600">
                  <span>Reviewed {currentCard.reviewCount} times</span>
                </div>
              </div>

              {/* Back of Card (Answer + Mnemonic) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-stone-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="uppercase tracking-wider font-semibold text-purple-300">Model Academic Answer</span>
                  <span className="flex items-center gap-1 text-stone-400">
                    <Rotate3d className="w-4 h-4" />
                    <span>Click to flip back</span>
                  </span>
                </div>

                <div className="my-auto space-y-4 px-2">
                  <p className="text-base sm:text-lg leading-relaxed text-stone-100 font-medium">
                    {currentCard.back}
                  </p>

                  {currentCard.mnemonic && (
                    <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 flex items-start gap-2.5 text-xs text-amber-200">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300">Memory Hook: </strong>
                        {currentCard.mnemonic}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                  <span>{currentCard.subtopic}</span>
                  <span className="text-[11px] opacity-75">Spaced repetition active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Feedback Buttons (Learning vs Mastered) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleMarkStatus("learning")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                <XCircle className="w-4 h-4 text-amber-600" />
                <span>Need Review</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkStatus("mastered")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mastered</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === filteredCards.length - 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-blue-500 mx-auto animate-realistic-float" />
          <h3 className="font-editorial text-2xl font-bold text-slate-900 mb-1">
            Your Flashcards Deck is Ready
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Generate active recall flashcards directly from your exam answers, solve a document, or generate a fresh deck on any academic topic.
          </p>
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 active:scale-95 duration-150 cursor-pointer"
          >
            Generate Flashcard Deck
          </button>
        </div>
      )}

      {/* AI Deck Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              Generate Active Recall Flashcards
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter any syllabus topic or paste summary text to generate high-yield active recall question cards with memory mnemonics.
            </p>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  placeholder="e.g. Economics, Biology, Physics..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Topic or Key Concepts
                </label>
                <textarea
                  rows={4}
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Enzyme Kinetics, Lineweaver-Burk plots, Michaelis-Menten derivation..."
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-stone-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGeneratingCards || !genTopic.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-medium hover:bg-purple-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingCards ? "Generating 6-10 Cards..." : "Create Deck"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
