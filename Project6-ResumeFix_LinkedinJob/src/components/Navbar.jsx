import React from 'react';
import { Briefcase, Plus, Sparkles, FileText, Target, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function Navbar({
  onAddJob,
  onOpenSmartAdd,
  onOpenResumes,
  onOpenGoals,
  searchQuery,
  setSearchQuery,
  selectedResumeFilter,
  setSelectedResumeFilter,
  resumes,
  ollamaStatus,
  onRefresh,
  loading
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                JobHunt Assistant
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Kanban + AI
                </span>
              </h1>
              <p className="text-xs text-slate-400">Track daily jobs, optimize applications & match resumes</p>
            </div>
          </div>

          {/* AI Health Badge */}
          <div className="flex items-center gap-2">
            <span
              title={ollamaStatus.online ? `Ollama Active (${ollamaStatus.models?.join(', ') || 'Connected'})` : 'Ollama Offline (Using Heuristic Fallback)'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                ollamaStatus.online
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {ollamaStatus.online ? 'Ollama AI Active' : 'Heuristic Mode'}
            </span>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Board"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, role, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Resume Filter */}
          <select
            value={selectedResumeFilter}
            onChange={(e) => setSelectedResumeFilter(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Resumes</option>
            {resumes.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenGoals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Targets</span>
          </button>

          <button
            onClick={onOpenResumes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Resumes</span>
          </button>

          <button
            onClick={onOpenSmartAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>AI Auto-Fill</span>
          </button>

          <button
            onClick={onAddJob}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Job</span>
          </button>
        </div>

      </div>
    </header>
  );
}

