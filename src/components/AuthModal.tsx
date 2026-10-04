import React, { useState, useEffect } from "react";
import { Mail, Phone, KeyRound, ShieldCheck, ArrowRight, RotateCcw, X, CheckCircle2, AlertCircle } from "lucide-react";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authType, setAuthType] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter_identifier" | "verify_otp">("enter_identifier");
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedOtpDisplay, setGeneratedOtpDisplay] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);

  useEffect(() => {
    let timer: any = null;
    if (step === "verify_otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${authType === "email" ? "email address" : "phone number"}.`);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), type: authType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate OTP code.");
      }

      setGeneratedOtpDisplay(data.otp);
      setStep("verify_otp");
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while generating your verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
          type: authType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP code.");
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPasteDemoOtp = () => {
    if (generatedOtpDisplay) {
      setOtp(generatedOtpDisplay);
    } else {
      setOtp("123456");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-700 text-amber-50 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 leading-snug">
                Student & Scholar Sign In
              </h3>
              <p className="text-xs text-stone-600">
                Access your personalized notes, document solutions, and history
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Method Switcher */}
          {step === "enter_identifier" && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthType("email");
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authType === "email"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthType("phone");
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authType === "phone"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Number</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl flex items-start gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === "enter_identifier" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  {authType === "email" ? "Enter your academic or personal email" : "Enter your mobile phone number"}
                </label>
                <div className="relative">
                  {authType === "email" ? (
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  ) : (
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  )}
                  <input
                    type={authType === "email" ? "email" : "tel"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={authType === "email" ? "scholar@university.edu" : "+1 555-0199 or 9876543210"}
                    autoFocus
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  We'll generate a secure 6-digit one-time password (OTP) code instantly.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 text-white font-medium text-xs sm:text-sm hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Generate & Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Generated OTP banner for effortless user testing */}
              {generatedOtpDisplay && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-amber-900 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Verification Code (OTP) Sent</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickPasteDemoOtp}
                      className="text-[11px] underline text-amber-800 hover:text-amber-950 font-mono font-bold cursor-pointer"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-600">Use this 6-digit code:</span>
                    <span className="font-mono text-base font-extrabold tracking-widest text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                      {generatedOtpDisplay}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Enter 6-Digit OTP Code
                  </label>
                  <span className="text-[11px] font-mono text-stone-500">
                    Sent to: {identifier}
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 482910"
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.4em] font-mono font-bold text-lg py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 text-white font-medium text-xs sm:text-sm hover:bg-amber-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              {/* Resend OTP & Change Number */}
              <div className="flex items-center justify-between text-xs pt-1 text-stone-600">
                <button
                  type="button"
                  onClick={() => {
                    setStep("enter_identifier");
                    setOtp("");
                    setErrorMsg(null);
                  }}
                  className="hover:text-stone-900 underline"
                >
                  Change {authType}
                </button>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => handleSendOtp()}
                  className="flex items-center gap-1 hover:text-stone-900 disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend Code"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
