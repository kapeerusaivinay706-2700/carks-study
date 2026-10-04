import React, { useState, useEffect, useRef } from "react";
import { 
  CalendarCheck, Clock, CheckCircle2, Circle, Plus, Trash2, 
  Flame, BookOpen, Smile, Award, Play, Pause, RotateCcw, AlertCircle,
  Droplets, Moon, Sun, Heart, Zap, Sparkles, X
} from "lucide-react";
import { PlannerTask, StudyHabit, ReflectionEntry, PersonalExamCountdown } from "../types";
import { soundFX } from "../utils/audio";

interface StudyPlannerViewProps {
  tasks: PlannerTask[];
  onUpdateTasks: (tasks: PlannerTask[]) => void;
  habits: StudyHabit[];
  onUpdateHabits: (habits: StudyHabit[]) => void;
  reflections: ReflectionEntry[];
  onAddReflection: (ref: ReflectionEntry) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  tasks,
  onUpdateTasks,
  habits,
  onUpdateHabits,
  reflections,
  onAddReflection,
}) => {
  // Pomodoro Timer States
  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const pomoIntervalRef = useRef<any>(null);

  // Personal Life Features
  const [waterCups, setWaterCups] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("carks_life_water");
      return raw ? Number(raw) : 5;
    } catch {
      return 5;
    }
  });

  const [sleepHours, setSleepHours] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("carks_life_sleep");
      return raw ? Number(raw) : 7.5;
    } catch {
      return 7.5;
    }
  });

  const [personalExams, setPersonalExams] = useState<PersonalExamCountdown[]>(() => {
    try {
      const raw = localStorage.getItem("carks_personal_exams");
      if (raw) return JSON.parse(raw);
      // Clean default upcoming exam for illustration
      const defaultDate = new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0];
      return [
        {
          id: "exam-1",
          title: "Final Academic Examination",
          subject: "Core Curriculum",
          examDate: defaultDate,
        }
      ];
    } catch {
      return [];
    }
  });

  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamSubject, setNewExamSubject] = useState("");
  const [newExamDate, setNewExamDate] = useState("");

  // New task inputs
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("General");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);

  // Reflection entry inputs
  const [refWell, setRefWell] = useState("");
  const [refHard, setRefHard] = useState("");
  const [refGoal, setRefGoal] = useState("");
  const [refRating, setRefRating] = useState(5);
  const [savedRefNotice, setSavedRefNotice] = useState(false);

  // Pomodoro durations
  const DURATIONS = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const handleSetPomoMode = (mode: "focus" | "shortBreak" | "longBreak") => {
    setPomodoroMode(mode);
    setPomodoroSeconds(DURATIONS[mode]);
    setIsPomoRunning(false);
  };

  useEffect(() => {
    if (isPomoRunning) {
      pomoIntervalRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(pomoIntervalRef.current);
            setIsPomoRunning(false);
            soundFX.playCompletionBell();

            if (pomodoroMode === "focus") {
              setCompletedSessions((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    }

    return () => {
      if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    };
  }, [isPomoRunning, pomodoroMode]);

  const togglePomoRunning = () => {
    soundFX.playTick();
    setIsPomoRunning(!isPomoRunning);
  };

  const resetPomo = () => {
    setIsPomoRunning(false);
    setPomodoroSeconds(DURATIONS[mode()]);
  };

  function mode() {
    return pomodoroMode;
  }

  // Personal Life Updates
  const updateWater = (delta: number) => {
    const next = Math.max(0, Math.min(16, waterCups + delta));
    setWaterCups(next);
    localStorage.setItem("carks_life_water", String(next));
  };

  const updateSleep = (val: number) => {
    setSleepHours(val);
    localStorage.setItem("carks_life_sleep", String(val));
  };

  const handleAddPersonalExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamDate) return;

    const newEx: PersonalExamCountdown = {
      id: `exam-${Date.now()}`,
      title: newExamTitle.trim(),
      subject: newExamSubject.trim() || "General",
      examDate: newExamDate,
    };

    const updated = [...personalExams, newEx];
    setPersonalExams(updated);
    localStorage.setItem("carks_personal_exams", JSON.stringify(updated));

    setNewExamTitle("");
    setNewExamSubject("");
    setNewExamDate("");
    setShowAddExamModal(false);
  };

  const handleDeletePersonalExam = (id: string) => {
    const updated = personalExams.filter((e) => e.id !== id);
    setPersonalExams(updated);
    localStorage.setItem("carks_personal_exams", JSON.stringify(updated));
  };

  // Task actions
  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: PlannerTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject.trim() || "General",
      priority: newTaskPriority,
      estimatedMinutes: Number(newTaskMinutes) || 25,
      completed: false,
      dueDate: "Today",
    };

    onUpdateTasks([task, ...tasks]);
    setNewTaskTitle("");
  };

  // Habit toggles
  const handleToggleHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const nextState = !h.completedToday;
        return {
          ...h,
          completedToday: nextState,
          streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
          completedDays: nextState ? h.completedDays + 1 : Math.max(0, h.completedDays - 1),
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  // Submit Reflection
  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refWell.trim() && !refGoal.trim()) return;

    const newEntry: ReflectionEntry = {
      id: `ref-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      whatWentWell: refWell,
      hardestConcept: refHard,
      tomorrowGoal: refGoal,
      moodRating: refRating,
    };

    onAddReflection(newEntry);
    setRefWell("");
    setRefHard("");
    setRefGoal("");
    setSavedRefNotice(true);
    setTimeout(() => setSavedRefNotice(false), 3000);
  };

  const pomoMins = Math.floor(pomodoroSeconds / 60);
  const pomoSecs = pomodoroSeconds % 60;
  const pomoPercent = ((DURATIONS[pomodoroMode] - pomodoroSeconds) / DURATIONS[pomodoroMode]) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Personal Life & Study Execution</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Daily Study Planner & Personal Wellness
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Track upcoming exam countdowns, personal wellness (sleep & hydration), deep-work intervals, and daily study habits.
        </p>
      </div>

      {/* 1. PERSONAL LIFE & EXAM COUNTDOWN HUB */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Personal Upcoming Exam Countdown Tracker (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Exam Countdowns</h3>
                <p className="text-[11px] text-slate-500">Live countdown to your critical test dates</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddExamModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer active:scale-95 duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam</span>
            </button>
          </div>

          {/* Exam Countdown Cards */}
          <div className="space-y-3">
            {personalExams.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No upcoming exams tracked yet. Click "Add Exam" to track your real test dates!
              </div>
            ) : (
              personalExams.map((exam) => {
                const targetTime = new Date(exam.examDate).getTime();
                const now = Date.now();
                const diffMs = targetTime - now;
                const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                const hoursLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 flex items-center justify-between gap-4 transition-all hover:shadow-xs"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">{exam.title}</span>
                        <span className="text-[10px] font-mono uppercase bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                          {exam.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">Date: {exam.examDate}</div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-blue-700">
                          {daysLeft} <span className="text-xs font-normal text-slate-600">days</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{hoursLeft} hrs remaining</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePersonalExam(exam.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Personal Wellness Tracker: Hydration & Sleep (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal Life & Wellness</h3>
              <p className="text-[11px] text-slate-500">Hydration & sleep habits for peak cognitive performance</p>
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span>Daily Hydration (8 Glasses)</span>
              </span>
              <span className="font-mono font-bold text-sky-800">{waterCups} / 8 cups</span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => (
                <div
                  key={cup}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    cup <= waterCups ? "bg-sky-500 shadow-xs" : "bg-sky-200/50"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => updateWater(-1)}
                className="w-6 h-6 rounded-lg bg-white border border-sky-200 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-colors active:scale-95 duration-150 flex items-center justify-center"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => updateWater(1)}
                className="px-2.5 h-6 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors active:scale-95 duration-150 flex items-center justify-center gap-1"
              >
                <span>+ Drink Glass</span>
              </button>
            </div>
          </div>

          {/* Sleep Tracker */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sleep Duration</span>
              </span>
              <span className="font-mono font-bold text-indigo-800">{sleepHours} Hours</span>
            </div>

            <input
              type="range"
              min={4}
              max={12}
              step={0.5}
              value={sleepHours}
              onChange={(e) => updateSleep(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>4h (Low)</span>
              <span>8h (Optimal)</span>
              <span>12h</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. POMODORO TIMER & ACADEMIC HABITS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pomodoro Focus Timer & Habits (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pomodoro Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Deep Work Focus Timer</span>
              </h2>

              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {completedSessions} Pomodoros Done
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleSetPomoMode("focus")}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 duration-150 cursor-pointer ${
                  pomodoroMode === "focus"
                    ? "bg-white text-blue-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                25m Focus
              </button>
              <button
                type="button"
                onClick={() => handleSetPomoMode("shortBreak")}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 duration-150 cursor-pointer ${
                  pomodoroMode === "shortBreak"
                    ? "bg-white text-blue-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5m Rest
              </button>
              <button
                type="button"
                onClick={() => handleSetPomoMode("longBreak")}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 duration-150 cursor-pointer ${
                  pomodoroMode === "longBreak"
                    ? "bg-white text-blue-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                15m Break
              </button>
            </div>

            {/* Big Digits Display */}
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="font-mono text-5xl font-extrabold text-slate-900 tracking-tight">
                {String(pomoMins).padStart(2, "0")}:{String(pomoSecs).padStart(2, "0")}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-1000"
                style={{ width: `${pomoPercent}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={togglePomoRunning}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-95 duration-150"
              >
                {isPomoRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Interval</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Focus Interval</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetPomo}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors active:scale-95 duration-150 cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daily Study Habits & Streaks */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Daily Academic Habits</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">Streak Tracker</span>
            </div>

            <div className="space-y-2.5">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-95 duration-150 ${
                    habit.completedToday
                      ? "bg-blue-50/50 border-blue-300 text-blue-950"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {habit.completedToday ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="text-xs font-medium">{habit.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-current" />
                      {habit.streak}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Revision Task Checklist & Night Reflection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Revision Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Revision Task Checklist
                </h2>
                <p className="text-xs text-slate-500">
                  {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {tasks.length ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0}% Done
              </span>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add revision task (e.g. Write 10-mark synaptic transmission answer)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                  />

                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer active:scale-95 duration-150"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </form>

            {/* Task Items List */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    task.completed
                      ? "bg-slate-50 border-slate-200 text-slate-400"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${task.completed ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{task.subject}</span>
                        <span>·</span>
                        <span className={task.priority === "High" ? "text-rose-600 font-bold" : ""}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Academic Reflection Journal */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Evening Academic Reflection Journal</span>
              </h2>
              {savedRefNotice && (
                <span className="text-xs font-medium text-emerald-600 animate-in fade-in">
                  Saved successfully!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  1. What went well today in your revision?
                </label>
                <input
                  type="text"
                  value={refWell}
                  onChange={(e) => setRefWell(e.target.value)}
                  placeholder="e.g. Mastered the 16-mark essay structure for monetary policy..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  2. What was the hardest concept or sticking point?
                </label>
                <input
                  type="text"
                  value={refHard}
                  onChange={(e) => setRefHard(e.target.value)}
                  placeholder="e.g. Differentiating between voltage-gated vs ligand-gated channels under exam timing..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  3. Single priority goal for tomorrow
                </label>
                <input
                  type="text"
                  value={refGoal}
                  onChange={(e) => setRefGoal(e.target.value)}
                  placeholder="e.g. Drill two 8-mark derivations under timed conditions..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Confidence:</span>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRefRating(num)}
                      className={`w-6 h-6 rounded-md font-mono text-xs font-bold transition-colors cursor-pointer ${
                        refRating === num
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!refWell.trim() && !refGoal.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer active:scale-95 duration-150"
                >
                  Log Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal for adding a new personal exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-slate-900">Add Upcoming Exam</h3>
              <button
                type="button"
                onClick={() => setShowAddExamModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPersonalExam} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exam Title <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="e.g. A-Level Economics Paper 1"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={newExamSubject}
                  onChange={(e) => setNewExamSubject(e.target.value)}
                  placeholder="e.g. Economics"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exam Date <span className="text-blue-600">*</span>
                </label>
                <input
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer active:scale-95 duration-150"
                >
                  Save Exam Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
