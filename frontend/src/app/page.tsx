"use client";

import { useState, useEffect } from "react";
import { Wallet, TrendingUp, PiggyBank, Plus, Search, Bell, Sparkles, MessageCircle, User as UserIcon } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { SpendLineChart, CategoryPieChart } from "@/components/Chart";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/transactions");
        setTransactions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
    
    // Check auth
    setIsSignedIn(!!localStorage.getItem("finance_user"));
  }, []);

  const totalBalance = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="hidden sm:block text-[var(--color-muted)] text-sm mt-1">Welcome back, here's your financial overview.</p>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            <Link href={isSignedIn ? "/profile" : "/login"} title={isSignedIn ? "Profile" : "Sign In"} className={`p-2.5 rounded-full transition-colors border group hidden sm:block ${isSignedIn ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] border-[var(--color-accent-blue)]/20 hover:bg-[var(--color-accent-blue)]/20 hover:text-white' : 'bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple)] border-[var(--color-accent-purple)]/20 hover:bg-[var(--color-accent-purple)]/20 hover:text-white'}`}>
              <UserIcon className="w-5 h-5" />
            </Link>
            <Link href="/chat" title="AI Chat" className="p-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors group">
              <MessageCircle className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
            </Link>
            <Link href="/insights" title="Insights" className="p-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors group flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-accent-blue)] group-hover:animate-pulse" />
              <span className="hidden sm:inline text-sm font-medium">Insights</span>
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-full py-2 pl-9 pr-4 text-sm text-white focus:border-[var(--color-accent-blue)] outline-none w-48 transition-all focus:w-64" />
            </div>
            <button onClick={() => alert("Search functionality coming soon!")} className="md:hidden p-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => alert("You have 0 new notifications.")} className="p-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent-blue)] animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-card)] rounded-[2rem] border border-dashed border-[var(--color-border)] shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] mb-4">
              <Wallet className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">No Tracking History</h2>
            <p className="text-[var(--color-muted)] mb-8 max-w-sm mx-auto">Your balance and charts will appear here once you add an expense. Start tracking to get AI insights.</p>
            <Link href="/add-expense" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-blue)] text-gray-900 rounded-full font-bold hover:bg-blue-400 transition-colors">
              <Plus className="w-5 h-5" />
              Add Your First Expense
            </Link>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <DashboardCard
                title="Total Expenses"
                value={`₹${totalBalance.toLocaleString()}`}
                icon={Wallet}
              />
              <DashboardCard
                title="Recent Transaction"
                value={`₹${transactions[0]?.amount || 0}`}
                icon={TrendingUp}
                subtitle={transactions[0]?.category}
              />
              <DashboardCard
                title="Savings Tracking"
                value="Active"
                icon={PiggyBank}
                subtitle="Analyzing spending..."
              />
            </div>

            {/* Charts Setup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-white">Daily Spend Trends</h2>
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent border border-[var(--color-border)] text-sm rounded-lg px-3 py-1.5 text-[var(--color-muted)] outline-none focus:border-[var(--color-accent-blue)] hidden sm:block"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                <SpendLineChart transactions={transactions} range={timeRange as "week"|"month"|"all"} />
              </div>

              <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-white mb-6">Spend Categories</h2>
                <CategoryPieChart transactions={transactions} />
              </div>
            </div>

            {/* Transaction History List */}
            <div className="mt-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-white">Transaction History</h2>
                  <div className="flex items-center gap-3">
                     <Link href="/history" className="text-sm font-medium text-[var(--color-accent-blue)] hover:text-blue-400 transition-colors">
                        View All
                     </Link>
                     <button onClick={async () => {
                     if (confirm("Are you sure you want to delete ALL your data?")) {
                        await axios.delete("http://localhost:5000/api/transactions").catch(()=>{});
                        setTransactions([]);
                     }
                  }} className="text-xs font-semibold px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">WIPE ALL</button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[var(--color-muted)] border-b border-[var(--color-border)]">
                       <tr>
                          <th className="pb-3 font-medium px-4">Date</th>
                          <th className="pb-3 font-medium px-4">Description</th>
                          <th className="pb-3 font-medium px-4">Category</th>
                          <th className="pb-3 font-medium px-4 text-right">Amount</th>
                          <th className="pb-3 font-medium px-4 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                       {transactions.slice(0, 20).map(tx => (
                          <tr key={tx._id} className="text-gray-300 hover:bg-white/5 transition-colors">
                             <td className="py-4 px-4">{new Date(tx.date || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                             <td className="py-4 px-4 truncate max-w-[200px]">{tx.note || "Expense"}</td>
                             <td className="py-4 px-4"><span className="px-2 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-xs">{tx.category}</span></td>
                             <td className="py-4 px-4 text-right font-medium text-white">₹{tx.amount}</td>
                             <td className="py-4 px-4 text-right">
                                <button onClick={async () => {
                                   if (confirm("Delete this entry?")) {
                                      await axios.delete(`http://localhost:5000/api/transactions/${tx._id}`).catch(()=>{});
                                      setTransactions(prev => prev.filter(t => t._id !== tx._id));
                                   }
                                }} className="text-red-400 hover:text-red-300 text-xs transition-colors bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg active:scale-95">Delete</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {transactions.length > 20 && <p className="text-center text-[var(--color-muted)] text-xs mt-4">Showing 20 most recent transactions.</p>}
               </div>
            </div>
          </>
        )}

        {/* Floating Action Button for Mobile or Dynamic add btn */}
        {(transactions.length > 0 && !loading) && (
          <Link 
            href="/add-expense"
            className="fixed bottom-6 right-6 md:static md:float-right md:mt-8 bg-gradient-to-r from-[var(--color-accent-blue)] to-blue-600 hover:shadow-lg hover:shadow-blue-500/20 text-white rounded-full md:rounded-xl p-4 md:px-6 md:py-3 flex items-center justify-center gap-2 transition-all group z-50"
          >
            <Plus className="w-6 h-6 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-medium">Add Expense</span>
          </Link>
        )}
      </div>
    </div>
  );
}
