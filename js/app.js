// js/app.js
// AutoGuide v3 — application logic
// Handles: view routing, topic search/filter, vehicle profile, records & bills

// ── State ────────────────────────────────────────────────────────────────────

let activeView   = 'all';   // sidebar view key
let activeCardId = null;    // expanded topic detail panel

// Service reminder rows (seeded from data/reminders.js, persisted in sessionStorage)
let reminderRows = loadFromStorage('ag_reminders') || JSON.parse(JSON.stringify(defaultReminders));

// Multi-car garage state is managed in js/vehicles.js

// Records array
let records = loadFromStorage('ag_records') || [];

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadFromStorage(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}
function saveToStorage(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Render dispatcher ─────────────────────────────────────────────────────────

function render() {
  const el = document.getElementById('content');
  if (activeView === 'mycar')     { el.innerHTML = renderGarage();     return; }
  if (activeView === 'records')   { el.innerHTML = renderRecords();    return; }
  if (activeView === 'reminders')   { el.innerHTML = renderReminders();     return; }
  if (activeView === 'myreminders') { el.innerHTML = renderMyReminders(); remUpdateBadge(); return; }
  remUpdateBadge();
  el.innerHTML = renderTopics(activeView);
  if (activeCardId) {
    document.querySelector('.detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── Records & Bills ───────────────────────────────────────────────────────────

const TYPE_LABELS = { insurance: 'Insurance', service: 'Service', dimensions: 'Dimensions', other: 'Other' };
const TYPE_CLASSES = { insurance: 'rec-ins', service: 'rec-svc', dimensions: 'rec-dim', other: 'rec-other' };

function renderRecords() {
  const today = new Date().toISOString().split('T')[0];

  const rows = records.length
    ? records.map((r, i) => `
        <div class="record-row">
          <span class="rec-badge ${TYPE_CLASSES[r.type] || 'rec-other'}">${TYPE_LABELS[r.type] || r.type}</span>
          <span class="rec-text">${escHtml(r.desc)}</span>
          ${r.amount ? `<span class="rec-amount">${escHtml(r.amount)}</span>` : ''}
          <span class="rec-date">${r.date}</span>
          <button class="remove-btn" onclick="deleteRecord(${i})">Remove</button>
        </div>`).join('')
    : '<p class="empty-state">No records yet. Add your first one above.</p>';

  return `
    <div class="vehicle-panel">
      <div class="vp-title">${icons.doc} Records & bills</div>

      <div class="form-grid">
        <div class="section-divider">Add a new record</div>
        <div class="form-group">
          <label>Type</label>
          <select id="r_type">
            <option value="insurance">Insurance bill</option>
            <option value="service">Service record</option>
            <option value="dimensions">Dimension / spec</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date</label>
          <input id="r_date" type="date" value="${today}" />
        </div>
        <div class="form-group full">
          <label>Description</label>
          <textarea id="r_desc" placeholder="e.g. Geico 6-month premium — renewal date June 2026…"></textarea>
        </div>
        <div class="form-group">
          <label>Amount / value (optional)</label>
          <input id="r_amount" type="text" placeholder="e.g. $480.00" />
        </div>
      </div>

      <div class="btn-row" style="margin-bottom: 16px;">
        <button class="btn-primary" onclick="addRecord()">Add record</button>
      </div>

      <div class="records-list">${rows}</div>
    </div>`;
}

function addRecord() {
  const desc = document.getElementById('r_desc').value.trim();
  if (!desc) { document.getElementById('r_desc').focus(); return; }
  records.push({
    type:   document.getElementById('r_type').value,
    desc,
    date:   document.getElementById('r_date').value || new Date().toISOString().split('T')[0],
    amount: document.getElementById('r_amount').value.trim(),
  });
  saveToStorage('ag_records', records);
  render();
}

function deleteRecord(i) {
  records.splice(i, 1);
  saveToStorage('ag_records', records);
  render();
}

// ── Topics ────────────────────────────────────────────────────────────────────

function renderTopics(cat) {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();

  const filtered = topics.filter(t => {
    const matchCat   = cat === 'all' || t.cat === cat;
    const matchQuery = !q ||
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)  ||
      t.steps.some(s => s.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });

  if (!filtered.length) {
    return '<div class="no-results">No results found. Try a different search term.</div>';
  }

  const label = cat === 'all' ? 'All topics' : cat.charAt(0).toUpperCase() + cat.slice(1);

  let html = `
    <div class="section-title">
      ${label}
      <span>${filtered.length} topic${filtered.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="cards-grid">
  `;

  filtered.forEach(t => { html += buildCard(t); });
  html += '</div>';

  if (activeCardId) {
    const t = topics.find(x => x.id === activeCardId);
    if (t) html += buildDetailPanel(t);
  }

  return html;
}

function buildCard(t) {
  const sevClass = t.severity === 'high' ? 'sev-high' : t.severity === 'med' ? 'sev-med' : 'sev-low';
  return `
    <div class="card" onclick="showDetail(${t.id})">
      <div class="card-header">
        <div class="card-icon ${t.iconStyle}">${icons[t.icon] || ''}</div>
        <div><div class="card-title">${t.title}</div></div>
      </div>
      <div class="card-desc">${t.desc}</div>
      <div class="card-footer">
        <span class="severity ${sevClass}">${t.severity_label}</span>
        <span class="steps-dot">${t.steps.length} steps</span>
      </div>
    </div>`;
}

function buildDetailPanel(t) {
  const vehicle    = getActiveVehicle();
  const vehData    = getVehicleSteps(t.id, vehicle);
  const useVehData = !!vehData;
  const stepList   = useVehData ? vehData.steps : t.steps;
  const vehLabel   = vehicle ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') : null;

  const stepsHtml = stepList
    .map((s, i) => `<li class="step"><div class="step-num">${i + 1}</div><div class="step-text">${s}</div></li>`)
    .join('');

  const productsHtml = useVehData && vehData.products && vehData.products.length ? `
    <div class="products-section">
      <div class="products-title">Recommended products for your ${escHtml(vehLabel)}</div>
      ${vehData.products.map(p => `
        <a class="product-row" href="https://www.amazon.com/s?k=${encodeURIComponent(p.search)}" target="_blank" rel="noopener noreferrer">
          <div class="product-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
          <div class="product-body">
            <div class="product-name">${escHtml(p.name)}</div>
            <div class="product-why">${escHtml(p.why)}</div>
          </div>
          <span class="product-arrow">↗</span>
        </a>`).join('')}
    </div>` : '';

  const vehBanner = vehLabel ? `
    <div class="veh-context-banner">
      <svg viewBox="0 0 24 24" width="13" height="13" stroke="#185FA5" fill="none" stroke-width="1.5"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h8l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
      ${useVehData ? `Steps tailored for your <strong>${escHtml(vehLabel)}</strong>` : `Showing general steps — add engine details to your <strong>${escHtml(vehLabel)}</strong> for tailored guidance`}
    </div>` : `
    <div class="veh-context-banner veh-context-plain">
      <svg viewBox="0 0 24 24" width="13" height="13" stroke="#854F0B" fill="none" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Add a vehicle in <strong>My Garage</strong> to get tailored steps and product recommendations.
    </div>`;

  const tutorialHtml = t.tutorial ? `
    <a class="tutorial-link" href="${t.tutorial.url}" target="_blank" rel="noopener noreferrer">
      <div class="tl-icon">${icons.play}</div>
      <div>
        <div class="tl-label">${t.tutorial.label}</div>
        <div class="tl-sub">Watch on YouTube</div>
      </div>
      <span class="tl-arrow">↗</span>
    </a>` : '';

  return `
    <div class="detail-panel">
      <button class="close-btn" onclick="closeDetail()">Close ✕</button>
      <div class="card-icon ${t.iconStyle}" style="margin-bottom: 10px;">${icons[t.icon] || ''}</div>
      <h2>${t.title}</h2>
      <p>${t.desc}</p>
      ${vehBanner}
      <ul class="steps-list">${stepsHtml}</ul>
      <div class="tip-box"><strong>Tip:</strong> ${t.tip}</div>
      ${productsHtml}
      ${tutorialHtml}
    </div>`;
}

// ── Actions ───────────────────────────────────────────────────────────────────

function showDetail(id)  { activeCardId = id;   render(); }
function closeDetail()   { activeCardId = null;  render(); }
function clearSearch()   { document.getElementById('searchInput').value = ''; render(); }

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    activeView   = el.dataset.view;
    activeCardId = null;
    render();
  });
});

document.getElementById('searchInput').addEventListener('input', () => {
  activeCardId = null;
  render();
});

// ── Init ──────────────────────────────────────────────────────────────────────

render();

// ── Service Reminders ─────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_MONTH = new Date().getMonth();

function renderReminders() {
  const rows = reminderRows;

  // Build header months
  const monthHeaders = MONTHS.map((m, i) => {
    const isCur = i === CURRENT_MONTH;
    return `<th class="${isCur ? 'cur-month' : ''}">${m}${isCur ? '<span class="month-now-label">now</span>' : ''}</th>`;
  }).join('');

  // Build table rows
  const tableRows = rows.map((r, ri) => {
    const cells = MONTHS.map((_, i) => {
      const isCur = i === CURRENT_MONTH;
      const hasDot = r.months.includes(i);
      return `<td class="${isCur ? 'cur-col' : ''}">
        ${hasDot ? `<div class="svc-dot ${r.color}${isCur ? ' cur' : ''}"></div>` : ''}
      </td>`;
    }).join('');
    return `<tr>
      <td>${escHtml(r.init)}</td>
      <td>${escHtml(r.obj)} <button class="rem-del-btn" onclick="deleteReminder(${ri})">Remove</button></td>
      ${cells}
    </tr>`;
  }).join('');

  return `
    <div class="reminders-wrap">
      <div class="rem-title">Service reminders</div>

      <div class="rem-legend">
        <div class="rem-leg-item"><div class="rem-leg-dot" style="background:#1D9E75"></div>Routine (5k–7k mi)</div>
        <div class="rem-leg-item"><div class="rem-leg-dot" style="background:#EF9F27"></div>Full service (10k–12k mi)</div>
        <div class="rem-leg-item"><div class="rem-leg-dot" style="background:#E24B4A"></div>Major (30k–90k mi)</div>
        <div class="rem-leg-item"><div class="rem-leg-dot" style="background:#378ADD;border-radius:3px"></div>Current month</div>
      </div>

      <div class="tbl-wrap">
        <table class="rem-table">
          <thead>
            <tr>
              <th>Initiative</th>
              <th>Objective</th>
              ${monthHeaders}
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>

      <div class="rem-add-row">
        <input id="rem_init" type="text" placeholder="Initiative (e.g. Every 15,000 mi)" style="flex:1;min-width:140px" />
        <input id="rem_obj"  type="text" placeholder="Objective / service description"   style="flex:2;min-width:180px" />
        <select id="rem_color">
          <option value="green">Routine</option>
          <option value="warn">Full service</option>
          <option value="red">Major</option>
        </select>
        <select id="rem_months" multiple style="height:36px;min-width:110px" title="Hold Ctrl/Cmd to select multiple months">
          ${MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join('')}
        </select>
        <button class="rem-add-btn" onclick="addReminder()">Add reminder</button>
      </div>
      <div class="rem-note">Hold Ctrl / Cmd to select multiple months for a reminder.</div>
    </div>`;
}

function addReminder() {
  const init   = document.getElementById('rem_init').value.trim();
  const obj    = document.getElementById('rem_obj').value.trim();
  const color  = document.getElementById('rem_color').value;
  const sel    = document.getElementById('rem_months');
  const months = [...sel.selectedOptions].map(o => parseInt(o.value));

  if (!init || !obj || !months.length) {
    if (!init)        document.getElementById('rem_init').focus();
    else if (!obj)    document.getElementById('rem_obj').focus();
    return;
  }

  reminderRows.push({ init, obj, color, months });
  saveToStorage('ag_reminders', reminderRows);
  render();
}

function deleteReminder(i) {
  reminderRows.splice(i, 1);
  saveToStorage('ag_reminders', reminderRows);
  render();
}
