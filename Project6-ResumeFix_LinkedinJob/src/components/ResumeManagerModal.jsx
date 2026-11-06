import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Check, Sparkles } from 'lucide-react';

export default function ResumeManagerModal({
  isOpen,
  onClose,
  resumes,
  onAddResume,
  onDeleteResume
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [contentText, setContentText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !contentText.trim()) {
      alert('Resume Name and Content Text are required.');
      return;
    }
    onAddResume({
      name: name.trim(),
      targetRole: targetRole.trim(),
      contentText: contentText.trim()
    });
    setName('');
    setTargetRole('');
    setContentText('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d35]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Resume Profiles Vault
            </h3>
            <p className="text-xs text-slate-400">Save your resume versions once to easily select & score during job hunting</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isAdding && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Saved Resumes ({resumes.length})
              </span>
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Resume
              </button>
            </div>
          )}

          {/* Add New Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-indigo-300">New Resume Profile</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resume Title / Identifier <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead SDET Resume v3 or Principal QA Architect"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Role / Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. SDET / Automation Lead / Full-Stack"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Resume Text Content <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste your raw resume summary, skills, and work history here for AI matching..."
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-mono text-[11px]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Resume
                </button>
              </div>
            </form>
          )}

          {/* List of Resumes */}
          <div className="space-y-3">
            {resumes.map(r => (
              <div
                key={r.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <h4 className="text-xs font-bold text-white">{r.name}</h4>
                  </div>
                  {r.targetRole && (
                    <span className="text-[11px] text-indigo-300 block mt-0.5">
                      Target: {r.targetRole}
                    </span>
                  )}
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">
                    {r.contentText}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => onDeleteResume(r.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="flex justify-end px-6 py-3 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

