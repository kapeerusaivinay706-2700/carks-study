import React, { useState, useMemo } from "react";
import { 
  BookOpen, Plus, Search, Star, FileDown, Trash2, Edit3, 
  Sparkles, CheckSquare, Square, Eye, Code, Clock, FileText, 
  Bold, Italic, Heading1, Heading2, Table, List, Quote, Download
} from "lucide-react";
import { StudyNote } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { exportSingleNoteToPdf, exportToWordDoc } from "../utils/pdfExport";

interface NotesCreatorAndLibraryProps {
  notes: StudyNote[];
  onSaveNote: (note: StudyNote) => void;
  onDeleteNote: (id: string) => void;
  onPrintPreview: (title: string, content: string, subject: string, metadata?: any) => void;
  onBatchPrintPreview: (selectedNotes: StudyNote[]) => void;
  onGenerateFlashcards: (content: string, title: string) => void;
}

export const NotesCreatorAndLibrary: React.FC<NotesCreatorAndLibraryProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onPrintPreview,
  onBatchPrintPreview,
  onGenerateFlashcards,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  // Editor Modal / Pane
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("General");
  const [editTags, setEditTags] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isAiGeneratingNote, setIsAiGeneratingNote] = useState(false);
  const [editorTab, setEditorTab] = useState<"write" | "preview" | "split">("split");

  // Filtered Notes
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.subject) set.add(n.subject);
    });
    return ["All", ...Array.from(set)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesSubject = selectedSubjectFilter === "All" || n.subject === selectedSubjectFilter;
      const matchesStarred = !onlyStarred || n.isStarred;

      return matchesSearch && matchesSubject && matchesStarred;
    });
  }, [notes, searchQuery, selectedSubjectFilter, onlyStarred]);

  // Metrics for live note editing
  const wordCount = useMemo(() => {
    return editContent.trim() ? editContent.trim().split(/\s+/).length : 0;
  }, [editContent]);

  const readingTimeEstimate = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Open note in editor
  const handleOpenEditor = (note?: StudyNote) => {
    if (note) {
      setEditingNoteId(note.id);
      setEditTitle(note.title);
      setEditSubject(note.subject);
      setEditTags(note.tags ? note.tags.join(", ") : "");
      setEditContent(note.content);
    } else {
      setEditingNoteId(null);
      setEditTitle("");
      setEditSubject("General");
      setEditTags("");
      setEditContent("# Title of Note\n\n## 1. Overview\nWrite your theoretical foundation here...\n\n| Concept | Mechanism | Significance |\n| :--- | :--- | :--- |\n| Term A | Step 1 -> Step 2 | Core mark |");
    }
    setIsEditing(true);
  };

  // Close editor and save
  const handleSaveEditor = () => {
    if (!editTitle.trim()) return;

    const tagsArray = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedNote: StudyNote = {
      id: editingNoteId || `note-${Date.now()}`,
      title: editTitle.trim(),
      subject: editSubject.trim() || "General",
      tags: tagsArray,
      content: editContent,
      wordCount,
      readingTimeMinutes: readingTimeEstimate,
      createdAt: editingNoteId
        ? notes.find((n) => n.id === editingNoteId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: editingNoteId ? notes.find((n) => n.id === editingNoteId)?.isStarred : false,
    };

    onSaveNote(updatedNote);
    setIsEditing(false);
  };

  // Insert markdown helpers into text
  const handleInsertSyntax = (prefix: string, suffix: string = "") => {
    setEditContent((prev) => `${prev}\n${prefix}${suffix}`);
  };

  // AI Generate Note
  const handleAiGenerateNote = async () => {
    if (!editTitle.trim()) {
      alert("Please enter a topic in the Title input first.");
      return;
    }

    setIsAiGeneratingNote(true);
    try {
      const res = await fetch("/api/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: editTitle,
          subject: editSubject,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate note");
      const data = await res.json();
      setEditContent(data.content);
    } catch (err: any) {
      alert(err.message || "Failed to generate note with AI");
    } finally {
      setIsAiGeneratingNote(false);
    }
  };

  // Star / Unstar
  const handleToggleStar = (note: StudyNote) => {
    onSaveNote({
      ...note,
      isStarred: !note.isStarred,
    });
  };

  // Batch Select toggles
  const handleToggleSelectNote = (id: string) => {
    const updated = new Set(selectedNoteIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedNoteIds(updated);
  };

  const handleSelectAll = () => {
    if (selectedNoteIds.size === filteredNotes.length) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(filteredNotes.map((n) => n.id)));
    }
  };

  const handleBatchPdfClick = () => {
    const selectedNotes = notes.filter((n) => selectedNoteIds.has(n.id));
    if (selectedNotes.length === 0) return;
    onBatchPrintPreview(selectedNotes);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Academic Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-editorial font-bold text-white tracking-tight">
            Notes Library & Academic Dossier
          </h1>
          <p className="text-blue-200/80 text-sm mt-0.5">
            Rich Markdown study notes with live word counts, reading times, PDF exports, and one-click active recall flashcard generation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {selectedNoteIds.size > 0 && (
            <button
              type="button"
              onClick={handleBatchPdfClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all shadow-md shadow-blue-500/30 cursor-pointer active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>Batch PDF Export ({selectedNoteIds.size})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenEditor()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Note</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Sapphire Glassmorphism */}
      <div className="glass-sapphire-card rounded-2xl border border-blue-500/20 p-4 mb-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, topic, or content..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/50 bg-slate-950/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Starred filter button */}
          <button
            type="button"
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              onlyStarred
                ? "bg-amber-950/70 text-amber-200 border border-amber-500/50"
                : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-blue-900/40"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>Starred Only</span>
          </button>

          {/* Select all checkbox for batch export */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 text-slate-300 hover:text-white border border-blue-900/40 transition-all cursor-pointer active:scale-95"
          >
            {selectedNoteIds.size === filteredNotes.length && filteredNotes.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Select All ({filteredNotes.length})</span>
          </button>
        </div>

        {/* Subject filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-xs font-semibold text-blue-300 mr-1 shrink-0">Subject:</span>
          {subjectsList.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubjectFilter(subj)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                selectedSubjectFilter === subj
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20 border border-blue-400/30"
                  : "bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-blue-900/40"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid with Sapphire Glassmorphism */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isSelected = selectedNoteIds.has(note.id);
            return (
              <div
                key={note.id}
                className={`glass-sapphire rounded-2xl border p-5 transition-all shadow-xl flex flex-col justify-between group ${
                  isSelected ? "border-blue-400 ring-2 ring-blue-500/30" : "border-blue-500/20 hover:border-blue-400/40"
                }`}
              >
                <div>
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectNote(note.id)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/70 text-blue-200 border border-blue-500/30">
                        {note.subject}
                      </span>

                      {note.marksAssociated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white shadow-xs">
                          {note.marksAssociated}M
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStar(note)}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${note.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => handleOpenEditor(note)}
                    className="font-editorial text-lg font-bold text-white leading-snug cursor-pointer hover:text-blue-300 transition-colors line-clamp-2 mb-2"
                  >
                    {note.title}
                  </h3>

                  {/* Body Preview */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {note.content.replace(/[#*`_]/g, "").slice(0, 160)}...
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-blue-500/15 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <FileText className="w-3 h-3 text-blue-400" />
                      {note.wordCount || Math.ceil(note.content.split(/\s+/).length)} words
                    </span>
                    <span aria-hidden="true" className="text-blue-500/50">·</span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-blue-400" />
                      {note.readingTimeMinutes || Math.max(1, Math.ceil(note.content.split(/\s+/).length / 200))}m
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onGenerateFlashcards(note.content, note.title)}
                      title="Generate Active Recall Flashcards"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-950/60 transition-colors cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => exportSingleNoteToPdf(note.title, note.content, note.subject, note.marksAssociated)}
                      title="Download PDF (.pdf)"
                      className="p-1.5 rounded-lg text-blue-400 hover:text-blue-200 hover:bg-blue-950/60 transition-colors cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const docHtml = `
                          <div class="box">
                            <strong>Subject:</strong> ${note.subject} ${note.marksAssociated ? `| <strong>Marks:</strong> ${note.marksAssociated}M` : ""}
                          </div>
                          <h2>${note.title}</h2>
                          <div>${note.content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div>
                        `;
                        exportToWordDoc(note.title, docHtml, note.subject);
                      }}
                      title="Download Word Document (.doc)"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditor(note)}
                      title="Edit Note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      title="Delete Note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-sapphire-card rounded-3xl border border-blue-500/25 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-blue-400 mx-auto animate-realistic-float" />
          <h3 className="font-editorial text-2xl font-bold text-white mb-1">
            Your Private Notes Library is Ready
          </h3>
          <p className="text-xs text-blue-200/80 max-w-md mx-auto leading-relaxed">
            Every time you generate an exam answer or solve a document, it will automatically save right here. You can also compose your own notes anytime!
          </p>
          <button
            type="button"
            onClick={() => handleOpenEditor()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 active:scale-95 duration-150 cursor-pointer"
          >
            Create Your First Study Note
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70">
              <div className="flex-1 min-w-[280px]">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note Title or Academic Topic (e.g. SN2 Reaction Kinetics)..."
                  className="w-full text-base sm:text-lg font-editorial font-bold text-stone-900 bg-transparent border-none focus:outline-none placeholder:text-stone-600"
                />
              </div>

              {/* View Tab Selector: Write, Preview, Split */}
              <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    editorTab === "write" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    editorTab === "preview" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("split")}
                  className={`hidden sm:inline-block px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    editorTab === "split" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>Split View</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiGenerateNote}
                  disabled={isAiGeneratingNote || !editTitle.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
                  title="Generate full academic study note with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isAiGeneratingNote ? "Generating Note..." : "AI Auto-Complete"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-xs hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveEditor}
                  disabled={!editTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 disabled:opacity-40 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Subject and Tags Toolbar */}
            <div className="px-5 py-2.5 bg-white border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-600 font-medium">Subject:</span>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="e.g. Biology, Economics"
                    className="px-2 py-1 rounded border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-stone-600 font-medium">Tags:</span>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Comma-separated (e.g. A-Level, Derivation)"
                    className="px-2 py-1 rounded border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Formatting Helper Buttons */}
              <div className="flex items-center gap-1 text-stone-700">
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("## Heading 2")}
                  title="Heading 2"
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("**Bold Text**")}
                  title="Bold"
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("*Italic Text*")}
                  title="Italic"
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("- Bullet item")}
                  title="Bullet List"
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |")}
                  title="Insert Table"
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSyntax("> Key concept or formula")}
                  title="Quote Callout"
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Write Side */}
              {(editorTab === "write" || editorTab === "split") && (
                <div className={`h-full flex flex-col ${editorTab === "split" ? "w-1/2 border-r border-stone-200" : "w-full"}`}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write your study notes with markdown headings (##), tables, lists, and LaTeX equations ($$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$)..."
                    className="flex-1 p-6 text-xs sm:text-sm font-mono leading-relaxed resize-none focus:outline-none bg-stone-50/30 text-stone-900"
                  />
                </div>
              )}

              {/* Preview Side */}
              {(editorTab === "preview" || editorTab === "split") && (
                <div className={`h-full overflow-y-auto p-6 bg-white ${editorTab === "split" ? "w-1/2" : "w-full"}`}>
                  <div className="max-w-2xl mx-auto">
                    <MarkdownRenderer content={editContent || "*No content to preview*"} />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Stats */}
            <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-600 font-mono">
              <div className="flex items-center gap-3">
                <span>{wordCount} Words</span>
                <span aria-hidden="true">·</span>
                <span>~{readingTimeEstimate} min reading time</span>
              </div>
              <span className="text-[11px] text-stone-600 font-sans">
                Full Markdown & Print-Friendly Stylesheet Supported
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
