(function () {
  'use strict';

  var ITERATEIT_URL = 'https://avnigtkswxmwywogsvqn.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bmlndGtzd3htd3l3b2dzdnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjk3NzYsImV4cCI6MjA5MjY0NTc3Nn0.9HM7S8uGTrwMc2Z3lqN_4h6BAsAqmlqZ1ljOi33cpc0';

  var config = {};
  var isOpen = false;
  var screenshots = [];

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = '#iterateit-btn{position:fixed;z-index:999999;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:#0057d9;color:white;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,87,217,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s,box-shadow 0.2s;}#iterateit-btn:hover{transform:scale(1.08);}#iterateit-btn svg{width:22px;height:22px;}#iterateit-panel{position:fixed;z-index:999998;bottom:88px;right:24px;width:380px;max-height:80vh;background:white;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.18);display:none;flex-direction:column;font-family:Arial,sans-serif;overflow:hidden;border:1px solid #dde3ec;}.iit-header{background:#0d1b2a;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}.iit-header-title{color:white;font-size:16px;font-weight:700;}.iit-header-title span{color:#0057d9;}.iit-close{background:none;border:none;color:#8a9bb0;cursor:pointer;font-size:20px;line-height:1;padding:4px 8px;border-radius:4px;}.iit-close:hover{color:white;}.iit-tabs{display:flex;border-bottom:1px solid #dde3ec;background:#f5f7fa;flex-shrink:0;}.iit-tab{flex:1;padding:10px;font-size:12px;font-weight:600;color:#8a9bb0;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;}.iit-tab.active{color:#0057d9;border-bottom-color:#0057d9;background:white;}.iit-body{padding:20px;overflow-y:auto;flex:1;}.iit-tab-content{display:none;}.iit-tab-content.active{display:block;}.iit-label{display:block;font-size:12px;font-weight:600;color:#0d1b2a;margin:14px 0 4px;}.iit-input,.iit-select,.iit-textarea{width:100%;border:1px solid #dde3ec;border-radius:6px;padding:8px 10px;font-size:13px;color:#0d1b2a;box-sizing:border-box;outline:none;font-family:inherit;}.iit-input:focus,.iit-select:focus,.iit-textarea:focus{border-color:#0057d9;box-shadow:0 0 0 3px rgba(0,87,217,0.1);}.iit-textarea{resize:none;}.iit-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}.iit-context{background:#f5f7fa;border-radius:6px;padding:10px 12px;margin-top:14px;font-size:11px;color:#8a9bb0;}.iit-context-title{font-weight:600;color:#0d1b2a;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;}.iit-context p{margin:2px 0;}.iit-snip-btn{width:100%;background:#f5f7fa;border:1px dashed #dde3ec;border-radius:6px;padding:9px;font-size:12px;color:#8a9bb0;cursor:pointer;margin-top:14px;font-family:inherit;transition:all 0.15s;box-sizing:border-box;}.iit-snip-btn:hover{border-color:#0057d9;color:#0057d9;background:#f0f4ff;}.iit-error{background:#fff0f0;border:1px solid #fcc;color:#c00;border-radius:6px;padding:8px 12px;font-size:12px;margin-top:10px;display:none;}.iit-success{background:#f0fff4;border:1px solid #9be9b8;color:#1a7a3c;border-radius:6px;padding:12px;font-size:13px;text-align:center;margin-top:10px;display:none;}.iit-footer{padding:14px 20px;border-top:1px solid #dde3ec;display:flex;gap:8px;flex-shrink:0;}.iit-btn-primary{flex:1;background:#0057d9;color:white;border:none;border-radius:6px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}.iit-btn-primary:hover{background:#0046b0;}.iit-btn-primary:disabled{opacity:0.5;cursor:not-allowed;}.iit-btn-secondary{background:#f5f7fa;color:#0d1b2a;border:1px solid #dde3ec;border-radius:6px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}.iit-ticket-item{padding:8px 10px;background:#f9fafb;border-radius:6px;margin-bottom:6px;border:1px solid #f0f0f0;}';
    document.head.appendChild(style);
  }

  function capturePageContext() {
    return { url: window.location.href, title: document.title, menuPath: getBreadcrumbPath() };
  }

  function getBreadcrumbPath() {
    var selectors = ['[aria-label="breadcrumb"]', '.breadcrumb', '.breadcrumbs'];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return el.innerText.replace(/\n/g, ' > ').trim();
    }
    var path = window.location.pathname.split('/').filter(Boolean)
      .map(function(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '); }).join(' > ');
    var tabSelectors = ['[role="tab"][aria-selected="true"]', 'button[aria-selected="true"]'];
    for (var j = 0; j < tabSelectors.length; j++) {
      var tab = document.querySelector(tabSelectors[j]);
      if (tab && tab.innerText.trim()) {
        var last = path.split(' > ').pop() || '';
        if (tab.innerText.trim().toLowerCase() !== last.toLowerCase()) path = path + ' > ' + tab.innerText.trim();
        break;
      }
    }
    return path;
  }

  function openPanel() { isOpen = true; document.getElementById('iterateit-panel').style.display = 'flex'; }
  function closePanel() { isOpen = false; document.getElementById('iterateit-panel').style.display = 'none'; }

  function buildUI() {
    var ctx = capturePageContext();
    var btn = document.createElement('button');
    btn.id = 'iterateit-btn';
    btn.title = 'Log a ticket';
    btn.innerHTML = '<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 8 A20 20 0 0 1 48 28" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/><polyline points="45,21 48,28 41,29" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M28 48 A20 20 0 0 1 8 28" stroke="rgba(255,255,255,0.5)" stroke-width="4.5" stroke-linecap="round" fill="none"/><polyline points="11,35 8,28 15,27" stroke="rgba(255,255,255,0.5)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="28" cy="28" r="4.5" fill="white"/></svg>';
    btn.onclick = function() { isOpen ? closePanel() : openPanel(); };

    var panel = document.createElement('div');
    panel.id = 'iterateit-panel';
    panel.innerHTML =
      '<div class="iit-header"><div class="iit-header-title">Iterate<span>IT</span></div><button class="iit-close" id="iit-close-btn" type="button">&#x2715;</button></div>' +
      '<div class="iit-tabs"><button class="iit-tab active" data-tab="log" type="button">Log Ticket</button><button class="iit-tab" data-tab="my" type="button">My Tickets</button></div>' +
      '<div class="iit-body">' +
        '<div class="iit-tab-content active" id="iit-tab-log">' +
          '<label class="iit-label" style="margin-top:0">Your Name *</label>' +
          '<input class="iit-input" id="iit-name" placeholder="Your full name" type="text" />' +
          '<label class="iit-label">Your Email *</label>' +
          '<input class="iit-input" id="iit-email" type="email" placeholder="you@company.com" />' +
          '<label class="iit-label">Title *</label>' +
          '<input class="iit-input" id="iit-title" placeholder="Brief summary of the issue" type="text" />' +
          '<label class="iit-label">Description</label>' +
          '<textarea class="iit-textarea" id="iit-desc" rows="3" placeholder="Describe the issue in detail..."></textarea>' +
          '<div class="iit-row">' +
            '<div><label class="iit-label" style="margin-top:0">Type</label><select class="iit-select" id="iit-type"><option value="enhancement">Enhancement</option><option value="bug">Bug</option><option value="question">Question</option><option value="change_request">Change Request</option></select></div>' +
            '<div><label class="iit-label" style="margin-top:0">Severity</label><select class="iit-select" id="iit-severity"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="critical">Critical</option></select></div>' +
          '</div>' +
          '<div class="iit-context"><div class="iit-context-title">Auto-captured context</div><p><strong>Page:</strong> ' + ctx.title + '</p><p><strong>URL:</strong> ' + ctx.url + '</p><p><strong>Path:</strong> ' + ctx.menuPath + '</p></div>' +
          '<div style="display:flex;gap:8px;margin-top:14px;">' +
            '<button class="iit-snip-btn" id="iit-snip-btn" type="button" style="flex:1;margin-top:0">&#9986;&#65039; Snip area</button>' +
            '<button class="iit-snip-btn" id="iit-fullscreen-btn" type="button" style="flex:1;margin-top:0">&#128247; Full page</button>' +
          '</div>' +
          '<div id="iit-screenshots-container" style="margin-top:10px;"></div>' +
          '<div id="iit-error" class="iit-error"></div>' +
          '<div id="iit-success" class="iit-success"></div>' +
        '</div>' +
        '<div class="iit-tab-content" id="iit-tab-my"><div id="iit-tickets-list"><p style="color:#8a9bb0;font-size:13px;margin-top:8px">Loading your tickets...</p></div></div>' +
      '</div>' +
      '<div class="iit-footer" id="iit-footer"><button class="iit-btn-primary" id="iit-submit-btn" type="button">Submit Ticket</button><button class="iit-btn-secondary" id="iit-cancel-btn" type="button">Cancel</button></div>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    panel.addEventListener('click', function(e) {
      var id = e.target.id;
      if (id === 'iit-close-btn' || id === 'iit-cancel-btn') { closePanel(); return; }
      if (id === 'iit-submit-btn') { submitTicket(); return; }
      if (id === 'iit-snip-btn') { captureScreenshot(); return; }
      if (id === 'iit-fullscreen-btn') { captureFullPage(); return; }
    });

    var tabs = panel.querySelectorAll('.iit-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        panel.querySelectorAll('.iit-tab-content').forEach(function(c) { c.classList.remove('active'); });
        tab.classList.add('active');
        document.getElementById('iit-tab-' + tab.dataset.tab).classList.add('active');
        document.getElementById('iit-footer').style.display = tab.dataset.tab === 'log' ? 'flex' : 'none';
        if (tab.dataset.tab === 'my') loadMyTickets();
      });
    });

    var savedName = localStorage.getItem('iit_name');
    var savedEmail = localStorage.getItem('iit_email');
    if (savedName) document.getElementById('iit-name').value = savedName;
    if (savedEmail) document.getElementById('iit-email').value = savedEmail;
  }

  function renderScreenshots() {
    var container = document.getElementById('iit-screenshots-container');
    if (!container) return;
    if (screenshots.length === 0) { container.innerHTML = ''; return; }
    var html = '<div style="margin-bottom:6px;font-size:11px;font-weight:600;color:#0d1b2a;text-transform:uppercase;letter-spacing:0.5px;">Captures (' + screenshots.length + ')</div><div style="display:flex;flex-wrap:wrap;gap:8px;">';
    screenshots.forEach(function(shot, index) {
      html += '<div style="position:relative;width:100px;flex-shrink:0;"><img src="' + shot.dataUrl + '" style="width:100px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #dde3ec;display:block;" /><button onclick="window.__iit_remove(' + index + ')" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center;">&#x2715;</button><p style="font-size:9px;color:#8a9bb0;margin:3px 0 0;text-align:center;">' + shot.label + '</p></div>';
    });
    html += '</div>';
    container.innerHTML = html;
    window.__iit_remove = function(index) { screenshots.splice(index, 1); renderScreenshots(); };
  }

  function captureScreenshot() {
    var btn = document.getElementById('iit-snip-btn');
    btn.textContent = 'Click and drag to select area...';
    document.getElementById('iterateit-btn').style.display = 'none';
    document.getElementById('iterateit-panel').style.display = 'none';
    var overlay = document.createElement('div');
    overlay.id = 'iit-snip-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999999;cursor:crosshair;background:rgba(0,0,0,0.3);';
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0057d9;color:white;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;z-index:99999999;font-family:Arial,sans-serif;pointer-events:none;';
    banner.textContent = 'Click and drag to select area. Press Esc to cancel.';
    overlay.appendChild(banner);
    var selBox = document.createElement('div');
    selBox.style.cssText = 'position:fixed;border:2px solid #0057d9;background:rgba(0,87,217,0.1);pointer-events:none;display:none;z-index:99999998;';
    overlay.appendChild(selBox);
    document.body.appendChild(overlay);
    var startX, startY, isDragging = false;
    function getCoords(e) { return { x: e.clientX || 0, y: e.clientY || 0 }; }
    function updateBox(x1, y1, x2, y2) {
      selBox.style.left = Math.min(x1,x2) + 'px'; selBox.style.top = Math.min(y1,y2) + 'px';
      selBox.style.width = Math.abs(x2-x1) + 'px'; selBox.style.height = Math.abs(y2-y1) + 'px';
      selBox.style.display = 'block';
    }
    function cleanup() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.getElementById('iterateit-btn').style.display = 'flex';
      document.getElementById('iterateit-panel').style.display = 'flex';
    }
    function onMouseDown(e) {
      e.preventDefault(); isDragging = true;
      var c = getCoords(e); startX = c.x; startY = c.y;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
    function onMouseMove(e) { if (!isDragging) return; var c = getCoords(e); updateBox(startX, startY, c.x, c.y); }
    function onMouseUp(e) {
      if (!isDragging) return; isDragging = false;
      var c = getCoords(e);
      var x1 = Math.min(startX, c.x), y1 = Math.min(startY, c.y);
      var x2 = Math.max(startX, c.x), y2 = Math.max(startY, c.y);
      var w = x2-x1, h = y2-y1;
      if (w < 10 || h < 10) { cleanup(); btn.textContent = 'Snip area'; return; }
      overlay.style.display = 'none';
      function doSnip() {
        setTimeout(function() {
        window.domtoimage.toJpeg(document.body, { quality: 0.9 })
        .then(function(fullDataUrl) {
          var img = new Image();
          img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            var ctx2 = canvas.getContext('2d');
            ctx2.drawImage(img, x1, y1, w, h, 0, 0, w, h);
            screenshots.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), label: 'Snip ' + (screenshots.length+1) });
            renderScreenshots(); btn.textContent = 'Snip area';
          };
          img.src = fullDataUrl;
        })
        .catch(function() { btn.textContent = 'Snip area (failed)'; })
        .finally(function() { cleanup(); });
        }, 800);
      }
      if (!window.domtoimage) {
        var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js';
        s.onload = doSnip; s.onerror = function() { btn.textContent = 'Snip area (failed)'; cleanup(); };
        document.head.appendChild(s);
      } else { doSnip(); }
    }
    function onKeyDown(e) { if (e.key === 'Escape') { cleanup(); btn.textContent = 'Snip area'; } }
    overlay.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
  }

  function captureFullPage() {
    var btn = document.getElementById('iit-fullscreen-btn');
    btn.textContent = 'Capturing...';
    document.getElementById('iterateit-btn').style.display = 'none';
    document.getElementById('iterateit-panel').style.display = 'none';
    function doCapture() {
      setTimeout(function() {
      window.domtoimage.toJpeg(document.body, { quality: 0.7 })
      .then(function(dataUrl) {
        screenshots.push({ dataUrl: dataUrl, label: 'Page ' + (screenshots.length+1) });
        renderScreenshots(); btn.textContent = 'Full page';
      })
      .catch(function() { btn.textContent = 'Full page (failed)'; })
      .finally(function() {
        document.getElementById('iterateit-btn').style.display = 'flex';
        document.getElementById('iterateit-panel').style.display = 'flex';
      });
      }, 800);
    }
    if (!window.domtoimage) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js';
      s.onload = doCapture; s.onerror = function() { btn.textContent = 'Full page (failed)'; document.getElementById('iterateit-btn').style.display = 'flex'; document.getElementById('iterateit-panel').style.display = 'flex'; };
      document.head.appendChild(s);
    } else { doCapture(); }
  }

  function submitTicket() {
    var name = document.getElementById('iit-name').value.trim();
    var email = document.getElementById('iit-email').value.trim();
    var title = document.getElementById('iit-title').value.trim();
    var desc = document.getElementById('iit-desc').value.trim();
    var type = document.getElementById('iit-type').value;
    var severity = document.getElementById('iit-severity').value;
    var errorEl = document.getElementById('iit-error');
    var successEl = document.getElementById('iit-success');
    var submitBtn = document.getElementById('iit-submit-btn');
    errorEl.style.display = 'none'; successEl.style.display = 'none';
    if (!name || !email || !title) { errorEl.textContent = 'Please fill in your name, email and title.'; errorEl.style.display = 'block'; return; }
    localStorage.setItem('iit_name', name); localStorage.setItem('iit_email', email);
    submitBtn.disabled = true; submitBtn.textContent = 'Submitting...';
    var ctx = capturePageContext();
    function finish(err) {
      submitBtn.disabled = false; submitBtn.textContent = 'Submit Ticket';
      if (err) { errorEl.textContent = 'Error: ' + err; errorEl.style.display = 'block'; }
      else {
        successEl.textContent = 'Ticket submitted! Thank you.'; successEl.style.display = 'block';
        document.getElementById('iit-title').value = '';
        document.getElementById('iit-desc').value = '';
        screenshots = []; renderScreenshots();
        document.getElementById('iit-snip-btn').textContent = 'Snip area';
        document.getElementById('iit-fullscreen-btn').textContent = 'Full page';
      }
    }
    function doSubmit(screenshotUrl) {
      fetch(ITERATEIT_URL + '/rest/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY, 'x-widget-key': config.apiKey, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ org_id: config.orgId, system_id: config.systemId, created_by: config.defaultUserId, title: title, description: desc, type: type, severity: severity, page_url: ctx.url, page_title: ctx.title, menu_path: ctx.menuPath, screenshot_url: screenshotUrl || null })
      })
      .then(function(res) { if (!res.ok) return res.json().then(function(e) { throw new Error(e.message || 'Submission failed'); }); finish(null); })
      .catch(function(e) { finish(e.message); });
    }
    if (screenshots.length > 0) {
      var urls = []; var pending = screenshots.length;
      screenshots.forEach(function(shot, i) {
        uploadScreenshot(shot.dataUrl, email + '_' + i, function(url) {
          if (url) urls.push(url); pending--;
          if (pending === 0) doSubmit(urls.join(','));
        });
      });
    } else { doSubmit(null); }
  }

  function uploadScreenshot(dataUrl, email, callback) {
    try {
      var byteString = atob(dataUrl.split(',')[1]);
      var ab = new ArrayBuffer(byteString.length); var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      var blob = new Blob([ab], { type: 'image/jpeg' });
      var fileName = 'widget/' + Date.now() + '-' + email.replace('@', '_') + '.jpg';
      fetch(ITERATEIT_URL + '/storage/v1/object/screenshots/' + fileName, {
        method: 'POST', headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY, 'Content-Type': 'image/jpeg' }, body: blob
      })
      .then(function(res) { callback(res.ok ? ITERATEIT_URL + '/storage/v1/object/public/screenshots/' + fileName : null); })
      .catch(function() { callback(null); });
    } catch(e) { callback(null); }
  }

  function loadMyTickets() {
    var list = document.getElementById('iit-tickets-list');
    list.innerHTML = '<p style="color:#8a9bb0;font-size:13px;margin-top:8px">Loading...</p>';
    var statusOrder = ['open', 'in_progress', 'in_review', 'on_hold', 'resolved', 'closed'];
    var statusLabels = { open: 'Open', in_progress: 'In Progress', in_review: 'In Review', on_hold: 'On Hold', resolved: 'Resolved', closed: 'Closed' };
    var statusBg = { open: '#dbeafe', in_progress: '#fef9c3', in_review: '#ede9fe', on_hold: '#f3f4f6', resolved: '#dcfce7', closed: '#f3f4f6' };
    var statusColor = { open: '#1d4ed8', in_progress: '#a16207', in_review: '#6d28d9', on_hold: '#6b7280', resolved: '#15803d', closed: '#6b7280' };
    fetch(ITERATEIT_URL + '/rest/v1/tickets?org_id=eq.' + config.orgId + '&system_id=eq.' + config.systemId + '&created_by=eq.' + config.defaultUserId + '&select=id,title,status,severity,type,created_at&order=created_at.desc&limit=50', {
      headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY, 'x-widget-key': config.apiKey }
    })
    .then(function(res) { return res.json(); })
    .then(function(tickets) {
      if (!tickets.length) { list.innerHTML = '<p style="color:#8a9bb0;font-size:13px;margin-top:8px">No tickets found.</p>'; return; }
      var grouped = {};
      statusOrder.forEach(function(s) { grouped[s] = []; });
      tickets.forEach(function(t) { if (grouped[t.status]) grouped[t.status].push(t); });
      var open = grouped['open'].length;
      var inProg = grouped['in_progress'].length;
      var resolved = grouped['resolved'].length + grouped['closed'].length;
      var html = '<div style="display:flex;gap:8px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;">' +
        '<div style="flex:1;text-align:center;background:#dbeafe;border-radius:8px;padding:8px 4px;"><div style="font-size:18px;font-weight:700;color:#1d4ed8;">' + open + '</div><div style="font-size:9px;color:#1d4ed8;font-weight:600;">OPEN</div></div>' +
        '<div style="flex:1;text-align:center;background:#fef9c3;border-radius:8px;padding:8px 4px;"><div style="font-size:18px;font-weight:700;color:#a16207;">' + inProg + '</div><div style="font-size:9px;color:#a16207;font-weight:600;">IN PROGRESS</div></div>' +
        '<div style="flex:1;text-align:center;background:#dcfce7;border-radius:8px;padding:8px 4px;"><div style="font-size:18px;font-weight:700;color:#15803d;">' + resolved + '</div><div style="font-size:9px;color:#15803d;font-weight:600;">RESOLVED</div></div>' +
      '</div>';
      statusOrder.forEach(function(status) {
        var group = grouped[status];
        if (!group.length) return;
        html += '<div style="margin-bottom:16px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="display:inline-block;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:600;background:' + statusBg[status] + ';color:' + statusColor[status] + ';">' + statusLabels[status] + '</span><span style="font-size:11px;color:#8a9bb0;">' + group.length + ' ticket' + (group.length > 1 ? 's' : '') + '</span></div>';
        group.forEach(function(t) {
          html += '<div class="iit-ticket-item"><div style="font-size:12px;font-weight:600;color:#0d1b2a;margin-bottom:4px;">' + t.title + '</div><div style="font-size:11px;color:#8a9bb0;display:flex;gap:8px;"><span>' + t.severity + '</span><span>' + t.type.replace('_', ' ') + '</span><span>' + new Date(t.created_at).toLocaleDateString() + '</span></div></div>';
        });
        html += '</div>';
      });
      list.innerHTML = html;
    })
    .catch(function() { list.innerHTML = '<p style="color:#c00;font-size:13px">Failed to load tickets.</p>'; });
  }

  window.IterateIT = {
    init: function(userConfig) {
      config = userConfig;
      injectStyles();
      buildUI();
    }
  };

})();
