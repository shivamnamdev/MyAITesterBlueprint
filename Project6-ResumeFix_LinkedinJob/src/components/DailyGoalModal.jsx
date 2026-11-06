import React, { useState, useEffect } from 'react';
import { X, Target, Send, Check } from 'lucide-react';

export default function DailyGoalModal({
  isOpen,
  onClose,
  dailyGoals,
  onSaveGoals
}) {
  const [targetSearches, setTargetSearches] = useState(10);
  const [targetApplications, setTargetApplications] = useState(5);

  useEffect(() => {
    if (dailyGoals) {
      setTargetSearches(dailyGoals.targetSearches || 10);
      setTargetApplications(dailyGoals.targetApplications || 5);
    }
  }, [dailyGoals, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveGoals({
      targetSearches: Number(targetSearches),
      targetApplications: Number(targetApplications)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d35]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Configure Daily Targets
            </h3>
            <p className="text-xs text-slate-400">Set daily search and application pace for job hunting</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              Daily Job Search Target (Leads to find daily)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={targetSearches}
              onChange={(e) => setTargetSearches(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              Daily Application Target (Jobs to apply to daily)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={targetApplications}
              onChange={(e) => setTargetApplications(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" />
              Save Targets
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

