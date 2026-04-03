'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Building, ChevronRight, Loader2, Plus, Sparkles } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  required_skills: string;
}

export default function JobsPage() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // New Job State (Admin only ideally, but anyone for current logic)
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:8000/jobs/');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setCreating(true);
    try {
      const res = await fetch('http://localhost:8000/jobs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          company: newCompany,
          description: newDesc,
          required_skills: newSkills
        })
      });
      if (res.ok) {
        setShowNewJobForm(false);
        setNewTitle('');
        setNewCompany('');
        setNewDesc('');
        setNewSkills('');
        fetchJobs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Career Portal <Sparkles className="text-blue-500 animate-pulse" />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
              Discover top roles designed for your unique skill set.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowNewJobForm(!showNewJobForm)}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus size={18} /> Post New Job
            </button>
          )}
        </header>

        {showNewJobForm && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8 animate-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Create Job Listing</h2>
            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Frontend Engineer" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Company Data</label>
                <input required value={newCompany} onChange={e => setNewCompany(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="TechCorp Inc." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input required value={newSkills} onChange={e => setNewSkills(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="React, Node.js, Python" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Job details..." />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {jobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
              <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No jobs posted yet</h3>
              <p className="text-slate-500 dark:text-slate-400">Check back later or post a new job.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-none transition-all border border-slate-100 dark:border-slate-800 group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-2xl border border-blue-100 dark:border-blue-800/50 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium mt-1">
                        <Building size={16} /> {job.company}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 ml-4 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
                
                <p className="mt-4 text-slate-600 dark:text-slate-300 line-clamp-2">{job.description}</p>
                
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">REQUIRED:</span>
                  {job.required_skills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
