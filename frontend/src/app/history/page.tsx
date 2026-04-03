'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, FileText, ChevronRight, Search, Layout, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Match {
  id: string;
  job: {
    title: string;
    company: string;
  };
  match_score: number;
  missing_skills: string;
}

interface HistoryItem {
  id: string;
  file_url: string;
  uploaded_at: string;
  score: number;
  skills: { skill_name: string }[];
  matches: Match[];
}

export default function HistoryPage() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      
      try {
        const res = await fetch('http://localhost:8000/resume/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch history');
        
        const data = await res.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Clock className="text-blue-600" size={32} />
            Your Upload <span className="text-blue-600">History</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Review your past resume analyses and tracked job matches.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
            Error: {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-4">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No History Yet</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              You haven't uploaded any resumes yet. Start by analyzing your first resume!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30"
            >
              Analyze Resume <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">
                      <Sparkles size={14} />
                      Analysis Completed
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 overflow-hidden text-ellipsis">
                      <FileText className="shrink-0 text-slate-400" size={20} />
                      {item.file_url.split('_').slice(1).join('_') || 'Resume Analysis'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                      Uploaded on {new Date(item.uploaded_at).toLocaleDateString()} at {new Date(item.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Match Efficiency</div>
                      <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                        {item.matches.length > 0 ? Math.round(item.matches[0].match_score) : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                       Detected Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-750"
                        >
                          {skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      Top Career Matches
                    </h3>
                    <div className="space-y-3">
                      {item.matches.slice(0, 2).map((match, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <div className="overflow-hidden">
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{match.job.title}</div>
                            <div className="text-slate-400 text-xs font-medium">{match.job.company}</div>
                          </div>
                          <div className="font-black text-blue-600 dark:text-blue-400 text-sm ml-2">
                            {Math.round(match.match_score)}%
                          </div>
                        </div>
                      ))}
                      {item.matches.length > 2 && (
                        <p className="text-xs text-slate-400 font-medium text-center">
                          + {item.matches.length - 2} more job matches
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
