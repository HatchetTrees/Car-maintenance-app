// js/app.js
// AutoGuide v3 — application logic
// Handles: view routing, topic search/filter, vehicle profile, records & bills

// ── State ────────────────────────────────────────────────────────────────────

let activeView   = 'all';   // sidebar view key
let activeCardId = null;    // expanded topic detail panel

// Vehicle profile (persisted in sessionStorage so it survives page reload during dev)
let vehicleData = loadFromStorage('ag_vehicle') || {
  year: '', make: '', model: '', color: '', vin: '',
  mileage: '', engine: '',
  length: '', width: '', height: '', weight: '',
};

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
  if (activeView === 'mycar')   { el.innerHTML = renderMyVehicle(); return; }
  if (activeView === 'records') { el.innerHTML = renderRecords();   return; }
  el.innerHTML = renderTopics(activeView);
  if (activeCardId) {
    document.querySelector('.detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── My Vehicle ────────────────────────────────────────────────────────────────

function renderMyVehicle() {
  const v = vehicleData;
  const hasCar = v.year || v.make || v.model;

  const savedCard = hasCar ? `
    <div class="saved-card">
      <div class="saved-card-header">
        <div class="car-avatar">${icons.car}</div>
        <div>
          <div class="saved-car-name">${[v.year, v.make, v.model].filter(Boolean).join(' ')}</div>
          <div class="saved-car-sub">${[v.color, v.mileage ? v.mileage + ' miles' : ''].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      <div class="info-grid">
        ${v.vin     ? `<div class="info-item"><div class="ilabel">VIN</div><div class="ival" style="font-family:monospace;font-size:11px">${v.vin}</div></div>` : ''}
        ${v.engine  ? `<div class="info-item"><div class="ilabel">Engine</div><div class="ival">${v.engine}</div></div>` : ''}
        ${v.length  ? `<div class="info-item"><div class="ilabel">Length</div><div class="ival">${v.length}</div></div>` : ''}
        ${v.width   ? `<div class="info-item"><div class="ilabel">Width</div><div class="ival">${v.width}</div></div>` : ''}
        ${v.height  ? `<div class="info-item"><div class="ilabel">Height</div><div class="ival">${v.height}</div></div>` : ''}
        ${v.weight  ? `<div class="info-item"><div class="ilabel">Curb weight</div><div class="ival">${v.weight}</div></div>` : ''}
      </div>
    </div>` : '';

  return `
    <div class="vehicle-panel">
      <div class="vp-title">${icons.car} My vehicle profile</div>
      ${savedCard}
      <div class="form-grid">
        <div class="section-divider">Basic info</div>
        <div class="form-group">
          <label>Year</label>
          <input id="v_year" type="number" min="1900" max="2099" placeholder="e.g. 2019" value="${v.year}" />
        </div>
        <div class="form-group">
          <label>Make</label>
          <input id="v_make" type="text" placeholder="e.g. Toyota" value="${v.make}" />
        </div>
        <div class="form-group">
          <label>Model</label>
          <input id="v_model" type="text" placeholder="e.g. Camry" value="${v.model}" />
        </div>
        <div class="form-group">
          <label>Color</label>
          <input id="v_color" type="text" placeholder="e.g. Silver" value="${v.color}" />
        </div>
        <div class="form-group full">
          <label>VIN (Vehicle Identification Number)</label>
          <input id="v_vin" type="text" placeholder="17-character VIN" maxlength="17"
                 value="${v.vin}" class="vin-input" />
        </div>
        <div class="form-group">
          <label>Current mileage</label>
          <input id="v_mileage" type="text" placeholder="e.g. 42,500 mi" value="${v.mileage}" />
        </div>
        <div class="form-group">
          <label>Engine</label>
          <input id="v_engine" type="text" placeholder="e.g. 2.5L 4-cyl" value="${v.engine}" />
        </div>

        <div class="section-divider">Physical dimensions</div>
        <div class="form-group">
          <label>Length</label>
          <input id="v_length" type="text" placeholder='e.g. 192"' value="${v.length}" />
        </div>
        <div class="form-group">
          <label>Width</label>
          <input id="v_width" type="text" placeholder='e.g. 72"' value="${v.width}" />
        </div>
        <div class="form-group">
          <label>Height</label>
          <input id="v_height" type="text" placeholder='e.g. 57"' value="${v.height}" />
        </div>
        <div class="form-group">
          <label>Curb weight</label>
          <input id="v_weight" type="text" placeholder="e.g. 3,340 lbs" value="${v.weight}" />
        </div>
      </div>

      <div class="btn-row">
        <button class="btn-primary" onclick="saveVehicle()">Save vehicle</button>
        <button class="btn-secondary" onclick="clearVehicle()">Clear</button>
      </div>
    </div>`;
}

function saveVehicle() {
  vehicleData = {
    year:    document.getElementById('v_year').value.trim(),
    make:    document.getElementById('v_make').value.trim(),
    model:   document.getElementById('v_model').value.trim(),
    color:   document.getElementById('v_color').value.trim(),
    vin:     document.getElementById('v_vin').value.trim().toUpperCase(),
    mileage: document.getElementById('v_mileage').value.trim(),
    engine:  document.getElementById('v_engine').value.trim(),
    length:  document.getElementById('v_length').value.trim(),
    width:   document.getElementById('v_width').value.trim(),
    height:  document.getElementById('v_height').value.trim(),
    weight:  document.getElementById('v_weight').value.trim(),
  };
  saveToStorage('ag_vehicle', vehicleData);
  render();
}

function clearVehicle() {
  vehicleData = { year:'', make:'', model:'', color:'', vin:'', mileage:'', engine:'', length:'', width:'', height:'', weight:'' };
  saveToStorage('ag_vehicle', vehicleData);
  render();
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
  const steps = t.steps
    .map((s, i) => `<li class="step"><div class="step-num">${i + 1}</div><div class="step-text">${s}</div></li>`)
    .join('');

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
      <ul class="steps-list">${steps}</ul>
      <div class="tip-box"><strong>Tip:</strong> ${t.tip}</div>
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
