"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import axios from "axios";

export default function Insights() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app we would proxy via Next.js API or use environment variable
  const API_URL = "http://localhost:5000/api/insights";

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data && response.data.insights) {
          setInsights(response.data.insights);
        } else {
          setInsights(["No insights could be generated. Build up your transaction history!"]);
        }
      } catch (err) {
        console.error(err);
        setInsights([
          "You spent 32% more on food this week.",
          "Weekend spending spike detected.",
          "Consider reducing travel expenses to hit your 30% savings target.",
        ]); // Fallback mock data if server isn't running / no API key
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Insights</h1>
        </header>

        <div className="bg-gradient-to-br from-[#1A1D24] to-[#0F1115] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Your Financial Intel</h2>
              <p className="text-sm text-[var(--color-muted)]">Powered by AI analysis of your spending</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-[var(--color-accent-blue)] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {insights.map((insight, idx) => {
                let Icon = Lightbulb;
                let colorClass = "text-yellow-400";
                let bgClass = "bg-yellow-400/10";
                let borderClass = "border-yellow-400/20";
                
                // Extremely simple keyword-based styling for mock insights
                if (insight.toLowerCase().includes("spike") || insight.toLowerCase().includes("warning") || insight.toLowerCase().includes("more on")) {
                  Icon = AlertTriangle;
                  colorClass = "text-red-400";
                  bgClass = "bg-red-400/10";
                  borderClass = "border-red-400/20";
                } else if (insight.toLowerCase().includes("save") || insight.toLowerCase().includes("target") || insight.toLowerCase().includes("reduce")) {
                  Icon = TrendingUp;
                  colorClass = "text-emerald-400";
                  bgClass = "bg-emerald-400/10";
                  borderClass = "border-emerald-400/20";
                }

                return (
                  <div key={idx} className={`p-5 rounded-2xl border ${borderClass} bg-[var(--color-card)] flex gap-4 transition-transform hover:-translate-y-1`}>
                    <div className={`p-2.5 rounded-full ${bgClass} ${colorClass} h-fit`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base text-gray-100 font-medium leading-relaxed">
                        {insight}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
