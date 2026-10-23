"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function RegisterPage() {
  const router = useRouter();
  const { registerRenter } = useApp();
  const [form, setForm] = useState({ name: "", email: "" });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = registerRenter(form);
    if (!result.ok) {
      setFeedback(result.error);
      setSubmitting(false);
      return;
    }
    router.replace("/");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-white">Create a renter account</h1>
      <p className="mt-2 text-sm text-gray-400">New public accounts receive the renter role only.</p>
      {feedback && <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{feedback}</p>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-gray-800 bg-[#131d2e] p-6">
        {["name", "email"].map((field) => (
          <label key={field} className="block text-xs font-bold text-gray-300">
            {field[0].toUpperCase() + field.slice(1)}
            <input type={field === "email" ? "email" : "text"} required value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-900 p-3 text-sm text-white" />
          </label>
        ))}
        <button disabled={submitting} className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-white disabled:bg-gray-700">{submitting ? "Creating account…" : "Create account"}</button>
        <Link href="/signin" className="block text-center text-xs text-emerald-400">Already have an account? Sign in</Link>
      </form>
    </div>
  );
}
