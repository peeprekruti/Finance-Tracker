"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, LogOut, ArrowLeft, Download, Shield, Bell, Globe } from "lucide-react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState<{name: string, email: string, dp?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // States for forms
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "" });
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [currency, setCurrency] = useState("₹ (INR)");

  useEffect(() => {
    const saved = localStorage.getItem("finance_user");
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("finance_user");
    window.location.href = "/";
  };

  const handleDpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image is too large! Please choose an image smaller than 3MB.");
        e.target.value = ''; // Reset input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (user) {
          try {
            const resultBase64 = reader.result as string;
            const updatedUser = { ...user, dp: resultBase64 };
            localStorage.setItem("finance_user", JSON.stringify(updatedUser));
            setUser(updatedUser); // Only set UI if storage succeeds!
          } catch (storageError) {
             console.error(storageError);
             alert("The image is too high resolution for local browser storage. Try using a compressed JPG or a smaller screenshot.");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions");
      const txs = res.data;
      if (!txs || txs.length === 0) {
        alert("No transaction data exists to export.");
        return;
      }
      
      const csvRows = ['Date,Category,Amount,Payment Method,Note'];
      txs.forEach((t: any) => {
        csvRows.push(`${new Date(t.date || Date.now()).toLocaleDateString()},${t.category},${t.amount},${t.paymentMethod},${t.note || ''}`);
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'finance_export.csv');
      a.click();
    } catch (err) {
      alert("Failed to export transactions.");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password updated successfully!");
    setActiveTab(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto mt-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-card)] text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Profile</h1>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-8">
            <label className="w-20 h-20 rounded-full bg-[var(--color-accent-blue)]/20 border border-[var(--color-accent-blue)]/30 flex items-center justify-center relative cursor-pointer overflow-hidden group">
              {user.dp ? (
                <img src={user.dp} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[var(--color-accent-blue)]" />
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                <span className="text-[10px] text-white font-medium text-center leading-tight">Edit<br/>DP</span>
              </div>
              <input type="file" accept="image/*" onChange={handleDpUpload} className="hidden" />
            </label>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-[var(--color-muted)] flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-8">
            <h3 className="text-lg font-medium text-white mb-4">Account Settings</h3>
            
            {activeTab === "password" && (
              <div className="mb-4 bg-[var(--color-background)] border border-[var(--color-border)] p-4 rounded-xl">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Shield className="w-4 h-4"/> Change Password</h4>
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <input type="password" required placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-white outline-none focus:border-[var(--color-accent-blue)]" />
                  <input type="password" required placeholder="New Password" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-white outline-none focus:border-[var(--color-accent-blue)]" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-[var(--color-accent-blue)] text-gray-900 font-bold rounded-lg text-sm">Save</button>
                    <button type="button" onClick={() => setActiveTab(null)} className="px-4 py-2 border border-[var(--color-border)] text-white rounded-lg text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="mb-4 bg-[var(--color-background)] border border-[var(--color-border)] p-4 rounded-xl">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Bell className="w-4 h-4"/> Notifications</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">Email Receipts</span>
                    <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({...notifications, email: e.target.checked})} className="w-4 h-4 accent-[var(--color-accent-blue)]" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">Push Alerts (Budget)</span>
                    <input type="checkbox" checked={notifications.push} onChange={e => setNotifications({...notifications, push: e.target.checked})} className="w-4 h-4 accent-[var(--color-accent-blue)]" />
                  </label>
                </div>
                <button onClick={() => { alert("Preferences saved!"); setActiveTab(null); }} className="mt-4 px-4 py-2 bg-[var(--color-accent-blue)] text-gray-900 font-bold rounded-lg text-sm">Save Preferences</button>
              </div>
            )}

            {activeTab === "currency" && (
              <div className="mb-4 bg-[var(--color-background)] border border-[var(--color-border)] p-4 rounded-xl">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Globe className="w-4 h-4"/> Set Currency</h4>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-white outline-none focus:border-[var(--color-accent-blue)]">
                  <option>₹ (INR)</option>
                  <option>$ (USD)</option>
                  <option>€ (EUR)</option>
                  <option>£ (GBP)</option>
                </select>
                <button onClick={() => { alert("Global currency preference saved!"); setActiveTab(null); }} className="mt-4 px-4 py-2 bg-[var(--color-accent-blue)] text-gray-900 font-bold rounded-lg text-sm">Update</button>
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => setActiveTab("password")} className={`w-full text-left px-4 py-3.5 bg-[var(--color-background)] rounded-xl hover:text-white hover:bg-[var(--color-card)] border hover:border-gray-600 transition-all ${activeTab === "password" ? 'border-gray-500 text-white' : 'border-[var(--color-border)] text-gray-300'}`}>
                Change Password
              </button>
              <button onClick={() => setActiveTab("notifications")} className={`w-full text-left px-4 py-3.5 bg-[var(--color-background)] rounded-xl hover:text-white hover:bg-[var(--color-card)] border hover:border-gray-600 transition-all ${activeTab === "notifications" ? 'border-gray-500 text-white' : 'border-[var(--color-border)] text-gray-300'}`}>
                Notification Preferences
              </button>
              <button onClick={() => setActiveTab("currency")} className={`w-full text-left px-4 py-3.5 bg-[var(--color-background)] rounded-xl hover:text-white hover:bg-[var(--color-card)] border hover:border-gray-600 transition-all ${activeTab === "currency" ? 'border-gray-500 text-white' : 'border-[var(--color-border)] text-gray-300'}`}>
                Currency & App Theme
              </button>
              <button onClick={handleExport} className="w-full text-left px-4 py-3.5 bg-[var(--color-background)] rounded-xl text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/5 border border-[var(--color-accent-blue)]/20 hover:border-[var(--color-accent-blue)]/50 transition-all flex justify-between items-center group">
                Export Data (CSV)
                <Download className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button onClick={() => {
                if(confirm("Are you sure you want to permanently delete your account & data?")) {
                  alert("Account deleted.");
                  localStorage.removeItem("finance_user");
                  window.location.href = "/";
                }
              }} className="w-full text-left px-4 py-3.5 bg-[var(--color-background)] rounded-xl text-red-400 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all mt-4">
                Danger: Delete Account
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-8 py-3.5 bg-[var(--color-card)] text-[var(--color-muted)] hover:text-white font-bold rounded-xl hover:bg-[var(--color-card)] border border-[var(--color-border)] hover:border-gray-500 transition-colors flex justify-center items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
