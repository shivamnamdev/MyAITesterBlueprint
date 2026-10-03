document.addEventListener('DOMContentLoaded', () => {
  const chatFeed = document.getElementById('chat-feed');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const testTypeSelect = document.getElementById('test-type-select');
  const modelSelect = document.getElementById('model-select');
  const ollamaStatus = document.getElementById('ollama-status');
  const selectedModelName = document.getElementById('selected-model-name');

  // Perform Health Check on Load
  checkOllamaHealth();

  async function checkOllamaHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();

      const dot = ollamaStatus.querySelector('.status-dot');
      const text = ollamaStatus.querySelector('.status-text');

      if (data.status === 'ok' && data.ollama === 'connected') {
        dot.className = 'status-dot online';
        text.textContent = 'Ollama Connected';

        if (data.models && data.models.length > 0) {
          modelSelect.innerHTML = data.models.map(m => 
            `<option value="${m}">${m}</option>`
          ).join('');
        }
      } else {
        dot.className = 'status-dot offline';
        text.textContent = 'Ollama Offline';
      }
    } catch (err) {
      const dot = ollamaStatus.querySelector('.status-dot');
      const text = ollamaStatus.querySelector('.status-text');
      dot.className = 'status-dot offline';
      text.textContent = 'Ollama Offline';
    }
  }

  // Model select change listener
  modelSelect.addEventListener('change', () => {
    selectedModelName.textContent = modelSelect.value;
  });

  // Prompt chip click handlers
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      userInput.value = chip.getAttribute('data-prompt');
      userInput.focus();
    });
  });

  // Handle Shift+Enter vs Enter
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // Submit Handler
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const promptText = userInput.value.trim();
    if (!promptText) return;

    const testType = testTypeSelect.value;
    const model = modelSelect.value;

    // Remove welcome card if present
    const welcomeCard = document.querySelector('.welcome-card');
    if (welcomeCard) {
      welcomeCard.remove();
    }

    // Append User Message
    appendUserMessage(promptText, testType);
    userInput.value = '';
    sendBtn.disabled = true;

    // Append Loading Indicator
    const loadingId = appendLoadingIndicator(model);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_description: promptText,
          test_type: testType,
          model: model
        })
      });

      removeElement(loadingId);

      const data = await res.json();

      if (!res.ok || !data.success) {
        appendErrorMessage(data.error || 'Failed to generate test cases.');
      } else {
        appendTestSuiteResponse(data.data);
      }

    } catch (err) {
      removeElement(loadingId);
      appendErrorMessage(`Network Error: ${err.message}`);
    } finally {
      sendBtn.disabled = false;
      scrollToBottom();
    }
  });

  function appendUserMessage(text, testType) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message user';
    msgDiv.innerHTML = `
      <div class="message-sender"><i class="fa-solid fa-user"></i> You (${testType} Scope)</div>
      <div class="user-bubble">${escapeHtml(text)}</div>
    `;
    chatFeed.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendLoadingIndicator(model) {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-message assistant';
    div.innerHTML = `
      <div class="message-sender"><i class="fa-solid fa-robot"></i> QA Pilot (${model})</div>
      <div class="loading-indicator">
        <div class="spinner"></div>
        <span>Analyzing feature requirements & generating test cases via ${model}...</span>
      </div>
    `;
    chatFeed.appendChild(div);
    scrollToBottom();
    return id;
  }

  function appendErrorMessage(errText) {
    const div = document.createElement('div');
    div.className = 'chat-message assistant';
    div.innerHTML = `
      <div class="message-sender"><i class="fa-solid fa-triangle-exclamation"></i> Error</div>
      <div class="test-suite-card" style="border-color: var(--accent-rose);">
        <p style="color: #fecdd3;"><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(errText)}</p>
      </div>
    `;
    chatFeed.appendChild(div);
    scrollToBottom();
  }

  function appendTestSuiteResponse(suiteData) {
    const div = document.createElement('div');
    div.className = 'chat-message assistant';
    
    const suiteId = 'suite-' + Date.now();

    const tcCardsHtml = suiteData.test_cases.map(tc => `
      <div class="tc-card">
        <div class="tc-card-top">
          <span class="tc-id">${escapeHtml(tc.id || 'TC')}</span>
          <div class="tc-badges">
            <span class="badge badge-${tc.priority || 'P1'}">${escapeHtml(tc.priority || 'P1')}</span>
            <span class="badge badge-type">${escapeHtml(tc.type || 'Functional')}</span>
          </div>
        </div>

        <div class="tc-title">${escapeHtml(tc.title || 'Untitled Test Case')}</div>

        ${tc.preconditions && tc.preconditions.length > 0 ? `
          <div>
            <div class="tc-section-title">Preconditions</div>
            <ul class="tc-preconditions">
              ${tc.preconditions.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div>
          <div class="tc-section-title">Test Steps</div>
          <ol class="tc-steps">
            ${(tc.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
        </div>

        <div class="tc-expected">
          <div class="tc-section-title" style="color: var(--accent-emerald);">Expected Result</div>
          <div>${escapeHtml(tc.expected_result || 'N/A')}</div>
        </div>
      </div>
    `).join('');

    div.innerHTML = `
      <div class="message-sender"><i class="fa-solid fa-robot"></i> QA Pilot</div>
      <div class="assistant-response">
        <div class="test-suite-card" id="${suiteId}">
          <div class="suite-header">
            <div>
              <div class="suite-title">${escapeHtml(suiteData.feature_name || 'Generated Test Suite')}</div>
              <div class="suite-summary">${escapeHtml(suiteData.summary || '')} (${suiteData.test_cases.length} Test Cases)</div>
            </div>

            <div class="suite-actions">
              <button class="action-btn copy-btn"><i class="fa-solid fa-copy"></i> Copy JSON</button>
              <button class="action-btn export-md-btn"><i class="fa-solid fa-file-markdown"></i> Download .MD</button>
              <button class="action-btn export-csv-btn"><i class="fa-solid fa-file-csv"></i> Download .CSV</button>
              <button class="action-btn export-slack-btn"><i class="fa-brands fa-slack"></i> Copy Slack Blocks</button>
              <button class="action-btn export-html-btn"><i class="fa-solid fa-envelope"></i> Download Email HTML</button>
            </div>
          </div>

          <div class="tc-grid">
            ${tcCardsHtml}
          </div>
        </div>
      </div>
    `;

    chatFeed.appendChild(div);

    // Attach Event Listeners for Export & Copy
    const cardEl = document.getElementById(suiteId);
    
    cardEl.querySelector('.copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(suiteData, null, 2));
      alert('Test suite JSON copied to clipboard!');
    });

    cardEl.querySelector('.export-md-btn').addEventListener('click', () => {
      downloadMarkdown(suiteData);
    });

    cardEl.querySelector('.export-csv-btn').addEventListener('click', () => {
      downloadCSV(suiteData);
    });

    cardEl.querySelector('.export-slack-btn').addEventListener('click', () => {
      const slackPayload = {
        blocks: [
          { type: "header", text: { type: "plain_text", text: `🧪 QA Test Suite: ${suiteData.feature_name}` } },
          { type: "section", text: { type: "mrkdwn", text: `*Summary:* ${suiteData.summary}\n*Total Test Cases:* \`${suiteData.test_cases.length}\`` } },
          { type: "divider" },
          ...suiteData.test_cases.map(tc => ({
            type: "section",
            text: { type: "mrkdwn", text: `*${tc.id}*: *${tc.title}* (${tc.priority})\n*Expected:* ${tc.expected_result}` }
          }))
        ]
      };
      navigator.clipboard.writeText(JSON.stringify(slackPayload, null, 2));
      alert('Slack Block Kit JSON copied to clipboard!');
    });

    cardEl.querySelector('.export-html-btn').addEventListener('click', () => {
      downloadEmailHTML(suiteData);
    });

    scrollToBottom();
  }

  function downloadEmailHTML(suiteData) {
    const rows = suiteData.test_cases.map(tc => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px; font-weight: bold; color: #4f46e5;">${tc.id}</td>
        <td style="padding: 10px; font-weight: 600;">${tc.title}</td>
        <td style="padding: 10px;"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-size: 11px;">${tc.priority}</span></td>
        <td style="padding: 10px; font-size: 13px;">${(tc.steps || []).join('<br>')}</td>
        <td style="padding: 10px; font-size: 13px; color: #059669; font-weight: 500;">${tc.expected_result}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${suiteData.feature_name}</title></head><body style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;"><div style="max-width: 800px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px;"><h2 style="color: #111827;">🧪 QA Test Suite: ${suiteData.feature_name}</h2><p style="color: #6b7280;">${suiteData.summary}</p><hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; text-align: left;"><thead><tr style="background: #f3f4f6; font-size: 12px;"><th style="padding: 10px;">ID</th><th style="padding: 10px;">Title</th><th style="padding: 10px;">Priority</th><th style="padding: 10px;">Steps</th><th style="padding: 10px;">Expected Result</th></tr></thead><tbody>${rows}</tbody></table></div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(suiteData.feature_name || 'test_cases').toLowerCase().replace(/[^a-z0-9]/g, '_')}_email.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadMarkdown(suiteData) {
    let md = `# QA Test Suite: ${suiteData.feature_name || 'Test Cases'}\n\n`;
    md += `**Summary:** ${suiteData.summary || ''}\n\n`;
    md += `---\n\n`;

    suiteData.test_cases.forEach((tc, idx) => {
      md += `### ${tc.id || `TC-${idx+1}`}: ${tc.title}\n`;
      md += `- **Type:** ${tc.type || 'Functional'}\n`;
      md += `- **Priority:** ${tc.priority || 'P1'}\n`;
      if (tc.preconditions && tc.preconditions.length > 0) {
        md += `- **Preconditions:**\n`;
        tc.preconditions.forEach(p => md += `  - ${p}\n`);
      }
      md += `- **Steps:**\n`;
      (tc.steps || []).forEach(step => md += `  1. ${step}\n`);
      md += `- **Expected Result:** ${tc.expected_result}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(suiteData.feature_name || 'test_cases').toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCSV(suiteData) {
    const headers = ['ID', 'Title', 'Type', 'Priority', 'Preconditions', 'Steps', 'Expected Result'];
    const rows = [headers];

    suiteData.test_cases.forEach((tc, idx) => {
      rows.push([
        tc.id || `TC-${idx+1}`,
        tc.title || '',
        tc.type || '',
        tc.priority || '',
        (tc.preconditions || []).join('; '),
        (tc.steps || []).join('; '),
        tc.expected_result || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`));
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(suiteData.feature_name || 'test_cases').toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
