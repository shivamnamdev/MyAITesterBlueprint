import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Loader2,
  TrendingUp,
  Save
} from 'lucide-react';

export default function ResumeScoreModal({
  isOpen,
  onClose,
  job,
  resumes,
  onUpdateJobScore
}) {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    if (job) {
      // Find matching resume by name or default to first
      const matched = resumes.find(r => r.name === job.resumeUsed) || resumes[0];
      setSelectedResumeId(matched?.id || '');

      if (job.matchBreakdown) {
        setAssessment({
          ratingOutOfTen: job.matchScore,
          percentage: Math.round(job.matchScore * 10),
          ratingLabel: job.matchBreakdown.ratingLabel || 'Assessed Match',
          strengths: job.matchBreakdown.strengths || [],
          gaps: job.matchBreakdown.missingKeywords || job.matchBreakdown.gaps || [],
          tailoringTips: Array.isArray(job.matchBreakdown.recommendations) 
            ? job.matchBreakdown.recommendations 
            : [job.matchBreakdown.recommendations || 'Tailor experience bullet points'],
          engineUsed: 'saved-record'
        });
      } else {
        setAssessment(null);
      }
      setError('');
    }
  }, [job, resumes, isOpen]);

  if (!isOpen || !job) return null;

  const currentResume = resumes.find(r => r.id === selectedResumeId);

  const handleRunAssessment = async () => {
    if (!job.jdText || !job.jdText.trim()) {
      setError('This job posting is missing a Job Description text. Please edit the job and paste the JD first.');
      return;
    }
    if (!currentResume || !currentResume.contentText) {
      setError('Please select a valid resume with content.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/assess-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdText: job.jdText,
          resumeText: currentResume.contentText,
          jobTitle: job.jobTitle,
          company: job.company
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to assess resume match.');

      setAssessment(json);
      // Auto save to database
      onUpdateJobScore(job.id, json.ratingOutOfTen, json, currentResume.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreTheme = (score) => {
    if (score >= 8.0) {
      return {
        bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
        bar: 'from-emerald-500 to-teal-400',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      };
    }
    if (score >= 6.0) {
      return {
        bg: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
        bar: 'from-amber-500 to-orange-400',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      };
    }
    return {
      bg: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
      bar: 'from-rose-500 to-pink-400',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    };
  };

  const scoreTheme = assessment ? getScoreTheme(assessment.ratingOutOfTen) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d35]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Resume & JD Match Assessor
            </h3>
            <p className="text-xs text-slate-400">{job.jobTitle} at <span className="text-slate-200 font-semibold">{job.company}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Resume Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Select Resume to Compare:</span>
                <span className="text-[11px] text-slate-500">Benchmark multiple resumes to see which one scores highest</span>
              </div>
            </div>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleRunAssessment}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>Evaluating Fit & Benchmarking Prospect Score...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{assessment ? 'Re-Evaluate Resume Match' : 'Assess Fit & Prospect Score'}</span>
              </>
            )}
          </button>

          {/* Assessment Output Display */}
          {assessment && (
            <div className="space-y-4 pt-2">
              
              {/* Score & Bar Card */}
              <div className={`rounded-xl p-5 border bg-gradient-to-br ${scoreTheme.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Prospect Potential Rating
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreTheme.badge}`}>
                      {assessment.ratingLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-extrabold tracking-tight text-white">
                      {assessment.ratingOutOfTen}
                    </span>
                    <span className="text-sm font-bold text-slate-400"> / 10</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900/80 rounded-full h-3 overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${scoreTheme.bar} transition-all duration-700`}
                    style={{ width: `${assessment.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
                  <span>Needs Tailoring (&lt;6)</span>
                  <span>Moderate Fit (6-8)</span>
                  <span>Top Prospect (8-10)</span>
                </div>
              </div>

              {/* Strengths */}
              {assessment.strengths?.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Matching Strengths in Resume
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {assessment.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Gaps */}
              {assessment.gaps?.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Missing JD Keywords & Tech Gaps
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {assessment.gaps.map((gap, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailoring Tips */}
              {assessment.tailoringTips?.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Actionable Application Tailoring Tips
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {assessment.tailoringTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

