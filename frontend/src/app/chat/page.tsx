"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, User, Bot, Menu, Plus, MessageSquare, Trash2, X } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
};

const DEFAULT_MESSAGE: Message = { 
  role: "assistant", 
  content: "Hi! I'm your AI Finance Assistant. Ask me anything about your spending, savings, or general financial advice." 
};

export default function Chat() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_URL = "http://localhost:5000/api/chat";

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("finance_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setChatSessions(parsed);
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  // Save to LocalStorage whenever sessions change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem("finance_chat_history", JSON.stringify(chatSessions));
    } else {
      localStorage.removeItem("finance_chat_history");
    }
  }, [chatSessions]);

  const currentMessages = chatSessions.find(s => s.id === currentSessionId)?.messages || [DEFAULT_MESSAGE];

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = chatSessions.filter(s => s.id !== id);
    setChatSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const queryStr = input;
    setInput("");
    setLoading(true);

    let sessionIdToUpdate = currentSessionId;
    let newSessions = [...chatSessions];

    // If starting a completely new chat
    if (!sessionIdToUpdate) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: queryStr.slice(0, 30) + (queryStr.length > 30 ? "..." : ""),
        messages: [DEFAULT_MESSAGE, userMessage]
      };
      newSessions = [newSession, ...newSessions];
      sessionIdToUpdate = newSession.id;
      setCurrentSessionId(newSession.id);
      setChatSessions(newSessions);
    } else {
      // Append user message to existing session
      newSessions = newSessions.map(session => {
        if (session.id === sessionIdToUpdate) {
          return { ...session, messages: [...session.messages, userMessage] };
        }
        return session;
      });
      setChatSessions(newSessions);
    }

    try {
      const response = await axios.post(API_URL, { query: queryStr });
      const assistantMessage: Message = { role: "assistant", content: response.data.reply };
      
      setChatSessions(prevSessions => prevSessions.map(session => {
        if (session.id === sessionIdToUpdate) {
          return { ...session, messages: [...session.messages, assistantMessage] };
        }
        return session;
      }));
    } catch (err) {
      console.error(err);
      const errorMessage: Message = { role: "assistant", content: "Oops! I encountered an error connecting to my brain. Please check the backend." };
      setChatSessions(prevSessions => prevSessions.map(session => {
        if (session.id === sessionIdToUpdate) {
          return { ...session, messages: [...session.messages, errorMessage] };
        }
        return session;
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button 
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
          {chatSessions.length === 0 ? (
            <div className="text-gray-500 text-sm text-center mt-10">No recent chats</div>
          ) : (
            chatSessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => {
                  setCurrentSessionId(session.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${currentSessionId === session.id ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 text-gray-300'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0 text-gray-400" />
                  <span className="text-sm truncate">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteChat(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all shrink-0"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <header className="flex items-center gap-4 p-4 shrink-0 border-b border-[var(--color-border)] md:border-none md:p-8">
          <button 
            className="p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-colors md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Advisor</h1>
            <Sparkles className="w-4 h-4 text-[var(--color-accent-blue)]" />
          </div>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:px-8 flex flex-col gap-6 overflow-y-auto pb-24 custom-scrollbar">
          {currentMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
              <div className={`p-2 rounded-full shrink-0 h-fit ${msg.role === "user" ? "bg-blue-600" : "bg-[var(--color-card)] border border-[var(--color-border)]"}`}>
                {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-emerald-400" />}
              </div>
              <div className={`p-4 text-sm leading-relaxed rounded-2xl ${msg.role === "user" ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none shadow-md" : "bg-[var(--color-card)] text-gray-100 border border-[var(--color-border)] rounded-tl-none shadow-sm"}`}>
                <div className="space-y-3">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-1" {...props} />,
                      li: ({node, ...props}) => <li className={msg.role === "assistant" ? "marker:text-[var(--color-accent-blue)]" : ""} {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 mt-3" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="p-2 rounded-full shrink-0 h-fit bg-[var(--color-card)] border border-[var(--color-border)]">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl rounded-tl-none flex items-center gap-1.5 w-16">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent pt-10">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending..."
              className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] text-white text-sm rounded-full px-5 py-4 outline-none focus:border-[var(--color-accent-blue)] transition-colors shadow-lg"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="p-4 bg-gradient-to-r from-[var(--color-accent-blue)] to-blue-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
