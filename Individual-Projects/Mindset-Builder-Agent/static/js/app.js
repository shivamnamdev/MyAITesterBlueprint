/**
 * Mindset Builder Agent - Client Application Logic
 * Stage-Driven Architecture with Storytelling Pedagogical Induction
 */

// Application State
const state = {
  currentStage: 0, // 0: Landing Chatbot, 1: Base Mentality & Analogies, 2: Chapter Storytelling, 3: Master Synthesis
  currentChapterId: 1,
  domainIntel: null,
  analogies: null,
  selectedAnalogyKey: null,
  selectedAnalogy: null,
  curriculum: null,
  conversationHistory: [],
  isLoading: false,
  unlockedStage: 1
};

// Safe DOM Getter
function getEl(id) {
  return document.getElementById(id);
}

function setElText(id, text) {
  const el = getEl(id);
  if (el) el.textContent = text;
}

function setElHtml(id, html) {
  const el = getEl(id);
  if (el) el.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  const messageInput = getEl('message-input');
  const sendBtn = getEl('send-btn');
  const exportBtn = getEl('export-btn');
  const askMentorToggleBtn = getEl('ask-mentor-toggle-btn');
  const closeMentorDrawerBtn = getEl('close-mentor-drawer-btn');
  const mentorSendBtn = getEl('mentor-send-btn');
  const mentorInputField = getEl('mentor-input-field');
  const mentorDrawer = getEl('mentor-drawer');

  // Chat Input Handling (Auto-expanding, Enter-to-send)
  if (messageInput) {
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
      if (sendBtn) {
        sendBtn.disabled = !messageInput.value.trim() || state.isLoading;
      }
    });

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const val = messageInput.value.trim();
        if (val && !state.isLoading) {
          startJourney(val);
        }
      }
    });
  }

  // Send Button Click
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const val = messageInput ? messageInput.value.trim() : '';
      if (val && !state.isLoading) {
        startJourney(val);
      }
    });
  }

  // Quick Starter Chips
  document.querySelectorAll('.chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const domain = btn.getAttribute('data-domain');
      if (domain && !state.isLoading) {
        startJourney(domain);
      }
    });
  });

  // Export Blueprint Button
  if (exportBtn) {
    exportBtn.addEventListener('click', exportDossier);
  }

  // Socratic Mentor Drawer Toggle & Input
  if (askMentorToggleBtn && mentorDrawer) {
    askMentorToggleBtn.addEventListener('click', () => {
      mentorDrawer.classList.toggle('open');
    });
  }

  if (closeMentorDrawerBtn && mentorDrawer) {
    closeMentorDrawerBtn.addEventListener('click', () => {
      mentorDrawer.classList.remove('open');
    });
  }

  if (mentorSendBtn) {
    mentorSendBtn.addEventListener('click', sendMentorQuestion);
  }

  if (mentorInputField) {
    mentorInputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMentorQuestion();
      }
    });
  }
}

let notificationTimer = null;
let notificationStartTime = 0;

function showNotification(title, message, progress = 25) {
  const banner = getEl('backend-notification-banner');
  if (banner) {
    banner.style.display = 'block';
    setElText('notification-status-msg', message);
    const bar = getEl('notification-progress-bar');
    if (bar) bar.style.width = `${progress}%`;
  }
  
  if (!notificationTimer) {
    notificationStartTime = Date.now();
    notificationTimer = setInterval(() => {
      const elapsed = ((Date.now() - notificationStartTime) / 1000).toFixed(1);
      setElText('notification-time-badge', `${elapsed}s`);
    }, 100);
  }
}

function hideNotification() {
  const banner = getEl('backend-notification-banner');
  if (banner) banner.style.display = 'none';
  if (notificationTimer) {
    clearInterval(notificationTimer);
    notificationTimer = null;
  }
}

function updateLoadingPhases(stepIndex, totalSteps = 4, customText = '') {
  const stepsContainer = getEl('loading-phase-steps');
  const linearBar = getEl('loading-linear-bar');
  if (linearBar) {
    linearBar.style.width = `${Math.min(100, Math.round((stepIndex / totalSteps) * 100))}%`;
  }
  if (stepsContainer) {
    const steps = stepsContainer.querySelectorAll('.phase-step');
    steps.forEach((st, idx) => {
      if (idx + 1 < stepIndex) {
        st.className = 'phase-step completed';
      } else if (idx + 1 === stepIndex) {
        st.className = 'phase-step active';
      } else {
        st.className = 'phase-step';
      }
    });
  }
  if (customText) {
    setElText('loading-text', customText);
  }
}

function showLoading(text) {
  state.isLoading = true;
  setElText('loading-text', text || 'Wiring Neural Mindset...');
  const overlay = getEl('loading-overlay');
  if (overlay) overlay.style.display = 'flex';
  const sendBtn = getEl('send-btn');
  if (sendBtn) sendBtn.disabled = true;
  if (window.neuralCanvas) window.neuralCanvas.setExcited(true);
}

function hideLoading() {
  state.isLoading = false;
  const overlay = getEl('loading-overlay');
  if (overlay) overlay.style.display = 'none';
  hideNotification();
  const inputHint = getEl('input-status-hint');
  if (inputHint) inputHint.style.display = 'none';
  const sendBtn = getEl('send-btn');
  const messageInput = getEl('message-input');
  if (sendBtn && messageInput) {
    sendBtn.disabled = !messageInput.value.trim();
  }
  if (window.neuralCanvas) window.neuralCanvas.setExcited(false);
}

// Global Reset back to Landing Chatbot View
window.resetToInitial = function () {
  state.currentStage = 0;
  state.currentChapterId = 1;
  state.domainIntel = null;
  state.analogies = null;
  state.selectedAnalogy = null;
  state.curriculum = null;
  state.unlockedStage = 1;

  hideLoading();
  hideNotification();

  const landing = getEl('chatbot-landing-view');
  const dashboard = getEl('stage-dashboard-view');
  const mentorBtn = getEl('ask-mentor-toggle-btn');
  const exportBtn = getEl('export-btn');
  const badge = getEl('active-domain-badge') || getEl('active-domain-tag');
  const messageInput = getEl('message-input');
  const sendBtn = getEl('send-btn');

  if (landing) {
    landing.classList.remove('hidden');
    landing.style.display = 'flex';
  }
  if (dashboard) {
    dashboard.classList.remove('active');
    dashboard.classList.add('hidden');
    dashboard.style.display = 'none';
  }
  if (mentorBtn) mentorBtn.style.display = 'none';
  if (exportBtn) exportBtn.disabled = true;

  if (badge) {
    badge.textContent = 'Ready to Wire Mindset';
    badge.className = 'badge-tag pulse';
  }

  if (messageInput) {
    messageInput.value = '';
    messageInput.style.height = 'auto';
  }
  if (sendBtn) sendBtn.disabled = true;
};

// =========================================================
// STEP 1: Ingest Domain and Transition to Stage Dashboard
// =========================================================
async function startJourney(domainQuery) {
  // 1. Immediate visual feedback right at input and navbar
  const inputHint = getEl('input-status-hint');
  if (inputHint) {
    inputHint.style.display = 'inline-flex';
    setElText('input-status-text', `Connecting neural engine for "${domainQuery}"...`);
  }

  const badge = getEl('active-domain-badge') || getEl('active-domain-tag');
  if (badge) {
    badge.textContent = `⚡ Wiring: ${domainQuery}`;
    badge.className = 'badge-tag pulse';
  }

  showLoading(`Deconstructing cognitive foundations for "${domainQuery}"...`);
  showNotification('Neural Ingestion', `Deconstructing first principles & certification standards for "${domainQuery}"...`, 25);
  updateLoadingPhases(1, 4, `Deconstructing cognitive foundations for "${domainQuery}"...`);

  // Animate multi-stage telemetry updates while backend compiles
  const stepTimer1 = setTimeout(() => {
    updateLoadingPhases(2, 4, 'Analyzing certification syllabi (ISTQB, IEEE, DORA, CISSP)...');
    showNotification('Syllabus Analysis', 'Extracting global industry standards and cognitive invariants...', 50);
  }, 350);

  const stepTimer2 = setTimeout(() => {
    updateLoadingPhases(3, 4, 'Synthesizing Tri-Tier Analogies (Easy, Medium, Hard)...');
    showNotification('Analogy Matrix', 'Synthesizing 3 graded cognitive analogies and mapping tables...', 75);
  }, 700);

  try {
    const res = await fetch('/api/domain/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: domainQuery })
    });

    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);

    updateLoadingPhases(4, 4, 'Assembling Stage 1 Dashboard...');
    showNotification('Engine Ready', 'Cognitive models compiled. Transitioning to Stage 1...', 100);

    const data = await res.json();
    hideLoading();

    if (data.status === 'error') {
      alert(`Error: ${data.message}`);
      return;
    }

    state.domainIntel = data.domain_intel;
    state.analogies = data.analogies;
    state.unlockedStage = 1;

    // Update Header Badges with safe fallbacks
    if (badge) {
      badge.textContent = state.domainIntel.domain;
      badge.className = 'badge-tag';
    }

    setElText('timeline-domain-label', state.domainIntel.domain);

    const mentorBtn = getEl('ask-mentor-toggle-btn');
    if (mentorBtn) mentorBtn.style.display = 'inline-flex';

    const exportBtn = getEl('export-btn');
    if (exportBtn) exportBtn.disabled = false;

    // Transition from Chatbot Landing View to Stage Dashboard View
    const landing = getEl('chatbot-landing-view');
    const dashboard = getEl('stage-dashboard-view');
    if (landing) {
      landing.classList.add('hidden');
      landing.style.display = 'none';
    }
    if (dashboard) {
      dashboard.classList.remove('hidden');
      dashboard.classList.add('active');
      dashboard.style.display = 'flex';
    }

    // Render Stage 1: Base Mentality + 3 Analogies
    goToStage(1);

  } catch (err) {
    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    hideLoading();
    alert(`Encountered error: ${err.message}`);
  }
}

// =========================================================
// NAVIGATION & TIMELINE ORCHESTRATION
// =========================================================
function updateProgress(percent) {
  const bar = getEl('timeline-progress-bar');
  if (bar) bar.style.width = `${percent}%`;
  setElText('timeline-progress-percent', `${percent}%`);
}

window.goToStage = function (stageNum, chapterId = 1) {
  state.currentStage = stageNum;
  if (stageNum === 2) {
    state.currentChapterId = chapterId;
  }
  if (stageNum > state.unlockedStage) {
    state.unlockedStage = stageNum;
  }

  const stageContent = getEl('stage-content-viewport');
  if (stageContent) {
    // Wipe out previous stage data completely
    stageContent.innerHTML = '';
    stageContent.scrollTop = 0;
  }

  // Render timeline AFTER state.currentStage and state.currentChapterId are both synchronized
  renderTimeline();

  if (stageNum === 1) {
    updateProgress(30);
    renderStage1BaseMentalityAndAnalogies();
  } else if (stageNum === 2) {
    const chProgress = 35 + chapterId * 12;
    updateProgress(Math.min(92, chProgress));
    renderStage2StoryChapter(chapterId);
  } else if (stageNum === 3) {
    updateProgress(100);
    renderStage3Synthesis();
  }
};

function renderTimeline() {
  const stages = [
    {
      num: 1,
      title: 'Stage 1: Base Mentality & Analogies',
      desc: 'First Principles, Certifications & 3 Graded Mental Anchors'
    },
    {
      num: 2,
      title: 'Stage 2: Chapter Story Induction',
      desc: 'Clinical Narrative Dilemmas & Real-World Decision Drills'
    },
    {
      num: 3,
      title: 'Stage 3: Mindset Master Synthesis',
      desc: 'Lifelong Axioms & Full Blueprint Export'
    }
  ];

  let html = '';

  stages.forEach((st) => {
    let statusClass = 'locked';
    let markerContent = st.num;

    if (st.num < state.currentStage) {
      statusClass = 'completed';
      markerContent = '✓';
    } else if (st.num === state.currentStage) {
      statusClass = 'active';
      markerContent = st.num;
    } else if (st.num <= state.unlockedStage) {
      statusClass = 'available';
      markerContent = st.num;
    }

    const clickable = st.num <= state.unlockedStage ? `onclick="goToStage(${st.num})"` : '';

    // Sub-chapters display when in Stage 2 (Chapter Induction)
    let subChaptersHtml = '';
    if (st.num === 2 && state.curriculum && (state.currentStage === 2 || state.unlockedStage >= 2)) {
      subChaptersHtml = `
        <div class="t-sub-chapters">
          ${state.curriculum.map((c) => {
            const isActiveCh = state.currentStage === 2 && state.currentChapterId === c.chapter_id;
            const isCompletedCh = state.currentStage > 2 || (state.currentStage === 2 && state.currentChapterId > c.chapter_id);
            return `
              <div 
                class="t-sub-node ${isActiveCh ? 'active' : ''} ${isCompletedCh ? 'completed' : ''}" 
                onclick="event.stopPropagation(); goToStage(2, ${c.chapter_id})"
              >
                ${isCompletedCh ? '✓ ' : ''}Ch ${c.chapter_id}: ${escapeHtml(c.title.split(':')[1] || c.title)}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    html += `
      <div class="t-step ${statusClass}" ${clickable}>
        <div class="t-marker">${markerContent}</div>
        <div class="t-content">
          <div class="t-label">${st.title}</div>
          <div class="t-desc">${st.desc}</div>
          ${subChaptersHtml}
        </div>
      </div>
    `;
  });

  setElHtml('timeline-steps-container', html);
}

// =========================================================
// STAGE 1: BASE MENTALITY & TRI-TIER ANALOGIES
// =========================================================
function renderStage1BaseMentalityAndAnalogies() {
  const intel = state.domainIntel;
  const analogies = state.analogies;
  const stageContent = getEl('stage-content-viewport');
  if (!intel || !stageContent) return;

  // First Principles
  const principlesHtml = (intel.first_principles || []).map((p, idx) => `
    <div class="principle-card">
      <div class="principle-num">AXIOM 0${idx + 1}</div>
      <div class="principle-text">${escapeHtml(p)}</div>
    </div>
  `).join('');

  // Certifications
  const certsHtml = (intel.syllabi_and_standards || []).map((s) => `
    <span class="cert-pill">📜 ${escapeHtml(s)}</span>
  `).join('');

  // 3 Analogies Cards
  const analogyCardsHtml = analogies ? Object.keys(analogies).map((key) => {
    const a = analogies[key];
    const mappingsHtml = (a.mapping || []).slice(0, 3).map((m) => `
      <div class="mapping-item">
        <strong>${escapeHtml(m.domain_concept)}</strong> → 
        <span style="color:var(--accent-cyan);">${escapeHtml(m.analogy_counterpart)}</span>
      </div>
    `).join('');

    return `
      <div class="analogy-tile" data-key="${key}" onclick="selectAnalogyAndStartChapters('${key}')">
        <div>
          <span class="analogy-tile-badge ${a.badge_color || 'emerald'}">${escapeHtml(a.tier_label || '')}</span>
          <h3>${escapeHtml(a.title || '')}</h3>
          <div class="tile-tagline">${escapeHtml(a.tagline || '')}</div>
          <div class="tile-narrative">${escapeHtml(a.narrative || '')}</div>
          
          <div class="analogy-mapping-preview">
            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px;">
              COGNITIVE MAPPING PREVIEW
            </div>
            ${mappingsHtml}
          </div>
        </div>

        <button class="btn-choose-analogy" onclick="event.stopPropagation(); selectAnalogyAndStartChapters('${key}')">
          Anchor Mindset with This Analogy →
        </button>
      </div>
    `;
  }).join('') : '';

  const evn = intel.expert_vs_novice_mindset || {};

  stageContent.innerHTML = `
    <div class="stage-header-badge">STAGE 1 // FIELD INTELLIGENCE & BASE MENTALITY</div>
    <h1 class="stage-title">${escapeHtml(intel.domain)}</h1>
    <div class="stage-tagline">"${escapeHtml(intel.tagline || '')}"</div>

    <div class="principles-grid">
      ${principlesHtml}
    </div>

    <div class="syllabi-box">
      <h4>Recognized Certification Syllabi & Global Standards</h4>
      <div class="syllabi-pills">
        ${certsHtml}
      </div>
    </div>

    <div class="battle-container">
      <div class="battle-side novice">
        <div class="battle-header">
          <span>❌</span> Novice / Checklist Mindset
        </div>
        <div class="battle-text">
          ${escapeHtml(evn.novice || '')}
        </div>
      </div>

      <div class="battle-side master">
        <div class="battle-header">
          <span>⚡</span> Master / First-Principles Mindset
        </div>
        <div class="battle-text">
          ${escapeHtml(evn.expert || '')}
        </div>
      </div>
    </div>

    <div class="mindset-thesis-banner">
      <h4>Why Mindset Beats Mechanical Skill in the Era of AI</h4>
      <p>${escapeHtml(intel.why_mindset_beats_skill || '')}</p>
    </div>

    <!-- Section: 3 Tri-Tier Analogies -->
    <div class="stage-section-divider">
      <div class="stage-header-badge" style="background: rgba(129, 140, 248, 0.15); color: var(--accent-indigo); border-color: rgba(129, 140, 248, 0.3);">
        CHOOSE YOUR MENTAL ANCHOR
      </div>
      <h2 class="stage-section-title">Tri-Tier Cognitive Analogies</h2>
      <div class="stage-section-subtitle">
        Select one of the 3 graded analogies below. Clicking your chosen analogy will <strong>wipe out everything and launch your chapter-wise storytelling curriculum</strong>.
      </div>

      <div class="analogies-stage-grid">
        ${analogyCardsHtml}
      </div>
    </div>
  `;
}

// User selects an analogy -> "wipes out everything and start chapter wise data"
window.selectAnalogyAndStartChapters = async function (analogyKey) {
  state.selectedAnalogyKey = analogyKey;
  state.selectedAnalogy = state.analogies[analogyKey];

  showLoading(`Wiping stage and constructing storytelling curriculum for "${state.selectedAnalogy.title}"...`);
  showNotification('Story Induction', `Wiping previous stage & anchoring cognitive models in "${state.selectedAnalogy.title}"...`, 30);
  updateLoadingPhases(1, 4, `Wiping stage & loading narrative dilemma...`);

  const stepTimer1 = setTimeout(() => {
    updateLoadingPhases(2, 4, 'Generating illustrated visual SVG scenes & telemetry graphs...');
    showNotification('Visual Telemetry', 'Rendering clinical diagnostic SVG waveforms & differential trees...', 60);
  }, 250);

  const stepTimer2 = setTimeout(() => {
    updateLoadingPhases(3, 4, 'Calibrating real-world crisis scenario drills...');
    showNotification('Decision Drills', 'Formulating cognitive scenario dilemmas with instant verdicts...', 85);
  }, 500);

  try {
    const res = await fetch('/api/curriculum/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain_intel: state.domainIntel,
        analogy_key: analogyKey
      })
    });

    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);

    updateLoadingPhases(4, 4, 'Launching Chapter 01...');
    showNotification('Curriculum Ready', 'Launching Chapter 01 Story Induction...', 100);

    const data = await res.json();
    hideLoading();

    if (data.status === 'error') {
      alert(`Error: ${data.message}`);
      return;
    }

    state.curriculum = data.curriculum;
    state.unlockedStage = 2; // Unlock Stage 2 (Chapters)

    // Transitions cleanly into Chapter 1 of Stage 2 (everything wiped clean)
    goToStage(2, 1);

  } catch (err) {
    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    hideLoading();
    alert(`Encountered error: ${err.message}`);
  }
};

// =========================================================
// STAGE 2: IMMERSIVE STORYTELLING CHAPTER VIEW
// =========================================================
function renderStage2StoryChapter(chapterId) {
  const stageContent = getEl('stage-content-viewport');
  if (!state.curriculum || !stageContent) return;

  const ch = state.curriculum.find((c) => c.chapter_id === chapterId);
  if (!ch) return;

  const story = ch.story || {};
  const isFirstCh = chapterId === 1;
  const isLastCh = chapterId === state.curriculum.length;

  let drillHtml = '';
  if (ch.scenario_drill) {
    const drill = ch.scenario_drill;
    const optionsHtml = (drill.options || []).map((opt) => `
      <button class="drill-opt-btn" onclick="evaluateDrillOptionById(${ch.chapter_id}, '${opt.id}')">
        <strong>Option ${opt.id}:</strong> ${escapeHtml(opt.label || '')}
      </button>
    `).join('');

    drillHtml = `
      <div class="scenario-drill-card">
        <div class="drill-title">⚔️ REAL-WORLD SCENARIO DILEMMA</div>
        <div class="drill-situation">${escapeHtml(drill.situation || '')}</div>
        <div class="drill-question">${escapeHtml(drill.question || '')}</div>
        <div class="drill-options-grid">
          ${optionsHtml}
        </div>
        <div id="drill-verdict-box" class="drill-feedback-box"></div>
      </div>
    `;
  }

  stageContent.innerHTML = `
    <div class="chapter-stage-container">
      <div class="stage-header-badge">
        STAGE 2 // CHAPTER 0${ch.chapter_id} OF 05
      </div>

      <div class="chapter-act-header">
        <div class="act-badge">${escapeHtml(story.act_title || `Act ${ch.chapter_id}`)}</div>
        <h1 class="act-title">${escapeHtml(ch.title || '')}</h1>
        <div class="act-meta">
          <span>📍 <strong>Setting:</strong> ${escapeHtml(story.setting || 'Clinical Unit')}</span>
          <span>👥 <strong>Characters:</strong> ${escapeHtml(story.characters || 'Dr. Elena Vance & Team')}</span>
        </div>
      </div>

      <!-- Illustrated Visual SVG Scene -->
      <div class="story-svg-container">
        ${story.svg_banner || ''}
      </div>

      <!-- Gripping Storytelling Narrative -->
      <div class="story-narrative-card">
        <h4>📖 The Narrative Dilemma</h4>
        <div class="story-text">${escapeHtml(story.narrative || ch.concept_breakdown || '')}</div>
      </div>

      <!-- Cognitive Bridge to Domain -->
      <div class="cognitive-bridge-card">
        <h4>Cognitive Translation & Reflex Induction</h4>
        <p>${escapeHtml(story.cognitive_bridge || ch.analogy_immersion || '')}</p>
      </div>

      <!-- Golden Axiom & Reflection -->
      <div class="golden-axiom-bar">
        <strong>⚡ Golden Axiom</strong>
        <p>"${escapeHtml(ch.golden_axiom || '')}"</p>
      </div>

      <div style="font-style: italic; color: #94a3b8; font-size: 0.9rem; margin-bottom: 24px; padding-left: 6px;">
        🤔 <strong>Daily Reflection:</strong> ${escapeHtml(ch.reflection_prompt || '')}
      </div>

      <!-- Interactive Scenario Drill -->
      ${drillHtml}

      <!-- Chapter Navigation Actions -->
      <div class="chapter-nav-actions">
        ${!isFirstCh ? `<button class="btn-icon" onclick="goToStage(2, ${chapterId - 1})">← Previous Chapter</button>` : '<div></div>'}
        
        ${isLastCh 
          ? `<button class="btn-stage-advance" onclick="goToStage(3)">Complete Mindset Certification →</button>`
          : `<button class="btn-stage-advance" onclick="goToStage(2, ${chapterId + 1})">Proceed to Chapter 0${chapterId + 1} →</button>`
        }
      </div>
    </div>
  `;
}

window.evaluateDrillOptionById = function (chapterId, optId) {
  if (!state.curriculum) return;
  const ch = state.curriculum.find((c) => c.chapter_id === chapterId);
  if (!ch || !ch.scenario_drill) return;
  const opt = (ch.scenario_drill.options || []).find((o) => o.id === optId);
  if (!opt) return;
  evaluateDrillOption(opt.id, opt.mindset_alignment, opt.verdict);
};

window.evaluateDrillOption = function (optId, alignment, verdict) {
  const box = getEl('drill-verdict-box');
  if (!box) return;

  const isMaster = (alignment || '').toLowerCase().includes('master') || (alignment || '').toLowerCase().includes('partner') || (alignment || '').toLowerCase().includes('catalyst');
  box.className = `drill-feedback-box show ${isMaster ? 'master' : 'novice'}`;
  box.innerHTML = `
    <div style="font-weight:800; font-size:0.95rem; margin-bottom:4px;">
      ${isMaster ? '🎯 Master Mindset Assessment' : '⚠️ Procedural Mindset Trap'} (Option ${optId})
    </div>
    <div style="font-size:0.82rem; margin-bottom:8px; opacity:0.9;"><strong>Alignment:</strong> ${alignment}</div>
    <div style="font-size:0.92rem; line-height:1.5;">${verdict}</div>
  `;
};

// =========================================================
// STAGE 3: MASTER SYNTHESIS & DOSSIER VIEW
// =========================================================
function renderStage3Synthesis() {
  const intel = state.domainIntel;
  const analogy = state.selectedAnalogy;
  const stageContent = getEl('stage-content-viewport');
  if (!intel || !analogy || !stageContent) return;

  const axioms = (state.curriculum || []).map((c, i) => `
    <li><strong>Axiom 0${i + 1}:</strong> ${escapeHtml(c.golden_axiom || '')}</li>
  `).join('');

  stageContent.innerHTML = `
    <div class="synthesis-card">
      <div class="synthesis-badge">✦ MINDSET CERTIFICATION COMPLETE</div>
      <h2>You Have Wired the ${escapeHtml(intel.domain)} Mindset</h2>
      <p>
        You have transitioned from a procedural checklist-follower to an intuitive, 
        first-principles practitioner anchored in <strong>${escapeHtml(analogy.title || '')}</strong>. 
        Remember: tools and AI models will automate mechanics, but your cognitive radar for unknown unknowns is your lifelong moat.
      </p>

      <div class="axioms-summary-list">
        <h4>Core Internalized Mindset Axioms</h4>
        <ol>
          ${axioms}
        </ol>
      </div>

      <div style="display:flex; justify-content:center; gap:16px;">
        <button class="btn-stage-advance" onclick="exportDossier()">
          📥 Download Master Mindset Blueprint (.md)
        </button>
        <button class="btn-icon" onclick="resetToInitial()">
          Explore Another Field ↺
        </button>
      </div>
    </div>
  `;
}

// =========================================================
// SOCRATIC MENTOR DRAWER
// =========================================================
async function sendMentorQuestion() {
  const mentorInputField = getEl('mentor-input-field');
  const mentorChatMessages = getEl('mentor-chat-messages');
  if (!mentorInputField || !mentorChatMessages) return;

  const q = mentorInputField.value.trim();
  if (!q || state.isLoading) return;

  mentorInputField.value = '';

  const userBubble = document.createElement('div');
  userBubble.className = 'mentor-bubble user';
  userBubble.textContent = q;
  mentorChatMessages.appendChild(userBubble);
  mentorChatMessages.scrollTop = mentorChatMessages.scrollHeight;

  const aiBubble = document.createElement('div');
  aiBubble.className = 'mentor-bubble ai';
  aiBubble.textContent = 'Mentor is formulating response...';
  mentorChatMessages.appendChild(aiBubble);
  mentorChatMessages.scrollTop = mentorChatMessages.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain_intel: state.domainIntel,
        selected_analogy: state.selectedAnalogy || (state.analogies ? state.analogies.easy : {}),
        message: q,
        history: state.conversationHistory
      })
    });

    const data = await res.json();
    if (data.status === 'success') {
      aiBubble.innerHTML = formatMarkdown(data.reply);
      state.conversationHistory.push({ role: 'user', content: q });
      state.conversationHistory.push({ role: 'assistant', content: data.reply });
    } else {
      aiBubble.textContent = `Error: ${data.message}`;
    }
    mentorChatMessages.scrollTop = mentorChatMessages.scrollHeight;
  } catch (err) {
    aiBubble.textContent = `Error: ${err.message}`;
  }
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<strong style="color:var(--accent-cyan); display:block; margin:6px 0;">$1</strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n\n/gim, '<br><br>')
    .replace(/\n/gim, '<br>');
}

// =========================================================
// EXPORT DOSSIER
// =========================================================
async function exportDossier() {
  if (!state.domainIntel) {
    alert('Please initialize a domain first.');
    return;
  }

  try {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain_intel: state.domainIntel,
        selected_analogy: state.selectedAnalogy || (state.analogies ? state.analogies.easy : {}),
        curriculum: state.curriculum || []
      })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.domainIntel.domain || 'mindset').toLowerCase().replace(/\s+/g, '_')}_blueprint.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Export error: ' + err.message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
