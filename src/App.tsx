import React, { useState, useEffect } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { ScholarCommandRibbon } from "./components/ScholarCommandRibbon";
import { ParallaxSapphireBackground } from "./components/ParallaxSapphireBackground";
import { ExamAnswerCreator } from "./components/ExamAnswerCreator";
import { DocumentAnalysisView } from "./components/DocumentAnalysisView";
import { StudyAssistantChat } from "./components/StudyAssistantChat";
import { NotesCreatorAndLibrary } from "./components/NotesCreatorAndLibrary";
import { FlashcardsView } from "./components/FlashcardsView";
import { StudyPlannerView } from "./components/StudyPlannerView";
import { PrintDocumentModal } from "./components/PrintDocumentModal";
import { LoginProgressGateway } from "./components/LoginProgressGateway";
import { UserProfileModal } from "./components/UserProfileModal";
import { FloatingAssistantBot } from "./components/FloatingAssistantBot";
import { 
  StudyNote, ExamAnswerResult, Flashcard, PlannerTask, 
  StudyHabit, ReflectionEntry, UserProfile, UserProgress 
} from "./types";
import { 
  getSavedNotes, saveNote, deleteNote, 
  getSavedFlashcards, saveFlashcards, 
  getSavedExamAnswers
} from "./utils/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("exam_answers");

  // User Profile & Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Persistent States
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [examAnswers, setExamAnswers] = useState<ExamAnswerResult[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>([]);
  const [studyHabits, setStudyHabits] = useState<StudyHabit[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [singlePrintDoc, setSinglePrintDoc] = useState<{
    title: string;
    content: string;
    subject: string;
    metadata?: any;
  } | null>(null);
  const [batchPrintDocs, setBatchPrintDocs] = useState<StudyNote[] | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    setNotes(getSavedNotes());
    setFlashcards(getSavedFlashcards());
    setExamAnswers(getSavedExamAnswers());

    // Check for saved user session
    try {
      const savedUser = localStorage.getItem("carks_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to parse user session:", err);
    }

    // Load planner & habits strictly from user storage (no sample clutter)
    try {
      const savedTasks = localStorage.getItem("carks_tasks");
      setPlannerTasks(savedTasks ? JSON.parse(savedTasks) : []);

      const savedHabits = localStorage.getItem("carks_habits");
      setStudyHabits(savedHabits ? JSON.parse(savedHabits) : []);

      const savedRefs = localStorage.getItem("carks_reflections");
      setReflections(savedRefs ? JSON.parse(savedRefs) : []);
    } catch {
      setPlannerTasks([]);
      setStudyHabits([]);
      setReflections([]);
    }
  }, []);

  // Authentication Handlers
  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem("carks_user", JSON.stringify(newUser));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("carks_user");
  };

  // User Progress Updater helper
  const addProgress = (xpDelta: number, metricsUpdate?: Partial<UserProgress>) => {
    if (!user) return;
    const currentProg: UserProgress = user.progress || {
      level: 1,
      xp: 100,
      rankTitle: "Junior Scholar",
      questionsGenerated: 1,
      documentsAnalyzed: 0,
      flashcardsMastered: 0,
      notesCreated: 0,
      focusMinutesLogged: 25,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
    };

    const newXp = currentProg.xp + xpDelta;
    const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);
    let newRankTitle = "Junior Scholar";
    if (newLevel >= 4) newRankTitle = "Master Academic";
    else if (newLevel >= 3) newRankTitle = "Senior Researcher";
    else if (newLevel >= 2) newRankTitle = "Honor Scholar";

    const updatedProg: UserProgress = {
      ...currentProg,
      ...metricsUpdate,
      xp: newXp,
      level: newLevel,
      rankTitle: newRankTitle,
      lastActiveDate: new Date().toISOString().split("T")[0],
    };

    const updatedUser: UserProfile = {
      ...user,
      progress: updatedProg,
    };

    setUser(updatedUser);
    localStorage.setItem("carks_user", JSON.stringify(updatedUser));
  };

  // Sync tasks, habits, reflections to storage
  const handleUpdateTasks = (newTasks: PlannerTask[]) => {
    setPlannerTasks(newTasks);
    localStorage.setItem("carks_tasks", JSON.stringify(newTasks));
  };

  const handleUpdateHabits = (newHabits: StudyHabit[]) => {
    setStudyHabits(newHabits);
    localStorage.setItem("carks_habits", JSON.stringify(newHabits));
  };

  const handleAddReflection = (newRef: ReflectionEntry) => {
    const updated = [newRef, ...reflections];
    setReflections(updated);
    localStorage.setItem("carks_reflections", JSON.stringify(updated));
    addProgress(20);
  };

  // Notes operations
  const handleSaveNote = (noteToSave: Partial<StudyNote>) => {
    const fullNote: StudyNote = {
      id: noteToSave.id || `note-${Date.now()}`,
      title: noteToSave.title || "Untitled Note",
      subject: noteToSave.subject || "General",
      content: noteToSave.content || "",
      tags: noteToSave.tags || [],
      isStarred: noteToSave.isStarred || false,
      marksAssociated: noteToSave.marksAssociated,
      wordCount: (noteToSave.content || "").trim().split(/\s+/).length,
      readingTimeMinutes: Math.max(1, Math.ceil((noteToSave.content || "").trim().split(/\s+/).length / 200)),
      createdAt: noteToSave.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveNote(fullNote);
    setNotes(updated);
    if (user) {
      addProgress(15, { notesCreated: (user.progress?.notesCreated || 0) + 1 });
    }
  };

  const handleDeleteNote = (id: string) => {
    const updated = deleteNote(id);
    setNotes(updated);
  };

  // Flashcards operations
  const handleUpdateFlashcards = (cards: Flashcard[]) => {
    setFlashcards(cards);
    saveFlashcards(cards);
    const masteredNow = cards.filter((c) => c.masteryStatus === "mastered").length;
    if (user && masteredNow > (user.progress?.flashcardsMastered || 0)) {
      addProgress(20, { flashcardsMastered: masteredNow });
    }
  };

  // Generate flashcards from note or content via backend API
  const handleGenerateFlashcardsFromText = async (content: string, title: string) => {
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });

      if (!res.ok) throw new Error("Failed to generate cards");
      const data = await res.json();
      if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        const mapped: Flashcard[] = data.flashcards.map((c: any, i: number) => ({
          id: `fc-gen-${Date.now()}-${i}`,
          front: c.front || "Concept Question",
          back: c.back || "Answer Explanation",
          mnemonic: c.mnemonic,
          difficulty: c.difficulty || "Intermediate",
          subtopic: c.subtopic || title || "Study Concept",
          masteryStatus: "new",
          reviewCount: 0,
        }));

        const merged = [...mapped, ...flashcards];
        handleUpdateFlashcards(merged);
        setActiveTab("flashcards");
        addProgress(25);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate flashcards: " + err.message);
    }
  };

  // Print handlers
  const handleSinglePrint = (title: string, content: string, subject: string, metadata?: any) => {
    setBatchPrintDocs(null);
    setSinglePrintDoc({ title, content, subject, metadata });
    setIsPrintModalOpen(true);
  };

  const handleBatchPrint = (selectedNotes: StudyNote[]) => {
    setSinglePrintDoc(null);
    setBatchPrintDocs(selectedNotes);
    setIsPrintModalOpen(true);
  };

  // If user is not logged in, show Login & Progress Gateway first!
  if (!user) {
    return <LoginProgressGateway onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f7ff] text-slate-800 font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Parallax Sapphire Background */}
      <ParallaxSapphireBackground />

      {/* Glassmorphic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notesCount={notes.length}
        flashcardsCount={flashcards.length}
        user={user}
        onOpenAuth={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Scholar Academic Command Ribbon */}
      <ScholarCommandRibbon
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notesCount={notes.length}
        flashcardsCount={flashcards.length}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area with Realistic Scroll Transition */}
      <main className="flex-1 relative z-10 scroll-section-enter">
        {activeTab === "exam_answers" && (
          <ExamAnswerCreator
            onSaveToNotes={handleSaveNote}
            onGenerateFlashcards={handleGenerateFlashcardsFromText}
            onPrintPreview={handleSinglePrint}
            initialAnswer={null}
          />
        )}

        {activeTab === "document_analysis" && (
          <DocumentAnalysisView
            onSaveToNotes={handleSaveNote}
            onGenerateFlashcards={handleGenerateFlashcardsFromText}
            onPrintPreview={handleSinglePrint}
            onBatchPrintPreview={handleBatchPrint}
          />
        )}

        {activeTab === "study_chat" && (
          <StudyAssistantChat onSaveToNotes={handleSaveNote} />
        )}

        {activeTab === "notes_library" && (
          <NotesCreatorAndLibrary
            notes={notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onPrintPreview={handleSinglePrint}
            onBatchPrintPreview={handleBatchPrint}
            onGenerateFlashcards={handleGenerateFlashcardsFromText}
          />
        )}

        {activeTab === "flashcards" && (
          <FlashcardsView
            flashcards={flashcards}
            onUpdateFlashcards={handleUpdateFlashcards}
            onGenerateFromTopic={async (topic, subj) => {
              await handleGenerateFlashcardsFromText(topic, `${subj || "Academic"}: ${topic}`);
            }}
          />
        )}

        {activeTab === "planner" && (
          <StudyPlannerView
            tasks={plannerTasks}
            onUpdateTasks={handleUpdateTasks}
            habits={studyHabits}
            onUpdateHabits={handleUpdateHabits}
            reflections={reflections}
            onAddReflection={handleAddReflection}
          />
        )}
      </main>

      {/* Floating AI Assistant Chatbot (Always accessible everywhere) */}
      <FloatingAssistantBot onSaveToNotes={handleSaveNote} />

      {/* User Progress Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          localStorage.setItem("carks_user", JSON.stringify(updated));
        }}
        onSignOut={handleSignOut}
      />

      {/* Print / PDF Export Modal */}
      <PrintDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        singleDoc={singlePrintDoc}
        batchDocs={batchPrintDocs}
      />

      {/* Light Blue Glassmorphic Academic Footer */}
      <footer className="no-print border-t border-sky-200 glass-sapphire py-8 mt-16 text-center text-xs text-slate-600 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-sky-950 text-sm">Carks</span>
            <span className="text-sky-400">·</span>
            <span className="text-slate-600">Light Blue Academic Portal & Exam Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Scholar Level {user?.progress?.level || 1} ({user?.progress?.rankTitle || "Junior Scholar"})</span>
            <span className="text-sky-400">·</span>
            <span className="text-sky-700 font-mono font-bold">{user?.progress?.xp || 0} XP Earned</span>
            <span className="text-sky-400">·</span>
            <span className="text-slate-500">PDF & Word Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
