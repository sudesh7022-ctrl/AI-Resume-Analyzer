'use client';

import React, { useState } from 'react';
import ResumeUpload from '@/components/ResumeUpload';
import { Briefcase, User, Sparkles, Building2, CheckCircle2, XCircle } from 'lucide-react';

export default function Home() {
  const [analysis, setAnalysis] = useState<any | null>(null);

  const handleUploadSuccess = (data: any) => {
    setAnalysis(data);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 md:p-24 selection:bg-blue-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <Sparkles size={14} className="animate-pulse" />
            AI-POWERED MATCHING
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Resume Analyzer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Upload your resume and let our AI engine match you with the perfect career opportunities based on your unique skill set.
          </p>
        </header>

        <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </section>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
            {/* Skills Profile */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Skill Profile</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-default"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Matches / Jobs Overview */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <Briefcase size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Target Job Match</h2>
                </div>
              </div>

              <div className="space-y-4">
                {analysis.matches?.map((match: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl border border-blue-50 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-900/10 group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700 font-black text-xl">
                          {match.job.company.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{match.job.title}</h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{match.job.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-600">{match.match_score}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs font-semibold">
                      {match.missing_skills ? (
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <XCircle size={14} /> Missing: {match.missing_skills}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 size={14} /> All Skills Matched
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!analysis.matches || analysis.matches.length === 0) && (
                  <div className="text-center p-6 text-slate-500 dark:text-slate-400 font-medium">
                    No jobs currently match your profile. Check back later!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
