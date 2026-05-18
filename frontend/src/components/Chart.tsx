"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#00E676", "#4FC3F7", "#9C27B0", "#F59E0B", "#EF4444", "#3B82F6", "#10B981"];

export function SpendLineChart({ transactions = [], range = "week" }: { transactions?: any[], range?: "week" | "month" | "all" }) {
  const data = useMemo(() => {
    const result: { name: string; dateRaw: string; spend: number }[] = [];
    
    if (range === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push({ 
          name: days[d.getDay()], 
          dateRaw: d.toISOString().split("T")[0],
          spend: 0 
        });
      }
    } else if (range === "month") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push({ 
          name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 
          dateRaw: d.toISOString().split("T")[0],
          spend: 0 
        });
      }
    } else if (range === "all") {
       // Group by month
       const monthMap: Record<string, number> = {};
       transactions.forEach(tx => {
         const txDate = tx.date ? new Date(tx.date) : new Date();
         const monthKey = txDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
         monthMap[monthKey] = (monthMap[monthKey] || 0) + (tx.amount || 0);
       });
       return Object.entries(monthMap).map(([name, spend]) => ({ name, spend, dateRaw: "" }));
    }

    if (range !== "all") {
      transactions.forEach(tx => {
        const txDate = tx.date ? new Date(tx.date) : new Date();
        const txDateRaw = txDate.toISOString().split("T")[0];
        const match = result.find(r => r.dateRaw === txDateRaw);
        if (match) match.spend += (tx.amount || 0);
      });
    }

    return result;
  }, [transactions, range]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `₹${value}`} 
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1A1D24", borderColor: "#2d3748", borderRadius: "8px" }}
            itemStyle={{ color: "#fff" }}
            cursor={{ stroke: "#2d3748", strokeWidth: 1, strokeDasharray: "3 3" }}
            formatter={(value: any) => [`₹${value}`, "Spend"]}
          />
          <Line 
            type="monotone" 
            dataKey="spend" 
            stroke="#4FC3F7" 
            strokeWidth={3} 
            dot={{ fill: "#1A1D24", strokeWidth: 2, r: 4, stroke: "#4FC3F7" }} 
            activeDot={{ r: 6, fill: "#4FC3F7" }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ transactions = [] }: { transactions?: any[] }) {
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + (tx.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [transactions]);

  if (categoryData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-sm text-[var(--color-muted)]">
        No expense data to analyze
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            cornerRadius={4}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#1A1D24", borderColor: "#2d3748", borderRadius: "8px" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: any) => `₹${value}`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mb-2 flex-wrap justify-center h-[15%]">
        {categoryData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}
