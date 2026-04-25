(function () {
  'use strict';

  // ============================================
  // ITERATEIT WIDGET v1.0
  // Self-contained, no framework dependencies
  // ============================================

  const ITERATEIT_URL = 'https://avnigtkswxmwywogsvqn.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bmlndGtzd3htd3l3b2dzdnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjk3NzYsImV4cCI6MjA5MjY0NTc3Nn0.9HM7S8uGTrwMc2Z3lqN_4h6BAsAqmlqZ1ljOi33cpc0';

  let config = {};
  let isOpen = false;
  let currentUser = null;

  // ── STYLES ──────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #iterateit-btn {
        position: fixed;
        z-index: 999999;
        bottom: 24px;
        right: 24px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #0057d9;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,87,217,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        font-family: sans-serif;
      }
      #iterateit-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 24px rgba(0,87,217,0.5);
      }
      #iterateit-btn svg {
        width: 22px;
        height: 22px;
      }
      #iterateit-panel {
        position: fixed;
        z-index: 999998;
        bottom: 88px;
        right: 24px;
        width: 380px;
        max-height: 80vh;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        display: none;
        flex-direction: column;
        font-family: 'Barlow', sans-serif;
        overflow: hidden;
        border: 1px solid #dde3ec;
      }
      #iterateit-panel.open {
        display: flex;
      }
      .iit-header {
        background: #0d1b2a;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .iit-header-title {
        color: white;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.3px;
      }
      .iit-header-title span { color: #0057d9; }
      .iit-close {
        background: none;
        border: none;
        color: #8a9bb0;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        padding: 0;
      }
      .iit-close:hover { color: white; }
      .iit-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .iit-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #0d1b2a;
        margin-bottom: 4px;
        margin-top: 14px;
      }
      .iit-label:first-child { margin-top: 0; }
      .iit-input, .iit-select, .iit-textarea {
        width: 100%;
        border: 1px solid #dde3ec;
        border-radius: 6px;
        padding: 8px 10px;
        font-size: 13px;
        color: #0d1b2a;
        box-sizing: border-box;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s;
      }
      .iit-input:focus, .iit-select:focus, .iit-textarea:focus {
        border-color: #0057d9;
        box-shadow: 0 0 0 3px rgba(0,87,217,0.1);
      }
      .iit-textarea { resize: none; }
      .iit-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .iit-context {
        background: #f5f7fa;
        border-radius: 6px;
        padding: 10px 12px;
        margin-top: 14px;
        font-size: 11px;
        color: #8a9bb0;
      }
      .iit-context-title {
        font-weight: 600;
        color: #0d1b2a;
        margin-bottom: 4px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .iit-context p { margin: 2px 0; }
      .iit-footer {
        padding: 14px 20px;
        border-top: 1px solid #dde3ec;
        display: flex;
        gap: 8px;
      }
      .iit-btn-primary {
        flex: 1;
        background: #0057d9;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        font-family: inherit;
      }
      .iit-btn-primary:hover { background: #0046b0; }
      .iit-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .iit-btn-secondary {
        background: #f5f7fa;
        color: #0d1b2a;
        border: 1px solid #dde3ec;
        border-radius: 6px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .iit-snip-btn {
        width: 100%;
        background: #f5f7fa;
        border: 1px dashed #dde3ec;
        border-radius: 6px;
        padding: 9px;
        font-size: 12px;
        color: #8a9bb0;
        cursor: pointer;
        margin-top: 14px;
        font-family: inherit;
        transition: all 0.15s;
      }
      .iit-snip-btn:hover {
        border-color: #0057d9;
        color: #0057d9;
        background: #f0f4ff;
      }
      .iit-error {
        background: #fff0f0;
        border: 1px solid #fcc;
        color: #c00;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        margin-top: 10px;
      }
      .iit-success {
        background: #f0fff4;
        border: 1px solid #9be9b8;
        color: #1a7a3c;
        border-radius: 6px;
        padding: 12px;
        font-size: 13px;
        text-align: center;
        margin-top: 10px;
      }
      .iit-screenshot-preview {
        width: 100%;
        border-radius: 6px;
        border: 1px solid #dde3ec;
        margin-top: 8px;
        max-height: 120px;
        object-fit: cover;
      }
      .iit-tabs {
        display: flex;
        border-bottom: 1px solid #dde3ec;
        background: #f5f7fa;
      }
      .iit-tab {
        flex: 1;
        padding: 10px;
        font-size: 12px;
        font-weight: 600;
        color: #8a9bb0;
        border: none;
        background: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font-family: inherit;
      }
      .iit-tab.active {
        color: #0057d9;
        border-bottom-color: #0057d9;
        background: white;
      }
      .iit-tab-content { display: none; }
      .iit-tab-content.active { display: block; }
      .iit-ticket-item {
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
      }
      .iit-ticket-item:last-child { border-bottom: none; }
      .iit-ticket-title {
        font-size: 13px;
        font-weight: 600;
        color: #0d1b2a;
        margin-bottom: 4px;
      }
      .iit-ticket-meta {
        font-size: 11px;
        color: #8a9bb0;
        display: flex;
        gap: 8px;
      }
      .iit-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 99px;
        font-size: 10px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .iit-badge-open { background: #dbeafe; color: #1d4ed8; }
      .iit-badge-in_progress { background: #fef9c3; color: #a16207; }
      .iit-badge-resolved { background: #dcfce7; color: #15803d; }
      .iit-badge-closed { background: #f3f4f6; color: #6b7280; }
    `;
    document.head.appendChild(style);
  }

  // ── PAGE CONTEXT CAPTURE ────────────────────
  function capturePageContext() {
    const url       = window.location.href;
    const title     = document.title;
    const menuPath  = getBreadcrumbPath();
    return { url, title, menuPath };
  }

  function getBreadcrumbPath() {
    // Try common breadcrumb selectors used in web apps
    const selectors = [
      '[aria-label="breadcrumb"]',
      '.breadcrumb',
      '.breadcrumbs',
      'nav[aria-label="Breadcrumb"]',
      '.nav-breadcrumb',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el.innerText.replace(/\n/g, ' › ').trim();
    }
    // Fall back to path segments
    return window.location.pathname
      .split('/')
      .filter(Boolean)
      .join(' › ');
  }

  // ── BUILD UI ────────────────────────────────
  function buildUI() {
    const context = capturePageContext();

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'iterateit-btn';
    btn.title = 'Log a ticket';
    btn.innerHTML = `
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 8 A20 20 0 0 1 48 28" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <polyline points="45,21 48,28 41,29" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M28 48 A20 20 0 0 1 8 28" stroke="rgba(255,255,255,0.5)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <polyline points="11,35 8,28 15,27" stroke="rgba(255,255,255,0.5)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="28" cy="28" r="4.5" fill="white"/>
      </svg>
    `;
    btn.onclick = togglePanel;

    // Panel
    const panel = document.createElement('div');
    panel.id = 'iterateit-panel';
    panel.innerHTML = `
      <div class="iit-header">
        <div class="iit-header-title">Iterate<span>IT</span></div>
        <button class="iit-close" id="iit-close-btn">✕</button>
      </div>
      <div class="iit-tabs">
        <button class="iit-tab active" data-tab="log">Log Ticket</button>
        <button class="iit-tab" data-tab="my">My Tickets</button>
      </div>
      <div class="iit-body">

        <!-- LOG TICKET TAB -->
        <div class="iit-tab-content active" id="iit-tab-log">
          <div id="iit-form-area">
            <label class="iit-label">Your Name *</label>
            <input class="iit-input" id="iit-name" placeholder="Your full name" />

            <label class="iit-label">Your Email *</label>
            <input class="iit-input" id="iit-email" type="email" placeholder="you@company.com" />

            <label class="iit-label">Title *</label>
            <input class="iit-input" id="iit-title" placeholder="Brief summary of the issue" />

            <label class="iit-label">Description</label>
            <textarea class="iit-textarea" id="iit-desc" rows="3" placeholder="Describe the issue in detail..."></textarea>

            <div class="iit-row" style="margin-top:14px">
              <div>
                <label class="iit-label" style="margin-top:0">Type</label>
                <select class="iit-select" id="iit-type">
                  <option value="enhancement">Enhancement</option>
                  <option value="bug">Bug</option>
                  <option value="question">Question</option>
                  <option value="change_request">Change Request</option>
                </select>
              </div>
              <div>
                <label class="iit-label" style="margin-top:0">Severity</label>
                <select class="iit-select" id="iit-severity">
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div class="iit-context">
              <div class="iit-context-title">Auto-captured context</div>
              <p><strong>Page:</strong> ${context.title}</p>
              <p><strong>URL:</strong> ${context.url}</p>
              <p><strong>Path:</strong> ${context.menuPath}</p>
            </div>

            <button class="iit-snip-btn" id="iit-snip-btn">
              📸 Capture screenshot
            </button>
            <img id="iit-screenshot-preview" class="iit-screenshot-preview" style="display:none" />

            <div id="iit-error" class="iit-error" style="display:none"></div>
            <div id="iit-success" class="iit-success" style="display:none"></div>
          </div>
        </div>

        <!-- MY TICKETS TAB -->
        <div class="iit-tab-content" id="iit-tab-my">
          <div id="iit-tickets-list">
            <p style="color:#8a9bb0;font-size:13px;margin-top:8px">
              Enter your email on the Log Ticket tab to see your tickets.
            </p>
          </div>
        </div>

      </div>
      <div class="iit-footer" id="iit-footer">
        <button class="iit-btn-primary" id="iit-submit-btn">Submit Ticket</button>
        <button class="iit-btn-secondary" id="iit-cancel-btn">Cancel</button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('iit-close-btn').onclick  = togglePanel;
    document.getElementById('iit-cancel-btn').onclick = togglePanel;
    document.getElementById('iit-submit-btn').onclick = submitTicket;
    document.getElementById('iit-snip-btn').onclick   = captureScreenshot;

    // Tab switching
    panel.querySelectorAll('.iit-tab').forEach(tab => {
      tab.onclick = function() {
        panel.querySelectorAll('.iit-tab').forEach(t => t.classList.remove('active'));
        panel.querySelectorAll('.iit-tab-content').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('iit-tab-' + this.dataset.tab).classList.add('active');
        if (this.dataset.tab === 'my') loadMyTickets();

        // Hide footer on My Tickets tab
        document.getElementById('iit-footer').style.display =
          this.dataset.tab === 'log' ? 'flex' : 'none';
      };
    });

    // Restore saved user info
    const savedName  = localStorage.getItem('iit_name');
    const savedEmail = localStorage.getItem('iit_email');
    if (savedName)  document.getElementById('iit-name').value  = savedName;
    if (savedEmail) document.getElementById('iit-email').value = savedEmail;
  }

  // ── TOGGLE PANEL ────────────────────────────
  function togglePanel() {
    const panel = document.getElementById('iterateit-panel');
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
  }

  // ── SCREENSHOT CAPTURE ──────────────────────
  let screenshotDataUrl = null;

  async function captureScreenshot() {
    const btn = document.getElementById('iit-snip-btn');
    btn.textContent = 'Capturing...';

    try {
      // Hide the widget while capturing
      document.getElementById('iterateit-btn').style.display   = 'none';
      document.getElementById('iterateit-panel').style.display = 'none';

      // Dynamically load html2canvas if not already loaded
      if (!window.html2canvas) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }

      const canvas = await window.html2canvas(document.body, {
        useCORS: true,
        scale: 0.75,
        logging: false,
      });

      screenshotDataUrl = canvas.toDataURL('image/jpeg', 0.7);

      // Show preview
      const preview = document.getElementById('iit-screenshot-preview');
      preview.src   = screenshotDataUrl;
      preview.style.display = 'block';
      btn.textContent = '✅ Screenshot captured — click to retake';

    } catch (err) {
      btn.textContent = '📸 Capture screenshot (failed — try again)';
    } finally {
      document.getElementById('iterateit-btn').style.display   = 'flex';
      document.getElementById('iterateit-panel').style.display = 'flex';
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s  = document.createElement('script');
      s.src    = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ── SUBMIT TICKET ───────────────────────────
  async function submitTicket() {
    const name     = document.getElementById('iit-name').value.trim();
    const email    = document.getElementById('iit-email').value.trim();
    const title    = document.getElementById('iit-title').value.trim();
    const desc     = document.getElementById('iit-desc').value.trim();
    const type     = document.getElementById('iit-type').value;
    const severity = document.getElementById('iit-severity').value;

    const errorEl   = document.getElementById('iit-error');
    const successEl = document.getElementById('iit-success');
    const submitBtn = document.getElementById('iit-submit-btn');

    errorEl.style.display   = 'none';
    successEl.style.display = 'none';

    if (!name || !email || !title) {
      errorEl.textContent  = 'Please fill in your name, email and title.';
      errorEl.style.display = 'block';
      return;
    }

    // Save user info for next time
    localStorage.setItem('iit_name',  name);
    localStorage.setItem('iit_email', email);

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Submitting...';

    const context = capturePageContext();

    try {
      // Upload screenshot if captured
      let screenshotUrl = null;
      if (screenshotDataUrl) {
        screenshotUrl = await uploadScreenshot(screenshotDataUrl, email);
      }

      const response = await fetch(`${ITERATEIT_URL}/rest/v1/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        ANON_KEY,
          'Authorization': 'Bearer ' + ANON_KEY,
          'x-widget-key':  config.apiKey,
          'Prefer':        'return=minimal',
        },
        body: JSON.stringify({
          org_id:         config.orgId,
          system_id:      config.systemId,
          created_by:     config.defaultUserId,
          title:          title,
          description:    desc,
          type:           type,
          severity:       severity,
          page_url:       context.url,
          page_title:     context.title,
          menu_path:      context.menuPath,
          screenshot_url: screenshotUrl,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Submission failed');
      }

      successEl.textContent  = '✅ Ticket submitted successfully! Thank you.';
      successEl.style.display = 'block';

      // Reset form
      document.getElementById('iit-title').value = '';
      document.getElementById('iit-desc').value  = '';
      screenshotDataUrl = null;
      document.getElementById('iit-screenshot-preview').style.display = 'none';
      document.getElementById('iit-snip-btn').textContent = '📸 Capture screenshot';

    } catch (err) {
      errorEl.textContent   = 'Error: ' + err.message;
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Submit Ticket';
    }
  }

  // ── UPLOAD SCREENSHOT ───────────────────────
  async function uploadScreenshot(dataUrl, email) {
    try {
      const blob     = dataURItoBlob(dataUrl);
      const fileName = 'widget/' + Date.now() + '-' + email.replace('@','_') + '.jpg';

      const response = await fetch(`${ITERATEIT_URL}/storage/v1/object/screenshots/${fileName}`, {
        method:  'POST',
        headers: {
          'apikey':        ANON_KEY,
          'Authorization': 'Bearer ' + ANON_KEY,
          'Content-Type':  'image/jpeg',
        },
        body: blob,
      });

      if (response.ok) {
        return `${ITERATEIT_URL}/storage/v1/object/public/screenshots/${fileName}`;
      }
    } catch (e) {
      console.warn('Screenshot upload failed:', e);
    }
    return null;
  }

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: 'image/jpeg' });
  }

  // ── LOAD MY TICKETS ─────────────────────────
  async function loadMyTickets() {
    const email = document.getElementById('iit-email')?.value?.trim();
    const list  = document.getElementById('iit-tickets-list');

    if (!email) {
      list.innerHTML = '<p style="color:#8a9bb0;font-size:13px;margin-top:8px">Enter your email on the Log Ticket tab first.</p>';
      return;
    }

    list.innerHTML = '<p style="color:#8a9bb0;font-size:13px;margin-top:8px">Loading...</p>';

    try {
      const response = await fetch(
        `${ITERATEIT_URL}/rest/v1/tickets?org_id=eq.${config.orgId}&system_id=eq.${config.systemId}&select=id,title,status,severity,created_at&order=created_at.desc&limit=10`,
        {
          headers: {
            'apikey':        ANON_KEY,
            'Authorization': 'Bearer ' + ANON_KEY,
            'x-widget-key':  config.apiKey,
          }
        }
      );

      const tickets = await response.json();

      if (!tickets.length) {
        list.innerHTML = '<p style="color:#8a9bb0;font-size:13px;margin-top:8px">No tickets found.</p>';
        return;
      }

      list.innerHTML = tickets.map(t => `
        <div class="iit-ticket-item">
          <div class="iit-ticket-title">${t.title}</div>
          <div class="iit-ticket-meta">
            <span class="iit-badge iit-badge-${t.status}">${t.status.replace('_',' ')}</span>
            <span>${t.severity}</span>
            <span>${new Date(t.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');

    } catch (e) {
      list.innerHTML = '<p style="color:#c00;font-size:13px">Failed to load tickets.</p>';
    }
  }

  // ── PUBLIC API ──────────────────────────────
  window.IterateIT = {
    init: function (userConfig) {
      config = userConfig;
      injectStyles();
      buildUI();
    }
  };

})();
