import React, { useState } from "react";
import { 
  GraduationCap, Mail, Lock, User, ShieldCheck, 
  ArrowRight, Sparkles, CheckCircle2, 
  AlertCircle, LogIn, UserPlus, BookOpen
} from "lucide-react";
import { UserProfile } from "../types";

interface LoginProgressGatewayProps {
  onLoginSuccess: (user: UserProfile) => void;
}

interface RegisteredAccount {
  name: string;
  identifier: string; // email or username
  passcode: string;
  examFocus: string;
  registeredAt: string;
}

const STORAGE_USERS_KEY = "carks_registered_accounts";

function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const LoginProgressGateway: React.FC<LoginProgressGatewayProps> = ({ onLoginSuccess }) => {
  // Mode: "signin" | "create"
  const [mode, setMode] = useState<"signin" | "create">("signin");

  // Sign In inputs
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPasscode, setSignInPasscode] = useState("");

  // Create Account inputs
  const [newName, setNewName] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [newExamFocus, setNewExamFocus] = useState("A-Level / University Exams");

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // 1. Create Account Handler
  // RULE: DO NOT open/enter app from Create Account! Must prompt to Sign In!
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const cleanName = newName.trim();
    const cleanId = newIdentifier.trim().toLowerCase();
    const cleanPass = newPasscode.trim();

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!cleanId) {
      setErrorMsg("Please enter an email or username.");
      return;
    }
    if (cleanPass.length < 4) {
      setErrorMsg("Password must be at least 4 characters long.");
      return;
    }
    if (cleanPass !== confirmPasscode.trim()) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const existing = accounts.find((acc) => acc.identifier.toLowerCase() === cleanId);
      if (existing) {
        setIsLoading(false);
        setErrorMsg("An account with this email/username already exists. Please switch to Sign In.");
        return;
      }

      const newAccount: RegisteredAccount = {
        name: cleanName,
        identifier: cleanId,
        passcode: cleanPass,
        examFocus: newExamFocus.trim() || "General Academic",
        registeredAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));

      setIsLoading(false);
      // Clean inputs
      setNewName("");
      setNewPasscode("");
      setConfirmPasscode("");
      
      // Pre-fill Sign In identifier and switch directly to Sign In mode
      setSignInIdentifier(cleanId);
      setSignInPasscode("");
      setMode("signin");
      setSuccessNotice(`Account created for ${cleanName}! Now enter your password to sign in and enter the portal.`);
    }, 350);
  };

  // 2. Sign In Handler
  // RULE: Validates credentials and opens the app!
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const cleanId = signInIdentifier.trim().toLowerCase();
    const cleanPass = signInPasscode.trim();

    if (!cleanId) {
      setErrorMsg("Please enter your registered email or username.");
      return;
    }
    if (!cleanPass) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const account = accounts.find((acc) => acc.identifier.toLowerCase() === cleanId);

      if (!account) {
        setIsLoading(false);
        setErrorMsg("No account found with this email or username. Please click 'Create Account' first.");
        return;
      }

      if (account.passcode !== cleanPass) {
        setIsLoading(false);
        setErrorMsg("Incorrect password. Please try again.");
        return;
      }

      // Successful authentication
      const userProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        name: account.name,
        identifier: account.identifier,
        type: account.identifier.includes("@") ? "email" : "phone",
        token: `tok-${Date.now()}`,
        loggedInAt: new Date().toISOString(),
        progress: {
          level: 1,
          xp: 100,
          rankTitle: "Junior Scholar",
          questionsGenerated: 0,
          documentsAnalyzed: 0,
          flashcardsMastered: 0,
          notesCreated: 0,
          focusMinutesLogged: 0,
          streakDays: 1,
          lastActiveDate: new Date().toISOString().split("T")[0],
        },
      };

      setIsLoading(false);
      onLoginSuccess(userProfile);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Realistic ambient fluid background animation with deep blue shading */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[180px] animate-realistic-float" />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[180px] animate-realistic-float [animation-delay:3s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Header Brand Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 transform hover:rotate-3 transition-transform">
            <GraduationCap className="w-6 h-6 text-blue-100" />
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Carks
            </span>
            <span className="ml-2 text-[10px] uppercase font-mono tracking-widest text-blue-300 font-semibold border border-blue-500/40 px-2.5 py-0.5 rounded-full bg-blue-950/60">
              Academic Portal
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-blue-200">
          <span className="flex items-center gap-1.5 bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-700/40">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Verified Student & Scholar Environment
          </span>
        </div>
      </header>

      {/* Central Login / Create Account Card */}
      <main className="max-w-md mx-auto w-full px-4 py-8 z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/60 relative overflow-hidden transition-all duration-300">
          {/* Subtle top glowing accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600" />

          {/* Mode Switcher Tabs with realistic click feedback */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-2xl border border-blue-900/50 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 duration-150 ${
                mode === "signin"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("create");
                setErrorMsg(null);
                setSuccessNotice(null);
              }}
              className={`py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 duration-150 ${
                mode === "create"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Context Title & Subtitle */}
          <div className="mb-6 text-center">
            <h1 className="font-editorial text-2xl font-bold text-white mb-1.5 tracking-tight">
              {mode === "signin" ? "Welcome Back, Scholar" : "Create Your Scholar Account"}
            </h1>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              {mode === "signin"
                ? "Enter your registered credentials to access your exam solutions, notes, and study routine."
                : "Register your account. Once created, sign in to enter your personalized revision portal."}
            </p>
          </div>

          {/* Success Notice Banner */}
          {successNotice && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successNotice}</p>
            </div>
          )}

          {/* Error Notice Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="e.g. alex.morgan@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={signInPasscode}
                    onChange={(e) => setSignInPasscode(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("create");
                    setErrorMsg(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: CREATE ACCOUNT */}
          {mode === "create" && (
            <form onSubmit={handleCreateAccount} className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newIdentifier}
                    onChange={(e) => setNewIdentifier(e.target.value)}
                    placeholder="e.g. alex.morgan@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Exam Focus / Syllabus
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newExamFocus}
                    onChange={(e) => setNewExamFocus(e.target.value)}
                    placeholder="e.g. A-Level Biology, GCSE, AP Chemistry..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Min. 4 chars"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950/70 border border-blue-900/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Account & Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Clean Academic Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-blue-300/60 z-10">
        <p>Carks Academic Revision Portal · Mark-Calibrated Exam Answer System</p>
      </footer>
    </div>
  );
};
