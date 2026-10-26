"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check client lockout
    const lockoutUntil = localStorage.getItem("admin_lockout_until");
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
      const minutesLeft = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 60000);
      setError(`Account temporarily locked after 5 failed attempts. Please retry in ${minutesLeft} minute(s).`);
      return;
    }

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res?.ok) {
        const attempts = parseInt(localStorage.getItem("admin_failed_attempts") || "0", 10) + 1;
        if (attempts >= 5) {
          const lockTime = Date.now() + 15 * 60 * 1000;
          localStorage.setItem("admin_lockout_until", lockTime.toString());
          localStorage.removeItem("admin_failed_attempts");
          setError("Account locked for 15 minutes after 5 failed attempts.");
        } else {
          localStorage.setItem("admin_failed_attempts", attempts.toString());
          setError(`Invalid email or password. Attempt ${attempts} of 5.`);
        }
      } else {
        localStorage.removeItem("admin_failed_attempts");
        localStorage.removeItem("admin_lockout_until");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Login error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-900 border border-slate-200 mx-auto mb-4 shadow-sm p-1">
            <Image
              src="/images/zenvora-icon.png"
              alt="Zenvora"
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
            Zenvora Admin Portal
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Enter your credentials to manage curriculum, domains, and student resources.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zenvora.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Zenvora Admin</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400">
            Protected by NextAuth enterprise session tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
