import React, { useState } from 'react';
import { Plus, ArrowDown } from 'lucide-react';
import JobCard from './JobCard.jsx';

const STAGE_CONFIG = {
  'To Search': {
    color: 'border-t-blue-500',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dropRing: 'ring-2 ring-blue-500 bg-blue-950/20 border-blue-500/60',
    desc: 'Leads & Saved Posts'
  },
  'To Apply': {
    color: 'border-t-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dropRing: 'ring-2 ring-amber-500 bg-amber-950/20 border-amber-500/60',
    desc: 'Ready for Submission'
  },
  'Applied': {
    color: 'border-t-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    dropRing: 'ring-2 ring-indigo-500 bg-indigo-950/20 border-indigo-500/60',
    desc: 'Applications Submitted'
  },
  'Interviewing': {
    color: 'border-t-purple-500',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dropRing: 'ring-2 ring-purple-500 bg-purple-950/20 border-purple-500/60',
    desc: 'Rounds in Progress'
  },
  'Offer': {
    color: 'border-t-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dropRing: 'ring-2 ring-emerald-500 bg-emerald-950/20 border-emerald-500/60',
    desc: 'Offers Received'
  },
  'Rejected': {
    color: 'border-t-slate-600',
    badge: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
    dropRing: 'ring-2 ring-slate-500 bg-slate-900 border-slate-500/60',
    desc: 'Archived / Closed'
  }
};

export default function KanbanColumn({
  stage,
  jobs,
  onAddJobForStage,
  onEditJob,
  onDeleteJob,
  onAssessMatch,
  onMoveStage
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG['To Search'];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const jobId = e.dataTransfer.getData('text/plain');
    const sourceStage = e.dataTransfer.getData('source-stage');
    if (jobId && sourceStage !== stage) {
      onMoveStage(jobId, stage);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-[#111827]/60 rounded-2xl border border-slate-800/90 border-t-4 ${config.color} p-3 w-80 shrink-0 shadow-lg transition-all duration-200 ${
        isDragOver ? config.dropRing : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">{stage}</h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.badge}`}>
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAddJobForStage(stage)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={`Add job to ${stage}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 px-1 mb-3">{config.desc}</p>

      {/* Drop Target Banner when Dragging Over */}
      {isDragOver && (
        <div className="mb-3 py-2 px-3 rounded-xl border-2 border-dashed border-indigo-400/80 bg-indigo-500/10 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Drop to move to {stage}</span>
        </div>
      )}

      {/* Cards Scroll Container */}
      <div className="flex-1 overflow-y-auto pr-1 kanban-col space-y-3">
        {jobs.length === 0 ? (
          <div className="h-40 rounded-xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <span className="text-xs">No jobs in {stage}</span>
            <span className="text-[10px] text-slate-600 mt-1">Drag a job card here</span>
            <button
              onClick={() => onAddJobForStage(stage)}
              className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              + Add a job
            </button>
          </div>
        ) : (
          jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
              onAssessMatch={onAssessMatch}
              onMoveStage={onMoveStage}
            />
          ))
        )}
      </div>
    </div>
  );
}
