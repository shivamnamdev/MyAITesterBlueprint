import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import DailyTracker from './components/DailyTracker.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import JobModal from './components/JobModal.jsx';
import ResumeScoreModal from './components/ResumeScoreModal.jsx';
import ResumeManagerModal from './components/ResumeManagerModal.jsx';
import DailyGoalModal from './components/DailyGoalModal.jsx';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [dailyGoals, setDailyGoals] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, models: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResumeFilter, setSelectedResumeFilter] = useState('');

  // Modals state
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [defaultStage, setDefaultStage] = useState('To Search');
  const [startWithSmartTab, setStartWithSmartTab] = useState(false);

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoringJob, setScoringJob] = useState(null);

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [jobsRes, resumesRes, goalsRes, healthRes] = await Promise.all([
        fetch('/api/jobs').then(r => r.json()),
        fetch('/api/resumes').then(r => r.json()),
        fetch('/api/daily-goals').then(r => r.json()),
        fetch('/api/health').then(r => r.json())
      ]);

      setJobs(Array.isArray(jobsRes) ? jobsRes : []);
      setResumes(Array.isArray(resumesRes) ? resumesRes : []);
      setDailyGoals(goalsRes);
      setOllamaStatus(healthRes?.ollama || { online: false, models: [] });
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Job CRUD Handlers
  const handleSaveJob = async (jobData) => {
    try {
      if (jobData.id) {
        const res = await fetch(`/api/jobs/${jobData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
        if (!res.ok) throw new Error('Failed to update job');
      } else {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
        if (!res.ok) throw new Error('Failed to create job');
      }
      setJobModalOpen(false);
      setEditingJob(null);
      await fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job application?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job');
      setJobModalOpen(false);
      setEditingJob(null);
      await fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveStage = async (id, newStage) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      if (!res.ok) throw new Error('Failed to move stage');
      await fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateJobScore = async (jobId, score, breakdown, resumeUsed) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchScore: score,
          matchBreakdown: breakdown,
          resumeUsed
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setJobs(prev => prev.map(j => j.id === jobId ? updated : j));
      }
    } catch (err) {
      console.error('Failed to update job score:', err);
    }
  };

  // Resume Vault Handlers
  const handleAddResume = async (resumeData) => {
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData)
      });
      if (!res.ok) throw new Error('Failed to save resume');
      const saved = await res.json();
      setResumes(prev => [saved, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!confirm('Delete this resume profile?')) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResumes(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Daily Goal Handlers
  const handleSaveGoals = async (goalsData) => {
    try {
      const res = await fetch('/api/daily-goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalsData)
      });
      if (res.ok) {
        const updated = await res.json();
        setDailyGoals(updated);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickIncrement = async (type) => {
    if (!dailyGoals) return;
    const update = type === 'applied' 
      ? { actualApplied: (dailyGoals.actualApplied || 0) + 1 }
      : { actualSearched: (dailyGoals.actualSearched || 0) + 1 };
    await handleSaveGoals(update);
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery.trim() || [
      job.company,
      job.jobTitle,
      job.location,
      job.notes,
      job.contactPerson,
      job.platformApplied
    ].some(field => field && field.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesResume = !selectedResumeFilter || job.resumeUsed === selectedResumeFilter;

    return matchesSearch && matchesResume;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      
      {/* Navigation Bar */}
      <Navbar
        onAddJob={() => {
          setEditingJob(null);
          setDefaultStage('To Search');
          setStartWithSmartTab(false);
          setJobModalOpen(true);
        }}
        onOpenSmartAdd={() => {
          setEditingJob(null);
          setDefaultStage('To Search');
          setStartWithSmartTab(true);
          setJobModalOpen(true);
        }}
        onOpenResumes={() => setResumeModalOpen(true)}
        onOpenGoals={() => setGoalModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedResumeFilter={selectedResumeFilter}
        setSelectedResumeFilter={setSelectedResumeFilter}
        resumes={resumes}
        ollamaStatus={ollamaStatus}
        onRefresh={fetchAllData}
        loading={loading}
      />

      {/* Daily Progress Tracker */}
      <DailyTracker
        dailyGoals={dailyGoals}
        jobs={jobs}
        onEditGoals={() => setGoalModalOpen(true)}
      />

      {/* Kanban Board Area */}
      <div className="flex-1">
        <KanbanBoard
          jobs={filteredJobs}
          onAddJobForStage={(stage) => {
            setEditingJob(null);
            setDefaultStage(stage);
            setStartWithSmartTab(false);
            setJobModalOpen(true);
          }}
          onEditJob={(job) => {
            setEditingJob(job);
            setJobModalOpen(true);
          }}
          onDeleteJob={handleDeleteJob}
          onAssessMatch={(job) => {
            setScoringJob(job);
            setScoreModalOpen(true);
          }}
          onMoveStage={handleMoveStage}
        />
      </div>

      {/* Modals */}
      <JobModal
        isOpen={jobModalOpen}
        onClose={() => {
          setJobModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        onDelete={handleDeleteJob}
        initialData={editingJob}
        resumes={resumes}
        defaultStage={defaultStage}
        startWithSmartTab={startWithSmartTab}
      />

      <ResumeScoreModal
        isOpen={scoreModalOpen}
        onClose={() => {
          setScoreModalOpen(false);
          setScoringJob(null);
        }}
        job={scoringJob}
        resumes={resumes}
        onUpdateJobScore={handleUpdateJobScore}
      />

      <ResumeManagerModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        resumes={resumes}
        onAddResume={handleAddResume}
        onDeleteResume={handleDeleteResume}
      />

      <DailyGoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        dailyGoals={dailyGoals}
        onSaveGoals={handleSaveGoals}
      />

    </div>
  );
}

