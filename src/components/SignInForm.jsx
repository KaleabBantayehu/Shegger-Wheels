"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const DEMO_ACCOUNTS = [
  { userId: "user-renter-1", role: "Renter", email: "renter@sheggar.et" },
  { userId: "user-owner-1", role: "Owner", email: "owner@sheggar.et" },
  { userId: "user-admin-1", role: "Admin", email: "admin@sheggar.et" },
];

export default function SignInForm({ nextPath = "/" }) {
  const router = useRouter();
  const { currentUser, signInDemoUser } = useApp();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback(null);
    if (!selectedUserId) {
      setFeedback({ type: "error", message: "Choose a demo account to continue." });
      return;
    }

    setSubmitting(true);
    const result = signInDemoUser(selectedUserId);
    if (!result.ok) {
      setFeedback({ type: "error", message: result.error });
      setSubmitting(false);
      return;
    }

    setFeedback({ type: "success", message: "Demo account selected. Redirecting…" });
    window.setTimeout(() => router.replace(nextPath), 300);
  };

  const selectDemoAccount = (account) => {
    setSelectedUserId(account.userId);
    setFeedback(null);
  };

  const copyDemoAccount = async (account) => {
    try {
      await navigator.clipboard.writeText(`${account.role}\n${account.email}\nDemo user ID: ${account.userId}`);
      setCopiedAccount(account.role);
      window.setTimeout(() => setCopiedAccount(""), 1500);
    } catch {
      setFeedback({ type: "error", message: "Copy is unavailable. Select the account details manually." });
    }
  };

  return (
    <div className="bg-[#0b1320] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 space-y-2">
          <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Demo Sign In
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Choose a Sheggar Wheels account</h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            This frontend-only demo selects a seeded user account. It does not verify passwords or real-world identity.
          </p>
        </div>

        {currentUser && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-4 rounded-xl">
            You are currently signed in as <strong>{currentUser.name}</strong>.
          </div>
        )}

        {feedback && (
          <div role={feedback.type === "error" ? "alert" : "status"} className={`mb-6 border text-xs font-semibold p-4 rounded-xl ${feedback.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#131d2e] border border-gray-800 rounded-2xl p-6 space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-gray-300">Demo account</legend>
            {DEMO_ACCOUNTS.map((account) => (
              <label key={account.userId} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${selectedUserId === account.userId ? "border-emerald-500/60 bg-emerald-500/10" : "border-gray-800 bg-gray-900/60"}`}>
                <input type="radio" name="demo-account" value={account.userId} checked={selectedUserId === account.userId} onChange={() => selectDemoAccount(account)} disabled={submitting} className="h-4 w-4 accent-emerald-500" />
                <span>
                  <span className="block text-sm font-bold text-white">{account.role}</span>
                  <span className="block text-xs text-gray-400">{account.email}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <p className="text-[11px] text-gray-500">After selecting an account you will be returned to <code className="text-gray-300">{nextPath}</code>.</p>
          <button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-xs">
            {submitting ? "Signing in…" : "Continue as selected account"}
          </button>
          <Link href="/register" className="block text-center text-[11px] text-emerald-400 hover:text-emerald-300">Create a renter account</Link>
          <Link href="/" className="block text-center text-[11px] text-gray-400 hover:text-white">Return to the homepage</Link>
        </form>

        <section className="mt-6 rounded-2xl border border-gray-800 bg-[#131d2e] p-6" aria-labelledby="demo-accounts-heading">
          <div className="mb-4">
            <h2 id="demo-accounts-heading" className="text-sm font-bold text-white">Demo accounts</h2>
            <p className="mt-1 text-[11px] text-gray-400">These accounts have no passwords. Click an account above, or copy the details below.</p>
          </div>
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.role} className="rounded-xl border border-gray-800 bg-gray-900/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-emerald-400">{account.role}</span>
                  <button type="button" onClick={() => copyDemoAccount(account)} className="rounded-md border border-gray-700 px-2 py-1 text-[10px] font-semibold text-gray-300 hover:border-emerald-400 hover:text-white">
                    {copiedAccount === account.role ? "Copied" : "Copy details"}
                  </button>
                </div>
                <div className="grid gap-1 text-[11px] text-gray-300 sm:grid-cols-2">
                  <code className="select-all break-all">{account.email}</code>
                  <code className="select-all break-all">{account.userId}</code>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
