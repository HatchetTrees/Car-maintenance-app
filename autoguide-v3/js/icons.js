// js/icons.js
// SVG icon strings keyed by name. Used by app.js to render card and detail icons.

const icons = {
  oil: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M5 12h14M5 12l4-4M5 12l4 4"/>
    <path d="M19 12c0 3.9-3.1 7-7 7s-7-3.1-7-7"/>
  </svg>`,

  tire: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,

  battery: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <rect x="2" y="7" width="16" height="10" rx="2"/>
    <path d="M22 11v2M9 11v2M13 11v2"/>
  </svg>`,

  coolant: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z"/>
  </svg>`,

  wiper: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M3 20 L21 4"/>
    <path d="M3 20 Q8 8 21 4"/>
  </svg>`,

  light: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="2" x2="12" y2="4"/>
    <line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="4" y2="12"/>
    <line x1="20" y1="12" x2="22" y2="12"/>
  </svg>`,

  engine: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <rect x="2" y="7" width="20" height="10" rx="2"/>
    <path d="M6 7V5M10 7V5M14 7V5M18 7V5"/>
  </svg>`,

  filter: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/>
  </svg>`,

  safety: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
  </svg>`,

  car: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h8l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>`,

  doc: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>`,

  play: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>`,
};
