"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Trash2, Wallet } from "lucide-react";
import axios from "axios";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Food", "Shopping", "Travel", "Bills", "Uncategorized"];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/transactions");
        setTransactions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`);
        setTransactions((prev) => prev.filter((tx) => tx._id !== id));
      } catch (err) {
        console.error("Failed to delete transaction", err);
      }
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = (tx.note || "").toLowerCase().includes(searchQuery.toLowerCase()) || (tx.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Transaction History</h1>
        </header>

        {/* Filters */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 md:p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by note or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-[var(--color-accent-blue)] outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm text-white focus:border-[var(--color-accent-blue)] outline-none transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent-blue)] animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-card)] rounded-[2rem] border border-dashed border-[var(--color-border)] shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] mb-4">
              <Wallet className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">No Transactions Found</h2>
            <p className="text-[var(--color-muted)] mb-8 max-w-sm mx-auto">
              We couldn't find any expenses matching your criteria.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[var(--color-muted)] border-b border-[var(--color-border)] bg-white/5">
                  <tr>
                    <th className="py-4 font-medium px-6">Date</th>
                    <th className="py-4 font-medium px-6">Description</th>
                    <th className="py-4 font-medium px-6">Category</th>
                    <th className="py-4 font-medium px-6 text-right">Amount</th>
                    <th className="py-4 font-medium px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx._id} className="text-gray-300 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        {new Date(tx.date || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 truncate max-w-[250px] font-medium text-white">
                        {tx.note || "Expense"}
                        <div className="text-xs text-[var(--color-muted)] font-normal mt-0.5">{tx.paymentMethod || "Credit Card"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-xs">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-white">
                        ₹{tx.amount}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="text-[var(--color-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-[var(--color-border)] text-center text-[var(--color-muted)] text-xs bg-white/5">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 && "s"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
