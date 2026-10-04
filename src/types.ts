export type MarkAllocation = 2 | 4 | 8 | 10 | 16;

export interface RubricItem {
  marks: string;
  objective: string;
  criteria: string;
  howToEarn: string;
}

export interface MnemonicHook {
  acronym: string;
  expansion: string;
  description: string;
}

export interface KeyVocabItem {
  term: string;
  definition: string;
}

export interface ExamAnswerResult {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  question: string;
  marks: MarkAllocation;
  examBoard?: string;
  recommendedTimeMinutes: number;
  timeGuidance?: string;
  modelAnswer: string;
  rubric: RubricItem[];
  commonPitfalls: string[];
  mnemonicHooks: MnemonicHook[];
  keyVocabulary: KeyVocabItem[];
  createdAt: string;
}

export type ChatMode = "socratic_tutor" | "exam_evaluator" | "concept_explainer" | "doubt_solver";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mode?: ChatMode;
  audioGenerating?: boolean;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  isStarred?: boolean;
  marksAssociated?: MarkAllocation;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mnemonic?: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  subtopic: string;
  masteryStatus: "new" | "learning" | "mastered";
  reviewCount: number;
}

export interface PlannerTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string;
}

export interface StudyHabit {
  id: string;
  name: string;
  targetDays: number;
  completedDays: number;
  streak: number;
  completedToday: boolean;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  whatWentWell: string;
  hardestConcept: string;
  tomorrowGoal: string;
  moodRating: number; // 1 to 5
}

export interface PersonalExamCountdown {
  id: string;
  title: string;
  subject: string;
  examDate: string;
}

export interface UserProgress {
  level: number;
  xp: number;
  rankTitle: string;
  questionsGenerated: number;
  documentsAnalyzed: number;
  flashcardsMastered: number;
  notesCreated: number;
  focusMinutesLogged: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface UserProfile {
  id: string;
  identifier: string;
  type: "email" | "phone";
  name: string;
  token?: string;
  loggedInAt: string;
  progress: UserProgress;
}

export interface DocumentQuestionAnswer {
  id: string;
  questionNumber: string;
  questionText: string;
  marks: MarkAllocation | number;
  topic?: string;
  modelAnswer: string;
  rubric: RubricItem[];
  pitfalls?: string[];
  mnemonic?: string;
  isApprovedByUser: boolean;
}

export interface DocumentAnalysisResult {
  id: string;
  documentTitle: string;
  fileName: string;
  fileType: "pdf" | "docx" | "doc" | "txt";
  subject: string;
  overview: string;
  totalQuestions: number;
  questions: DocumentQuestionAnswer[];
  analyzedAt: string;
}

