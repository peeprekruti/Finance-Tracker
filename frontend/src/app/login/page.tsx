"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("finance_user", JSON.stringify({ name: email.split("@")[0], email }));
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] font-sans p-4">
      <div className="w-full max-w-md bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-[var(--color-muted)] mt-2">Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 mt-4 bg-[var(--color-accent-blue)] text-gray-900 font-bold rounded-xl hover:bg-blue-400 transition-colors flex justify-center items-center gap-2"
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[var(--color-accent-blue)] hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
