import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileText,
  Key,
  Layers,
  Sparkles,
  Bot,
  Search,
  ArrowRight,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  Upload,
  FileUp,
  FileCode,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  // ── Step 1: JIRA Configuration State ──────────────────────────────────────────
  const [jiraUrl, setJiraUrl] = useState(() => localStorage.getItem('jira_url') || '');
  const [jiraEmail, setJiraEmail] = useState(() => localStorage.getItem('jira_email') || '');
  const [jiraToken, setJiraToken] = useState(() => localStorage.getItem('jira_token') || '');
  const [jiraProjectKey, setJiraProjectKey] = useState(() => localStorage.getItem('jira_project') || '');
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [rememberJira, setRememberJira] = useState(true);

  const [jiraConnecting, setJiraConnecting] = useState(false);
  const [jiraConnectedUser, setJiraConnectedUser] = useState(null);
  const [jiraError, setJiraError] = useState('');

  // ── Step 2: Ticket Fetch & Document Upload State ─────────────────────────────
  const [ticketId, setTicketId] = useState('');
  const [fetchingTicket, setFetchingTicket] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [ticketError, setTicketError] = useState('');

  // Uploaded Supplemental Requirement Document
  const [supplementalDoc, setSupplementalDoc] = useState(null); // { filename, text, charCount }
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const fileInputRef = useRef(null);

  // ── Step 3: LLM State ────────────────────────────────────────────────────────
  const [availableModels, setAvailableModels] = useState({
    cloudModels: [],
    localModels: [],
    ollamaStatus: { available: false },
  });
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem('anthropic_key') || '');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [verifyingAnthropic, setVerifyingAnthropic] = useState(false);
  const [anthropicVerified, setAnthropicVerified] = useState(false);
  const [anthropicError, setAnthropicError] = useState('');

  // ── Step 4: Two-Stage Generation State ───────────────────────────────────────
  // Stage 1: Test Plan
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [testPlan, setTestPlan] = useState(null);
  const [planApproved, setPlanApproved] = useState(false);

  // Stage 2: Test Cases (Enabled only after plan is approved)
  const [generatingCases, setGeneratingCases] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [engineUsed, setEngineUsed] = useState('');
  const [generationError, setGenerationError] = useState('');

  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'cases' | 'json'

  // Test cases filtering
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);

  // Write-back & Export State
  const [pushingToJira, setPushingToJira] = useState(false);
  const [pushedJiraKey, setPushedJiraKey] = useState('');
  const [exportingGDocs, setExportingGDocs] = useState(false);
  const [gdocsUrl, setGdocsUrl] = useState('');

  // ── Load available models on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/llm/models');
      const data = await res.json();
      if (data.success) {
        setAvailableModels(data);
      }
    } catch (err) {
      console.warn('Could not load models list:', err.message);
    }
  };

  // ── Connect & Test JIRA ─────────────────────────────────────────────────────
  const handleConnectJira = async (e) => {
    e?.preventDefault();
    setJiraConnecting(true);
    setJiraError('');
    setJiraConnectedUser(null);

    try {
      const res = await fetch('/api/jira/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: jiraUrl,
          email: jiraEmail,
          apiToken: jiraToken,
          projectKey: jiraProjectKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setJiraConnectedUser(data.user);
        if (rememberJira) {
          localStorage.setItem('jira_url', jiraUrl);
          localStorage.setItem('jira_email', jiraEmail);
          localStorage.setItem('jira_token', jiraToken);
          localStorage.setItem('jira_project', jiraProjectKey);
        }
      } else {
        setJiraError(data.error || 'Connection failed');
      }
    } catch (err) {
      setJiraError(err.message || 'Network error connecting to JIRA');
    } finally {
      setJiraConnecting(false);
    }
  };

  // ── Fetch Ticket Details ────────────────────────────────────────────────────
  const handleFetchTicket = async (e) => {
    e?.preventDefault();
    if (!ticketId.trim()) return;

    setFetchingTicket(true);
    setTicketError('');
    setTicketDetails(null);
    setTestPlan(null);
    setPlanApproved(false);
    setTestCases([]);
    setGenerationError('');

    try {
      const res = await fetch('/api/jira/fetch-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: jiraUrl,
          email: jiraEmail,
          apiToken: jiraToken,
          ticketId: ticketId.trim(),
          projectKey: jiraProjectKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTicketDetails(data.ticket);
      } else {
        setTicketError(data.error || 'Failed to fetch ticket');
      }
    } catch (err) {
      setTicketError(err.message || 'Error fetching ticket details');
    } finally {
      setFetchingTicket(false);
    }
  };

  // ── Handle Document File Upload ─────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setDocUploadError('');

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      // 1. Text files (.txt, .md, .json, .yaml, .yml, .csv)
      if (['txt', 'md', 'json', 'yaml', 'yml', 'csv'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result || '';
          setSupplementalDoc({
            filename: file.name,
            text,
            charCount: text.length,
          });
          setUploadingDoc(false);
        };
        reader.onerror = () => {
          setDocUploadError('Failed to read file');
          setUploadingDoc(false);
        };
        reader.readAsText(file);
      }
      // 2. Microsoft Word documents (.docx, .doc) -> Extract locally in browser with mammoth
      else if (ext === 'docx' || ext === 'doc') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result;
            const result = await mammoth.extractRawText({ arrayBuffer });
            const extractedText = (result.value || '').trim();
            if (!extractedText) {
              throw new Error('Word document contains no readable text');
            }
            setSupplementalDoc({
              filename: file.name,
              text: extractedText,
              charCount: extractedText.length,
            });
          } catch (mErr) {
            setDocUploadError(`Failed to parse Word document: ${mErr.message}`);
          } finally {
            setUploadingDoc(false);
          }
        };
        reader.onerror = () => {
          setDocUploadError('Failed to read Word file');
          setUploadingDoc(false);
        };
        reader.readAsArrayBuffer(file);
      }
      // 3. PDF documents -> Extract via server parser with safe response handling
      else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const dataUrl = event.target?.result || '';
            const base64 = dataUrl.split(',')[1];

            const res = await fetch('/api/generate/parse-doc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file: {
                  name: file.name,
                  contentBase64: base64,
                },
              }),
            });

            const rawText = await res.text();
            let data;
            try {
              data = JSON.parse(rawText);
            } catch {
              throw new Error(
                `Server returned an HTML response (${res.status}). Please restart the server with ./start.sh to ensure latest backend routes are active.`
              );
            }

            if (data.success && data.doc) {
              setSupplementalDoc(data.doc);
            } else {
              setDocUploadError(data.error || 'Failed to parse document');
            }
          } catch (uploadErr) {
            setDocUploadError(uploadErr.message || 'Failed to upload document');
          } finally {
            setUploadingDoc(false);
          }
        };
        reader.onerror = () => {
          setDocUploadError('Failed to read PDF file');
          setUploadingDoc(false);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setDocUploadError(err.message || 'Error reading file');
      setUploadingDoc(false);
    }
  };

  const handleRemoveDoc = () => {
    setSupplementalDoc(null);
    setDocUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Verify Anthropic API Key ────────────────────────────────────────────────
  const handleVerifyAnthropic = async () => {
    if (!anthropicKey.trim()) return;
    setVerifyingAnthropic(true);
    setAnthropicError('');
    setAnthropicVerified(false);

    try {
      const res = await fetch('/api/llm/test-anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: anthropicKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAnthropicVerified(true);
        localStorage.setItem('anthropic_key', anthropicKey.trim());
      } else {
        setAnthropicError(data.error || 'Invalid Anthropic API Key');
      }
    } catch (err) {
      setAnthropicError(err.message || 'Error verifying Anthropic API Key');
    } finally {
      setVerifyingAnthropic(false);
    }
  };

  // ── Composite Supplemental Document Context ─────────────────────────────────
  const getActiveSupplementalDoc = () => {
    let combinedText = '';
    let name = '';

    if (supplementalDoc?.text) {
      combinedText += supplementalDoc.text;
      name = supplementalDoc.filename;
    }
    if (manualNotes.trim()) {
      combinedText += (combinedText ? '\n\n' : '') + `MANUAL QA NOTES / SPECS:\n${manualNotes.trim()}`;
      name = name ? `${name} + Manual Notes` : 'Manual Requirement Notes';
    }

    if (!combinedText) return null;
    return { filename: name, text: combinedText, charCount: combinedText.length };
  };

  // ── STAGE 1: Generate Test Plan ONLY ────────────────────────────────────────
  const handleGenerateTestPlan = async () => {
    if (!ticketDetails) return;
    setGeneratingPlan(true);
    setGenerationError('');
    setPlanApproved(false);
    setTestCases([]);
    setPushedJiraKey('');

    try {
      const res = await fetch('/api/generate/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          apiKey: selectedProvider === 'anthropic' ? anthropicKey : '',
          ticket: ticketDetails,
          supplementalDoc: getActiveSupplementalDoc(),
        }),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned an HTML response (${res.status}). Please restart your server with ./start.sh on port 5080.`
        );
      }

      if (data.success) {
        setTestPlan(data.testPlan);
        setEngineUsed(data.engineUsed);
        setActiveTab('plan');
      } else {
        setGenerationError(data.error || 'Test Plan generation failed');
      }
    } catch (err) {
      setGenerationError(err.message || 'Error generating test plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // ── STAGE 2: Generate Test Cases (Enabled only after plan is approved) ────────
  const handleGenerateTestCases = async () => {
    if (!ticketDetails || !testPlan || !planApproved) return;
    setGeneratingCases(true);
    setGenerationError('');
    setPushedJiraKey('');

    try {
      const res = await fetch('/api/generate/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          apiKey: selectedProvider === 'anthropic' ? anthropicKey : '',
          ticket: ticketDetails,
          approvedTestPlan: testPlan,
          supplementalDoc: getActiveSupplementalDoc(),
        }),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned an HTML response (${res.status}). Please restart your server with ./start.sh on port 5080.`
        );
      }
      if (data.success) {
        setTestCases(data.testCases || []);
        setActiveTab('cases');
      } else {
        setGenerationError(data.error || 'Test Cases generation failed');
      }
    } catch (err) {
      setGenerationError(err.message || 'Error generating test cases');
    } finally {
      setGeneratingCases(false);
    }
  };

  // ── Export Handlers ─────────────────────────────────────────────────────────
  const handleDownloadXlsx = async () => {
    if (!testPlan) return;
    try {
      const res = await fetch('/api/export/xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPlan,
          testCases,
          filename: `${ticketDetails?.key || 'TestSuite'}_TestPlan_Cases`,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ticketDetails?.key || 'TestSuite'}_TestPlan_Cases.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download Excel file: ' + err.message);
    }
  };

  const handleDownloadCsv = async () => {
    if (!testCases.length) {
      alert('Please generate Test Cases first to export CSV.');
      return;
    }
    try {
      const res = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCases,
          ticketKey: ticketDetails?.key,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ticketDetails?.key || 'TestSuite'}_TestCases.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download CSV: ' + err.message);
    }
  };

  const handleDownloadMarkdown = async () => {
    if (!testPlan) return;
    try {
      const res = await fetch('/api/export/markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPlan,
          testCases,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ticketDetails?.key || 'TestSuite'}_TestPlan.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download Markdown: ' + err.message);
    }
  };

  const handleExportGDocs = async () => {
    if (!testPlan) return;
    setExportingGDocs(true);
    try {
      const res = await fetch('/api/gdocs/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPlan,
          testCases,
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setGdocsUrl(data.url);
        window.open(data.url, '_blank');
      } else {
        const authRes = await fetch('/api/gdocs/auth-url');
        const authData = await authRes.json();
        if (authData.url) {
          window.open(authData.url, '_blank');
        } else {
          alert('Google Docs notice: ' + (data.error || 'Configure GOOGLE_CLIENT_ID in .env'));
        }
      }
    } catch (err) {
      alert('Failed to export to Google Docs: ' + err.message);
    } finally {
      setExportingGDocs(false);
    }
  };

  const handlePushToJira = async () => {
    if (!testCases?.length) {
      alert('Generate test cases first to push to JIRA.');
      return;
    }
    setPushingToJira(true);
    try {
      const firstCase = testCases[0];
      const res = await fetch('/api/jira/create-test-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: jiraUrl,
          email: jiraEmail,
          apiToken: jiraToken,
          projectKey: ticketDetails.project?.key || jiraProjectKey,
          testCase: firstCase,
          linkedTicketKey: ticketDetails.key,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPushedJiraKey(data.issueKey);
      } else {
        alert('JIRA create notice: ' + data.error);
      }
    } catch (err) {
      alert('Failed to push to JIRA: ' + err.message);
    } finally {
      setPushingToJira(false);
    }
  };

  const handleCopyJson = () => {
    const fullJson = { testPlan, testCases };
    navigator.clipboard.writeText(JSON.stringify(fullJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Filter test cases
  const filteredTestCases = (testCases || []).filter((tc) => {
    const matchesType = filterType === 'ALL' || tc.type.toUpperCase() === filterType.toUpperCase();
    const matchesPriority = filterPriority === 'ALL' || tc.priority.toUpperCase() === filterPriority.toUpperCase();
    const matchesSearch =
      !searchQuery.trim() ||
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tc.preconditions && tc.preconditions.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">TestPlan AI Agent</span>
                <span className="badge badge-blue text-[10px]">v1.1 • Two-Stage Human-in-the-Loop</span>
              </div>
              <p className="text-xs text-slate-400">Deterministic QA Suite from JIRA & Supplemental Specs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {jiraConnectedUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>JIRA: {jiraConnectedUser.displayName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>JIRA: Disconnected</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
              <Bot className="w-3.5 h-3.5" />
              <span>{selectedModel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Container ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Intro Banner */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/40 border border-blue-900/30">
          <h1 className="text-2xl font-bold text-white mb-2">
            Two-Stage Intelligent QA Agent for JIRA & Requirement Specs
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Connect your JIRA workspace, fetch requirements, and optionally upload supporting PRDs, Tech Specs, or API definitions.
            Follow the <strong>Two-Stage QA Protocol</strong>: generate and review the <strong>Test Plan</strong> first; once approved,
            unlock deterministic step-by-step <strong>Test Cases</strong> generation with one-click exports.
          </p>
        </div>

        {/* ── Grid: Step 1 (JIRA) & Step 2 (Ticket + Document Upload) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Step 1: JIRA Configuration (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card-glass p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <h2 className="font-semibold text-white">JIRA Workspace Connection</h2>
                </div>
                <Database className="w-4 h-4 text-blue-400" />
              </div>

              <form onSubmit={handleConnectJira} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    JIRA Base URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://your-org.atlassian.net"
                    value={jiraUrl}
                    onChange={(e) => setJiraUrl(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Atlassian Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      JIRA API Token <span className="text-rose-400">*</span>
                    </label>
                    <a
                      href="https://id.atlassian.com/manage-profile/security/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Get Token <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showJiraToken ? 'text' : 'password'}
                      required
                      placeholder="Paste your Atlassian API Token"
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      className="input-field pr-10 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowJiraToken(!showJiraToken)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showJiraToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Default Project Key <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROJ or QA"
                    value={jiraProjectKey}
                    onChange={(e) => setJiraProjectKey(e.target.value.toUpperCase())}
                    className="input-field uppercase"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberJira}
                      onChange={(e) => setRememberJira(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    Remember in browser
                  </label>

                  <button
                    type="submit"
                    disabled={jiraConnecting || !jiraUrl || !jiraEmail || !jiraToken}
                    className="btn-primary text-xs py-2"
                  >
                    {jiraConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Test & Connect</span>
                      </>
                    )}
                  </button>
                </div>

                {jiraError && (
                  <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 whitespace-pre-wrap leading-relaxed">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{jiraError}</span>
                  </div>
                )}

                {jiraConnectedUser && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Connected as <strong>{jiraConnectedUser.displayName}</strong></span>
                    </div>
                    <span className="badge badge-green text-[10px]">Active</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Step 2: JIRA Ticket Inspector & Document Upload (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="card-glass p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <h2 className="font-semibold text-white">JIRA Requirement & Supplemental Docs</h2>
                </div>
                <Search className="w-4 h-4 text-blue-400" />
              </div>

              {/* Ticket Search Form */}
              <form onSubmit={handleFetchTicket} className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Enter Ticket ID (e.g. PROJ-101, QA-42) or paste ticket URL"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    className="input-field text-sm font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={fetchingTicket || !ticketId.trim()}
                  className="btn-primary shrink-0"
                >
                  {fetchingTicket ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <span>Fetch Ticket</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {ticketError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 whitespace-pre-wrap leading-relaxed">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Failed to fetch ticket</strong>
                    <span>{ticketError}</span>
                  </div>
                </div>
              )}

              {/* Ticket Preview Card */}
              {ticketDetails && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-blue font-mono">{ticketDetails.key}</span>
                        <span className="badge badge-purple">{ticketDetails.issueType}</span>
                        <span className="badge badge-amber">{ticketDetails.priority}</span>
                        <span className="text-xs text-slate-400">Status: <strong>{ticketDetails.status}</strong></span>
                      </div>
                      <h3 className="font-bold text-base text-white pt-1">{ticketDetails.summary}</h3>
                    </div>

                    <a
                      href={ticketDetails.browseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                    >
                      <span>Open in JIRA</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Acceptance Criteria Box */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Acceptance Criteria (AC)
                      </label>
                      {ticketDetails.hasAcceptanceCriteria ? (
                        <span className="badge badge-green text-[10px]">Detected</span>
                      ) : (
                        <span className="badge badge-amber text-[10px]">Not Declared</span>
                      )}
                    </div>
                    <div
                      className={`p-2.5 rounded-lg border text-xs max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed ${
                        ticketDetails.hasAcceptanceCriteria
                          ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                          : 'bg-amber-950/20 border-amber-800/40 text-amber-200/90'
                      }`}
                    >
                      {ticketDetails.hasAcceptanceCriteria
                        ? ticketDetails.acceptanceCriteria
                        : '⚠️ Notice: No explicit Acceptance Criteria found. Uploading a PRD/Spec below will significantly enhance test coverage!'}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Supplemental Document Upload Section ──────────────────────── */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-indigo-400" />
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Upload Supplemental Document / PRD / Specs
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400">Optional (DOCX, PDF, MD, TXT, JSON, YAML)</span>
                </div>

                {!supplementalDoc ? (
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/30">
                      <Upload className="w-6 h-6 text-indigo-400 mb-1.5" />
                      <span className="text-xs font-medium text-slate-300">
                        {uploadingDoc ? 'Parsing document...' : 'Click or drop Word (.docx), PDF, or Specification file'}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Supports Microsoft Word (.docx), PDF, Architecture diagrams, Swagger APIs, PRD drafts, and Wireframe specs
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx,.doc,.pdf,.md,.txt,.json,.yaml,.yml,.csv"
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCode className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="text-xs font-semibold text-white block">{supplementalDoc.filename}</span>
                        <span className="text-[11px] text-indigo-300/80">
                          {supplementalDoc.charCount.toLocaleString()} characters extracted and attached to prompt
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDoc}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove uploaded document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {docUploadError && (
                  <div className="text-xs text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{docUploadError}</span>
                  </div>
                )}

                {/* Optional Manual Notes Accordion */}
                <div>
                  <textarea
                    rows={2}
                    placeholder="Or quickly paste supplementary notes, API endpoint contract, or edge cases here..."
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="input-field text-xs resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 3: Model Selection & Anthropic Setup ────────────────────── */}
        <div className="card-glass p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <h2 className="font-semibold text-white">Select AI Engine & Model</h2>
            </div>
            <Bot className="w-5 h-5 text-blue-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Model Dropdown Selector (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Choose LLM Model <span className="text-rose-400">*</span>
                </label>
                <select
                  value={`${selectedProvider}::${selectedModel}`}
                  onChange={(e) => {
                    const [prov, mod] = e.target.value.split('::');
                    setSelectedProvider(prov);
                    setSelectedModel(mod);
                  }}
                  className="input-field font-medium text-sm bg-slate-900 py-3"
                >
                  <optgroup label="Anthropic Claude (Default Cloud Models)">
                    <option value="anthropic::claude-3-7-sonnet-20250219">
                      Claude 3.7 Sonnet (Recommended - Hybrid Reasoning)
                    </option>
                    <option value="anthropic::claude-3-5-sonnet-20241022">
                      Claude 3.5 Sonnet (High Accuracy QA)
                    </option>
                    <option value="anthropic::claude-3-opus-20240229">
                      Claude 3 Opus (Deep Analysis)
                    </option>
                    <option value="anthropic::claude-3-5-haiku-20241022">
                      Claude 3.5 Haiku (Ultra Fast & Cost-Efficient)
                    </option>
                  </optgroup>

                  {availableModels.localModels?.length > 0 && (
                    <optgroup label="Local Ollama Models (100% Offline)">
                      {availableModels.localModels.map((m) => (
                        <option key={m.id} value={`ollama::${m.id}`}>
                          {m.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="Google Gemini">
                    <option value="gemini::gemini-3.8-flash">
                      Gemini 3.8 Flash (Multimodal QA)
                    </option>
                  </optgroup>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Execution Mode:</span>
                  <span className="font-semibold text-white">Temperature: 0.2 (Deterministic)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Workflow:</span>
                  <span className="font-semibold text-blue-400">Two-Stage (Plan Review ➔ Cases)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Local Ollama Status:</span>
                  <span className={availableModels.ollamaStatus?.available ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {availableModels.ollamaStatus?.available ? 'Online (Ready)' : 'Offline (Optional)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Anthropic Browser Login / Key Setup (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {selectedProvider === 'anthropic' ? (
                <div className="p-5 rounded-xl border border-indigo-900/40 bg-indigo-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-semibold text-sm text-indigo-200">Anthropic Claude Authentication</h4>
                    </div>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1 px-2.5 bg-indigo-900/40 border-indigo-700/50 hover:bg-indigo-800/50 text-indigo-200"
                    >
                      <span>Anthropic Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                    Sign in to your Anthropic account in your browser, copy your API key from the console, and paste it below.
                    Your key is saved locally in your browser for seamless generation.
                  </p>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showAnthropicKey ? 'text' : 'password'}
                        placeholder="sk-ant-api03-..."
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        className="input-field pr-10 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleVerifyAnthropic}
                        disabled={verifyingAnthropic || !anthropicKey.trim()}
                        className="btn-secondary text-xs py-1.5"
                      >
                        {verifyingAnthropic ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify Key</span>
                          </>
                        )}
                      </button>

                      {anthropicVerified && (
                        <span className="badge badge-green text-[10px]">Key Verified</span>
                      )}
                    </div>

                    {anthropicError && (
                      <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{anthropicError}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedProvider === 'ollama' ? (
                <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-semibold text-sm text-emerald-200">Local Ollama Selected</h4>
                  </div>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">
                    Zero API keys needed. All reasoning and test generation executes 100% locally on your machine.
                  </p>
                  <p className="text-xs text-slate-400">
                    Host: <code>{availableModels.ollamaStatus?.host || 'http://localhost:11434'}</code>
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-blue-900/40 bg-blue-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h4 className="font-semibold text-sm text-blue-200">Google Gemini</h4>
                  </div>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Uses GEMINI_API_KEY from .env for high-speed balanced test generation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Two-Stage Workflow Action Buttons ─────────────────────────── */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              {ticketDetails ? (
                <span>Requirement: <strong>{ticketDetails.key}</strong> ({supplementalDoc ? `+ ${supplementalDoc.filename}` : 'No extra doc'})</span>
              ) : (
                <span>Fetch a ticket in Step 2 to enable generation</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Stage 1 Button: Generate Test Plan */}
              <button
                onClick={handleGenerateTestPlan}
                disabled={
                  generatingPlan ||
                  !ticketDetails ||
                  (selectedProvider === 'anthropic' && !anthropicKey && !process.env.ANTHROPIC_API_KEY)
                }
                className="btn-primary py-2.5 px-5 text-xs shadow-lg shadow-blue-600/20"
              >
                {generatingPlan ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Stage 1: Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Stage 1: Generate Test Plan</span>
                  </>
                )}
              </button>

              {/* Stage 2 Button: Generate Test Cases (Locked until plan approved) */}
              <button
                onClick={handleGenerateTestCases}
                disabled={generatingCases || !testPlan || !planApproved}
                className={`py-2.5 px-5 text-xs rounded-lg font-medium inline-flex items-center gap-2 transition-all ${
                  planApproved
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
                title={!planApproved ? 'Approve the Test Plan below first to enable Test Cases generation' : 'Generate step-by-step test cases'}
              >
                {generatingCases ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Stage 2: Generating Cases...</span>
                  </>
                ) : planApproved ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Stage 2: Generate Test Cases</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Stage 2: Locked (Approve Plan First)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {generationError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Generation Failed</strong>
                <span>{generationError}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Step 4: Results & Approval Gate ──────────────────────────────── */}
        {testPlan && (
          <div className="card-glass p-6 space-y-6">
            {/* Header & Export Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Test Plan & QA Suite</h2>
                  <span className="badge badge-blue">{engineUsed}</span>
                  {planApproved ? (
                    <span className="badge badge-green">Plan Approved</span>
                  ) : (
                    <span className="badge badge-amber">Plan Draft (Review Required)</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {testCases.length > 0
                    ? `${testCases.length} Test Cases generated for ${ticketDetails?.key}`
                    : 'Test Plan generated — review and approve to generate Test Cases'}
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadXlsx}
                  className="btn-secondary text-xs py-2 px-3 border-emerald-600/40 hover:border-emerald-500 text-emerald-300"
                  title="Download two-sheet Excel file (Plan + Cases)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handleDownloadCsv}
                  className="btn-secondary text-xs py-2 px-3 border-blue-600/40 hover:border-blue-500 text-blue-300"
                  title="Download CSV for Zephyr / Xray import"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="btn-secondary text-xs py-2 px-3"
                  title="Download formatted Markdown"
                >
                  <Download className="w-4 h-4" />
                  <span>Markdown</span>
                </button>

                <button
                  onClick={handleExportGDocs}
                  disabled={exportingGDocs}
                  className="btn-secondary text-xs py-2 px-3 border-amber-600/40 hover:border-amber-500 text-amber-300"
                  title="Export formatted Test Plan directly to Google Docs"
                >
                  {exportingGDocs ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{gdocsUrl ? 'Docs Exported ↗' : 'Google Docs'}</span>
                </button>

                <button
                  onClick={handlePushToJira}
                  disabled={pushingToJira || !!pushedJiraKey || !testCases.length}
                  className="btn-secondary text-xs py-2 px-3 border-indigo-600/40 hover:border-indigo-500 text-indigo-300"
                  title="Create test issue in JIRA and link to this ticket"
                >
                  {pushingToJira ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  ) : (
                    <Send className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{pushedJiraKey ? `Pushed: ${pushedJiraKey}` : 'Push to JIRA'}</span>
                </button>
              </div>
            </div>

            {/* Approval Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                planApproved
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {planApproved ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    {planApproved
                      ? 'Test Plan Approved — Ready for Test Cases Generation'
                      : 'Step 1 Review: Approve Test Plan to unlock Test Cases'}
                  </h4>
                  <p className="text-xs text-slate-300/90 mt-0.5">
                    {planApproved
                      ? 'Click "Stage 2: Generate Test Cases" above to derive test cases from this approved scope.'
                      : 'Carefully inspect the Scope, Strategy, and Environments below. Click Approve when satisfied.'}
                  </p>
                </div>
              </div>

              <div>
                {!planApproved ? (
                  <button
                    onClick={() => setPlanApproved(true)}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 px-4 shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Test Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setPlanApproved(false)}
                    className="btn-secondary text-xs py-1.5 px-3 border-slate-700 text-slate-400 hover:text-white"
                    title="Unlock to make changes"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Revoke Approval</span>
                  </button>
                )}
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800">
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'plan'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Test Plan View
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'cases'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Test Cases Grid ({testCases.length})
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'json'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Raw JSON
              </button>
            </div>

            {/* Tab 1: Test Plan */}
            {activeTab === 'plan' && testPlan && (
              <div className="space-y-6">
                {testPlan.warning && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">QA Integrity Notice</strong>
                      <span>{testPlan.warning}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Scope & Objectives */}
                  <div className="card-glass p-5 space-y-4">
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Scope & Objectives</span>
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider block">Scope</label>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        {testPlan.scope}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider block">Key Objectives</label>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {(testPlan.objectives || []).map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Strategy & Criteria */}
                  <div className="card-glass p-5 space-y-4">
                    <h3 className="font-semibold text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Test Strategy & Environments</span>
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider block">Coverage Types</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(testPlan.testStrategy?.types || []).map((t, i) => (
                          <span key={i} className="badge badge-purple text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider block">Target Environments</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(testPlan.testStrategy?.environments || []).map((env, i) => (
                          <span key={i} className="badge badge-blue text-[10px]">{env}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <label className="text-xs text-slate-400 uppercase tracking-wider block">Entry / Exit Criteria</label>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                          <strong className="text-emerald-400 block mb-1">Entry Criteria:</strong>
                          <ul className="space-y-1 text-slate-300">
                            {(testPlan.testStrategy?.entryCriteria || []).map((ec, i) => (
                              <li key={i}>• {ec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                          <strong className="text-rose-400 block mb-1">Exit Criteria:</strong>
                          <ul className="space-y-1 text-slate-300">
                            {(testPlan.testStrategy?.exitCriteria || []).map((xc, i) => (
                              <li key={i}>• {xc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                {testPlan.riskAssessment?.length > 0 && (
                  <div className="card-glass p-5 space-y-3">
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Identified Risks & Mitigations</span>
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                      {testPlan.riskAssessment.map((risk, i) => (
                        <li key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Test Cases Grid */}
            {activeTab === 'cases' && (
              <div className="space-y-4">
                {testCases.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                    <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                    <h4 className="font-semibold text-sm text-slate-300">No Test Cases Generated Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {planApproved
                        ? 'Your Test Plan is approved! Click "Stage 2: Generate Test Cases" at the top to generate detailed test steps.'
                        : 'Review and approve the Test Plan in Tab 1 first to enable Test Cases generation.'}
                    </p>
                    {planApproved && (
                      <button
                        onClick={handleGenerateTestCases}
                        disabled={generatingCases}
                        className="btn-primary text-xs py-2 px-4 mt-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Test Cases Now</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-72">
                        <input
                          type="text"
                          placeholder="Search test cases by title, ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input-field text-xs pl-8"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="input-field text-xs py-2 bg-slate-900"
                        >
                          <option value="ALL">All Types</option>
                          <option value="FUNCTIONAL">Functional</option>
                          <option value="NEGATIVE">Negative</option>
                          <option value="BOUNDARY">Boundary</option>
                          <option value="SMOKE">Smoke</option>
                          <option value="SECURITY">Security</option>
                        </select>

                        <select
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                          className="input-field text-xs py-2 bg-slate-900"
                        >
                          <option value="ALL">All Priorities</option>
                          <option value="CRITICAL">Critical</option>
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Test Cases Table */}
                    <div className="space-y-4">
                      {filteredTestCases.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
                          No test cases match the active filter criteria.
                        </div>
                      ) : (
                        filteredTestCases.map((tc) => (
                          <div
                            key={tc.id}
                            className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3">
                                <span className="badge badge-blue font-mono">{tc.id}</span>
                                <h4 className="font-semibold text-white text-sm">{tc.title}</h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`badge text-[10px] ${
                                    tc.priority?.toUpperCase() === 'CRITICAL'
                                      ? 'badge-red'
                                      : tc.priority?.toUpperCase() === 'HIGH'
                                      ? 'badge-amber'
                                      : 'badge-blue'
                                  }`}
                                >
                                  {tc.priority}
                                </span>
                                <span className="badge badge-purple text-[10px]">{tc.type}</span>
                              </div>
                            </div>

                            {tc.preconditions && (
                              <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                                <strong className="text-slate-300">Preconditions: </strong>
                                <span>{tc.preconditions}</span>
                              </div>
                            )}

                            {/* Steps Table */}
                            <div className="overflow-x-auto rounded-lg border border-slate-800">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                                  <tr>
                                    <th className="px-3 py-2 w-16">Step</th>
                                    <th className="px-3 py-2">Action</th>
                                    <th className="px-3 py-2 w-48">Test Data</th>
                                    <th className="px-3 py-2">Expected Result</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                  {(tc.steps || []).map((step, sIdx) => (
                                    <tr key={sIdx} className="hover:bg-slate-800/30">
                                      <td className="px-3 py-2.5 font-mono text-blue-400 font-semibold">
                                        #{step.stepNumber || sIdx + 1}
                                      </td>
                                      <td className="px-3 py-2.5 text-slate-200">{step.action}</td>
                                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px]">
                                        {step.testData || '—'}
                                      </td>
                                      <td className="px-3 py-2.5 text-emerald-300/90 font-medium">
                                        {step.expectedResult}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {tc.postconditions && (
                              <div className="text-xs text-slate-400">
                                <strong>Postconditions: </strong>
                                <span>{tc.postconditions}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab 3: Raw JSON */}
            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button onClick={handleCopyJson} className="btn-secondary text-xs py-1.5 px-3">
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 overflow-x-auto font-mono max-h-96">
                  {JSON.stringify({ testPlan, testCases }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
