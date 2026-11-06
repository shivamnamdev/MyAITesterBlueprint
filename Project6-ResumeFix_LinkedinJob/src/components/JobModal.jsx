import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Globe,
  FileText,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Send,
  Loader2,
  Trash2,
  Check
} from 'lucide-react';

const STAGES = [
  'To Search',
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected'
];

const COMMON_SOURCES = [
  'LinkedIn',
  'Referral',
  'Recruiter InMail',
  'Indeed',
  'Wellfound',
  'Company Careers',
  'Glassdoor',
  'HackerNews',
  'Career Fair'
];

const COMMON_PLATFORMS = [
  'Company Portal',
  'LinkedIn Easy Apply',
  'Greenhouse',
  'Lever',
  'Workday',
  'Email Submission',
  'Indeed Apply',
  'Ashby'
];

export default function JobModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  resumes,
  defaultStage = 'To Search',
  startWithSmartTab = false
}) {
  const [activeTab, setActiveTab] = useState(startWithSmartTab ? 'smart' : 'details');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [smartUrl, setSmartUrl] = useState('');
  const [smartRawText, setSmartRawText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    jobTitle: '',
    company: '',
    jobUrl: '',
    sourceReceived: 'LinkedIn',
    platformApplied: 'Company Portal',
    resumeUsed: '',
    resumeText: '',
    jdText: '',
    stage: defaultStage,
    salaryRange: '',
    location: 'Remote',
    contactPerson: '',
    appliedDate: '',
    followUpDate: '',
    notes: '',
    matchScore: 0,
    matchBreakdown: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        sourceReceived: initialData.sourceReceived || 'LinkedIn',
        platformApplied: initialData.platformApplied || 'Company Portal',
        stage: initialData.stage || defaultStage
      });
      setActiveTab('details');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setFormData({
        id: '',
        jobTitle: '',
        company: '',
        jobUrl: '',
        sourceReceived: 'LinkedIn',
        platformApplied: 'Company Portal',
        resumeUsed: resumes[0]?.name || '',
        resumeText: resumes[0]?.contentText || '',
        jdText: '',
        stage: defaultStage,
        salaryRange: '',
        location: 'Remote',
        contactPerson: '',
        appliedDate: defaultStage === 'Applied' ? today : '',
        followUpDate: '',
        notes: '',
        matchScore: 0,
        matchBreakdown: null
      });
      setActiveTab(startWithSmartTab ? 'smart' : 'details');
      setSmartUrl('');
      setSmartRawText('');
      setAiError('');
    }
  }, [initialData, isOpen, defaultStage, startWithSmartTab, resumes]);

  if (!isOpen) return null;

  const handleSmartExtract = async () => {
    if (!smartUrl.trim() && !smartRawText.trim()) {
      setAiError('Please enter a Webpage URL or paste raw JD/job text.');
      return;
    }

    setLoadingAI(true);
    setAiError('');

    try {
      const res = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: smartUrl.trim() || undefined,
          rawText: smartRawText.trim() || undefined
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to parse job information.');

      const data = json.data;
      setFormData(prev => ({
        ...prev,
        jobTitle: data.jobTitle || prev.jobTitle,
        company: data.company || prev.company,
        location: data.location || prev.location,
        salaryRange: data.salaryRange || prev.salaryRange,
        sourceReceived: data.sourceReceived || prev.sourceReceived,
        platformApplied: data.platformApplied || prev.platformApplied,
        jdText: data.jdText || prev.jdText,
        contactPerson: data.contactPerson || prev.contactPerson,
        jobUrl: smartUrl.trim() || prev.jobUrl
      }));

      // Switch to details tab for review
      setActiveTab('details');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleResumeSelect = (resumeName) => {
    const selected = resumes.find(r => r.name === resumeName);
    setFormData(prev => ({
      ...prev,
      resumeUsed: resumeName,
      resumeText: selected ? selected.contentText : prev.resumeText
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      alert('Company Name and Job Title are required.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d35]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              {initialData?.id ? 'Edit Job Application' : 'Add New Job Application'}
            </h3>
            <p className="text-xs text-slate-400">Track company, stage, platform, and resume version</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Job Details Form
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('smart')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'smart'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Smart Auto-Fill (URL / Raw Text)
          </button>
        </div>

        {/* Smart Extract Tab Content */}
        {activeTab === 'smart' && (
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-xl p-4">
              <h4 className="text-sm font-bold text-indigo-200 flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-300" />
                One-Click Job Field Auto-Extractor
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the job post URL to surf online and fetch the JD, or paste random text/email from a recruiter. The assistant will parse company name, role, salary, location, and requirements into the database fields automatically.
              </p>
            </div>

            {aiError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {aiError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Option A: Job Webpage URL (Online Surfing)
              </label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/jobs/view/... or company career page"
                value={smartUrl}
                onChange={(e) => setSmartUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">OR</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Option B: Paste Raw Job Description or Email Text
              </label>
              <textarea
                rows={6}
                placeholder="Paste the job description, recruiter message, requirements, or raw job details here..."
                value={smartRawText}
                onChange={(e) => setSmartRawText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              disabled={loadingAI}
              onClick={handleSmartExtract}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Surfing & Extracting Job Fields...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Auto-Fill Database Fields</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Details Form Tab Content */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Row 1: Company & Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Acme Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Title / Position <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior QA Architect / SDET Lead"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Where Received, Where Applied, Resume Used */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Where Received? (Source)
                </label>
                <select
                  value={formData.sourceReceived}
                  onChange={(e) => setFormData({ ...formData, sourceReceived: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {COMMON_SOURCES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Where Applied? (Platform)
                </label>
                <select
                  value={formData.platformApplied}
                  onChange={(e) => setFormData({ ...formData, platformApplied: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {COMMON_PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resume Used
                </label>
                <select
                  value={formData.resumeUsed}
                  onChange={(e) => handleResumeSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Resume --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Stage, Location, Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Board Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => {
                    const newStage = e.target.value;
                    const today = new Date().toISOString().slice(0, 10);
                    setFormData({
                      ...formData,
                      stage: newStage,
                      appliedDate: newStage === 'Applied' && !formData.appliedDate ? today : formData.appliedDate
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Remote / San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Salary / Compensation
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. $140k - $160k"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Job URL & Contact Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Person / Recruiter
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Tech Recruiter)"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Row 5: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Applied Date
                </label>
                <input
                  type="date"
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Row 6: Notes & Updates */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notes, Updates & Interview Progress
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Recruiter called on Tuesday; Round 1 Technical scheduled for Friday..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            {/* Row 7: Full JD Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Job Description Text (Used for Resume Matching)
              </label>
              <textarea
                rows={3}
                placeholder="Job description details, required skills, and responsibilities..."
                value={formData.jdText}
                onChange={(e) => setFormData({ ...formData, jdText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px] resize-none"
              ></textarea>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {initialData?.id ? (
                <button
                  type="button"
                  onClick={() => onDelete(initialData.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Job</span>
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{initialData?.id ? 'Save Updates' : 'Add to Board'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

