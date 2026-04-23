// js/reminders.js
// AutoGuide — My Reminders system
// Handles: creating, storing, displaying, snoozing, and completing car maintenance reminders.
// Data is persisted in localStorage under the key 'ag_car_reminders'.

// ── Helpers ───────────────────────────────────────────────────────────────────

const REM_KEY = 'ag_car_reminders';

function remToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function remDateStr(d) {
  return d.toISOString().split('T')[0];
}

function remParseDate(str) {
  const p = str.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function remDaysUntil(dateStr) {
  return Math.round((remParseDate(dateStr) - remToday()) / 86400000);
}

function remFmtDate(dateStr) {
  return remParseDate(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function remSave(rows) {
  try { localStorage.setItem(REM_KEY, JSON.stringify(rows)); } catch {}
}

function remLoad() {
  try { return JSON.parse(localStorage.getItem(REM_KEY)); } catch { return null; }
}

// ── Default seed data ─────────────────────────────────────────────────────────

function remSeedData() {
  const today = remToday();
  const ago   = (days) => { const d = new Date(today); d.setDate(d.getDate() - days); return remDateStr(d); };
  const ahead = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return remDateStr(d); };
  return [
    { id: 1, task: 'Oil change',             date: ago(16),    repeat: '6m', notes: 'Use 5W-30 synthetic oil' },
    { id: 2, task: 'Tire rotation',           date: ahead(5),   repeat: '6m', notes: '' },
    { id: 3, task: 'Battery check',           date: ahead(18),  repeat: '1y', notes: 'Battery is 3 years old — consider replacement' },
    { id: 4, task: 'Air filter replacement',  date: ahead(62),  repeat: '1y', notes: '' },
  ];
}

// ── State ─────────────────────────────────────────────────────────────────────

let remRows  = remLoad() || remSeedData();
let remNextId = Math.max(...remRows.map(r => r.id), 0) + 1;

// ── Status logic ──────────────────────────────────────────────────────────────

function remStatusOf(r) {
  const d = remDaysUntil(r.date);
  if (d < 0)  return 'overdue';
  if (d <= 7) return 'due-soon';
  return 'ok';
}

// ── Icon map ──────────────────────────────────────────────────────────────────

const REM_ICONS = {
  'Oil change':              '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M5 12h14M5 12l4-4M5 12l4 4"/><path d="M19 12c0 3.9-3.1 7-7 7s-7-3.1-7-7"/></svg>',
  'Tire rotation':           '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
  'Tire pressure check':     '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
  'Battery check':           '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M9 11v2M13 11v2"/></svg>',
  'Brake inspection':        '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>',
  'Coolant top-up':          '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z"/></svg>',
  'Air filter replacement':  '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/></svg>',
  'Wiper blade replacement': '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M3 20 L21 4"/><path d="M3 20 Q8 8 21 4"/></svg>',
  'Full service':            '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
  'Timing belt replacement': '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7V5M10 7V5M14 7V5M18 7V5"/></svg>',
  'Transmission fluid':      '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z"/></svg>',
  '_default':                '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
};

function remIconFor(task, status) {
  const svg  = REM_ICONS[task] || REM_ICONS['_default'];
  const cls  = status === 'overdue' ? 'rem-ic-red' : status === 'due-soon' ? 'rem-ic-amber' : 'rem-ic-green';
  return `<div class="rem-card-icon ${cls}">${svg}</div>`;
}

function remPillFor(status) {
  if (status === 'overdue')  return '<span class="rem-pill rem-pill-red">Overdue</span>';
  if (status === 'due-soon') return '<span class="rem-pill rem-pill-amber">Due soon</span>';
  return '<span class="rem-pill rem-pill-green">Scheduled</span>';
}

function remDateLine(r, status) {
  const d = remDaysUntil(r.date);
  let txt;
  if (status === 'overdue') {
    txt = `${Math.abs(d)} day${Math.abs(d) !== 1 ? 's' : ''} overdue — was due ${remFmtDate(r.date)}`;
  } else if (d === 0) {
    txt = `Due today`;
  } else if (d === 1) {
    txt = `Due tomorrow — ${remFmtDate(r.date)}`;
  } else {
    txt = `Due in ${d} days — ${remFmtDate(r.date)}`;
  }
  if (r.repeat !== 'none') {
    const lbl = { '1m': 'monthly', '3m': 'every 3 months', '6m': 'every 6 months', '1y': 'yearly' }[r.repeat] || '';
    if (lbl) txt += ` · repeats ${lbl}`;
  }
  return `<div class="rem-dateline rem-dateline-${status}">${txt}</div>`;
}

// ── Card HTML ─────────────────────────────────────────────────────────────────

function remCardHTML(r) {
  const st = remStatusOf(r);
  return `
    <div class="rem-card rem-card-${st}" id="rc${r.id}">
      ${remIconFor(r.task, st)}
      <div class="rem-card-body">
        <div class="rem-card-title">${escHtml(r.task)}</div>
        ${r.notes ? `<div class="rem-card-sub">${escHtml(r.notes)}</div>` : ''}
        ${remDateLine(r, st)}
        <div class="rem-card-actions">
          <button class="rem-btn-done"   onclick="remMarkDone(${r.id})">Mark done</button>
          <button class="rem-btn-snooze" onclick="remSnooze(${r.id}, 7)">Snooze 1 week</button>
          <button class="rem-btn-snooze" onclick="remSnooze(${r.id}, 30)">Snooze 1 month</button>
          <button class="rem-btn-remove" onclick="remDelete(${r.id})">Remove</button>
        </div>
      </div>
      <div class="rem-card-right">${remPillFor(st)}</div>
    </div>`;
}

// ── Main render ───────────────────────────────────────────────────────────────

function renderMyReminders() {
  const sorted = [...remRows].sort((a, b) => remDaysUntil(a.date) - remDaysUntil(b.date));
  const alerts   = sorted.filter(r => remStatusOf(r) !== 'ok');
  const upcoming = sorted.filter(r => remStatusOf(r) === 'ok');

  // Update sidebar badge
  const badge = document.getElementById('reminderBadge');
  if (badge) {
    badge.textContent  = alerts.length;
    badge.style.display = alerts.length ? 'inline' : 'none';
    badge.style.background = alerts.length ? '#E24B4A' : '#185FA5';
    badge.style.color      = '#E6F1FB';
  }

  const alertSection = alerts.length
    ? `<div class="rem-section-head rem-head-alert">Needs attention</div>${alerts.map(remCardHTML).join('')}`
    : `<div class="rem-section-head rem-head-ok">All caught up</div>
       <div class="rem-all-ok">No overdue or due-soon reminders. Great work keeping up with maintenance!</div>`;

  const upcomingSection = upcoming.length
    ? `<div class="rem-section-head">Upcoming</div>${upcoming.map(remCardHTML).join('')}`
    : `<div class="rem-empty">No upcoming reminders — add one below.</div>`;

  // Default due date = 30 days from today
  const defDate = new Date(remToday());
  defDate.setDate(defDate.getDate() + 30);

  return `
    <div class="rem-page">

      <div class="rem-banner">
        <div class="rem-banner-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="#B5D4F4" fill="none" stroke-width="1.5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </div>
        <div class="rem-banner-text">
          <div class="rem-banner-title">Maintenance reminders</div>
          <div class="rem-banner-sub">Stay on top of your car's health</div>
        </div>
        <div class="rem-banner-count">
          <div class="rem-count-num" id="remDueCount">${alerts.length}</div>
          <div class="rem-count-label">due or overdue</div>
        </div>
      </div>

      <div class="rem-notify-bar" id="remNotifyBar">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="#185FA5" fill="none" stroke-width="1.5" style="flex-shrink:0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Reminders are saved in your browser. They will persist across page refreshes on this device.
        <button class="rem-dismiss-btn" onclick="document.getElementById('remNotifyBar').style.display='none'">Dismiss</button>
      </div>

      ${alertSection}
      ${upcomingSection}

      <div class="rem-add-panel">
        <div class="rem-add-title">Set a new reminder</div>
        <div class="rem-form-grid">
          <div class="rem-fg">
            <label class="rem-label">Task</label>
            <select id="rem_task" onchange="remToggleCustom()">
              <option>Oil change</option>
              <option>Tire rotation</option>
              <option>Tire pressure check</option>
              <option>Battery check</option>
              <option>Brake inspection</option>
              <option>Coolant top-up</option>
              <option>Air filter replacement</option>
              <option>Wiper blade replacement</option>
              <option>Full service</option>
              <option>Timing belt replacement</option>
              <option>Transmission fluid</option>
              <option value="Custom...">Custom...</option>
            </select>
          </div>
          <div class="rem-fg" id="rem_customGroup" style="display:none">
            <label class="rem-label">Custom task name</label>
            <input id="rem_custom" type="text" placeholder="e.g. Spark plug check" />
          </div>
          <div class="rem-fg">
            <label class="rem-label">Due date</label>
            <input id="rem_date" type="date" value="${remDateStr(defDate)}" />
          </div>
          <div class="rem-fg">
            <label class="rem-label">Repeat</label>
            <select id="rem_repeat">
              <option value="none">No repeat</option>
              <option value="1m">Every month</option>
              <option value="3m">Every 3 months</option>
              <option value="6m">Every 6 months</option>
              <option value="1y">Every year</option>
            </select>
          </div>
          <div class="rem-fg rem-fg-full">
            <label class="rem-label">Notes (optional)</label>
            <input id="rem_notes" type="text" placeholder="e.g. Use 5W-30 synthetic, check at Jiffy Lube" />
          </div>
        </div>
        <button class="rem-add-btn" onclick="remAdd()">Add reminder</button>
      </div>

    </div>`;
}

// ── Actions ───────────────────────────────────────────────────────────────────

function remMarkDone(id) {
  const r = remRows.find(x => x.id === id);
  if (!r) return;
  if (r.repeat === 'none') {
    remRows = remRows.filter(x => x.id !== id);
  } else {
    const months = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[r.repeat] || 1;
    const next   = remParseDate(r.date);
    next.setMonth(next.getMonth() + months);
    r.date = remDateStr(next);
  }
  remSave(remRows);
  render(); // re-render full page (defined in app.js)
}

function remSnooze(id, days) {
  const r = remRows.find(x => x.id === id);
  if (!r) return;
  const d = remParseDate(r.date);
  d.setDate(d.getDate() + days);
  r.date = remDateStr(d);
  remSave(remRows);
  render();
}

function remDelete(id) {
  remRows = remRows.filter(x => x.id !== id);
  remSave(remRows);
  render();
}

function remToggleCustom() {
  const sel = document.getElementById('rem_task');
  const grp = document.getElementById('rem_customGroup');
  if (sel && grp) grp.style.display = sel.value === 'Custom...' ? 'flex' : 'none';
}

function remAdd() {
  let task = document.getElementById('rem_task').value;
  if (task === 'Custom...') {
    task = (document.getElementById('rem_custom').value || '').trim();
    if (!task) { document.getElementById('rem_custom').focus(); return; }
  }
  const date   = document.getElementById('rem_date').value;
  const repeat = document.getElementById('rem_repeat').value;
  const notes  = (document.getElementById('rem_notes').value || '').trim();
  if (!date) { document.getElementById('rem_date').focus(); return; }

  remRows.push({ id: remNextId++, task, date, repeat, notes });
  remSave(remRows);
  render();
}

// ── Sidebar badge update (called on every render) ─────────────────────────────

function remUpdateBadge() {
  const count  = remRows.filter(r => remStatusOf(r) !== 'ok').length;
  const badge  = document.getElementById('reminderBadge');
  if (!badge) return;
  badge.textContent   = count;
  badge.style.display = count ? 'inline' : 'none';
  if (count) { badge.style.background = '#E24B4A'; badge.style.color = '#E6F1FB'; }
}
