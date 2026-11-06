import React from 'react';
import { Target, Send, CheckCircle2, TrendingUp, Award, Flame, Calendar } from 'lucide-react';

export default function DailyTracker({ dailyGoals, jobs, onEditGoals }) {
  const searchedTarget = dailyGoals?.targetSearches || 10;
  const appliedTarget = dailyGoals?.targetApplications || 5;

  // Exact real-time counts from current jobs on the board
  const toSearchCount = jobs.filter(j => j.stage === 'To Search').length;
  const toApplyCount = jobs.filter(j => j.stage === 'To Apply').length;
  const appliedCount = jobs.filter(j => j.stage === 'Applied').length;
  const interviewingCount = jobs.filter(j => j.stage === 'Interviewing').length;
  const offerCount = jobs.filter(j => j.stage === 'Offer').length;

  const toSearchPct = Math.min(100, Math.round((toSearchCount / searchedTarget) * 100));
  const toApplyPct = Math.min(100, Math.round((toApplyCount / appliedTarget) * 100));

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <section className="px-4 lg:px-8 pt-5 pb-2">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Jobs To Search Queue */}
          <div className="glass-panel rounded-xl p-4 relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                Jobs To Search
              </span>
              <span className="text-xs font-medium text-blue-400">{toSearchPct}%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                {toSearchCount} <span className="text-sm font-normal text-slate-500">/ {searchedTarget} target</span>
              </div>
              <span className="text-[11px] text-slate-400">In Search Queue</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${toSearchPct}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Jobs To Apply Queue */}
          <div className="glass-panel rounded-xl p-4 relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-amber-400" />
                Jobs To Apply
              </span>
              <span className="text-xs font-medium text-amber-400">{toApplyPct}%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                {toApplyCount} <span className="text-sm font-normal text-slate-500">/ {appliedTarget} target</span>
              </div>
              <span className="text-[11px] text-slate-400">Ready to Submit</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${toApplyPct}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Applications Submitted */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Applications Sent
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {todayStr}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                {appliedCount} <span className="text-sm font-normal text-slate-500">submitted</span>
              </div>
              <span className="text-xs font-medium text-emerald-400">In Applied Stage</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Total Board Jobs: <span className="text-slate-200 font-semibold">{jobs.length}</span>
            </p>
          </div>

          {/* Card 4: Active Interview & Offer Pipeline */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                Interviews & Offers
              </span>
              <button
                onClick={onEditGoals}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Configure Targets
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                {interviewingCount} <span className="text-sm font-normal text-slate-500">interviews</span>
              </div>
              {offerCount > 0 ? (
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> {offerCount} Offer!
                </span>
              ) : (
                <span className="text-xs text-slate-400">0 offers</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Active response pipeline from employers
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
