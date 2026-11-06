import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  FileText,
  ExternalLink,
  Sparkles,
  Calendar,
  ChevronRight,
  ChevronLeft,
  GripVertical
} from 'lucide-react';

const STAGES = [
  'To Search',
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected'
];

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onAssessMatch,
  onMoveStage
}) {
  const [isDragging, setIsDragging] = useState(false);
  const currentStageIndex = STAGES.indexOf(job.stage);

  const getScoreColor = (score) => {
    if (!score || score === 0) return { bg: 'bg-slate-700', text: 'text-slate-400', bar: 'bg-slate-600' };
    if (score >= 8.0) return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (score >= 6.0) return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' };
    return { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', bar: 'bg-rose-500' };
  };

  const scoreTheme = getScoreColor(job.matchScore);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', job.id);
    e.dataTransfer.setData('source-stage', job.stage);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit(job)}
      className={`glass-card rounded-xl p-3.5 mb-3 group relative cursor-grab active:cursor-grabbing transition-all select-none ${
        isDragging
          ? 'opacity-40 scale-95 ring-2 ring-indigo-500 border-dashed border-indigo-400 shadow-2xl'
          : 'hover:shadow-lg'
      }`}
    >
      {/* Top Header: Company, Title & Drag Handle */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <div className="text-slate-500 group-hover:text-slate-300 mt-0.5 cursor-grab shrink-0" title="Drag to move column">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold tracking-wide text-indigo-400 uppercase flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{job.company}</span>
            </span>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug truncate">
              {job.jobTitle}
            </h4>
          </div>
        </div>

        {/* External Link if URL available */}
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
            title="Open original job link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Location & Salary */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-2.5 pl-5">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            {job.location}
          </span>
        )}
        {job.salaryRange && (
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            {job.salaryRange}
          </span>
        )}
      </div>

      {/* Resume Used & Sources */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pl-5">
        {job.resumeUsed && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/80 flex items-center gap-1 max-w-[200px] truncate"
            title={`Resume used: ${job.resumeUsed}`}
          >
            <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">{job.resumeUsed}</span>
          </span>
        )}
        {job.sourceReceived && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
            via {job.sourceReceived}
          </span>
        )}
        {job.platformApplied && job.stage !== 'To Search' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
            on {job.platformApplied}
          </span>
        )}
      </div>

      {/* Prospect & Match Score Bar */}
      <div className="mb-2.5 pl-5">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400 text-[10px]">Resume Fit Prospect:</span>
          {job.matchScore > 0 ? (
            <span className={`font-semibold ${scoreTheme.text} flex items-center gap-1`}>
              <Sparkles className="w-3 h-3" />
              {job.matchScore} / 10
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssessMatch(job);
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-0.5"
            >
              <Sparkles className="w-2.5 h-2.5" /> Assess Match
            </button>
          )}
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${scoreTheme.bar}`}
            style={{ width: `${job.matchScore > 0 ? Math.min(100, job.matchScore * 10) : 5}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Info: Applied Date & Stage Quick Switch */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 pl-5">
        <span className="flex items-center gap-1 text-[10px]">
          <Calendar className="w-3 h-3" />
          {job.appliedDate ? `Applied: ${job.appliedDate}` : `Updated: ${job.updatedAt.slice(0, 10)}`}
        </span>

        {/* Stage Shift Arrows */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {currentStageIndex > 0 && (
            <button
              onClick={() => onMoveStage(job.id, STAGES[currentStageIndex - 1])}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={`Move back to ${STAGES[currentStageIndex - 1]}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {currentStageIndex < STAGES.length - 1 && (
            <button
              onClick={() => onMoveStage(job.id, STAGES[currentStageIndex + 1])}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={`Move forward to ${STAGES[currentStageIndex + 1]}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
