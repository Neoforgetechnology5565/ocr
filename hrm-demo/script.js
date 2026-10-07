/* ==========================================================================
   NovaCore HR — Interactive product demo
   Frontend prototype only: no backend, no authentication, no real data.
   Every person, figure and record in this file is fictional.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Utilities
     ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n, d = 0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const moneyK = (n) => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + n;
  const num = (n) => Number(n).toLocaleString('en-US');
  const pct = (n, d = 1) => Number(n).toFixed(d) + '%';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let rand = mulberry32(20261007);
  const ri = (a, b) => Math.floor(rand() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  function shuffle(arr, r = rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const TODAY = new Date(2026, 9, 7, 10, 42); // Demo "today": Wed, Oct 7 2026
  const fmtDate = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const fmtShort = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hm = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const ampm = (mins) => { const h = Math.floor(mins / 60), m = mins % 60; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

  /* ------------------------------------------------------------------
     Icons (inline SVG, stroke style)
     ------------------------------------------------------------------ */
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    'user-x': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5M22 8l-5 5"/>',
    'user-circle': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    'calendar-check': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M21 12V9a2 2 0 0 0-2-2H5"/><path d="M16 12h5v4h-5a2 2 0 0 1 0-4z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 18v-3M12 18v-6M16 18v-2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    trending: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
    'trending-down': '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
    'arrow-down': '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    workflow: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    dollar: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    crown: '<path d="m2 6 4 11h12l4-11-6 5-4-7-4 7-6-5z"/><path d="M6 21h12"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    play: '<path d="m6 3 14 9-14 9V3z"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    bar: '<path d="M12 20V10M18 20V4M6 20v-4"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    car: '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5M3 12h18"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    tooth: '<path d="M12 5.5c-1.5-1.5-3-2.5-5-2.5C4.5 3 3 5 3 7.5c0 3 1.5 4.5 2 7.5.5 3.5 1 6 2.5 6s1.8-3 2.5-5c.4-1 1.6-1 2 0 .7 2 1 5 2.5 5s2-2.5 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3.5 1-5 2.5z"/>',
    umbrella: '<path d="M22 12a10.06 10.06 0 0 0-20 0z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
    piggy: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
    certificate: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 8h10M7 12h6"/><path d="m14 16 1 6 2-1.5 2 1.5 1-6"/>',
    fileCheck: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
    receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    video: '<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>'
  };
  const icon = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
  function hydrateIcons(root = document) {
    $$('[data-icon]', root).forEach((el) => {
      el.outerHTML = icon(el.getAttribute('data-icon'), el.className || '');
    });
  }

  /* ------------------------------------------------------------------
     Fictional demo data — NovaCore Technologies
     ------------------------------------------------------------------ */
  const COMPANY = 'NovaCore Technologies';
  const AV_COLORS = [
    ['#dbe6fe', '#1e40af'], ['#ccfbf1', '#115e59'], ['#e0e7ff', '#3730a3'], ['#fef3c7', '#92400e'],
    ['#fce7f3', '#9d174d'], ['#e0f2fe', '#075985'], ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#f1f5f9', '#334155']
  ];

  const DEPTS = [
    { name: 'Engineering', count: 34, lead: 'John Carter', positions: [['Software Engineer', 7600], ['Senior Software Engineer', 9800], ['Frontend Engineer', 7900], ['Backend Engineer', 8200], ['DevOps Engineer', 8600], ['QA Engineer', 6400], ['Data Engineer', 8900], ['Engineering Manager', 11800]] },
    { name: 'Sales', count: 22, lead: 'Michael Brown', positions: [['Account Executive', 6200], ['Sales Development Rep', 4600], ['Senior Account Executive', 7800], ['Sales Manager', 9400]] },
    { name: 'Operations', count: 18, lead: 'Daniel Thompson', positions: [['Operations Analyst', 5600], ['Operations Coordinator', 4800], ['Procurement Specialist', 5400], ['Facilities Lead', 5900]] },
    { name: 'Customer Success', count: 16, lead: 'Olivia Garcia', positions: [['Customer Success Manager', 6100], ['Support Specialist', 4400], ['Support Team Lead', 6300]] },
    { name: 'Product', count: 12, lead: 'Emily Johnson', positions: [['Product Manager', 9200], ['Product Designer', 8100], ['UX Researcher', 7400], ['Senior Product Manager', 10900]] },
    { name: 'Marketing', count: 10, lead: 'Sophia Martinez', positions: [['Content Strategist', 5600], ['Growth Marketer', 6300], ['Brand Designer', 5900], ['Marketing Manager', 8700]] },
    { name: 'Finance', count: 8, lead: 'David Anderson', positions: [['Financial Analyst', 6600], ['Accountant', 5800], ['Payroll Specialist', 5500], ['Finance Manager', 10200]] },
    { name: 'Human Resources', count: 8, lead: 'Sarah Williams', positions: [['HR Generalist', 5400], ['Talent Acquisition Partner', 6000], ['People Ops Coordinator', 4700], ['HR Business Partner', 8300]] }
  ];
  const DEPT_NAMES = DEPTS.map((d) => d.name);
  const LOCATIONS = ['Austin HQ', 'Austin HQ', 'Austin HQ', 'Denver Office', 'Remote — US', 'Toronto Office'];

  const FIRST = ['James', 'Olivia', 'Daniel', 'Ava', 'Matthew', 'Isabella', 'Andrew', 'Mia', 'Ryan', 'Charlotte', 'Ethan', 'Amelia', 'Nathan', 'Harper', 'Lucas', 'Grace', 'Benjamin', 'Chloe', 'Samuel', 'Zoe', 'Henry', 'Lily', 'Owen', 'Hannah', 'Jacob', 'Nora', 'Leo', 'Ella', 'Adam', 'Maya', 'Thomas', 'Aria', 'Noah', 'Leah', 'Caleb', 'Ruby', 'Isaac', 'Stella', 'Aaron', 'Claire', 'Gabriel', 'Naomi', 'Elijah', 'Violet', 'Julian', 'Alice', 'Marcus', 'Elena', 'Victor', 'Priya', 'Kevin', 'Aisha', 'Omar', 'Mei', 'Diego', 'Lena', 'Rahul', 'Fatima', 'Tomas', 'Yuki', 'Amara', 'Kofi', 'Ines', 'Felix'];
  const LAST = ['Thompson', 'Garcia', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Patel', 'Nguyen', 'Kim', 'Okafor', 'Silva', 'Novak', 'Haddad'];

  const FIXED = [
    { name: 'John Carter', dept: 'Engineering', position: 'Senior Software Engineer', join: '2021-03-15' },
    { name: 'Sarah Williams', dept: 'Human Resources', position: 'HR Business Partner', join: '2019-08-01' },
    { name: 'Michael Brown', dept: 'Sales', position: 'Sales Manager', join: '2020-01-13' },
    { name: 'Emily Johnson', dept: 'Product', position: 'Product Designer', join: '2022-06-06' },
    { name: 'David Anderson', dept: 'Finance', position: 'Finance Manager', join: '2018-11-19' },
    { name: 'Sophia Martinez', dept: 'Marketing', position: 'Marketing Manager', join: '2021-09-27' },
    { name: 'Daniel Thompson', dept: 'Operations', position: 'Facilities Lead', join: '2019-04-08' },
    { name: 'Olivia Garcia', dept: 'Customer Success', position: 'Support Team Lead', join: '2020-07-20' }
  ];

  function buildEmployees() {
    const remaining = {};
    DEPTS.forEach((d) => (remaining[d.name] = d.count));
    const list = [];
    const used = new Set(['Alex Morgan']);
    const mk = (name, dept, position, join, i) => {
      const d = DEPTS.find((x) => x.name === dept);
      const posBase = (d.positions.find((p) => p[0] === position) || d.positions[0])[1];
      const basic = Math.round((posBase + ri(-6, 9) * 50) / 50) * 50;
      const allowances = Math.round((basic * (0.08 + rand() * 0.07)) / 10) * 10;
      const gross = basic + allowances;
      const tax = Math.round(gross * (0.14 + rand() * 0.05));
      const benefitsDed = ri(18, 34) * 10;
      const pension = Math.round(basic * 0.05);
      const deductions = tax + benefitsDed + pension;
      const [first, last] = name.split(' ');
      used.add(name);
      remaining[dept]--;
      return {
        id: 'NC-' + (1001 + i), name, first, last, dept, position,
        status: 'Active',
        join: new Date(join + 'T00:00:00'),
        email: `${first}.${last}@novacore-demo.com`.toLowerCase(),
        phone: `+1 (555) 01${String(ri(10, 99))}-${String(ri(1000, 9999))}`,
        location: pick(LOCATIONS),
        manager: d.lead === name ? 'Alex Morgan' : d.lead,
        type: rand() < 0.92 ? 'Full-time' : 'Contract',
        basic, allowances, tax, benefitsDed, pension, deductions,
        net: gross - deductions,
        payStatus: 'Paid',
        attendance: +(88 + rand() * 11).toFixed(1),
        leave: { annual: ri(4, 18), sick: ri(3, 10), casual: ri(1, 6) },
        perf: +(2.9 + rand() * 2).toFixed(1),
        goalsTotal: ri(3, 6),
        goalsDone: 0,
        review: 'Completed',
        av: AV_COLORS[i % AV_COLORS.length]
      };
    };
    FIXED.forEach((f, i) => list.push(mk(f.name, f.dept, f.position, f.join, i)));
    let i = list.length;
    DEPTS.forEach((d) => {
      while (remaining[d.name] > 0) {
        let name;
        do { name = pick(FIRST) + ' ' + pick(LAST); } while (used.has(name));
        const pos = rand() < 0.08 ? d.positions[d.positions.length - 1][0] : pick(d.positions.slice(0, -1))[0];
        const y = ri(2017, 2026), m = y === 2026 ? ri(0, 8) : ri(0, 11);
        list.push(mk(name, d.name, pos, iso(new Date(y, m, ri(1, 28))), i++));
      }
    });
    // Statuses: 8 On Leave, 6 Probation (recent joiners), 2 Notice Period
    const pool = shuffle(list.slice(8));
    pool.slice(0, 8).forEach((e) => (e.status = 'On Leave'));
    pool.slice(8, 14).forEach((e) => { e.status = 'Probation'; e.join = new Date(2026, ri(5, 8), ri(1, 28)); });
    pool.slice(14, 16).forEach((e) => (e.status = 'Notice Period'));
    // Performance goals / reviews
    list.forEach((e) => {
      e.goalsDone = clamp(Math.round(e.goalsTotal * (e.perf / 5) - rand()), 0, e.goalsTotal);
      const r = rand();
      e.review = r < 0.55 ? 'Completed' : r < 0.8 ? 'In Progress' : r < 0.93 ? 'Not Started' : 'Overdue';
    });
    list[0].perf = 4.7; list[0].goalsDone = list[0].goalsTotal - 1; list[0].review = 'Completed';
    list[3].perf = 4.8; list[3].review = 'Completed';
    // Payroll statuses for current cycle
    shuffle(list).slice(0, 34).forEach((e) => (e.payStatus = 'Pending'));
    shuffle(list).slice(0, 2).forEach((e) => (e.payStatus = 'On Hold'));
    return list;
  }
  const EMPLOYEES = buildEmployees();
  const empById = (id) => EMPLOYEES.find((e) => e.id === id);
  const empByName = (n) => EMPLOYEES.find((e) => e.name === n);
  const initials = (n) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const av = (e, cls = '') => {
    const c = e.av || AV_COLORS[8];
    return `<span class="avatar ${cls}" style="--av-bg:${c[0]};--av-fg:${c[1]}">${esc(initials(e.name))}</span>`;
  };
  const deptCounts = () => DEPT_NAMES.map((d) => ({ name: d, value: EMPLOYEES.filter((e) => e.dept === d).length }));

  /* Attendance by day (seeded per date so it is stable) */
  const ATT_DATES = [0, -1, -2, -5, -6].map((n) => addDays(TODAY, n));
  const attCache = {};
  function attendanceFor(dateIdx) {
    if (attCache[dateIdx]) return attCache[dateIdx];
    const r = mulberry32(777 + dateIdx * 31);
    const isToday = dateIdx === 0;
    const onLeave = EMPLOYEES.filter((e) => e.status === 'On Leave');
    const others = shuffle(EMPLOYEES.filter((e) => e.status !== 'On Leave'), r);
    const nAbs = isToday ? 6 : 3 + Math.floor(r() * 5);
    const nLate = isToday ? 9 : 6 + Math.floor(r() * 7);
    const leaveSet = isToday ? onLeave : onLeave.slice(0, 5 + Math.floor(r() * 4));
    const rows = EMPLOYEES.map((e) => {
      let status, cin = null, cout = null;
      const oi = others.indexOf(e);
      if (leaveSet.includes(e)) status = 'On Leave';
      else if (oi > -1 && oi < nAbs) status = 'Absent';
      else if (oi >= nAbs && oi < nAbs + nLate) { status = 'Late'; cin = 9 * 60 + 6 + Math.floor(r() * 44); }
      else { status = 'Present'; cin = 8 * 60 + 10 + Math.floor(r() * 50); }
      if (cin && !isToday) cout = 17 * 60 + Math.floor(r() * 105);
      return { emp: e, status, cin, cout };
    });
    attCache[dateIdx] = rows;
    return rows;
  }
  // 4 weeks of daily attendance history (weekdays)
  const ATT_HISTORY = (() => {
    const r = mulberry32(4242);
    const out = [];
    let d = addDays(TODAY, -40);
    while (d <= TODAY) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        const isToday = iso(d) === iso(TODAY);
        const leave = isToday ? 8 : 5 + Math.floor(r() * 5);
        const absent = isToday ? 6 : 2 + Math.floor(r() * 6);
        const late = isToday ? 9 : 5 + Math.floor(r() * 9);
        const present = 128 - leave - absent - late;
        out.push({ date: new Date(d), present, late, absent, leave });
      }
      d = addDays(d, 1);
    }
    return out;
  })();

  /* Leave requests */
  const byDept = (d, skip = 0) => EMPLOYEES.filter((e) => e.dept === d && e.status === 'Active')[skip];
  let leaveSeq = 1;
  const mkLeave = (emp, type, start, days, reason, status, decidedBy) => {
    const s = new Date(start + 'T00:00:00');
    let e = new Date(s), left = days - 1;
    while (left > 0) { e = addDays(e, 1); if (e.getDay() !== 0 && e.getDay() !== 6) left--; }
    return { id: 'LV-' + String(2400 + leaveSeq++), emp, type, start: s, end: e, days, reason, status, decidedBy: decidedBy || null, submitted: addDays(TODAY, -ri(0, 4)) };
  };
  const LEAVES = [
    mkLeave(empByName('John Carter'), 'Annual Leave', '2026-10-19', 5, 'Family vacation planned since summer', 'Pending'),
    mkLeave(empByName('Michael Brown'), 'Sick Leave', '2026-10-08', 2, 'Medical appointment and recovery', 'Pending'),
    mkLeave(empByName('Emily Johnson'), 'Casual Leave', '2026-10-14', 1, 'Personal errand', 'Pending'),
    mkLeave(byDept('Engineering', 3), 'Annual Leave', '2026-11-02', 5, 'Travelling abroad to visit relatives', 'Pending'),
    mkLeave(byDept('Sales', 2), 'Annual Leave', '2026-10-26', 2, 'Attending a family wedding', 'Pending'),
    mkLeave(byDept('Operations', 1), 'Casual Leave', '2026-10-12', 1, 'Moving to a new apartment', 'Pending'),
    mkLeave(empByName('Sarah Williams'), 'Annual Leave', '2026-09-28', 3, 'Short break', 'Approved', 'Alex Morgan'),
    mkLeave(empByName('Sophia Martinez'), 'Sick Leave', '2026-10-01', 1, 'Flu symptoms', 'Approved', 'Alex Morgan'),
    mkLeave(byDept('Customer Success', 2), 'Casual Leave', '2026-10-02', 1, 'Child school event', 'Approved', 'Olivia Garcia'),
    mkLeave(byDept('Engineering', 6), 'Annual Leave', '2026-10-05', 4, 'Holiday trip', 'Approved', 'John Carter'),
    mkLeave(byDept('Marketing', 1), 'Annual Leave', '2026-10-09', 3, 'Overlaps with campaign launch week', 'Rejected', 'Sophia Martinez'),
    mkLeave(byDept('Finance', 1), 'Casual Leave', '2026-09-30', 1, 'Quarter-end close — requested to reschedule', 'Rejected', 'David Anderson'),
    mkLeave(byDept('Product', 2), 'Sick Leave', '2026-09-24', 2, 'Recovering from a minor procedure', 'Approved', 'Emily Johnson')
  ];
  const LEAVE_TYPES = [
    { name: 'Annual Leave', icon: 'sun', entitlement: 20, taken: 1184, total: 2560, color: 'blue' },
    { name: 'Sick Leave', icon: 'heart', entitlement: 10, taken: 412, total: 1280, color: 'red' },
    { name: 'Casual Leave', icon: 'coffee', entitlement: 6, taken: 389, total: 768, color: 'amber' }
  ];

  const BENEFITS = [
    { name: 'Health Insurance', icon: 'heart', provider: 'Meridian Health (fictional)', enrolled: 121, eligible: 128, cost: 54450, elig: 'All full-time employees', status: 'Active' },
    { name: 'Dental Insurance', icon: 'tooth', provider: 'BrightSmile Dental (fictional)', enrolled: 98, eligible: 128, cost: 6370, elig: 'All full-time employees', status: 'Active' },
    { name: 'Life Insurance', icon: 'umbrella', provider: 'Evergreen Life (fictional)', enrolled: 112, eligible: 128, cost: 4480, elig: 'After 90 days of service', status: 'Active' },
    { name: 'Retirement Plan (401k)', icon: 'piggy', provider: 'Summit Retirement (fictional)', enrolled: 104, eligible: 122, cost: 31200, elig: 'After probation · 5% match', status: 'Active' },
    { name: 'Transport Allowance', icon: 'car', provider: 'Internal', enrolled: 76, eligible: 96, cost: 11400, elig: 'Office-based employees', status: 'Active' },
    { name: 'Meal Allowance', icon: 'coffee', provider: 'Internal', enrolled: 118, eligible: 128, cost: 14160, elig: 'All employees', status: 'Active' },
    { name: 'Wellness Program', icon: 'dumbbell', provider: 'FitWell Partners (fictional)', enrolled: 54, eligible: 128, cost: 2700, elig: 'All employees', status: 'Open Enrollment' },
    { name: 'Learning Stipend', icon: 'book', provider: 'Internal', enrolled: 31, eligible: 110, cost: 4650, elig: 'After 6 months of service', status: 'Under Review' }
  ];

  const JOBS = [
    { id: 'J-201', title: 'Senior Backend Engineer', dept: 'Engineering', applicants: 48, posted: 12, loc: 'Austin HQ · Hybrid' },
    { id: 'J-202', title: 'Product Designer', dept: 'Product', applicants: 36, posted: 9, loc: 'Remote — US' },
    { id: 'J-203', title: 'Account Executive', dept: 'Sales', applicants: 41, posted: 18, loc: 'Denver Office' },
    { id: 'J-204', title: 'Customer Success Manager', dept: 'Customer Success', applicants: 27, posted: 6, loc: 'Austin HQ' },
    { id: 'J-205', title: 'DevOps Engineer', dept: 'Engineering', applicants: 22, posted: 15, loc: 'Remote — US' },
    { id: 'J-206', title: 'Financial Analyst', dept: 'Finance', applicants: 19, posted: 4, loc: 'Austin HQ' },
    { id: 'J-207', title: 'Growth Marketer', dept: 'Marketing', applicants: 14, posted: 3, loc: 'Toronto Office' },
    { id: 'J-208', title: 'People Ops Coordinator', dept: 'Human Resources', applicants: 7, posted: 2, loc: 'Austin HQ' }
  ];
  const STAGES = [
    { key: 'applied', name: 'Applied', color: '#94a3b8' },
    { key: 'screening', name: 'Screening', color: '#0ea5e9' },
    { key: 'interview', name: 'Interview', color: '#6366f1' },
    { key: 'offer', name: 'Offer', color: '#f59e0b' },
    { key: 'hired', name: 'Hired', color: '#16a34a' }
  ];
  const CAND_NAMES = ['Liam Foster', 'Chloe Bennett', 'Arjun Mehta', 'Hannah Lee', 'Marco Rossi', 'Sofia Lindqvist', 'Jordan Hayes', 'Nadia Karim', 'Ethan Brooks', 'Grace Okoye', 'Lucas Moreau', 'Zara Ahmed', 'Tyler Grant', 'Mila Novak', 'Kenji Watanabe', 'Rosa Delgado', 'Ben Whitaker', 'Ivy Chen', 'Oscar Lindgren', 'Leila Nasser'];
  const SOURCES = ['LinkedIn', 'Referral', 'Careers page', 'Job board', 'Agency'];
  const CANDIDATES = CAND_NAMES.map((n, i) => {
    const stage = ['applied', 'applied', 'applied', 'applied', 'applied', 'screening', 'screening', 'screening', 'screening', 'interview', 'interview', 'interview', 'interview', 'offer', 'offer', 'hired', 'hired', 'applied', 'screening', 'interview'][i];
    const job = JOBS[i % JOBS.length];
    return { id: 'C-' + (500 + i), name: n, job: job.id, role: job.title, stage, rating: 3 + (i * 7) % 3, source: SOURCES[i % SOURCES.length], days: 1 + (i * 5) % 14, av: AV_COLORS[(i + 3) % AV_COLORS.length] };
  });

  const WORKFLOWS = [
    { id: 'wf1', name: 'Leave Request Notification', desc: 'Keep managers in the loop instantly', icon: 'calendar', trigger: 'Employee submits leave request', action: 'Notify manager by email & in-app', on: true, runs: 412, last: '12 min ago' },
    { id: 'wf2', name: 'Employee Onboarding', desc: 'Consistent first-week experience', icon: 'user-plus', trigger: 'New employee created', action: 'Create onboarding checklist & assign buddy', on: true, runs: 38, last: '2 days ago' },
    { id: 'wf3', name: 'Probation Reminder', desc: 'Never miss a probation review', icon: 'hourglass', trigger: 'Probation ending in 14 days', action: 'Notify HR & line manager', on: true, runs: 61, last: 'Yesterday' },
    { id: 'wf4', name: 'Payroll Reminder', desc: 'Stay ahead of payroll deadlines', icon: 'wallet', trigger: 'Payroll deadline in 3 days', action: 'Notify HR & Finance approvers', on: true, runs: 24, last: 'Oct 1' },
    { id: 'wf5', name: 'Document Expiry Alert', desc: 'Track contracts and certifications', icon: 'file', trigger: 'Document expires in 30 days', action: 'Notify document owner & HR', on: false, runs: 17, last: 'Sep 22' },
    { id: 'wf6', name: 'Work Anniversary Greeting', desc: 'Celebrate milestones automatically', icon: 'gift', trigger: 'Employee work anniversary', action: 'Send greeting & notify team channel', on: true, runs: 96, last: 'Today' }
  ];
  const WF_RUNS = [
    ['10:30 AM', 'Leave Request Notification', 'John Carter — Annual Leave', 'Success', '0.8s'],
    ['09:58 AM', 'Work Anniversary Greeting', 'Olivia Garcia — 6 years', 'Success', '1.1s'],
    ['09:12 AM', 'Leave Request Notification', 'Michael Brown — Sick Leave', 'Success', '0.7s'],
    ['Yesterday', 'Probation Reminder', '3 employees ending probation', 'Success', '1.4s'],
    ['Yesterday', 'Employee Onboarding', 'New hire checklist created', 'Success', '2.2s'],
    ['Oct 5', 'Leave Request Notification', 'Manager email bounced — retried', 'Retried', '4.9s'],
    ['Oct 1', 'Payroll Reminder', 'October payroll deadline', 'Success', '0.9s']
  ];

  const DOC_CATS = [
    { key: 'Contracts', icon: 'fileCheck', count: 132 },
    { key: 'Policies', icon: 'book', count: 24 },
    { key: 'Employee Documents', icon: 'user', count: 486 },
    { key: 'Benefits', icon: 'heart', count: 38 },
    { key: 'Payslips', icon: 'receipt', count: 1536 },
    { key: 'Certificates', icon: 'certificate', count: 71 }
  ];
  const DOCS = [
    ['Employment Contract — John Carter.pdf', 'Contracts', 'Sarah Williams', -3, 'Signed', 'pdf'],
    ['Employee Handbook 2026.pdf', 'Policies', 'Sarah Williams', -12, 'Published', 'pdf'],
    ['Remote Work Policy v3.docx', 'Policies', 'Alex Morgan', -2, 'In Review', 'doc'],
    ['Offer Letter — Grace Okoye.pdf', 'Contracts', 'Sarah Williams', -1, 'Pending Signature', 'pdf'],
    ['Health Insurance Summary 2026.pdf', 'Benefits', 'David Anderson', -20, 'Published', 'pdf'],
    ['Payslip — September 2026 (batch).zip', 'Payslips', 'Payroll System', -7, 'Archived', 'xls'],
    ['ID Verification — Emily Johnson.jpg', 'Employee Documents', 'Emily Johnson', -40, 'Verified', 'img'],
    ['AWS Solutions Architect — Daniel T.pdf', 'Certificates', 'Daniel Thompson', -64, 'Expiring Soon', 'pdf'],
    ['Code of Conduct.pdf', 'Policies', 'Alex Morgan', -90, 'Published', 'pdf'],
    ['NDA — Contractor Template.docx', 'Contracts', 'Alex Morgan', -15, 'Draft', 'doc'],
    ['401k Plan Enrollment Guide.pdf', 'Benefits', 'David Anderson', -33, 'Published', 'pdf'],
    ['Tax Form W-4 — Michael Brown.pdf', 'Employee Documents', 'Michael Brown', -5, 'Verified', 'pdf'],
    ['First Aid Certificate — Olivia G.pdf', 'Certificates', 'Olivia Garcia', -120, 'Verified', 'pdf'],
    ['Payroll Register — Q3 2026.xlsx', 'Payslips', 'David Anderson', -6, 'Archived', 'xls'],
    ['Contract Amendment — Sophia Martinez.pdf', 'Contracts', 'Sarah Williams', -4, 'Pending Signature', 'pdf'],
    ['Travel & Expense Policy.pdf', 'Policies', 'David Anderson', -45, 'Published', 'pdf']
  ].map((d, i) => ({ id: 'D-' + (900 + i), name: d[0], cat: d[1], owner: d[2], updated: addDays(TODAY, d[3]), status: d[4], type: d[5], size: (0.2 + ((i * 37) % 30) / 10).toFixed(1) + ' MB' }));

  const AUDIT_USERS = ['Alex Morgan', 'Sarah Williams', 'David Anderson', 'Michael Brown', 'System', 'Olivia Garcia'];
  const AUDIT_ACTIONS = [
    ['Approved leave request LV-2407', 'Leave', 'Success'], ['Updated salary details for NC-1023', 'Payroll', 'Success'],
    ['Exported attendance report', 'Reports', 'Success'], ['Signed in', 'Authentication', 'Success'],
    ['Failed sign-in attempt', 'Authentication', 'Failed'], ['Created employee record NC-1129', 'Employees', 'Success'],
    ['Changed role permissions: HR Manager', 'Settings', 'Warning'], ['Uploaded document: Employee Handbook 2026', 'Documents', 'Success'],
    ['Ran automation: Probation Reminder', 'Automation', 'Success'], ['Moved candidate to Interview', 'Recruitment', 'Success'],
    ['Deleted draft document', 'Documents', 'Warning'], ['Updated benefit plan: Dental Insurance', 'Benefits', 'Success'],
    ['Viewed payslip for NC-1004', 'Payroll', 'Success'], ['Password reset requested', 'Authentication', 'Success'],
    ['Bulk import: 4 employees', 'Employees', 'Success'], ['API token rotated', 'Settings', 'Success']
  ];
  const AUDIT = (() => {
    const r = mulberry32(99);
    const out = [];
    let t = new Date(TODAY);
    for (let i = 0; i < 44; i++) {
      t = new Date(t.getTime() - (8 + Math.floor(r() * 140)) * 60000);
      const a = AUDIT_ACTIONS[Math.floor(r() * AUDIT_ACTIONS.length)];
      const user = a[1] === 'Automation' ? 'System' : AUDIT_USERS[Math.floor(r() * (AUDIT_USERS.length))];
      const nets = ['192.0.2.', '198.51.100.', '203.0.113.'];
      out.push({ time: t, user, action: a[0], module: a[1], ip: user === 'System' ? 'internal' : nets[Math.floor(r() * 3)] + (10 + Math.floor(r() * 240)), status: a[2] });
    }
    return out;
  })();

  const NOTIFS = [
    { id: 1, icon: 'calendar', tone: 'amber', text: '<b>John Carter</b> requested 5 days of Annual Leave', time: '12 min ago', unread: true, page: 'leave' },
    { id: 2, icon: 'wallet', tone: 'blue', text: '<b>October payroll</b> is awaiting your approval', time: '1 hour ago', unread: true, page: 'payroll' },
    { id: 3, icon: 'user-plus', tone: 'green', text: '<b>Grace Okoye</b> accepted the offer for Customer Success Manager', time: '3 hours ago', unread: true, page: 'recruitment', premium: true },
    { id: 4, icon: 'hourglass', tone: 'premium', text: 'Automation: <b>3 probation periods</b> end within 14 days', time: 'Yesterday', unread: true, page: 'automation', premium: true },
    { id: 5, icon: 'calendar', tone: 'amber', text: '<b>Michael Brown</b> requested 2 days of Sick Leave', time: 'Yesterday', unread: false, page: 'leave' },
    { id: 6, icon: 'file', tone: 'blue', text: 'Contract amendment for <b>Sophia Martinez</b> is pending signature', time: '2 days ago', unread: false, page: 'documents', premium: true },
    { id: 7, icon: 'shield', tone: 'red', text: '<b>Failed sign-in</b> attempt detected from 198.51.100.24', time: '2 days ago', unread: false, page: 'audit', premium: true },
    { id: 8, icon: 'heart', tone: 'green', text: 'Wellness Program <b>open enrollment</b> starts next week', time: '3 days ago', unread: false, page: 'benefits' }
  ];

  const ACTIVITY = [
    { icon: 'user-plus', tone: 'green', text: '<b>Priya Patel</b> joined Engineering as QA Engineer', time: 'Today, 9:15 AM' },
    { icon: 'calendar-check', tone: 'blue', text: '<b>Sarah Williams</b> approved leave for <b>Sophia Martinez</b>', time: 'Today, 8:52 AM' },
    { icon: 'wallet', tone: 'premium', text: 'Payroll for <b>September 2026</b> was disbursed to 126 employees', time: 'Yesterday' },
    { icon: 'edit', tone: '', text: '<b>David Anderson</b> updated the Travel & Expense policy', time: 'Yesterday' },
    { icon: 'award', tone: 'amber', text: '<b>Emily Johnson</b> completed the Q3 performance review', time: 'Oct 5' },
    { icon: 'heart', tone: 'red', text: '<b>12 employees</b> enrolled in Dental Insurance', time: 'Oct 4' }
  ];

  const ROLES_STD = ['Administrator', 'HR Manager', 'Employee'];
  const ROLES_PREM = ['Administrator', 'HR Manager', 'Finance Approver', 'Department Head', 'Employee'];
  const PERM_MODULES = ['Employees', 'Attendance', 'Leave', 'Payroll', 'Benefits', 'Reports', 'Settings'];
  const PERMS = {
    Administrator: [1, 1, 1, 1, 1, 1, 1],
    'HR Manager': [1, 1, 1, 1, 1, 1, 0],
    'Finance Approver': [0, 0, 0, 1, 1, 1, 0],
    'Department Head': [1, 1, 1, 0, 0, 1, 0],
    Employee: [0, 1, 1, 0, 1, 0, 0]
  };

  /* ------------------------------------------------------------------
     Application state
     ------------------------------------------------------------------ */
  const state = {
    pkg: 'standard',
    page: 'dashboard',
    payrollRun: false,
    clockedIn: true,
    clockIn: 8 * 60 + 51,
    customRoles: [],
    ess: 'overview',
    myRequests: [
      { id: 'RQ-311', type: 'Annual Leave', detail: 'Oct 19 – Oct 23 · 5 days', status: 'Pending', date: 'Oct 6' },
      { id: 'RQ-298', type: 'Expense Claim', detail: 'Client lunch · $86.40', status: 'Approved', date: 'Sep 29' },
      { id: 'RQ-287', type: 'Equipment', detail: 'External monitor (27")', status: 'Approved', date: 'Sep 18' },
      { id: 'RQ-264', type: 'Document', detail: 'Employment verification letter', status: 'Completed', date: 'Aug 30' }
    ]
  };
  const ui = {
    emp: { q: '', dept: 'all', status: 'all', page: 1 },
    att: { q: '', dept: 'all', status: 'all', date: 0, page: 1 },
    pay: { q: '', dept: 'all', status: 'all', page: 1 },
    perf: { q: '', dept: 'all', page: 1 },
    leaveTab: 'Pending',
    attRange: 'week',
    anRange: 12,
    anDept: 'all',
    docCat: 'all',
    docQ: '',
    audit: { q: '', module: 'all', status: 'all', page: 1 },
    jobFilter: 'all',
    settingsTab: 'general',
    notifTab: 'all'
  };
  const PER_PAGE = 10;

  /* ------------------------------------------------------------------
     Charts — lightweight SVG renderer with hover tooltips
     ------------------------------------------------------------------ */
  const tipEl = $('#chartTip');
  function showTip(html, e) {
    tipEl.innerHTML = html;
    tipEl.classList.add('show');
    const pad = 14, r = tipEl.getBoundingClientRect();
    let x = e.clientX + pad, y = e.clientY + pad;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
    tipEl.style.left = Math.max(8, x) + 'px';
    tipEl.style.top = Math.max(8, y) + 'px';
  }
  const hideTip = () => tipEl.classList.remove('show');
  const tipRow = (color, name, val) => `<div class="tr"><span><i style="background:${color}"></i>${esc(name)}</span><b>${val}</b></div>`;

  function niceScale(min, max, n = 4) {
    if (max === min) { max = min + 1; }
    const rough = (max - min) / n;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(6));
    return { min: lo, max: hi, ticks };
  }

  const charts = [];
  function registerChart(fn) { charts.push(fn); fn(); }
  window.addEventListener('resize', debounce(() => charts.forEach((fn) => fn()), 150));

  function lineChart(el, o) {
    if (!el) return;
    const W = Math.max(el.clientWidth || 0, 260), H = o.height || 240;
    const p = { t: 12, r: 14, b: 28, l: o.padLeft || 44 };
    const all = o.series.flatMap((s) => s.data);
    let lo = o.min !== undefined ? o.min : Math.min(...all), hi = o.max !== undefined ? o.max : Math.max(...all);
    if (o.min === undefined) lo = Math.max(0, lo - (hi - lo) * 0.25);
    const sc = niceScale(lo, hi, o.ticks || 4);
    const iw = W - p.l - p.r, ih = H - p.t - p.b, n = o.labels.length;
    const fmt = o.yFmt || ((v) => v);
    const x = (i) => p.l + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
    const y = (v) => p.t + ih - ((v - sc.min) / (sc.max - sc.min)) * ih;
    const uid = 'g' + Math.random().toString(36).slice(2, 8);
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || 'Line chart')}"><defs>`;
    o.series.forEach((se, k) => { s += `<linearGradient id="${uid}${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${se.color}" stop-opacity="0.16"/><stop offset="1" stop-color="${se.color}" stop-opacity="0"/></linearGradient>`; });
    s += '</defs>';
    sc.ticks.forEach((t) => { s += `<line class="grid-line" x1="${p.l}" x2="${W - p.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${p.l - 10}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`; });
    const maxLabels = Math.max(2, Math.floor(iw / 58));
    const step = Math.ceil(n / maxLabels);
    o.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1 && (n - 1) % step > step / 2) s += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
    o.series.forEach((se, k) => {
      const pts = se.data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
      if (o.area !== false && k === 0) s += `<path d="M${pts.join(' L')} L${x(n - 1)},${y(sc.min)} L${x(0)},${y(sc.min)} Z" fill="url(#${uid}${k})"/>`;
      s += `<path d="M${pts.join(' L')}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" ${se.dash ? 'stroke-dasharray="4 4"' : ''}/>`;
      s += `<circle cx="${x(n - 1)}" cy="${y(se.data[n - 1])}" r="4" fill="${se.color}" stroke="#fff" stroke-width="2"/>`;
    });
    s += `<line class="guide" x1="0" x2="0" y1="${p.t}" y2="${p.t + ih}" style="display:none"/>`;
    o.series.forEach((se) => { s += `<circle class="hdot" r="4.5" fill="${se.color}" stroke="#fff" stroke-width="2" style="display:none"/>`; });
    s += `<rect class="hit" x="${p.l - 10}" y="${p.t}" width="${iw + 20}" height="${ih}"/></svg>`;
    el.innerHTML = s;
    const svg = el.firstChild, guide = $('.guide', svg), dots = $$('.hdot', svg), hit = $('.hit', svg);
    hit.addEventListener('mousemove', (e) => {
      const bx = svg.getBoundingClientRect().left;
      const i = clamp(Math.round(((e.clientX - bx - p.l) / iw) * (n - 1)), 0, n - 1);
      guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i)); guide.style.display = '';
      dots.forEach((d, k) => { d.setAttribute('cx', x(i)); d.setAttribute('cy', y(o.series[k].data[i])); d.style.display = ''; });
      showTip(`<div class="tt">${esc(o.tipLabels ? o.tipLabels[i] : o.labels[i])}</div>` + o.series.map((se) => tipRow(se.color, se.name, (o.tipFmt || fmt)(se.data[i]))).join(''), e);
    });
    hit.addEventListener('mouseleave', () => { guide.style.display = 'none'; dots.forEach((d) => (d.style.display = 'none')); hideTip(); });
  }

  function roundTop(x, y, w, h, r) {
    r = Math.min(r, h, w / 2);
    if (h <= 0) return '';
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  }

  function barChart(el, o) {
    if (!el) return;
    const W = Math.max(el.clientWidth || 0, 260), H = o.height || 240;
    const p = { t: 12, r: 10, b: 28, l: o.padLeft || 44 };
    const n = o.labels.length, iw = W - p.l - p.r, ih = H - p.t - p.b;
    const totals = o.labels.map((_, i) => o.stacked ? o.series.reduce((a, s) => a + s.data[i], 0) : Math.max(...o.series.map((s) => s.data[i])));
    const sc = niceScale(0, Math.max(...totals), o.ticks || 4);
    const fmt = o.yFmt || ((v) => v);
    const y = (v) => p.t + ih - (v / sc.max) * ih;
    const gw = iw / n;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || 'Bar chart')}">`;
    sc.ticks.forEach((t) => { s += `<line class="grid-line" x1="${p.l}" x2="${W - p.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${p.l - 10}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`; });
    const maxLabels = Math.max(2, Math.floor(iw / 44));
    const lstep = Math.ceil(n / maxLabels);
    o.labels.forEach((l, i) => {
      const cx = p.l + gw * i + gw / 2;
      s += `<g class="bar" data-i="${i}">`;
      if (o.stacked) {
        const bw = Math.min(o.barMax || 30, gw * 0.56);
        let acc = 0;
        const top = o.series.reduce((t, se, k) => (se.data[i] > 0 ? k : t), 0);
        o.series.forEach((se, k) => {
          const v = se.data[i]; if (v <= 0) return;
          const y0 = y(acc), y1 = y(acc + v); acc += v;
          const hgt = Math.max(0, y0 - y1 - (k === 0 ? 0 : 2));
          s += k === top ? `<path d="${roundTop(cx - bw / 2, y1, bw, hgt, 4)}" fill="${se.color}"/>` : `<rect x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${hgt}" fill="${se.color}"/>`;
        });
      } else {
        const m = o.series.length;
        const bw = Math.min(o.barMax || 22, (gw * 0.62 - (m - 1) * 2) / m);
        const groupW = bw * m + (m - 1) * 2;
        o.series.forEach((se, k) => {
          const v = se.data[i], bx = cx - groupW / 2 + k * (bw + 2);
          s += `<path d="${roundTop(bx, y(v), bw, y(0) - y(v), 4)}" fill="${se.color}"/>`;
        });
      }
      s += '</g>';
      if (i % lstep === 0) s += `<text x="${cx}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`;
    });
    s += `<line class="axis-line" x1="${p.l}" x2="${W - p.r}" y1="${y(0)}" y2="${y(0)}"/>`;
    o.labels.forEach((_, i) => { s += `<rect class="bar-hit" data-i="${i}" x="${p.l + gw * i}" y="${p.t}" width="${gw}" height="${ih}"/>`; });
    s += '</svg>';
    el.innerHTML = s;
    const bars = $$('.bar', el);
    $$('.bar-hit', el).forEach((r) => {
      const i = +r.dataset.i;
      r.addEventListener('mousemove', (e) => {
        el.classList.add('dim'); bars.forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
        let html = `<div class="tt">${esc(o.tipLabels ? o.tipLabels[i] : o.labels[i])}</div>` + o.series.map((se) => tipRow(se.color, se.name, (o.tipFmt || fmt)(se.data[i]))).join('');
        if (o.stacked && o.showTotal !== false) html += `<div class="tr" style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,.1)"><span>Total</span><b>${(o.tipFmt || fmt)(totals[i])}</b></div>`;
        showTip(html, e);
      });
      r.addEventListener('mouseleave', () => { el.classList.remove('dim'); hideTip(); });
    });
  }

  function donutChart(el, o) {
    if (!el) return;
    const S = o.size || 180, R = S / 2, th = o.thickness || 22, r0 = R - th;
    const total = o.data.reduce((a, d) => a + d.value, 0);
    const gap = o.data.length > 1 ? 0.025 : 0;
    let a = -Math.PI / 2;
    const arc = (a0, a1) => {
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (ang, rad) => `${(R + rad * Math.cos(ang)).toFixed(2)},${(R + rad * Math.sin(ang)).toFixed(2)}`;
      return `M${p(a0, R)} A${R},${R} 0 ${large} 1 ${p(a1, R)} L${p(a1, r0)} A${r0},${r0} 0 ${large} 0 ${p(a0, r0)} Z`;
    };
    let s = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(o.title || 'Donut chart')}">`;
    if (o.track) s += `<circle cx="${R}" cy="${R}" r="${R - th / 2}" fill="none" stroke="var(--surface-3)" stroke-width="${th}"/>`;
    o.data.forEach((d, i) => {
      const sweep = (d.value / (o.of || total)) * Math.PI * 2;
      const a1 = a + sweep;
      if (sweep > 0) s += `<path class="bar" data-i="${i}" d="${arc(a + gap / 2, Math.max(a + gap / 2 + 0.001, a1 - gap / 2))}" fill="${d.color}" style="cursor:pointer"/>`;
      a = a1;
    });
    s += `<text x="${R}" y="${R - 2}" text-anchor="middle" style="font-size:${o.centerSize || 24}px;font-weight:700;fill:var(--text);letter-spacing:-.02em">${esc(o.center || '')}</text>`;
    s += `<text x="${R}" y="${R + 17}" text-anchor="middle" style="font-size:11.5px;fill:var(--muted)">${esc(o.centerLabel || '')}</text></svg>`;
    el.innerHTML = s;
    const segs = $$('.bar', el);
    segs.forEach((sg) => {
      const d = o.data[+sg.dataset.i];
      sg.addEventListener('mousemove', (e) => {
        el.classList.add('dim'); segs.forEach((x) => x.classList.toggle('on', x === sg));
        showTip(`<div class="tt">${esc(d.label)}</div>` + tipRow(d.color, o.valueName || 'Value', (o.fmt || num)(d.value)) + (o.of ? '' : tipRow('transparent', 'Share', pct((d.value / total) * 100))), e);
      });
      sg.addEventListener('mouseleave', () => { el.classList.remove('dim'); hideTip(); });
    });
  }

  function sparkline(values, color = 'var(--c1)', w = 96, h = 34) {
    const lo = Math.min(...values), hi = Math.max(...values), n = values.length;
    const x = (i) => (i / (n - 1)) * (w - 4) + 2;
    const y = (v) => h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 8);
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L');
    const id = 's' + Math.random().toString(36).slice(2, 7);
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="M${pts} L${x(n - 1)},${h} L${x(0)},${h} Z" fill="url(#${id})"/><path d="M${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function ring(value, max, color = 'var(--primary)', size = 84, stroke = 8) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - value / max);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg>`;
  }

  /* ------------------------------------------------------------------
     UI primitives: toast, modal, dropdowns, CSV download
     ------------------------------------------------------------------ */
  function toast(title, msg = '', tone = 'success') {
    const ic = { success: 'check-circle', info: 'info', warning: 'alert', danger: 'x-circle' }[tone];
    const t = document.createElement('div');
    t.className = `toast ${tone}`;
    t.innerHTML = `<span class="ti">${icon(ic)}</span><div><b>${esc(title)}</b>${msg ? `<span>${esc(msg)}</span>` : ''}</div>`;
    $('#toastRoot').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 3400);
  }

  const modalRoot = $('#modalRoot'), modalScroller = $('#modalScroller');
  let modalOnClose = null;
  function openModal(html, size = '', onMount, onClose) {
    modalScroller.innerHTML = `<div class="modal ${size}">${html}</div>`;
    modalRoot.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalOnClose = onClose || null;
    const m = $('.modal', modalScroller);
    if (onMount) onMount(m);
    const f = $('[autofocus]', m); if (f) setTimeout(() => f.focus(), 50);
    return m;
  }
  function closeModal() {
    if (!modalRoot.classList.contains('open')) return;
    modalRoot.classList.remove('open');
    modalScroller.innerHTML = '';
    document.body.style.overflow = '';
    hideTip();
    if (modalOnClose) { const f = modalOnClose; modalOnClose = null; f(); }
  }
  modalScroller.addEventListener('mousedown', (e) => { if (e.target === modalScroller) closeModal(); });
  modalRoot.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  const modalHead = (title, sub = '') => `<div class="modal-head"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="icon-btn sm modal-close" data-close aria-label="Close">${icon('x')}</button></div>`;

  const FRAMED = (() => { try { return window.self !== window.top; } catch (_) { return true; } })();
  function previewCSV(filename, rows) {
    const head = rows[0], body = rows.slice(1, 13);
    openModal(`${modalHead('Report preview', `${esc(filename)} · ${num(rows.length - 1)} rows`)}
      <div class="modal-body"><div class="table-wrap" style="border:1px solid var(--border);border-radius:10px"><table class="table no-top" style="min-width:560px"><thead><tr>${head.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="muted mt-12" style="font-size:12.5px">${icon('info', 'xs')} Showing the first ${body.length} rows. File downloads are turned off in the online demo; in the delivered system this exports as CSV, Excel or PDF.</p></div>
      <div class="modal-foot"><button class="btn btn-primary btn-sm" data-close>Done</button></div>`, 'lg');
  }
  function downloadCSV(filename, rows) {
    if (FRAMED) { previewCSV(filename, rows); return; }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const note = '"DEMO DATA — NovaCore HR product demonstration. All information is fictional."\n';
    const blob = new Blob([note + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Download started', filename + ' · demo data', 'success');
  }

  function closeDropdowns(except) {
    $$('.dropdown.open').forEach((d) => { if (d !== except) d.classList.remove('open'); });
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dd-wrap') && !e.target.closest('.global-search')) closeDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeDropdowns(); closeSidebar(); }
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !$('#app').classList.contains('hidden')) {
      e.preventDefault(); $('#searchInput').focus();
    }
  });

  /* Shared render helpers */
  const STATUS_TONE = {
    Active: 'success', 'On Leave': 'warning', Probation: 'info', 'Notice Period': 'danger',
    Present: 'success', Late: 'warning', Absent: 'danger',
    Pending: 'warning', Approved: 'success', Rejected: 'danger',
    Paid: 'success', 'On Hold': 'danger', Processing: 'info',
    'Open Enrollment': 'info', 'Under Review': 'warning',
    Completed: 'success', 'In Progress': 'info', 'Not Started': 'neutral', Overdue: 'danger',
    Signed: 'success', Published: 'success', Verified: 'success', 'In Review': 'info', 'Pending Signature': 'warning', Draft: 'neutral', Archived: 'neutral', 'Expiring Soon': 'danger',
    Success: 'success', Failed: 'danger', Warning: 'warning', Retried: 'warning'
  };
  const pill = (s, tone) => `<span class="pill ${tone || STATUS_TONE[s] || 'neutral'}">${esc(s)}</span>`;
  const delta = (v, suffix = '%', invert = false) => {
    const good = invert ? v < 0 : v > 0;
    const cls = v === 0 ? 'flat' : good ? 'up' : 'down';
    return `<span class="delta ${cls}">${icon(v >= 0 ? 'arrow-up' : 'arrow-down')}${Math.abs(v)}${suffix}</span>`;
  };
  const kpi = (label, value, ic, tone, foot, extra = '') => `
    <div class="card kpi">
      <div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-icon ${tone}">${icon(ic)}</span></div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-foot">${foot}</div>${extra}
    </div>`;
  const pageHeader = (title, sub, actions = '', extra = '') => `
    <div class="page-header">
      <div>
        <div class="breadcrumb">${esc(COMPANY)} ${icon('chevron-right')} ${esc(PAGES[state.page].label)}</div>
        <h1 class="page-title">${title}${extra}</h1>
        <p class="page-sub">${sub}</p>
      </div>
      <div class="page-actions">${actions}</div>
    </div>`;
  const selectOpts = (opts, cur) => opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
  function pager(total, page, key) {
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    const from = total ? (page - 1) * PER_PAGE + 1 : 0, to = Math.min(total, page * PER_PAGE);
    let btns = `<button data-action="page" data-key="${key}" data-p="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chevron-left', 'sm')}</button>`;
    const list = [];
    for (let i = 1; i <= pages; i++) { if (i === 1 || i === pages || Math.abs(i - page) <= 1) list.push(i); else if (list[list.length - 1] !== '…') list.push('…'); }
    list.forEach((i) => { btns += i === '…' ? '<button disabled>…</button>' : `<button data-action="page" data-key="${key}" data-p="${i}" class="${i === page ? 'active' : ''}">${i}</button>`; });
    btns += `<button data-action="page" data-key="${key}" data-p="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">${icon('chevron-right', 'sm')}</button>`;
    return `<div class="card-footer"><span>Showing <b>${from}–${to}</b> of <b>${num(total)}</b> records</span><div class="pager">${btns}</div></div>`;
  }
  const emptyRow = (cols, msg = 'No records match your filters') => `<tr class="empty-row"><td colspan="${cols}">${icon('search')}<div><b>${msg}</b></div><div class="muted" style="font-size:12.5px;margin-top:2px">Try adjusting the search or filters.</div></td></tr>`;
  const personCell = (e, sub, clickable = true) => clickable
    ? `<button class="person" data-action="employee" data-id="${e.id}">${av(e)}<span><span class="person-name">${esc(e.name)}</span><br><span class="person-sub">${esc(sub !== undefined ? sub : e.position)}</span></span></button>`
    : `<div class="person">${av(e)}<span><span class="person-name">${esc(e.name)}</span><br><span class="person-sub">${esc(sub !== undefined ? sub : e.position)}</span></span></div>`;

  /* ------------------------------------------------------------------
     Page registry
     ------------------------------------------------------------------ */
  const PAGES = {
    dashboard: { label: 'Dashboard', icon: 'grid', tier: 'standard', group: 'main' },
    employees: { label: 'Employees', icon: 'users', tier: 'standard', group: 'main' },
    attendance: { label: 'Attendance', icon: 'clock', tier: 'standard', group: 'main' },
    leave: { label: 'Leave', icon: 'calendar', tier: 'standard', group: 'main' },
    payroll: { label: 'Payroll', icon: 'wallet', tier: 'standard', group: 'main' },
    benefits: { label: 'Benefits', icon: 'heart', tier: 'standard', group: 'main' },
    performance: { label: 'Performance', icon: 'target', tier: 'premium', group: 'premium', blurb: 'Run review cycles, track goals and identify top performers across every team.' },
    recruitment: { label: 'Recruitment', icon: 'briefcase', tier: 'premium', group: 'premium', blurb: 'A full applicant tracking system with a drag-and-drop hiring pipeline.' },
    automation: { label: 'Automation', icon: 'zap', tier: 'premium', group: 'premium', blurb: 'Automate notifications, onboarding, reminders and approvals with no-code workflows.' },
    analytics: { label: 'Analytics', icon: 'trending', tier: 'premium', group: 'premium', blurb: 'Executive dashboards for growth, turnover, engagement, payroll cost and tenure.' },
    documents: { label: 'Documents', icon: 'folder', tier: 'premium', group: 'premium', blurb: 'A secure HR document library with categories, e-signature status and expiry tracking.' },
    audit: { label: 'Audit Logs', icon: 'shield', tier: 'premium', group: 'premium', blurb: 'A complete, searchable record of every change made in your HR system.' },
    selfservice: { label: 'Employee Self-Service', icon: 'user-circle', tier: 'premium', group: 'premium', blurb: 'An employee portal for profiles, attendance, leave, payslips, benefits and requests.' },
    reports: { label: 'Reports', icon: 'report', tier: 'standard', group: 'system' },
    settings: { label: 'Settings', icon: 'settings', tier: 'standard', group: 'system' }
  };
  const isPrem = () => state.pkg === 'premium';
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const premOnly = (feature) => isPrem() ? '' : `data-action="premium" data-feature="${esc(feature)}"`;

  /* ------------------------------------------------------------------
     Derived metrics
     ------------------------------------------------------------------ */
  const pendingLeaves = () => LEAVES.filter((l) => l.status === 'Pending');
  function payrollTotals() {
    let total = 0, paid = 0, pending = 0, hold = 0, nPaid = 0, nPending = 0;
    EMPLOYEES.forEach((e) => {
      const g = e.basic + e.allowances;
      total += g;
      if (e.payStatus === 'Paid') { paid += g; nPaid++; }
      else if (e.payStatus === 'Pending') { pending += g; nPending++; }
      else hold += g;
    });
    return { total, paid, pending, hold, nPaid, nPending };
  }
  function attCounts(rows) {
    const c = { Present: 0, Late: 0, Absent: 0, 'On Leave': 0 };
    rows.forEach((r) => c[r.status]++);
    return { present: c.Present + c.Late, onTime: c.Present, late: c.Late, absent: c.Absent, leave: c['On Leave'] };
  }

  function logAudit(action, module, status = 'Success') {
    AUDIT.unshift({ time: new Date(), user: 'Alex Morgan', action, module, ip: '192.0.2.14', status, fresh: true });
  }
  function logActivity(icn, tone, text) {
    ACTIVITY.unshift({ icon: icn, tone, text, time: 'Just now', fresh: true });
    ACTIVITY.length = Math.min(ACTIVITY.length, 10);
  }

  /* ------------------------------------------------------------------
     DASHBOARD
     ------------------------------------------------------------------ */
  PAGES.dashboard.render = function () {
    const prem = isPrem();
    const c = attCounts(attendanceFor(0));
    const pend = pendingLeaves();
    const pt = payrollTotals();
    const paidPct = Math.round((pt.paid / pt.total) * 100);
    const insights = prem ? `
      <div class="card mt-20">
        <div class="card-header"><div><div class="card-title">${icon('sparkles', 'sm')} Workforce Insights <span class="premium-badge">${icon('crown')}Premium</span></div><div class="card-sub">Signals generated from attendance, engagement and performance data</div></div>
          <button class="btn btn-ghost btn-sm" data-action="nav" data-page="analytics">Open analytics ${icon('arrow-right', 'sm')}</button></div>
        <div class="card-body grid grid-3" style="gap:14px">
          <div class="insight"><span class="feed-icon amber">${icon('alert')}</span><div><h5>Attrition risk rising in Sales</h5><p>3 high performers show low engagement scores and no 1:1 meetings in the last 45 days.</p><button class="link-btn" data-action="nav" data-page="analytics">Review risk factors ${icon('arrow-right')}</button></div></div>
          <div class="insight"><span class="feed-icon blue">${icon('clock')}</span><div><h5>Overtime up 12% in Operations</h5><p>Average weekly hours rose to 46.2 over the past 3 weeks. Consider rebalancing shifts.</p><button class="link-btn" data-action="nav" data-page="attendance">View attendance ${icon('arrow-right')}</button></div></div>
          <div class="insight"><span class="feed-icon green">${icon('trending')}</span><div><h5>Q4 hiring is on track</h5><p>7 of 8 open roles have candidates at interview or offer stage. Time-to-hire down 4 days.</p><button class="link-btn" data-action="nav" data-page="recruitment">Open pipeline ${icon('arrow-right')}</button></div></div>
        </div>
      </div>` : '';

    const premRow = prem ? `
      <div class="grid grid-12 mt-20">
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Hiring Pipeline</div><div class="card-sub">${CANDIDATES.length} active candidates · ${JOBS.length} open roles</div></div><button class="link-btn" data-action="nav" data-page="recruitment">View ${icon('arrow-right')}</button></div>
          <div class="card-body"><div class="hbar">${STAGES.map((s) => { const n = CANDIDATES.filter((c) => c.stage === s.key).length; return `<div class="hbar-row" style="grid-template-columns:90px 1fr 30px"><span class="lbl">${s.name}</span><span class="track"><span style="width:${(n / 7) * 100}%;background:${s.color}"></span></span><span class="v">${n}</span></div>`; }).join('')}</div></div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Performance Snapshot</div><div class="card-sub">Q3 2026 review cycle</div></div><button class="link-btn" data-action="nav" data-page="performance">View ${icon('arrow-right')}</button></div>
          <div class="card-body"><div class="balance-row"><div class="ring">${ring(4.1, 5, 'var(--premium)')}<div class="rv"><div><b>4.1</b><span>of 5.0</span></div></div></div>
            <div style="flex:1;display:grid;gap:10px">
              <div class="row between"><span class="muted">Reviews completed</span><b>64%</b></div><div class="progress premium"><span style="width:64%"></span></div>
              <div class="row between"><span class="muted">Goals on track</span><b>78%</b></div><div class="progress green"><span style="width:78%"></span></div>
            </div></div></div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Automation</div><div class="card-sub">${WORKFLOWS.filter((w) => w.on).length} active workflows</div></div><button class="link-btn" data-action="nav" data-page="automation">Manage ${icon('arrow-right')}</button></div>
          <div class="card-body" style="padding-top:8px">${WORKFLOWS.slice(0, 4).map((w) => `<div class="list-row"><span class="feed-icon premium">${icon(w.icon)}</span><div class="grow"><div style="font-weight:560;font-size:13px">${esc(w.name)}</div><div class="muted" style="font-size:12px">Last run ${esc(w.last)}</div></div><span class="pill ${w.on ? 'success' : 'neutral'}">${w.on ? 'On' : 'Off'}</span></div>`).join('')}</div>
        </div>
      </div>` : `
      <div class="banner premium mt-20">
        <span class="bi">${icon('sparkles')}</span>
        <div class="grow"><h4>Unlock workforce insights, recruitment and automation</h4><p>Premium adds performance management, an applicant tracking system, workflow automation, executive analytics and more.</p></div>
        <button class="btn btn-premium btn-sm" data-action="explore-premium">Explore Premium ${icon('arrow-right', 'sm')}</button>
      </div>`;

    return `
      ${pageHeader(`${greeting()}, Alex`, `Here's what's happening at ${COMPANY} today · ${TODAY.toLocaleDateString('en-US', { weekday: 'long' })}, ${fmtDate(TODAY)}`,
        `<button class="btn btn-secondary" data-action="export-summary">${icon('download', 'sm')} Export</button><button class="btn btn-primary" data-action="add-employee">${icon('user-plus', 'sm')} Add Employee</button>`)}
      <div class="grid grid-4">
        ${kpi('Total Employees', num(EMPLOYEES.length), 'users', 'blue', `${delta(4.1)} vs last quarter`, sparkline([112, 114, 115, 117, 118, 121, 122, 124, 125, 128], 'var(--c1)', 84, 30))}
        ${kpi('Present Today', c.present, 'user-check', 'green', `<b style="color:var(--text)">${pct((c.present / EMPLOYEES.length) * 100)}</b> attendance rate`)}
        ${kpi('On Leave', c.leave, 'calendar', 'amber', '3 returning on Monday')}
        ${kpi('Pending Requests', pend.length, 'inbox', 'red', pend.length ? `<button class="link-btn" data-action="nav" data-page="leave">Review requests ${icon('arrow-right')}</button>` : 'All caught up')}
      </div>
      ${insights}
      <div class="grid grid-12 mt-20">
        <div class="card span-8">
          <div class="card-header"><div><div class="card-title">Attendance Overview</div><div class="card-sub">Daily check-in status across all departments</div></div>
            <div class="seg" role="tablist"><button class="${ui.attRange === 'week' ? 'active' : ''}" data-action="att-range" data-v="week">2 weeks</button><button class="${ui.attRange === 'month' ? 'active' : ''}" data-action="att-range" data-v="month">Month</button></div></div>
          <div class="card-body">
            <div class="legend" style="margin-bottom:10px"><span><i style="background:var(--c1)"></i>On time</span><span><i style="background:var(--c5)"></i>Late</span><span><i style="background:var(--c3)"></i>On leave</span><span><i style="background:#cbd5e1"></i>Absent</span></div>
            <div class="chart" id="chAtt"></div>
          </div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Employee Distribution</div><div class="card-sub">Headcount by department</div></div></div>
          <div class="card-body"><div class="donut-wrap" style="flex-direction:column;align-items:stretch"><div class="chart" id="chDept" style="width:180px;margin:0 auto"></div><div class="donut-legend" id="dlDept"></div></div></div>
        </div>
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Recent HR Activity</div><div class="card-sub">Latest changes across ${COMPANY}</div></div></div>
          <div class="card-body"><div class="feed">${ACTIVITY.slice(0, 5).map((a) => `<div class="feed-item ${a.fresh ? 'new' : ''}"><span class="feed-icon ${a.tone}">${icon(a.icon)}</span><div><div class="feed-text">${a.text}</div><div class="feed-time">${a.time}</div></div></div>`).join('')}</div></div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Payroll Progress</div><div class="card-sub">October 2026 cycle · Pay date Oct 30</div></div><button class="link-btn" data-action="nav" data-page="payroll">Open ${icon('arrow-right')}</button></div>
          <div class="card-body">
            <div class="row between" style="align-items:flex-end"><div><div class="muted" style="font-size:12.5px">Processed</div><div class="hl-num">${money(pt.paid)}</div></div><div style="text-align:right"><div class="muted" style="font-size:12.5px">of total</div><b class="tnum">${money(pt.total)}</b></div></div>
            <div class="progress lg mt-12 ${paidPct === 100 ? 'green' : ''}"><span style="width:${paidPct}%"></span></div>
            <div class="row between mt-8" style="font-size:12.5px"><span class="muted">${pt.nPaid} of ${EMPLOYEES.length} employees processed</span><b>${paidPct}%</b></div>
            <div class="divider"></div>
            ${[['Data collection', 'Oct 1 – Oct 5', 'done'], ['Review & validation', 'Oct 6 – Oct 12', state.payrollRun ? 'done' : 'current'], ['Approval', 'Oct 26', state.payrollRun ? 'done' : 'todo'], ['Disbursement', 'Oct 30', state.payrollRun ? 'done' : 'todo']].map(([t, d, s]) => `<div class="list-row" style="padding:8px 0;border:0"><span class="feed-icon ${s === 'done' ? 'green' : s === 'current' ? 'blue' : ''}" style="width:26px;height:26px;border-radius:50%">${icon(s === 'done' ? 'check' : s === 'current' ? 'refresh' : 'clock', 'xs')}</span><div class="grow" style="font-size:13px;font-weight:550">${t}</div><span class="muted" style="font-size:12px">${d}</span></div>`).join('')}
          </div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Pending Approvals</div><div class="card-sub">${pend.length} leave request${pend.length === 1 ? '' : 's'} awaiting a decision</div></div></div>
          <div class="card-body" style="padding-top:6px">
            ${pend.length ? pend.slice(0, 5).map((l) => `<div class="list-row">${av(l.emp, 'sm')}<div class="grow"><div style="font-weight:560;font-size:13px">${esc(l.emp.name)}</div><div class="muted" style="font-size:12px">${l.type} · ${fmtShort(l.start)}${l.days > 1 ? ' – ' + fmtShort(l.end) : ''}</div></div><button class="icon-btn sm" style="color:var(--green-500)" data-action="approve" data-id="${l.id}" title="Approve" aria-label="Approve">${icon('check-circle')}</button><button class="icon-btn sm" style="color:var(--red-500)" data-action="reject" data-id="${l.id}" title="Reject" aria-label="Reject">${icon('x-circle')}</button></div>`).join('') : `<div style="text-align:center;padding:32px 0"><span class="feed-icon green" style="margin:0 auto 10px;width:40px;height:40px">${icon('check')}</span><b>All caught up</b><div class="muted" style="font-size:12.5px">No pending requests right now.</div></div>`}
          </div>
          ${pend.length ? `<div class="card-footer"><span>Approve or reject in one click</span><button class="link-btn" data-action="nav" data-page="leave">All requests ${icon('arrow-right')}</button></div>` : ''}
        </div>
      </div>
      ${premRow}`;
  };
  PAGES.dashboard.mount = function () {
    registerChart(() => {
      const days = ui.attRange === 'week' ? ATT_HISTORY.slice(-10) : ATT_HISTORY.slice(-22);
      barChart($('#chAtt'), {
        title: 'Attendance overview', height: 330, stacked: true, barMax: ui.attRange === 'week' ? 34 : 20,
        labels: days.map((d) => ui.attRange === 'week' ? DAYS[d.date.getDay()] + ' ' + d.date.getDate() : String(d.date.getDate())),
        tipLabels: days.map((d) => `${DAYS[d.date.getDay()]}, ${fmtShort(d.date)}`),
        series: [
          { name: 'On time', color: 'var(--c1)', data: days.map((d) => d.present) },
          { name: 'Late', color: 'var(--c5)', data: days.map((d) => d.late) },
          { name: 'On leave', color: 'var(--c3)', data: days.map((d) => d.leave) },
          { name: 'Absent', color: '#cbd5e1', data: days.map((d) => d.absent) }
        ]
      });
    });
    const dc = deptCounts().sort((a, b) => b.value - a.value);
    const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)'];
    const top = dc.slice(0, 5).map((d, i) => ({ label: d.name, value: d.value, color: colors[i] }));
    top.push({ label: 'Other (3 depts)', value: dc.slice(5).reduce((a, d) => a + d.value, 0), color: 'var(--c-other)' });
    donutChart($('#chDept'), { data: top, center: String(EMPLOYEES.length), centerLabel: 'Employees', valueName: 'Employees', title: 'Employee distribution' });
    $('#dlDept').innerHTML = top.map((d) => `<div class="dl"><i style="background:${d.color}"></i><span class="name">${esc(d.label)}</span><b>${d.value}</b><span class="pct">${pct((d.value / EMPLOYEES.length) * 100, 0)}</span></div>`).join('');
  };

  /* ------------------------------------------------------------------
     EMPLOYEES
     ------------------------------------------------------------------ */
  function filteredEmployees() {
    const f = ui.emp, q = f.q.trim().toLowerCase();
    return EMPLOYEES.filter((e) => (f.dept === 'all' || e.dept === f.dept) && (f.status === 'all' || e.status === f.status) &&
      (!q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.position.toLowerCase().includes(q) || e.email.includes(q)));
  }
  PAGES.employees.render = function () {
    const statuses = ['Active', 'On Leave', 'Probation', 'Notice Period'];
    return `
      ${pageHeader('Employees', `Manage employee records, roles and employment status for ${num(EMPLOYEES.length)} people.`,
        `<button class="btn btn-secondary" data-action="export-employees">${icon('download', 'sm')} Export CSV</button><button class="btn btn-primary" data-action="add-employee">${icon('user-plus', 'sm')} Add Employee</button>`)}
      <div class="grid grid-4" style="margin-bottom:20px">
        ${kpi('Total Headcount', num(EMPLOYEES.length), 'users', 'blue', `${delta(4.1)} this quarter`)}
        ${kpi('New Hires (90 days)', EMPLOYEES.filter((e) => e.status === 'Probation').length, 'user-plus', 'green', 'Currently on probation')}
        ${kpi('Departments', DEPTS.length, 'building', '', 'Across 4 office locations')}
        ${kpi('Avg. Tenure', '3.6<small>yrs</small>', 'award', 'amber', `${delta(0.3, ' yrs')} year over year`)}
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="input-icon">${icon('search', 'sm')}<input class="input" placeholder="Search by name, ID, role or email…" data-filter="emp.q" value="${esc(ui.emp.q)}" aria-label="Search employees"></div>
          <select class="select" data-filter="emp.dept" aria-label="Department">${selectOpts([['all', 'All departments'], ...DEPT_NAMES], ui.emp.dept)}</select>
          <div class="spacer"></div>
          <div class="chips" id="empChips"></div>
        </div>
        <div id="empTable"></div>
      </div>`;
  };
  PAGES.employees.refresh = function () {
    const statuses = ['all', 'Active', 'On Leave', 'Probation', 'Notice Period'];
    const base = EMPLOYEES.filter((e) => ui.emp.dept === 'all' || e.dept === ui.emp.dept);
    $('#empChips').innerHTML = statuses.map((s) => `<button class="chip ${ui.emp.status === s ? 'active' : ''}" data-action="set" data-key="emp.status" data-val="${s}">${s === 'all' ? 'All' : s} <span class="n">${s === 'all' ? base.length : base.filter((e) => e.status === s).length}</span></button>`).join('');
    const list = filteredEmployees();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    ui.emp.page = clamp(ui.emp.page, 1, pages);
    const rows = list.slice((ui.emp.page - 1) * PER_PAGE, ui.emp.page * PER_PAGE);
    $('#empTable').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Position</th><th>Status</th><th>Joining Date</th><th class="num">Action</th></tr></thead><tbody>
      ${rows.length ? rows.map((e) => `<tr class="${e.fresh ? 'flash' : ''}"><td>${personCell(e, e.email)}</td><td><span class="mono">${e.id}</span></td><td>${esc(e.dept)}</td><td>${esc(e.position)}</td><td>${pill(e.status)}</td><td class="tnum">${fmtDate(e.join)}</td><td class="num"><button class="btn btn-secondary btn-xs" data-action="employee" data-id="${e.id}">${icon('eye', 'xs')} View</button></td></tr>`).join('') : emptyRow(7)}
      </tbody></table></div>${pager(list.length, ui.emp.page, 'emp')}`;
    EMPLOYEES.forEach((e) => delete e.fresh);
  };

  /* Employee profile modal */
  function openEmployee(id, tab = 'overview') {
    const e = empById(id); if (!e) return;
    const prem = isPrem();
    const tabs = [['overview', 'Overview'], ['attendance', 'Attendance'], ['leave', 'Leave'], ['compensation', 'Compensation'], ['performance', 'Performance', true], ['documents', 'Documents', true]];
    const html = `
      <div class="profile-cover"><button class="icon-btn sm modal-close" data-close aria-label="Close">${icon('x')}</button></div>
      <div class="profile-head">
        ${av(e, 'xl')}
        <div class="info"><h3>${esc(e.name)} ${pill(e.status)}</h3><p>${esc(e.position)} · ${esc(e.dept)} · <span class="mono">${e.id}</span></p></div>
        <div class="actions"><button class="btn btn-secondary btn-sm" data-action="toast" data-title="Message sent" data-msg="Demo: a message to ${esc(e.first)} was simulated.">${icon('message', 'sm')} Message</button><button class="btn btn-primary btn-sm" data-action="edit-employee" data-id="${e.id}">${icon('edit', 'sm')} Edit</button></div>
      </div>
      <div class="tabs profile-tabs" id="pTabs">${tabs.map(([k, l, p]) => `<button class="tab ${k === tab ? 'active' : ''}" data-ptab="${k}">${l}${p && !prem ? ' ' + icon('lock', 'xs') : ''}</button>`).join('')}</div>
      <div class="modal-body" id="pBody" style="min-height:280px"></div>
      <div class="modal-foot"><span class="left">${icon('info', 'sm')} Fictional demo profile</span><button class="btn btn-secondary btn-sm" data-close>Close</button><button class="btn btn-secondary btn-sm" data-action="payslip" data-id="${e.id}">${icon('receipt', 'sm')} View Payslip</button></div>`;
    openModal(html, 'lg', (m) => {
      const show = (k) => {
        $$('#pTabs .tab', m).forEach((t) => t.classList.toggle('active', t.dataset.ptab === k));
        $('#pBody', m).innerHTML = profileTab(e, k);
      };
      $('#pTabs', m).addEventListener('click', (ev) => { const t = ev.target.closest('[data-ptab]'); if (t) show(t.dataset.ptab); });
      show(tab);
    });
  }
  function profileTab(e, k) {
    const prem = isPrem();
    const lockedTeaser = (title, text) => `<div class="locked-card" style="border-radius:12px;border:1px solid var(--border);min-height:260px"><div class="blur" style="padding:20px">${'<div class="list-row"><span class="avatar sm"></span><div class="grow"><div class="progress"><span style="width:70%"></span></div></div></div>'.repeat(5)}</div><div class="locked-overlay"><span class="lk">${icon('lock')}</span><h4>${title}</h4><p>${text}</p><button class="btn btn-premium btn-sm" data-action="explore-premium">${icon('sparkles', 'sm')} Explore Premium</button></div></div>`;
    const tenureY = ((TODAY - e.join) / (365.25 * 864e5));
    if (k === 'overview') return `
      <div class="mini-stats"><div class="mini-stat"><div class="k">Attendance (YTD)</div><div class="v">${pct(e.attendance)}</div><div class="s">Company avg 94.2%</div></div>
      <div class="mini-stat"><div class="k">Leave Balance</div><div class="v">${e.leave.annual + e.leave.sick + e.leave.casual} days</div><div class="s">${e.leave.annual} annual · ${e.leave.sick} sick · ${e.leave.casual} casual</div></div>
      <div class="mini-stat"><div class="k">Monthly Salary</div><div class="v">${money(e.basic + e.allowances)}</div><div class="s">Gross · ${money(e.net)} net</div></div></div>
      <div class="section-title">Profile</div>
      <div class="detail-grid">
        ${[['briefcase', 'Job Title', e.position], ['building', 'Department', e.dept], ['user', 'Reports To', e.manager], ['mail', 'Email', e.email], ['phone', 'Phone', e.phone], ['pin', 'Location', e.location], ['calendar', 'Joining Date', fmtDate(e.join)], ['check-circle', 'Employment Status', e.status + ' · ' + e.type], ['award', 'Tenure', tenureY < 1 ? Math.max(1, Math.round(tenureY * 12)) + ' months' : tenureY.toFixed(1) + ' years']].map(([i, kk, v]) => `<div class="detail"><div class="k">${icon(i)}${kk}</div><div class="v">${esc(v)}</div></div>`).join('')}
      </div>`;
    if (k === 'attendance') {
      const r = mulberry32(parseInt(e.id.slice(3), 10));
      const dots = Array.from({ length: 22 }, () => { const x = r(); return x < 0.05 ? 'a' : x < 0.14 ? 'l' : x < 0.18 ? 'v' : ''; });
      return `<div class="mini-stats"><div class="mini-stat"><div class="k">Attendance rate</div><div class="v">${pct(e.attendance)}</div></div><div class="mini-stat"><div class="k">Avg. check-in</div><div class="v">08:${String(30 + (e.id.charCodeAt(5) % 25)).padStart(2, '0')}</div></div><div class="mini-stat"><div class="k">Avg. hours / day</div><div class="v">8h ${10 + (e.id.charCodeAt(6) % 40)}m</div></div></div>
        <div class="section-title">September 2026 · working days</div><div class="att-dots">${dots.map((d) => `<span class="${d}"></span>`).join('')}</div>
        <div class="legend mt-12"><span><i style="background:var(--green-100)"></i>Present</span><span><i style="background:var(--amber-100)"></i>Late</span><span><i style="background:var(--primary-100)"></i>Leave</span><span><i style="background:var(--red-100)"></i>Absent</span></div>`;
    }
    if (k === 'leave') {
      const own = LEAVES.filter((l) => l.emp === e);
      return `<div class="mini-stats">${[['Annual', e.leave.annual, 20], ['Sick', e.leave.sick, 10], ['Casual', e.leave.casual, 6]].map(([t, v, m]) => `<div class="mini-stat"><div class="k">${t} leave</div><div class="v">${v}<small class="muted" style="font-size:13px;font-weight:500"> / ${m} days</small></div><div class="progress mt-8"><span style="width:${(v / m) * 100}%"></span></div></div>`).join('')}</div>
        <div class="section-title">Requests</div>${own.length ? own.map((l) => `<div class="list-row"><span class="feed-icon blue">${icon('calendar')}</span><div class="grow"><b style="font-size:13px">${l.type}</b><div class="muted" style="font-size:12px">${fmtShort(l.start)} – ${fmtShort(l.end)} · ${l.days} day${l.days > 1 ? 's' : ''}</div></div>${pill(l.status)}</div>`).join('') : '<p class="muted">No leave requests in the current period.</p>'}`;
    }
    if (k === 'compensation') return `<div class="mini-stats"><div class="mini-stat"><div class="k">Basic salary</div><div class="v">${money(e.basic)}</div><div class="s">per month</div></div><div class="mini-stat"><div class="k">Allowances</div><div class="v">${money(e.allowances)}</div><div class="s">housing, transport, meals</div></div><div class="mini-stat"><div class="k">Net pay</div><div class="v">${money(e.net)}</div><div class="s">after ${money(e.deductions)} deductions</div></div></div>
      <div class="section-title">Enrolled benefits</div><div class="chips">${['Health Insurance', 'Dental Insurance', 'Retirement Plan (401k)', 'Meal Allowance'].map((b) => `<span class="tag blue">${icon('check', 'xs')} ${b}</span>`).join('')}</div>
      <p class="muted mt-12" style="font-size:12px">All compensation figures are fictional demo values.</p>`;
    if (k === 'performance') return prem ? `<div class="balance-row"><div class="ring">${ring(e.perf, 5, 'var(--premium)')}<div class="rv"><div><b>${e.perf}</b><span>of 5.0</span></div></div></div><div style="flex:1"><b>Q3 2026 review · ${esc(e.review)}</b><p class="muted" style="font-size:13px;margin-top:4px">Goals completed: ${e.goalsDone} of ${e.goalsTotal}. Reviewer: ${esc(e.manager)}.</p><div class="progress premium mt-8"><span style="width:${(e.goalsDone / e.goalsTotal) * 100}%"></span></div></div></div>
      <div class="section-title">Competencies</div><div class="hbar">${[['Delivery', 0.92], ['Collaboration', 0.86], ['Ownership', 0.9], ['Communication', 0.78]].map(([n, f]) => `<div class="hbar-row"><span class="lbl">${n}</span><span class="track"><span style="width:${Math.min(100, (e.perf / 5) * f * 112)}%;background:var(--premium)"></span></span><span class="v">${((e.perf * f * 1.1)).toFixed(1)}</span></div>`).join('')}</div>`
      : lockedTeaser('Performance reviews are a Premium feature', 'Track goals, competencies and review history for every employee.');
    if (k === 'documents') return prem ? DOCS.slice(0, 5).map((d) => `<div class="list-row"><span class="file-ic ${d.type}">${d.type.toUpperCase()}</span><div class="grow"><b style="font-size:13px">${esc(d.name.replace(/ — .*(\.\w+)$/, ' — ' + e.name + '$1'))}</b><div class="muted" style="font-size:12px">${d.cat} · ${d.size}</div></div>${pill(d.status)}</div>`).join('')
      : lockedTeaser('Employee documents are a Premium feature', 'Store contracts, IDs and certificates securely in each employee profile.');
    return '';
  }

  /* ------------------------------------------------------------------
     ATTENDANCE
     ------------------------------------------------------------------ */
  PAGES.attendance.render = function () {
    return `
      ${pageHeader('Attendance', 'Monitor daily check-ins, punctuality and working hours.',
        `<button class="btn btn-secondary" data-action="export-attendance">${icon('download', 'sm')} Export</button><button class="btn btn-primary" data-action="mark-attendance">${icon('plus', 'sm')} Manual Entry</button>`)}
      <div class="grid grid-4" id="attKpis"></div>
      <div class="grid grid-12 mt-20">
        <div class="card span-8">
          <div class="card-header"><div><div class="card-title">Attendance Trend</div><div class="card-sub">Present employees (on time + late) over the last 4 weeks</div></div><div class="legend"><span><i class="line" style="background:var(--c1)"></i>Present</span><span><i class="line" style="background:var(--c5)"></i>Late</span></div></div>
          <div class="card-body"><div class="chart" id="chAttTrend"></div></div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Today at a Glance</div><div class="card-sub">${fmtDate(TODAY)}</div></div></div>
          <div class="card-body">
            ${[['On-time rate', '92.1%', 92.1, 'green'], ['Average check-in', '08:47 AM', 70, ''], ['Avg. working hours (week)', '8h 24m', 84, ''], ['Overtime hours (week)', '46.5h', 38, 'amber']].map(([l, v, w, c]) => `<div style="margin-bottom:16px"><div class="row between" style="font-size:13px;margin-bottom:6px"><span class="muted">${l}</span><b class="tnum">${v}</b></div><div class="progress ${c}"><span style="width:${w}%"></span></div></div>`).join('')}
            <div class="banner" style="padding:12px 14px;gap:12px"><span class="bi" style="width:32px;height:32px">${icon('pin', 'sm')}</span><div class="grow"><h4 style="font-size:13px">3 office locations + remote</h4><p style="font-size:12px">Check-ins via web, mobile & kiosk</p></div></div>
          </div>
        </div>
      </div>
      <div class="card mt-20">
        <div class="card-header"><div><div class="card-title">Attendance Records</div><div class="card-sub">Daily log for each employee</div></div></div>
        <div class="toolbar">
          <select class="select" data-filter="att.date" aria-label="Date">${selectOpts(ATT_DATES.map((d, i) => [i, (i === 0 ? 'Today · ' : '') + DAYS[d.getDay()] + ', ' + fmtShort(d)]), ui.att.date)}</select>
          <div class="input-icon">${icon('search', 'sm')}<input class="input" placeholder="Search employee…" data-filter="att.q" value="${esc(ui.att.q)}" aria-label="Search attendance"></div>
          <select class="select" data-filter="att.dept" aria-label="Department">${selectOpts([['all', 'All departments'], ...DEPT_NAMES], ui.att.dept)}</select>
          <div class="spacer"></div><div class="chips" id="attChips"></div>
        </div>
        <div id="attTable"></div>
      </div>`;
  };
  PAGES.attendance.refresh = function () {
    const rows = attendanceFor(+ui.att.date);
    const c = attCounts(rows), T = EMPLOYEES.length;
    $('#attKpis').innerHTML = [
      kpi('Present', c.present, 'user-check', 'green', `<b style="color:var(--text)">${pct((c.present / T) * 100)}</b> of workforce`),
      kpi('Absent', c.absent, 'user-x', 'red', `${pct((c.absent / T) * 100)} · unplanned`),
      kpi('Late', c.late, 'clock', 'amber', `Arrived after 09:05 AM`),
      kpi('On Leave', c.leave, 'calendar', 'blue', 'Approved leave')
    ].join('');
    const f = ui.att, q = f.q.trim().toLowerCase(), isToday = +f.date === 0;
    const base = rows.filter((r) => (f.dept === 'all' || r.emp.dept === f.dept) && (!q || r.emp.name.toLowerCase().includes(q) || r.emp.id.toLowerCase().includes(q)));
    $('#attChips').innerHTML = ['all', 'Present', 'Late', 'Absent', 'On Leave'].map((s) => `<button class="chip ${f.status === s ? 'active' : ''}" data-action="set" data-key="att.status" data-val="${s}">${s === 'all' ? 'All' : s} <span class="n">${s === 'all' ? base.length : base.filter((r) => r.status === s).length}</span></button>`).join('');
    const list = base.filter((r) => f.status === 'all' || r.status === f.status);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)); f.page = clamp(f.page, 1, pages);
    const d = ATT_DATES[+f.date];
    const page = list.slice((f.page - 1) * PER_PAGE, f.page * PER_PAGE);
    $('#attTable').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Status</th></tr></thead><tbody>
      ${page.length ? page.map((r) => {
        const hrs = r.cin && r.cout ? r.cout - r.cin - 45 : null;
        return `<tr><td>${personCell(r.emp, r.emp.dept)}</td><td class="tnum">${fmtShort(d)}, ${d.getFullYear()}</td><td class="tnum">${r.cin ? ampm(r.cin) : '<span class="subtle">—</span>'}</td><td class="tnum">${r.cout ? ampm(r.cout) : r.cin && isToday ? '<span class="pill info no-dot">Working</span>' : '<span class="subtle">—</span>'}</td><td class="tnum">${hrs ? `${Math.floor(hrs / 60)}h ${String(hrs % 60).padStart(2, '0')}m` : r.cin ? '<span class="muted">In progress</span>' : '<span class="subtle">—</span>'}</td><td>${pill(r.status)}</td></tr>`;
      }).join('') : emptyRow(6)}
      </tbody></table></div>${pager(list.length, f.page, 'att')}`;
  };
  PAGES.attendance.mount = function () {
    registerChart(() => {
      const h = ATT_HISTORY.slice(-20);
      lineChart($('#chAttTrend'), {
        title: 'Attendance trend', height: 250,
        labels: h.map((d) => fmtShort(d.date)), tipLabels: h.map((d) => `${DAYS[d.date.getDay()]}, ${fmtShort(d.date)}`),
        min: 0, max: 128,
        series: [{ name: 'Present', color: 'var(--c1)', data: h.map((d) => d.present + d.late) }, { name: 'Late', color: 'var(--c5)', data: h.map((d) => d.late) }]
      });
    });
  };

  /* ------------------------------------------------------------------
     LEAVE
     ------------------------------------------------------------------ */
  PAGES.leave.render = function () {
    return `
      ${pageHeader('Leave Management', 'Review requests, track balances and see who is out of office.',
        `<button class="btn btn-secondary" data-action="leave-policy">${icon('book', 'sm')} Leave Policy</button><button class="btn btn-primary" data-action="new-leave">${icon('plus', 'sm')} New Leave Request</button>`)}
      <div class="grid grid-4" id="leaveKpis"></div>
      <div class="grid grid-12 mt-20">
        <div class="card span-8">
          <div class="card-header" style="padding-bottom:0"><div><div class="card-title">Leave Requests</div><div class="card-sub">Approve or reject requests submitted by employees</div></div></div>
          <div class="tabs" id="leaveTabs" style="padding:0 12px;margin-top:10px"></div>
          <div id="leaveTable"></div>
        </div>
        <div class="span-4 stack">
          <div class="card"><div class="card-header"><div><div class="card-title">October 2026</div><div class="card-sub">Team leave calendar</div></div></div><div class="card-body" id="leaveCal"></div></div>
          <div class="card"><div class="card-header"><div><div class="card-title">Out of Office Today</div><div class="card-sub">8 employees on approved leave</div></div></div>
            <div class="card-body" style="padding-top:6px">${EMPLOYEES.filter((e) => e.status === 'On Leave').slice(0, 5).map((e, i) => `<div class="list-row">${av(e, 'sm')}<div class="grow"><div style="font-weight:560;font-size:13px">${esc(e.name)}</div><div class="muted" style="font-size:12px">${esc(e.dept)}</div></div><span class="tag">${['Annual', 'Sick', 'Annual', 'Casual', 'Parental'][i]}</span></div>`).join('')}<button class="link-btn mt-8" data-action="nav-filter" data-page="employees" data-key="emp.status" data-val="On Leave">View all 8 ${icon('arrow-right')}</button></div>
          </div>
        </div>
      </div>`;
  };
  PAGES.leave.refresh = function () {
    const pend = pendingLeaves().length;
    $('#leaveKpis').innerHTML = LEAVE_TYPES.map((t) => `
      <div class="card leave-type">
        <div class="kpi-top"><span class="kpi-label">${t.name}</span><span class="kpi-icon ${t.color}">${icon(t.icon)}</span></div>
        <div class="row" style="align-items:baseline;gap:6px"><b>${num(t.total - t.taken)}</b><small>days remaining company-wide</small></div>
        <div class="progress ${t.color === 'red' ? 'red' : t.color === 'amber' ? 'amber' : ''}"><span style="width:${(t.taken / t.total) * 100}%"></span></div>
        <div class="stats"><span>Used <b>${num(t.taken)}</b></span><span>Entitlement <b>${t.entitlement} days / person</b></span></div>
      </div>`).join('') + kpi('Pending Requests', pend, 'inbox', pend ? 'amber' : 'green', pend ? 'Awaiting manager decision' : 'All requests handled');
    const tabs = ['Pending', 'Approved', 'Rejected', 'All'];
    $('#leaveTabs').innerHTML = tabs.map((t) => `<button class="tab ${ui.leaveTab === t ? 'active' : ''}" data-action="set" data-key="leaveTab" data-val="${t}">${t} <span class="count">${t === 'All' ? LEAVES.length : LEAVES.filter((l) => l.status === t).length}</span></button>`).join('');
    const list = LEAVES.filter((l) => ui.leaveTab === 'All' || l.status === ui.leaveTab || (l.justDecided && ui.leaveTab === 'Pending'));
    $('#leaveTable').innerHTML = `<div class="table-wrap"><table class="table no-top"><thead><tr><th>Employee</th><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Duration</th><th>Reason</th><th>Status</th><th class="num">Action</th></tr></thead><tbody>
      ${list.length ? list.map((l) => `<tr data-row="${l.id}" class="${l.justDecided ? 'flash' : ''}"><td>${personCell(l.emp, l.emp.dept)}</td><td>${esc(l.type)}</td><td class="tnum">${fmtDate(l.start)}</td><td class="tnum">${fmtDate(l.end)}</td><td class="tnum">${l.days} day${l.days > 1 ? 's' : ''}</td><td class="wrap muted" style="max-width:220px">${esc(l.reason)}</td><td>${pill(l.status)}</td>
        <td class="num">${l.status === 'Pending' ? `<div class="row-actions"><button class="btn btn-success btn-xs" data-action="approve" data-id="${l.id}">${icon('check', 'xs')} Approve</button><button class="btn btn-danger btn-xs" data-action="reject" data-id="${l.id}">${icon('x', 'xs')} Reject</button></div>` : `<span class="muted" style="font-size:12px">by ${esc(l.decidedBy || '—')}</span>`}</td></tr>`).join('') : emptyRow(8, ui.leaveTab === 'Pending' ? 'No pending requests — you’re all caught up' : 'No requests in this view')}
      </tbody></table></div>`;
    LEAVES.forEach((l) => delete l.justDecided);
    // Calendar
    const first = new Date(2026, 9, 1), startDow = first.getDay();
    const leaveDays = new Set();
    LEAVES.filter((l) => l.status !== 'Rejected').forEach((l) => { for (let d = new Date(l.start); d <= l.end; d = addDays(d, 1)) if (d.getMonth() === 9) leaveDays.add(d.getDate()); });
    let cal = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="h">${d}</div>`).join('');
    for (let i = 0; i < startDow; i++) cal += '<div></div>';
    for (let d = 1; d <= 31; d++) {
      const dow = (startDow + d - 1) % 7;
      const cls = d === TODAY.getDate() ? 'today' : d === 12 ? 'hol' : leaveDays.has(d) ? 'leave' : dow === 0 || dow === 6 ? 'off' : '';
      cal += `<div class="d ${cls}">${d}</div>`;
    }
    $('#leaveCal').innerHTML = `<div class="calendar-mini">${cal}</div><div class="legend mt-12"><span><i style="background:var(--primary)"></i>Today</span><span><i style="background:var(--amber-100)"></i>Leave</span><span><i style="background:var(--premium-100)"></i>Holiday</span></div>`;
  };
  function decideLeave(id, approve) {
    const l = LEAVES.find((x) => x.id === id);
    if (!l || l.status !== 'Pending') return;
    l.status = approve ? 'Approved' : 'Rejected';
    l.decidedBy = 'Alex Morgan';
    l.justDecided = true;
    const days = `${l.days} day${l.days > 1 ? 's' : ''}`;
    if (approve) {
      toast('Leave approved', `${l.emp.name} · ${l.type} · ${days}`, 'success');
      logActivity('calendar-check', 'green', `<b>Alex Morgan</b> approved ${l.type.toLowerCase()} for <b>${esc(l.emp.name)}</b>`);
    } else {
      toast('Leave rejected', `${l.emp.name} has been notified`, 'danger');
      logActivity('x-circle', 'red', `<b>Alex Morgan</b> rejected ${l.type.toLowerCase()} for <b>${esc(l.emp.name)}</b>`);
    }
    logAudit(`${approve ? 'Approved' : 'Rejected'} leave request ${l.id}`, 'Leave', approve ? 'Success' : 'Warning');
    updateBadges();
    rerender();
  }

  /* ------------------------------------------------------------------
     PAYROLL
     ------------------------------------------------------------------ */
  PAGES.payroll.render = function () {
    return `
      ${pageHeader('Payroll', 'October 2026 pay cycle · Monthly · Pay date Oct 30, 2026',
        `<button class="btn btn-secondary" data-action="export-payroll">${icon('download', 'sm')} Export Register</button><button class="btn btn-primary" data-action="run-payroll" ${state.payrollRun ? 'disabled' : ''}>${icon(state.payrollRun ? 'check' : 'play', 'sm')} ${state.payrollRun ? 'Payroll Completed' : 'Run Payroll'}</button>`)}
      <div class="grid grid-4" id="payKpis"></div>
      <div class="card mt-20">
        <div class="card-header"><div><div class="card-title">Pay Cycle Progress</div><div class="card-sub">October 2026 · ${EMPLOYEES.length} employees · 8 departments</div></div><span id="payCycleStatus"></span></div>
        <div class="card-body"><div class="steps" id="paySteps"></div></div>
      </div>
      <div class="card mt-20">
        <div class="card-header"><div><div class="card-title">Payroll Register</div><div class="card-sub">All amounts are fictional demo values in USD</div></div></div>
        <div class="toolbar">
          <div class="input-icon">${icon('search', 'sm')}<input class="input" placeholder="Search employee or ID…" data-filter="pay.q" value="${esc(ui.pay.q)}" aria-label="Search payroll"></div>
          <select class="select" data-filter="pay.dept" aria-label="Department">${selectOpts([['all', 'All departments'], ...DEPT_NAMES], ui.pay.dept)}</select>
          <div class="spacer"></div><div class="chips" id="payChips"></div>
        </div>
        <div id="payTable"></div>
      </div>`;
  };
  PAGES.payroll.refresh = function () {
    const t = payrollTotals();
    $('#payKpis').innerHTML = [
      kpi('Total Payroll', money(t.total), 'wallet', 'blue', `${delta(2.8)} vs September`),
      kpi('Paid', money(t.paid), 'check-circle', 'green', `${t.nPaid} employees processed`),
      kpi('Pending', money(t.pending), 'hourglass', 'amber', `${t.nPending} employees awaiting run`),
      kpi('Next Payroll', 'Oct 30', 'calendar', '', `In ${Math.round((new Date(2026, 9, 30) - TODAY) / 864e5)} days · Monthly cycle`)
    ].join('');
    const done = state.payrollRun;
    const steps = [['Prepare', 'Oct 1 – Oct 5', 'done'], ['Review', 'Oct 6 – Oct 12', done ? 'done' : 'current'], ['Approve', 'Oct 26', done ? 'done' : 'todo'], ['Disburse', 'Oct 30', done ? 'done' : 'todo']];
    $('#paySteps').innerHTML = steps.map(([l, w, s]) => `<div class="step ${s}"><div class="bar"><span></span></div><div class="lbl">${icon(s === 'done' ? 'check-circle' : s === 'current' ? 'refresh' : 'clock')}${l}</div><div class="when">${w}</div></div>`).join('');
    $('#payCycleStatus').innerHTML = done ? pill('Completed', 'success') : pill('In Review', 'info');
    const f = ui.pay, q = f.q.trim().toLowerCase();
    const base = EMPLOYEES.filter((e) => (f.dept === 'all' || e.dept === f.dept) && (!q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)));
    $('#payChips').innerHTML = ['all', 'Paid', 'Pending', 'On Hold'].map((s) => `<button class="chip ${f.status === s ? 'active' : ''}" data-action="set" data-key="pay.status" data-val="${s}">${s === 'all' ? 'All' : s} <span class="n">${s === 'all' ? base.length : base.filter((e) => e.payStatus === s).length}</span></button>`).join('');
    const list = base.filter((e) => f.status === 'all' || e.payStatus === f.status);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)); f.page = clamp(f.page, 1, pages);
    const page = list.slice((f.page - 1) * PER_PAGE, f.page * PER_PAGE);
    $('#payTable').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th class="num">Basic Salary</th><th class="num">Allowances</th><th class="num">Deductions</th><th class="num">Net Salary</th><th>Status</th><th class="num">Action</th></tr></thead><tbody>
      ${page.length ? page.map((e) => `<tr><td>${personCell(e)}</td><td class="num">${money(e.basic)}</td><td class="num">${money(e.allowances)}</td><td class="num" style="color:var(--red)">−${money(e.deductions)}</td><td class="num strong">${money(e.net)}</td><td>${pill(e.payStatus)}</td><td class="num"><button class="btn btn-secondary btn-xs" data-action="payslip" data-id="${e.id}">${icon('receipt', 'xs')} View Payslip</button></td></tr>`).join('') : emptyRow(7)}
      </tbody></table></div>${pager(list.length, f.page, 'pay')}`;
  };

  function openPayslip(id) {
    const e = empById(id); if (!e) return;
    const housing = Math.round(e.allowances * 0.6), transport = Math.round(e.allowances * 0.25), meal = e.allowances - housing - transport;
    const gross = e.basic + e.allowances;
    const html = `
      ${modalHead('Payslip', `${esc(e.name)} · October 2026`)}
      <div class="modal-body">
        <div class="payslip">
          <div class="ps-head">
            <div class="row" style="gap:12px"><span class="brand-mark" style="width:38px;height:38px"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17V7l10 10V7"/></svg></span><div class="co"><b>${COMPANY}</b><span>1200 Example Avenue, Austin, TX (fictional)</span></div></div>
            <div class="period"><b>Pay period: Oct 1 – Oct 31, 2026</b><span>Pay date: Oct 30, 2026 · Slip #PS-2610-${e.id.slice(3)}</span></div>
          </div>
          <div class="ps-emp">
            ${[['Employee', e.name], ['Employee ID', e.id], ['Department', e.dept], ['Position', e.position], ['Payment method', 'Bank transfer ••••' + (4000 + (parseInt(e.id.slice(3), 10) * 37) % 6000)], ['Working days', '22 of 22'], ['Tax code', 'Single · Std'], ['Status', e.payStatus]].map(([k, v]) => `<div class="detail"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`).join('')}
          </div>
          <div class="ps-cols">
            <div class="ps-col"><h5>Earnings</h5>
              <div class="ps-line"><span>Basic salary</span><span>${money(e.basic, 2)}</span></div>
              <div class="ps-line"><span>Housing allowance</span><span>${money(housing, 2)}</span></div>
              <div class="ps-line"><span>Transport allowance</span><span>${money(transport, 2)}</span></div>
              <div class="ps-line"><span>Meal allowance</span><span>${money(meal, 2)}</span></div>
              <div class="ps-line total"><span>Gross earnings</span><span>${money(gross, 2)}</span></div>
            </div>
            <div class="ps-col"><h5>Deductions</h5>
              <div class="ps-line"><span>Income tax</span><span>${money(e.tax, 2)}</span></div>
              <div class="ps-line"><span>Health &amp; benefits</span><span>${money(e.benefitsDed, 2)}</span></div>
              <div class="ps-line"><span>Retirement (401k · 5%)</span><span>${money(e.pension, 2)}</span></div>
              <div class="ps-line"><span>Other</span><span>${money(0, 2)}</span></div>
              <div class="ps-line total"><span>Total deductions</span><span style="color:var(--red)">${money(e.deductions, 2)}</span></div>
            </div>
          </div>
          <div class="ps-net"><span>Net pay for October 2026</span><b>${money(e.net, 2)}</b></div>
          <div class="ps-note">DEMO PAYSLIP — all values are fictional and for illustration only.</div>
        </div>
      </div>
      <div class="modal-foot"><span class="left">${icon('lock', 'sm')} Visible to employee &amp; payroll admins</span>${FRAMED ? '' : `<button class="btn btn-secondary btn-sm" data-action="print">${icon('printer', 'sm')} Print</button>`}<button class="btn btn-primary btn-sm" data-action="download-payslip" data-id="${e.id}">${icon('download', 'sm')} Download</button></div>`;
    openModal(html, 'md');
  }

  function runPayroll() {
    const t = payrollTotals();
    openModal(`
      ${modalHead('Run October payroll?', 'Pending payments will be processed for disbursement on Oct 30.')}
      <div class="modal-body">
        <div class="mini-stats"><div class="mini-stat"><div class="k">Employees</div><div class="v">${t.nPending}</div></div><div class="mini-stat"><div class="k">Amount</div><div class="v">${moneyK(t.pending)}</div></div><div class="mini-stat"><div class="k">On hold</div><div class="v">${EMPLOYEES.filter((e) => e.payStatus === 'On Hold').length}</div></div></div>
        <div id="runProgress" class="upload-progress hidden"><div class="row between" style="font-size:13px"><span id="runLabel">Validating payroll data…</span><b id="runPct">0%</b></div><div class="progress lg"><span id="runBar" style="width:0"></span></div></div>
        <p class="muted mt-12" style="font-size:12.5px">${icon('info', 'xs')} This is a demonstration — no real payments are made.</p>
      </div>
      <div class="modal-foot"><button class="btn btn-secondary btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="confirmRun">${icon('play', 'sm')} Process ${t.nPending} payments</button></div>`, 'sm', (m) => {
      $('#confirmRun', m).addEventListener('click', (ev) => {
        ev.currentTarget.disabled = true;
        $('#runProgress', m).classList.remove('hidden');
        const labels = ['Validating payroll data…', 'Calculating taxes & deductions…', 'Generating payslips…', 'Scheduling bank transfers…'];
        let p = 0;
        const iv = setInterval(() => {
          p = Math.min(100, p + 4 + Math.random() * 8);
          $('#runBar', m).style.width = p + '%';
          $('#runPct', m).textContent = Math.round(p) + '%';
          $('#runLabel', m).textContent = labels[Math.min(3, Math.floor(p / 25))];
          if (p >= 100) {
            clearInterval(iv);
            EMPLOYEES.forEach((e) => { if (e.payStatus === 'Pending') e.payStatus = 'Paid'; });
            state.payrollRun = true;
            logActivity('wallet', 'premium', `<b>Alex Morgan</b> processed October payroll for <b>${t.nPending}</b> employees`);
            logAudit('Ran payroll: October 2026 cycle', 'Payroll');
            setTimeout(() => { closeModal(); toast('Payroll processed', `${t.nPending} payments · ${money(t.pending)} scheduled for Oct 30`); render(); }, 350);
          }
        }, 90);
      });
    });
  }

  /* ------------------------------------------------------------------
     BENEFITS
     ------------------------------------------------------------------ */
  PAGES.benefits.render = function () {
    const enrolled = BENEFITS.reduce((a, b) => a + b.enrolled, 0);
    const cost = BENEFITS.reduce((a, b) => a + b.cost, 0);
    return `
      ${pageHeader('Benefits Management', 'Manage benefit plans, enrollment and monthly costs.',
        `<button class="btn btn-secondary" data-action="export-benefits">${icon('download', 'sm')} Export</button><button class="btn btn-primary" data-action="add-benefit">${icon('plus', 'sm')} Add Benefit Plan</button>`)}
      <div class="grid grid-4">
        ${kpi('Active Plans', BENEFITS.filter((b) => b.status === 'Active').length + '<small>/ ' + BENEFITS.length + '</small>', 'layers', 'blue', 'Across 6 providers')}
        ${kpi('Total Enrollments', num(enrolled), 'user-check', 'green', `${delta(6.2)} since last quarter`)}
        ${kpi('Monthly Benefits Cost', money(cost), 'dollar', '', `${money(Math.round(cost / EMPLOYEES.length))} per employee`)}
        ${kpi('Enrollment Rate', '91.4%', 'pie', 'amber', 'Core plans (health, dental, life)')}
      </div>
      <div class="banner mt-20">
        <span class="bi">${icon('calendar-check')}</span>
        <div class="grow"><h4>Open enrollment: Oct 12 – Oct 30, 2026</h4><p>Employees can enroll in the Wellness Program and change dependents during this window.</p></div>
        <button class="btn btn-secondary btn-sm" data-action="toast" data-title="Reminder scheduled" data-msg="All eligible employees will be notified on Oct 12 (demo).">${icon('send', 'sm')} Notify employees</button>
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-8">
          <div class="card-header bordered"><div><div class="card-title">Benefit Plans</div><div class="card-sub">Provider names are fictional</div></div></div>
          <div class="table-wrap"><table class="table no-top"><thead><tr><th>Benefit</th><th>Employees Enrolled</th><th class="num">Monthly Cost</th><th>Eligibility</th><th>Status</th></tr></thead><tbody id="benBody">
            ${BENEFITS.map((b) => `<tr class="${b.fresh ? 'flash' : ''}"><td><div class="person"><span class="kpi-icon blue" style="width:34px;height:34px">${icon(b.icon)}</span><span><span class="person-name">${esc(b.name)}</span><br><span class="person-sub">${esc(b.provider)}</span></span></div></td>
              <td style="min-width:180px"><div class="progress-row"><div class="progress"><span style="width:${(b.enrolled / b.eligible) * 100}%"></span></div><span class="val">${b.enrolled}</span></div><span class="muted" style="font-size:11.5px">of ${b.eligible} eligible</span></td>
              <td class="num strong">${money(b.cost)}</td><td class="muted">${esc(b.elig)}</td><td>${pill(b.status)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
        <div class="card span-4">
          <div class="card-header"><div><div class="card-title">Cost by Plan</div><div class="card-sub">Share of ${money(cost)} monthly spend</div></div></div>
          <div class="card-body"><div class="hbar">${BENEFITS.slice().sort((a, b) => b.cost - a.cost).map((b) => `<div class="hbar-row" style="grid-template-columns:110px 1fr 54px"><span class="lbl" title="${esc(b.name)}">${esc(b.name.replace(' Insurance', '').replace(' (401k)', ''))}</span><span class="track"><span style="width:${(b.cost / 54450) * 100}%"></span></span><span class="v">${moneyK(b.cost)}</span></div>`).join('')}</div></div>
        </div>
      </div>`;
  };

  /* ------------------------------------------------------------------
     REPORTS
     ------------------------------------------------------------------ */
  const STD_REPORTS = [
    { key: 'employee', name: 'Employee Report', icon: 'users', desc: 'Complete employee directory with department, position, status and joining date.', updated: 'Today, 8:00 AM', rows: 128 },
    { key: 'attendance', name: 'Attendance Report', icon: 'clock', desc: 'Daily check-in and check-out log with working hours and attendance status.', updated: 'Today, 10:30 AM', rows: 128 },
    { key: 'payroll', name: 'Payroll Report', icon: 'wallet', desc: 'Payroll register with basic salary, allowances, deductions and net pay.', updated: 'Oct 6, 2026', rows: 128 },
    { key: 'leave', name: 'Leave Report', icon: 'calendar', desc: 'Leave requests, approvals and balances by leave type and department.', updated: 'Oct 6, 2026', rows: LEAVES.length }
  ];
  const ADV_REPORTS = [
    { key: 'turnover', name: 'Turnover & Retention', icon: 'trending-down', desc: 'Voluntary vs. involuntary exits, retention by cohort and flight-risk indicators.' },
    { key: 'cost', name: 'Department Cost Analysis', icon: 'dollar', desc: 'Fully-loaded people cost per department including benefits and allowances.' },
    { key: 'performance', name: 'Performance Distribution', icon: 'target', desc: 'Score distribution, calibration view and goal completion by team.' },
    { key: 'hiring', name: 'Hiring Funnel Report', icon: 'briefcase', desc: 'Conversion rates by stage, time-to-hire and source effectiveness.' }
  ];
  PAGES.reports.render = function () {
    const prem = isPrem();
    const card = (r, adv) => `
      <div class="card report-card ${adv ? 'p' : ''}">
        <div class="row between"><span class="ri">${icon(r.icon)}</span>${adv ? `<span class="premium-badge">${icon('crown')}Advanced</span>` : '<span class="tag">CSV</span>'}</div>
        <div><h4>${r.name}</h4><p>${r.desc}</p></div>
        <div class="meta"><span>${icon('refresh', 'xs')} ${r.updated || 'Generated on demand'}</span><span>${icon('file', 'xs')} ${r.rows ? r.rows + ' rows' : 'Interactive'}</span></div>
        <div class="actions">${adv && !prem ? `<button class="btn btn-premium btn-sm" data-action="premium" data-feature="Advanced Reports">${icon('lock', 'sm')} Unlock with Premium</button>` : `<button class="btn btn-primary btn-sm" data-action="download-report" data-key="${r.key}">${icon('download', 'sm')} Download Demo</button>`}</div>
      </div>`;
    return `
      ${pageHeader('Reports', 'Generate and download HR reports. Downloads contain fictional demo data.',
        prem ? `<button class="btn btn-primary" data-action="schedule-report">${icon('calendar', 'sm')} Schedule Report</button>` : `<button class="btn btn-secondary" data-action="premium" data-feature="Scheduled Reports">${icon('lock', 'sm')} Schedule Report</button>`)}
      <div class="section-title" style="margin-top:0">Standard reports</div>
      <div class="grid grid-4">${STD_REPORTS.map((r) => card(r)).join('')}</div>
      <div class="row between" style="margin:28px 0 12px"><div class="section-title" style="margin:0">Advanced reports</div>${prem ? '' : `<span class="premium-badge">${icon('crown')}Premium</span>`}</div>
      <div class="grid grid-4">${ADV_REPORTS.map((r) => card(r, true)).join('')}</div>
      ${prem ? `
      <div class="card mt-24">
        <div class="card-header bordered"><div><div class="card-title">Scheduled Reports</div><div class="card-sub">Delivered automatically to stakeholders by email</div></div></div>
        <div class="table-wrap"><table class="table no-top"><thead><tr><th>Report</th><th>Frequency</th><th>Recipients</th><th>Next Delivery</th><th class="num">Enabled</th></tr></thead><tbody>
          ${[['Headcount Summary', 'Weekly · Monday 8:00 AM', 'Leadership team (4)', 'Oct 12, 2026', true], ['Payroll Register', 'Monthly · 25th', 'Finance (3)', 'Oct 25, 2026', true], ['Attendance Exceptions', 'Daily · 6:00 PM', 'Department heads (8)', 'Today, 6:00 PM', true], ['Turnover & Retention', 'Quarterly', 'CEO, CFO', 'Jan 2, 2027', false]].map(([n, f, r, d, on]) => `<tr><td class="strong">${n}</td><td>${f}</td><td class="muted">${r}</td><td class="tnum">${d}</td><td class="num"><label class="toggle"><input type="checkbox" ${on ? 'checked' : ''} data-action="toggle-generic" data-label="${n}"><span class="track"></span><span class="thumb"></span></label></td></tr>`).join('')}
        </tbody></table></div>
      </div>` : ''}`;
  };
  function downloadReport(key) {
    const H = { employee: ['Employee', 'Employee ID', 'Department', 'Position', 'Status', 'Joining Date', 'Email'] };
    let rows;
    if (key === 'employee') rows = [H.employee, ...EMPLOYEES.map((e) => [e.name, e.id, e.dept, e.position, e.status, iso(e.join), e.email])];
    else if (key === 'attendance') rows = [['Employee', 'Employee ID', 'Date', 'Check In', 'Check Out', 'Status'], ...attendanceFor(1).map((r) => [r.emp.name, r.emp.id, iso(ATT_DATES[1]), r.cin ? hm(r.cin) : '', r.cout ? hm(r.cout) : '', r.status])];
    else if (key === 'payroll') rows = [['Employee', 'Employee ID', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'], ...EMPLOYEES.map((e) => [e.name, e.id, e.dept, e.basic, e.allowances, e.deductions, e.net, e.payStatus])];
    else if (key === 'leave') rows = [['Request ID', 'Employee', 'Leave Type', 'Start', 'End', 'Days', 'Status'], ...LEAVES.map((l) => [l.id, l.emp.name, l.type, iso(l.start), iso(l.end), l.days, l.status])];
    else if (key === 'turnover') rows = [['Department', 'Headcount', 'Exits (12m)', 'Turnover %'], ...DEPTS.map((d, i) => [d.name, d.count, [3, 4, 2, 2, 1, 1, 0, 1][i], ([3, 4, 2, 2, 1, 1, 0, 1][i] / d.count * 100).toFixed(1)])];
    else if (key === 'cost') rows = [['Department', 'Headcount', 'Monthly Gross Payroll'], ...DEPT_NAMES.map((d) => { const l = EMPLOYEES.filter((e) => e.dept === d); return [d, l.length, l.reduce((a, e) => a + e.basic + e.allowances, 0)]; })];
    else if (key === 'performance') rows = [['Employee', 'Department', 'Score', 'Goals Done', 'Goals Total', 'Review'], ...EMPLOYEES.map((e) => [e.name, e.dept, e.perf, e.goalsDone, e.goalsTotal, e.review])];
    else rows = [['Candidate', 'Role', 'Stage', 'Source'], ...CANDIDATES.map((c) => [c.name, c.role, c.stage, c.source])];
    downloadCSV(`novacore-${key}-report-demo.csv`, rows);
  }

  /* ------------------------------------------------------------------
     SETTINGS
     ------------------------------------------------------------------ */
  PAGES.settings.render = function () {
    const tabs = [['general', 'General', 'building'], ['roles', 'Roles & Permissions', 'key'], ['notifications', 'Notifications', 'bell'], ['security', 'Security', 'shield'], ['plan', 'Plan & Billing', 'card']];
    return `
      ${pageHeader('Settings', 'Configure your organization, access control and preferences.', `<button class="btn btn-primary" data-action="save-settings">${icon('check', 'sm')} Save Changes</button>`)}
      <div class="settings-layout">
        <nav class="settings-nav">${tabs.map(([k, l, i]) => `<button class="${ui.settingsTab === k ? 'active' : ''}" data-action="set" data-key="settingsTab" data-val="${k}" data-full="1">${icon(i, 'sm')} ${l}</button>`).join('')}</nav>
        <div>${settingsPanel()}</div>
      </div>`;
  };
  function settingsPanel() {
    const prem = isPrem();
    const t = ui.settingsTab;
    const tog = (on, label, dis) => `<label class="toggle"><input type="checkbox" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''} data-action="toggle-generic" data-label="${esc(label)}"><span class="track"></span><span class="thumb"></span></label>`;
    if (t === 'general') return `
      <div class="card"><div class="card-header bordered"><div><div class="card-title">Organization Profile</div><div class="card-sub">Shown on payslips, reports and the employee portal</div></div></div>
        <div class="card-body"><div class="form-grid">
          <div class="field"><label>Company name</label><input class="input" value="${COMPANY}"></div>
          <div class="field"><label>Industry</label><select class="select">${selectOpts(['Software & Technology', 'Professional Services', 'Manufacturing', 'Retail'], 'Software & Technology')}</select></div>
          <div class="field"><label>Headquarters</label><input class="input" value="Austin, Texas (fictional address)"></div>
          <div class="field"><label>Time zone</label><select class="select">${selectOpts(['(UTC−06:00) Central Time', '(UTC−05:00) Eastern Time', '(UTC−08:00) Pacific Time', '(UTC+00:00) London'], '(UTC−06:00) Central Time')}</select></div>
          <div class="field"><label>Currency</label><select class="select">${selectOpts(['USD — US Dollar', 'CAD — Canadian Dollar', 'EUR — Euro', 'GBP — British Pound'], 'USD — US Dollar')}</select></div>
          <div class="field"><label>Fiscal year start</label><select class="select">${selectOpts(MONTHS, 'Jan')}</select></div>
          <div class="field span-2"><label>Work week</label><div class="chips">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => `<button class="chip ${i < 5 ? 'active' : ''}" data-action="chip-toggle">${d}</button>`).join('')}</div></div>
        </div></div></div>`;
    if (t === 'roles') {
      const roles = (prem ? ROLES_PREM : ROLES_STD).concat(state.customRoles);
      return `
      <div class="card"><div class="card-header bordered"><div><div class="card-title">Roles &amp; Permissions</div><div class="card-sub">${prem ? 'Create custom roles and fine-tune module access' : 'Built-in roles control who can access each module'}</div></div>
        <button class="btn ${prem ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="${prem ? 'add-role' : 'premium'}" data-feature="Custom Roles & Permissions">${icon(prem ? 'plus' : 'lock', 'sm')} Create Custom Role</button></div>
        <div class="table-wrap"><table class="table no-top perm-table"><thead><tr><th>Module</th>${roles.map((r) => `<th>${esc(r)}</th>`).join('')}</tr></thead><tbody>
          ${PERM_MODULES.map((m, i) => `<tr><td class="strong">${m}</td>${roles.map((r) => `<td><input type="checkbox" class="check" ${(PERMS[r] || [1, 1, 1, 0, 0, 1, 0])[i] ? 'checked' : ''} ${prem && r !== 'Administrator' ? '' : 'disabled'} data-action="perm-change" aria-label="${esc(r)} ${m}"></td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
        <div class="card-footer"><span>${prem ? `${icon('info', 'xs')} Changes are recorded in the Audit Log` : `${icon('lock', 'xs')} Permission editing &amp; custom roles are available in Premium`}</span>${prem ? '' : '<button class="link-btn" data-action="explore-premium">Explore Premium</button>'}</div>
      </div>`;
    }
    if (t === 'notifications') return `
      <div class="card"><div class="card-header bordered"><div><div class="card-title">Notification Preferences</div><div class="card-sub">Choose which events notify HR administrators</div></div></div>
        <div class="card-body" style="padding-top:4px">
          ${[['Leave requests', 'When an employee submits or cancels leave', true], ['Payroll deadlines', 'Reminders before each pay cycle closes', true], ['New employees', 'When a new employee record is created', true], ['Attendance exceptions', 'Daily digest of late arrivals and absences', false]].map(([a, b, on]) => `<div class="setting-row"><div><b>${a}</b><span>${b}</span></div>${tog(on, a)}</div>`).join('')}
          ${[['Smart notifications', 'Automated alerts from workflows and insights'], ['Slack & Teams delivery', 'Send notifications to collaboration tools'], ['Escalation rules', 'Escalate unanswered requests after 48 hours']].map(([a, b]) => `<div class="setting-row"><div><b style="display:flex;gap:8px;align-items:center">${a} ${prem ? '' : `<span class="premium-badge">${icon('crown')}Premium</span>`}</b><span>${b}</span></div>${prem ? tog(true, a) : `<button class="btn btn-secondary btn-xs" data-action="premium" data-feature="Notifications">${icon('lock', 'xs')} Unlock</button>`}</div>`).join('')}
        </div></div>`;
    if (t === 'security') return `
      <div class="card"><div class="card-header bordered"><div><div class="card-title">Security</div><div class="card-sub">Authentication and session policies</div></div></div>
        <div class="card-body" style="padding-top:4px">
          <div class="setting-row"><div><b>Two-factor authentication</b><span>Require 2FA for all administrators</span></div>${tog(true, 'Two-factor authentication')}</div>
          <div class="setting-row"><div><b>Session timeout</b><span>Automatically sign out inactive users</span></div><select class="select sm" style="width:150px">${selectOpts(['15 minutes', '30 minutes', '1 hour', '4 hours'], '30 minutes')}</select></div>
          <div class="setting-row"><div><b>Password policy</b><span>Minimum 12 characters with complexity rules</span></div>${tog(true, 'Password policy')}</div>
          <div class="setting-row"><div><b style="display:flex;gap:8px;align-items:center">Audit logging ${prem ? '' : `<span class="premium-badge">${icon('crown')}Premium</span>`}</b><span>Record every change with user, time and IP address</span></div>${prem ? `<button class="btn btn-secondary btn-xs" data-action="nav" data-page="audit">View logs ${icon('arrow-right', 'xs')}</button>` : `<button class="btn btn-secondary btn-xs" data-action="premium" data-feature="Audit Logs">${icon('lock', 'xs')} Unlock</button>`}</div>
        </div></div>`;
    return `
      <div class="card"><div class="card-header bordered"><div><div class="card-title">Plan &amp; Billing</div><div class="card-sub">Demo — no billing is processed</div></div></div>
        <div class="card-body">
          <div class="banner ${prem ? 'premium' : ''}"><span class="bi">${icon(prem ? 'sparkles' : 'layers')}</span><div class="grow"><h4>NovaCore HR ${prem ? 'Premium' : 'Standard'}</h4><p>${prem ? 'All 15 modules, automation, analytics and unlimited custom roles.' : '8 core modules for complete day-to-day HR operations.'}</p></div>
          <button class="btn ${prem ? 'btn-secondary' : 'btn-premium'} btn-sm" data-action="switch-pkg" data-pkg="${prem ? 'standard' : 'premium'}">${prem ? 'View Standard' : 'Upgrade to Premium'}</button></div>
          <div class="grid grid-3 mt-20">${[['Employees', '128 / 250'], ['Admin seats', prem ? '6 / Unlimited' : '3 / 5'], ['Storage', prem ? '18.4 GB / 500 GB' : '4.1 GB / 25 GB']].map(([k, v]) => `<div class="mini-stat"><div class="k">${k}</div><div class="v" style="font-size:17px">${v}</div></div>`).join('')}</div>
        </div></div>`;
  }

  /* ------------------------------------------------------------------
     PERFORMANCE (Premium)
     ------------------------------------------------------------------ */
  PAGES.performance.render = function () {
    const avg = EMPLOYEES.reduce((a, e) => a + e.perf, 0) / EMPLOYEES.length;
    const due = EMPLOYEES.filter((e) => e.review === 'Not Started' || e.review === 'Overdue').length;
    const goals = EMPLOYEES.reduce((a, e) => a + e.goalsDone, 0) / EMPLOYEES.reduce((a, e) => a + e.goalsTotal, 0);
    const top = EMPLOYEES.filter((e) => e.perf >= 4.5).length;
    const completed = EMPLOYEES.filter((e) => e.review === 'Completed').length;
    return `
      ${pageHeader('Performance Management', 'Q3 2026 review cycle · Track goals, scores and review progress.',
        `<button class="btn btn-secondary" data-action="download-report" data-key="performance">${icon('download', 'sm')} Export</button><button class="btn btn-primary" data-action="new-cycle">${icon('plus', 'sm')} New Review Cycle</button>`)}
      <div class="grid grid-4">
        ${kpi('Average Performance', avg.toFixed(1) + '<small>/ 5.0</small>', 'star', 'premium', `${delta(0.2, '')} vs Q2 2026`)}
        ${kpi('Reviews Due', due, 'clipboard', 'amber', `${EMPLOYEES.filter((e) => e.review === 'Overdue').length} overdue · cycle closes Oct 31`)}
        ${kpi('Goals On Track', Math.round(goals * 100) + '%', 'target', 'green', `${delta(5)} vs last cycle`)}
        ${kpi('Top Performers', top, 'award', 'blue', 'Score of 4.5 or higher')}
      </div>
      <div class="banner premium mt-20">
        <span class="bi">${icon('activity')}</span>
        <div class="grow"><h4>Q3 2026 review cycle is ${Math.round((completed / EMPLOYEES.length) * 100)}% complete</h4><p>${completed} of ${EMPLOYEES.length} reviews submitted. Automated reminders are sent to managers every Monday.</p><div class="progress premium mt-8" style="max-width:420px"><span style="width:${(completed / EMPLOYEES.length) * 100}%"></span></div></div>
        <button class="btn btn-secondary btn-sm" data-action="toast" data-title="Reminders sent" data-msg="${due} managers were nudged to complete reviews (demo).">${icon('send', 'sm')} Remind managers</button>
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-6"><div class="card-header"><div><div class="card-title">Score Distribution</div><div class="card-sub">Number of employees by performance score band</div></div></div><div class="card-body"><div class="chart" id="chPerfDist"></div></div></div>
        <div class="card span-6"><div class="card-header"><div><div class="card-title">Average Score by Department</div><div class="card-sub">Out of 5.0</div></div></div><div class="card-body"><div class="hbar">${DEPT_NAMES.map((d) => { const l = EMPLOYEES.filter((e) => e.dept === d); return [d, l.reduce((a, e) => a + e.perf, 0) / l.length]; }).sort((a, b) => b[1] - a[1]).map(([d, v]) => `<div class="hbar-row"><span class="lbl">${d}</span><span class="track"><span style="width:${(v / 5) * 100}%;background:var(--c3)"></span></span><span class="v">${v.toFixed(2)}</span></div>`).join('')}</div></div></div>
      </div>
      <div class="card mt-20">
        <div class="card-header"><div><div class="card-title">Employee Performance</div><div class="card-sub">Scores, goal progress and review status</div></div></div>
        <div class="toolbar">
          <div class="input-icon">${icon('search', 'sm')}<input class="input" placeholder="Search employee…" data-filter="perf.q" value="${esc(ui.perf.q)}" aria-label="Search performance"></div>
          <select class="select" data-filter="perf.dept" aria-label="Department">${selectOpts([['all', 'All departments'], ...DEPT_NAMES], ui.perf.dept)}</select>
        </div>
        <div id="perfTable"></div>
      </div>`;
  };
  PAGES.performance.refresh = function () {
    const f = ui.perf, q = f.q.trim().toLowerCase();
    const list = EMPLOYEES.filter((e) => (f.dept === 'all' || e.dept === f.dept) && (!q || e.name.toLowerCase().includes(q))).sort((a, b) => b.perf - a.perf);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)); f.page = clamp(f.page, 1, pages);
    const page = list.slice((f.page - 1) * PER_PAGE, f.page * PER_PAGE);
    const tone = (s) => s >= 4.5 ? 'green' : s >= 3.5 ? '' : s >= 3.2 ? 'amber' : 'red';
    $('#perfTable').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Department</th><th style="min-width:200px">Performance Score</th><th style="min-width:160px">Goals</th><th>Review Status</th><th class="num">Action</th></tr></thead><tbody>
      ${page.length ? page.map((e) => `<tr><td>${personCell(e)}</td><td>${esc(e.dept)}</td>
        <td><div class="progress-row"><div class="progress ${tone(e.perf)}"><span style="width:${(e.perf / 5) * 100}%"></span></div><span class="val">${e.perf.toFixed(1)}</span></div></td>
        <td><div class="progress-row"><div class="progress premium"><span style="width:${(e.goalsDone / e.goalsTotal) * 100}%"></span></div><span class="val">${e.goalsDone}/${e.goalsTotal}</span></div></td>
        <td>${pill(e.review)}</td>
        <td class="num">${e.review === 'Not Started' || e.review === 'Overdue' ? `<button class="btn btn-primary btn-xs" data-action="start-review" data-id="${e.id}">${icon('play', 'xs')} Start Review</button>` : `<button class="btn btn-secondary btn-xs" data-action="employee-tab" data-id="${e.id}" data-tab="performance">${icon('eye', 'xs')} View</button>`}</td></tr>`).join('') : emptyRow(6)}
      </tbody></table></div>${pager(list.length, f.page, 'perf')}`;
  };
  PAGES.performance.mount = function () {
    registerChart(() => {
      const bands = [['< 3.0', 0, 3], ['3.0–3.4', 3, 3.5], ['3.5–3.9', 3.5, 4], ['4.0–4.4', 4, 4.5], ['4.5–5.0', 4.5, 5.1]];
      barChart($('#chPerfDist'), { title: 'Score distribution', height: 250, barMax: 46, labels: bands.map((b) => b[0]), series: [{ name: 'Employees', color: 'var(--c3)', data: bands.map((b) => EMPLOYEES.filter((e) => e.perf >= b[1] && e.perf < b[2]).length) }] });
    });
  };

  /* ------------------------------------------------------------------
     RECRUITMENT / ATS (Premium)
     ------------------------------------------------------------------ */
  PAGES.recruitment.render = function () {
    const cnt = (s) => CANDIDATES.filter((c) => c.stage === s).length;
    return `
      ${pageHeader('Recruitment', 'Applicant tracking · Drag candidates between stages to update the pipeline.',
        `<button class="btn btn-secondary" data-action="new-job">${icon('briefcase', 'sm')} Post a Job</button><button class="btn btn-primary" data-action="add-candidate">${icon('user-plus', 'sm')} Add Candidate</button>`)}
      <div class="grid grid-5" id="recKpis">
        ${kpi('Open Positions', JOBS.length, 'briefcase', 'blue', `${JOBS.filter((j) => j.posted <= 7).length} posted this week`)}
        ${kpi('Applicants', JOBS.reduce((a, j) => a + j.applicants, 0), 'users', '', `${delta(18)} vs last month`)}
        ${kpi('Interviews', 18, 'video', 'premium', '6 scheduled this week')}
        ${kpi('Offers', cnt('offer'), 'send', 'amber', '84% acceptance rate')}
        ${kpi('Hired', 7 + cnt('hired') - 2, 'user-check', 'green', 'Quarter to date')}
      </div>
      <div class="card mt-20">
        <div class="card-header"><div><div class="card-title">Hiring Pipeline</div><div class="card-sub">${icon('grip', 'xs')} Drag &amp; drop cards to move candidates · use ••• on touch devices</div></div>
          <select class="select sm" style="width:auto;min-width:220px" data-filter="jobFilter" aria-label="Filter by job">${selectOpts([['all', 'All open positions'], ...JOBS.map((j) => [j.id, j.title])], ui.jobFilter)}</select></div>
        <div class="card-body"><div class="kanban" id="kanban"></div></div>
      </div>
      <div class="card mt-20">
        <div class="card-header bordered"><div><div class="card-title">Open Positions</div><div class="card-sub">Active job postings</div></div></div>
        <div class="table-wrap"><table class="table no-top"><thead><tr><th>Position</th><th>Department</th><th>Location</th><th class="num">Applicants</th><th>Pipeline</th><th>Posted</th><th class="num">Action</th></tr></thead><tbody id="jobBody"></tbody></table></div>
      </div>`;
  };
  PAGES.recruitment.refresh = function () {
    const list = CANDIDATES.filter((c) => ui.jobFilter === 'all' || c.job === ui.jobFilter);
    $('#kanban').innerHTML = STAGES.map((s) => {
      const cs = list.filter((c) => c.stage === s.key);
      return `<div class="kb-col" data-stage="${s.key}"><div class="kb-head"><span class="dot" style="background:${s.color}"></span><b>${s.name}</b><span class="count">${cs.length}</span></div>
        <div class="kb-list">${cs.length ? cs.map((c) => `
          <div class="kb-card ${c.dropped ? 'dropped' : ''}" draggable="true" data-id="${c.id}">
            <div class="dd-wrap more"><button class="icon-btn sm" data-action="dd-toggle" aria-label="Move candidate">${icon('more')}</button>
              <div class="dropdown" style="min-width:170px"><div class="sr-label">Move to</div>${STAGES.filter((x) => x.key !== c.stage).map((x) => `<button class="dd-item" data-action="move-cand" data-id="${c.id}" data-stage="${x.key}"><span class="dot-s" style="background:${x.color}"></span>${x.name}</button>`).join('')}</div></div>
            <div class="top"><span class="avatar sm" style="--av-bg:${c.av[0]};--av-fg:${c.av[1]}">${initials(c.name)}</span><div><div class="nm">${esc(c.name)}</div><div class="rl">${esc(c.role)}</div></div></div>
            <div class="mid"><span class="tag">${esc(c.source)}</span>${s.key === 'interview' ? '<span class="tag blue">Panel · Thu</span>' : ''}${s.key === 'offer' ? '<span class="tag blue">Offer sent</span>' : ''}</div>
            <div class="bot"><span class="stars">${[1, 2, 3, 4, 5].map((n) => icon('star', n <= c.rating ? '' : 'off')).join('')}</span><span>${c.days}d ago</span></div>
          </div>`).join('') : '<div class="kb-empty">Drop candidates here</div>'}</div></div>`;
    }).join('');
    CANDIDATES.forEach((c) => delete c.dropped);
    $('#jobBody').innerHTML = JOBS.map((j) => {
      const n = CANDIDATES.filter((c) => c.job === j.id);
      return `<tr><td><span class="person-name">${esc(j.title)}</span><br><span class="person-sub mono">${j.id}</span></td><td>${j.dept}</td><td class="muted">${j.loc}</td><td class="num strong">${j.applicants}</td>
        <td><div class="avatar-stack">${n.slice(0, 4).map((c) => `<span class="avatar xs" style="--av-bg:${c.av[0]};--av-fg:${c.av[1]}" title="${esc(c.name)}">${initials(c.name)}</span>`).join('')}</div></td>
        <td class="muted">${j.posted} days ago</td><td class="num"><button class="btn btn-secondary btn-xs" data-action="filter-job" data-id="${j.id}">${icon('filter', 'xs')} Pipeline</button></td></tr>`;
    }).join('');
  };
  PAGES.recruitment.mount = function () {
    const board = $('#kanban');
    let dragId = null;
    board.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.kb-card'); if (!card) return;
      dragId = card.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragId); } catch (_) { /* noop */ }
      setTimeout(() => card.classList.add('dragging'), 0);
    });
    board.addEventListener('dragend', (e) => { const card = e.target.closest('.kb-card'); if (card) card.classList.remove('dragging'); $$('.kb-col', board).forEach((c) => c.classList.remove('over')); });
    board.addEventListener('dragover', (e) => {
      const col = e.target.closest('.kb-col'); if (!col || !dragId) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      $$('.kb-col', board).forEach((c) => c.classList.toggle('over', c === col));
    });
    board.addEventListener('dragleave', (e) => { const col = e.target.closest('.kb-col'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('over'); });
    board.addEventListener('drop', (e) => {
      const col = e.target.closest('.kb-col'); if (!col) return;
      e.preventDefault();
      const id = dragId || e.dataTransfer.getData('text/plain');
      dragId = null;
      moveCandidate(id, col.dataset.stage);
    });
  };
  function moveCandidate(id, stage) {
    const c = CANDIDATES.find((x) => x.id === id);
    if (!c || c.stage === stage) { PAGES.recruitment.refresh(); return; }
    c.stage = stage; c.dropped = true; c.days = 0;
    const st = STAGES.find((s) => s.key === stage);
    toast(`Moved to ${st.name}`, `${c.name} · ${c.role}`, stage === 'hired' ? 'success' : 'info');
    logAudit(`Moved candidate ${c.name} to ${st.name}`, 'Recruitment');
    if (stage === 'hired') logActivity('user-check', 'green', `<b>${esc(c.name)}</b> was hired as ${esc(c.role)}`);
    closeDropdowns();
    PAGES.recruitment.refresh();
    const k = $('#recKpis'); if (k) { const cnt = (s) => CANDIDATES.filter((x) => x.stage === s).length; $$('.kpi-value', k)[3].textContent = cnt('offer'); $$('.kpi-value', k)[4].textContent = 7 + cnt('hired') - 2; }
  }

  /* ------------------------------------------------------------------
     AUTOMATION (Premium)
     ------------------------------------------------------------------ */
  PAGES.automation.render = function () {
    const active = WORKFLOWS.filter((w) => w.on).length;
    return `
      ${pageHeader('HR Workflow Automation', 'Automate repetitive HR tasks with trigger-based workflows.',
        `<button class="btn btn-secondary" data-action="toast" data-title="Template gallery" data-msg="24 ready-made workflow templates (demo).">${icon('layers', 'sm')} Templates</button><button class="btn btn-primary" data-action="new-workflow">${icon('plus', 'sm')} Create Workflow</button>`)}
      <div class="grid grid-4">
        ${kpi('Active Workflows', `<span id="wfActive">${active}</span><small>/ ${WORKFLOWS.length}</small>`, 'workflow', 'premium', 'Running in real time')}
        ${kpi('Runs This Month', num(1284), 'zap', 'blue', `${delta(22)} vs September`)}
        ${kpi('Hours Saved', '96<small>hrs</small>', 'clock', 'green', 'Estimated this month')}
        ${kpi('Success Rate', '99.2%', 'check-circle', '', '2 retries · 0 failures')}
      </div>
      <div class="grid grid-2 mt-20" id="wfGrid">${WORKFLOWS.map(wfCard).join('')}</div>
      <div class="card mt-20">
        <div class="card-header bordered"><div><div class="card-title">Recent Runs</div><div class="card-sub">Execution history across all workflows</div></div><span class="pill success">All systems operational</span></div>
        <div class="table-wrap"><table class="table no-top"><thead><tr><th>Time</th><th>Workflow</th><th>Details</th><th>Status</th><th class="num">Duration</th></tr></thead><tbody>
          ${WF_RUNS.map((r) => `<tr><td class="tnum muted">${r[0]}</td><td class="strong">${r[1]}</td><td>${esc(r[2])}</td><td>${pill(r[3])}</td><td class="num mono">${r[4]}</td></tr>`).join('')}
        </tbody></table></div>
      </div>`;
  };
  function wfCard(w) {
    return `
      <div class="card wf-card ${w.on ? '' : 'off'}" data-wf="${w.id}">
        <div class="wf-head"><span class="wi">${icon(w.icon)}</span><div><h4>${esc(w.name)}</h4><p>${esc(w.desc)}</p></div>
          <label class="toggle" title="Turn workflow on/off"><input type="checkbox" ${w.on ? 'checked' : ''} data-action="wf-toggle" data-id="${w.id}" aria-label="Toggle ${esc(w.name)}"><span class="track"></span><span class="thumb"></span></label></div>
        <div class="wf-flow">
          <div class="wf-node trigger"><span class="ni">${icon('zap', 'sm')}</span><div><div class="k">Trigger</div><div class="v">${esc(w.trigger)}</div></div></div>
          <div class="wf-link"></div>
          <div class="wf-node action"><span class="ni">${icon('send', 'sm')}</span><div><div class="k">Action</div><div class="v">${esc(w.action)}</div></div></div>
        </div>
        <div class="wf-foot"><span class="wf-status ${w.on ? 'on' : 'off'}">${icon(w.on ? 'check-circle' : 'pause', 'xs')} ${w.on ? 'Active' : 'Paused'}</span><span>${icon('activity', 'xs')} ${num(w.runs)} runs</span><span>${icon('clock', 'xs')} Last run ${esc(w.last)}</span></div>
      </div>`;
  }

  /* ------------------------------------------------------------------
     ANALYTICS (Premium)
     ------------------------------------------------------------------ */
  const AN = {
    months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    years: ['2025', '2025', '2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026'],
    headcount: [108, 110, 111, 113, 114, 117, 118, 120, 121, 123, 125, 128],
    hires: [3, 4, 2, 3, 2, 4, 3, 3, 2, 3, 3, 4],
    exits: [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    attendance: [93.1, 92.4, 91.8, 93.5, 94.0, 94.6, 93.9, 92.8, 94.4, 95.1, 94.7, 94.2],
    engagement: [76, 77, 77, 78, 79, 79, 80, 81, 81, 82, 82, 82],
    turnover: [10.2, 10.0, 9.8, 9.5, 9.3, 9.1, 9.0, 8.9, 8.8, 8.6, 8.5, 8.4],
    leaveUtil: [48, 52, 39, 41, 44, 47, 51, 63, 68, 60, 57, 61],
    tenure: [3.2, 3.2, 3.3, 3.3, 3.3, 3.4, 3.4, 3.5, 3.5, 3.5, 3.6, 3.6]
  };
  PAGES.analytics.render = function () {
    const pt = payrollTotals();
    const cost = AN.headcount.map((h) => Math.round((pt.total * h) / 128 / 1000));
    const tile = (label, value, d, spark, color, sub) => `<div class="card kpi compact"><div class="kpi-top"><span class="kpi-label">${label}</span>${d}</div><div class="kpi-value">${value}</div><div class="row between" style="align-items:flex-end"><span class="muted" style="font-size:12px">${sub}</span>${sparkline(spark, color, 90, 30)}</div></div>`;
    return `
      ${pageHeader('Workforce Analytics', 'Executive view of growth, retention, engagement and people cost.',
        `<div class="seg"><button class="${ui.anRange === 6 ? 'active' : ''}" data-action="an-range" data-v="6">Last 6 months</button><button class="${ui.anRange === 12 ? 'active' : ''}" data-action="an-range" data-v="12">Last 12 months</button></div><button class="btn btn-secondary" data-action="download-report" data-key="turnover">${icon('download', 'sm')} Export</button>`)}
      <div class="grid grid-4">
        ${tile('Employee Growth', '+18.5%', delta(2.1, ' pts'), AN.headcount, 'var(--c1)', '108 → 128 employees')}
        ${tile('Turnover Rate', '8.4%', delta(-1.8, ' pts', true), AN.turnover, 'var(--c4)', 'Rolling 12 months')}
        ${tile('Attendance Rate', '94.2%', delta(0.6, ' pts'), AN.attendance, 'var(--c2)', 'Company average')}
        ${tile('Employee Engagement', '82<small>/100</small>', delta(6), AN.engagement, 'var(--c3)', 'Pulse survey · Sep')}
      </div>
      <div class="grid grid-3 mt-20">
        ${tile('Leave Utilization', '61%', delta(4, ' pts'), AN.leaveUtil, 'var(--c5)', 'Of annual entitlement used')}
        ${tile('Payroll Cost', moneyK(pt.total), delta(2.8), cost, 'var(--c1)', 'Monthly gross')}
        ${tile('Average Tenure', '3.6<small>yrs</small>', delta(0.4, ' yrs'), AN.tenure, 'var(--c4)', 'Across all employees')}
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-8"><div class="card-header"><div><div class="card-title">Headcount Growth</div><div class="card-sub">Total employees at month end</div></div><span class="pill success no-dot">${icon('trending', 'xs')} +${AN.headcount[11] - AN.headcount[12 - ui.anRange]} in period</span></div><div class="card-body"><div class="chart" id="chHead"></div></div></div>
        <div class="card span-4"><div class="card-header"><div><div class="card-title">Engagement Score</div><div class="card-sub">September pulse survey · 87% response</div></div></div>
          <div class="card-body"><div class="chart" id="chEng" style="width:170px;margin:0 auto 18px"></div>
            <div class="hbar">${[['Manager support', 86], ['Work-life balance', 81], ['Recognition', 79], ['Career growth', 74]].map(([l, v]) => `<div class="hbar-row" style="grid-template-columns:120px 1fr 32px"><span class="lbl">${l}</span><span class="track"><span style="width:${v}%;background:var(--c3)"></span></span><span class="v">${v}</span></div>`).join('')}</div></div></div>
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-6"><div class="card-header"><div><div class="card-title">Hires vs. Exits</div><div class="card-sub">Monthly joiners and leavers</div></div><div class="legend"><span><i style="background:var(--c1)"></i>Hires</span><span><i style="background:var(--c5)"></i>Exits</span></div></div><div class="card-body"><div class="chart" id="chHires"></div></div></div>
        <div class="card span-6"><div class="card-header"><div><div class="card-title">Attendance Rate</div><div class="card-sub">Monthly average, %</div></div></div><div class="card-body"><div class="chart" id="chAttRate"></div></div></div>
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-8"><div class="card-header"><div><div class="card-title">Payroll Cost by Department</div><div class="card-sub">Monthly gross payroll, USD thousands</div></div><div class="legend" id="lgPay"></div></div><div class="card-body"><div class="chart" id="chPay"></div></div></div>
        <div class="card span-4"><div class="card-header"><div><div class="card-title">Leave Utilization</div><div class="card-sub">Days taken by leave type, YTD</div></div></div><div class="card-body"><div class="donut-wrap" style="flex-direction:column;align-items:stretch"><div class="chart" id="chLeave" style="width:170px;margin:0 auto"></div><div class="donut-legend" id="dlLeave"></div></div></div></div>
      </div>
      <div class="grid grid-12 mt-20">
        <div class="card span-6"><div class="card-header"><div><div class="card-title">Average Tenure by Department</div><div class="card-sub">Years of service</div></div></div><div class="card-body"><div class="hbar">${DEPT_NAMES.map((d) => { const l = EMPLOYEES.filter((e) => e.dept === d); return [d, l.reduce((a, e) => a + (TODAY - e.join) / (365.25 * 864e5), 0) / l.length]; }).sort((a, b) => b[1] - a[1]).map(([d, v]) => `<div class="hbar-row"><span class="lbl">${d}</span><span class="track"><span style="width:${(v / 6) * 100}%;background:var(--c4)"></span></span><span class="v">${v.toFixed(1)}y</span></div>`).join('')}</div></div></div>
        <div class="card span-6"><div class="card-header"><div><div class="card-title">Turnover by Department</div><div class="card-sub">Rolling 12-month exit rate</div></div></div><div class="card-body"><div class="hbar">${DEPTS.map((d, i) => [d.name, ([3, 4, 2, 2, 1, 1, 0, 1][i] / d.count) * 100]).sort((a, b) => b[1] - a[1]).map(([d, v]) => `<div class="hbar-row"><span class="lbl">${d}</span><span class="track"><span style="width:${(v / 20) * 100}%;background:${v > 15 ? 'var(--red-500)' : 'var(--c2)'}"></span></span><span class="v">${v.toFixed(1)}%</span></div>`).join('')}</div><p class="muted mt-12" style="font-size:12px">${icon('alert', 'xs')} Sales is above the 15% alert threshold.</p></div></div>
      </div>`;
  };
  PAGES.analytics.mount = function () {
    const n = ui.anRange, sl = (a) => a.slice(12 - n);
    const labels = sl(AN.months), tl = sl(AN.months.map((m, i) => `${m} ${AN.years[i]}`));
    registerChart(() => lineChart($('#chHead'), { title: 'Headcount growth', height: 300, labels, tipLabels: tl, series: [{ name: 'Headcount', color: 'var(--c1)', data: sl(AN.headcount) }] }));
    registerChart(() => barChart($('#chHires'), { title: 'Hires vs exits', height: 230, labels, tipLabels: tl, series: [{ name: 'Hires', color: 'var(--c1)', data: sl(AN.hires) }, { name: 'Exits', color: 'var(--c5)', data: sl(AN.exits) }] }));
    registerChart(() => lineChart($('#chAttRate'), { title: 'Attendance rate', height: 230, labels, tipLabels: tl, min: 90, max: 96, yFmt: (v) => v + '%', tipFmt: (v) => v.toFixed(1) + '%', series: [{ name: 'Attendance', color: 'var(--c2)', data: sl(AN.attendance) }] }));
    const groups = [['Engineering'], ['Sales'], ['Operations'], ['Product'], ['Customer Success', 'Marketing', 'Finance', 'Human Resources']];
    const gNames = ['Engineering', 'Sales', 'Operations', 'Product', 'Other'];
    const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c-other)'];
    const base = groups.map((g) => EMPLOYEES.filter((e) => g.includes(e.dept)).reduce((a, e) => a + e.basic + e.allowances, 0) / 1000);
    const series = gNames.map((nm, k) => ({ name: nm, color: colors[k], data: sl(AN.headcount).map((h) => Math.round((base[k] * h) / 128)) }));
    $('#lgPay').innerHTML = gNames.map((g, k) => `<span><i style="background:${colors[k]}"></i>${g}</span>`).join('');
    registerChart(() => barChart($('#chPay'), { title: 'Payroll cost by department', height: 330, stacked: true, labels, tipLabels: tl, yFmt: (v) => '$' + v + 'K', series }));
    const lv = [['Annual', 1184, 'var(--c1)'], ['Sick', 412, 'var(--c2)'], ['Casual', 389, 'var(--c3)'], ['Parental', 96, 'var(--c4)'], ['Unpaid', 22, 'var(--c-other)']];
    const tot = lv.reduce((a, l) => a + l[1], 0);
    donutChart($('#chLeave'), { size: 170, data: lv.map(([l, v, c]) => ({ label: l + ' leave', value: v, color: c })), center: num(tot), centerLabel: 'Days taken', valueName: 'Days', centerSize: 22 });
    $('#dlLeave').innerHTML = lv.map(([l, v, c]) => `<div class="dl"><i style="background:${c}"></i><span class="name">${l}</span><b>${num(v)}</b><span class="pct">${pct((v / tot) * 100, 0)}</span></div>`).join('');
    donutChart($('#chEng'), { size: 170, thickness: 16, track: true, of: 100, data: [{ label: 'Engagement', value: 82, color: 'var(--c3)' }], center: '82', centerLabel: 'out of 100', valueName: 'Score' });
  };

  /* ------------------------------------------------------------------
     DOCUMENTS (Premium)
     ------------------------------------------------------------------ */
  PAGES.documents.render = function () {
    return `
      ${pageHeader('HR Document Library', 'Securely store, organize and track every HR document.',
        `<button class="btn btn-secondary" data-action="toast" data-title="New folder created" data-msg="Demo: folder “Q4 2026” added.">${icon('folder', 'sm')} New Folder</button><button class="btn btn-primary" data-action="upload-doc">${icon('upload', 'sm')} Upload Document</button>`)}
      <div class="cat-grid" id="docCats"></div>
      <div class="grid grid-12 mt-20">
        <div class="card span-8">
          <div class="toolbar">
            <div class="input-icon">${icon('search', 'sm')}<input class="input" placeholder="Search documents…" data-filter="docQ" value="${esc(ui.docQ)}" aria-label="Search documents"></div>
            <div class="spacer"></div><span class="muted" style="font-size:12.5px" id="docCount"></span>
          </div>
          <div id="docTable"></div>
        </div>
        <div class="span-4 stack">
          <div class="card"><div class="card-header"><div><div class="card-title">Storage</div><div class="card-sub">18.4 GB of 500 GB used</div></div></div><div class="card-body"><div class="progress lg"><span style="width:3.7%"></span></div>
            <div class="mt-12" style="display:grid;gap:8px;font-size:12.5px">${[['Payslips', '9.8 GB', 'var(--c1)'], ['Employee Documents', '5.1 GB', 'var(--c2)'], ['Contracts', '2.4 GB', 'var(--c3)'], ['Other', '1.1 GB', 'var(--c-other)']].map(([l, v, c]) => `<div class="row between"><span class="row" style="gap:8px"><span class="dot-s" style="background:${c}"></span>${l}</span><b>${v}</b></div>`).join('')}</div></div></div>
          <div class="card"><div class="card-header"><div><div class="card-title">Needs Attention</div></div></div><div class="card-body" style="padding-top:6px">
            ${DOCS.filter((d) => d.status === 'Pending Signature' || d.status === 'Expiring Soon').map((d) => `<div class="list-row"><span class="feed-icon ${d.status === 'Expiring Soon' ? 'red' : 'amber'}">${icon(d.status === 'Expiring Soon' ? 'alert' : 'edit')}</span><div class="grow"><div style="font-size:12.5px;font-weight:560;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.name)}</div><div class="muted" style="font-size:11.5px">${d.status}</div></div></div>`).join('')}</div></div>
        </div>
      </div>`;
  };
  PAGES.documents.refresh = function () {
    $('#docCats').innerHTML = DOC_CATS.map((c) => `<button class="cat ${ui.docCat === c.key ? 'active' : ''}" data-action="doc-cat" data-val="${esc(c.key)}"><span class="ci">${icon(c.icon)}</span><div><b>${c.key}</b><span>${num(c.count + DOCS.filter((d) => d.cat === c.key && d.fresh !== undefined).length)} files</span></div></button>`).join('');
    const q = ui.docQ.trim().toLowerCase();
    const list = DOCS.filter((d) => (ui.docCat === 'all' || d.cat === ui.docCat) && (!q || d.name.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q)));
    $('#docCount').textContent = `${list.length} document${list.length === 1 ? '' : 's'}${ui.docCat !== 'all' ? ' in ' + ui.docCat : ''}`;
    $('#docTable').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Document</th><th>Category</th><th>Owner</th><th>Updated</th><th>Status</th><th class="num">Action</th></tr></thead><tbody>
      ${list.length ? list.map((d) => `<tr class="${d.fresh ? 'flash' : ''}"><td><div class="person"><span class="file-ic ${d.type}">${d.type.toUpperCase()}</span><span><span class="person-name" style="white-space:normal">${esc(d.name)}</span><br><span class="person-sub">${d.size}</span></span></div></td><td><span class="tag">${esc(d.cat)}</span></td><td>${esc(d.owner)}</td><td class="tnum muted">${fmtDate(d.updated)}</td><td>${pill(d.status)}</td><td class="num"><button class="btn btn-secondary btn-xs" data-action="view-doc" data-id="${d.id}">${icon('eye', 'xs')} View</button></td></tr>`).join('') : emptyRow(6, 'No documents found')}
      </tbody></table></div>`;
    DOCS.forEach((d) => { if (d.fresh) d.fresh = false; });
  };

  /* ------------------------------------------------------------------
     AUDIT LOGS (Premium)
     ------------------------------------------------------------------ */
  PAGES.audit.render = function () {
    const mods = [...new Set(AUDIT.map((a) => a.module))].sort();
    return `
      ${pageHeader('Audit Logs', 'Tamper-evident record of every action taken in NovaCore HR.',
        `<button class="btn btn-secondary" data-action="export-audit">${icon('download', 'sm')} Export CSV</button>`, ` <span class="pill success" style="margin-left:4px">Live</span>`)}
      <div class="grid grid-4">
        ${kpi('Events (24h)', AUDIT.filter((a) => TODAY - a.time < 864e5 || a.fresh).length, 'activity', 'blue', 'Across 10 modules')}
        ${kpi('Active Users', 6, 'users', '', '4 admins · 2 managers')}
        ${kpi('Failed Actions', AUDIT.filter((a) => a.status === 'Failed').length, 'x-circle', 'red', 'Mostly sign-in attempts')}
        ${kpi('Retention', '7<small>years</small>', 'shield', 'green', 'Compliant log retention')}
      </div>
      <div class="card mt-20">
        <div class="toolbar">
          <div class="input-icon">${icon('search', 'sm')}<input class="input" placeholder="Search user, action or IP…" data-filter="audit.q" value="${esc(ui.audit.q)}" aria-label="Search audit logs"></div>
          <select class="select" data-filter="audit.module" aria-label="Module">${selectOpts([['all', 'All modules'], ...mods], ui.audit.module)}</select>
          <select class="select" data-filter="audit.status" aria-label="Status">${selectOpts([['all', 'All statuses'], 'Success', 'Warning', 'Failed'], ui.audit.status)}</select>
        </div>
        <div id="auditTable"></div>
      </div>`;
  };
  const fmtStamp = (d) => `${iso(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  PAGES.audit.refresh = function () {
    const f = ui.audit, q = f.q.trim().toLowerCase();
    const list = AUDIT.filter((a) => (f.module === 'all' || a.module === f.module) && (f.status === 'all' || a.status === f.status) && (!q || (a.user + ' ' + a.action + ' ' + a.ip).toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)); f.page = clamp(f.page, 1, pages);
    const page = list.slice((f.page - 1) * PER_PAGE, f.page * PER_PAGE);
    $('#auditTable').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>IP Address</th><th>Status</th></tr></thead><tbody>
      ${page.length ? page.map((a) => { const e = empByName(a.user); const avh = a.user === 'System' ? `<span class="avatar sm" style="--av-bg:var(--premium-50);--av-fg:var(--premium)">${icon('zap', 'xs')}</span>` : a.user === 'Alex Morgan' ? '<span class="avatar sm" style="--av-bg:#0f172a;--av-fg:#fff">AM</span>' : av(e || { name: a.user }, 'sm');
        return `<tr class="${a.fresh ? 'flash' : ''}"><td class="mono muted">${fmtStamp(a.time)}</td><td><div class="person">${avh}<span class="person-name">${esc(a.user)}</span></div></td><td class="wrap" style="color:var(--text)">${esc(a.action)}</td><td><span class="tag">${a.module}</span></td><td class="mono">${a.ip}</td><td>${pill(a.status)}</td></tr>`; }).join('') : emptyRow(6)}
      </tbody></table></div>${pager(list.length, f.page, 'audit')}`;
    AUDIT.forEach((a) => { if (a.fresh) a.fresh = false; });
  };

  /* ------------------------------------------------------------------
     EMPLOYEE SELF-SERVICE (Premium)
     ------------------------------------------------------------------ */
  const ME = () => empByName('Emily Johnson');
  PAGES.selfservice.render = function () {
    const e = ME();
    const tabs = [['overview', 'My Profile', 'user'], ['attendance', 'My Attendance', 'clock'], ['leave', 'My Leave', 'calendar'], ['payslips', 'My Payslips', 'receipt'], ['benefits', 'My Benefits', 'heart'], ['documents', 'My Documents', 'folder'], ['requests', 'My Requests', 'inbox']];
    return `
      ${pageHeader('Employee Self-Service', 'Preview of the employee-facing portal — what your team sees on web and mobile.',
        `<button class="btn btn-secondary" data-action="toast" data-title="Portal link copied" data-msg="Demo: https://my.novacore-hr.demo" data-tone="info">${icon('copy', 'sm')} Copy portal link</button>`)}
      <div class="portal">
        <div class="portal-hero">
          <div class="portal-top">
            ${av(e, 'xl')}
            <div><h2>${greeting()}, ${esc(e.first)} 👋</h2><p>${esc(e.position)} · ${esc(e.dept)} · ${esc(e.location)}</p></div>
            <div class="clock" id="essClock"></div>
          </div>
          <div class="portal-tabs">${tabs.map(([k, l, i]) => `<button class="${state.ess === k ? 'active' : ''}" data-action="ess-tab" data-v="${k}">${icon(i)}${l}</button>`).join('')}</div>
        </div>
        <div class="portal-body" id="essBody">${essPanel()}</div>
      </div>`;
  };
  function essClockHTML() {
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return `<div><div class="t">${t}</div><div class="s">${state.clockedIn ? `Clocked in at ${ampm(state.clockIn)}` : 'Not clocked in'}</div></div>
      <button class="btn btn-sm ${state.clockedIn ? 'out' : ''}" data-action="clock">${icon(state.clockedIn ? 'logout' : 'clock', 'sm')} ${state.clockedIn ? 'Clock Out' : 'Clock In'}</button>`;
  }
  function essPanel() {
    const e = ME(), k = state.ess;
    const card = (title, body, extra = '') => `<div class="card"><div class="card-header"><div class="card-title">${title}</div>${extra}</div><div class="card-body">${body}</div></div>`;
    if (k === 'overview') return `
      <div class="quick-grid">
        ${[['calendar', 'Request Leave', `${e.leave.annual} annual days left`, 'ess-leave'], ['receipt', 'Latest Payslip', 'September 2026', 'ess-payslip'], ['dollar', 'Submit Expense', 'Reimbursement claim', 'ess-expense'], ['edit', 'Update Details', 'Address, bank, contacts', 'ess-update']].map(([i, t, s, a]) => `<button class="quick" data-action="${a}"><span class="qi">${icon(i)}</span><div><b>${t}</b><br><span>${s}</span></div></button>`).join('')}
      </div>
      <div class="grid grid-12 mt-20">
        <div class="span-8">${card('Personal Information', `<div class="detail-grid">${[['Full name', e.name], ['Employee ID', e.id], ['Email', e.email], ['Phone', e.phone], ['Manager', e.manager], ['Joining date', fmtDate(e.join)], ['Location', e.location], ['Employment', e.type], ['Emergency contact', 'Mark Johnson (fictional)']].map(([kk, v]) => `<div class="detail"><div class="k">${kk}</div><div class="v">${esc(v)}</div></div>`).join('')}</div>`, `<button class="btn btn-secondary btn-xs" data-action="ess-update">${icon('edit', 'xs')} Edit</button>`)}</div>
        <div class="span-4">${card('Upcoming', [['flag', 'Columbus Day (holiday)', 'Mon, Oct 12'], ['calendar', 'Annual leave — pending', 'Oct 19 – Oct 23'], ['wallet', 'Payday', 'Fri, Oct 30'], ['target', 'Q3 self-review due', 'Oct 31']].map(([i, t, d]) => `<div class="list-row"><span class="feed-icon blue">${icon(i)}</span><div class="grow"><div style="font-size:13px;font-weight:560">${t}</div><div class="muted" style="font-size:12px">${d}</div></div></div>`).join(''))}</div>
      </div>
      <div class="mt-20">${card('Announcements', `<div class="feed">${[['sparkles', 'premium', '<b>Open enrollment</b> for the Wellness Program starts Oct 12.', '2 days ago'], ['building', 'blue', 'The Austin office kitchen renovation finishes this Friday.', '4 days ago']].map(([i, t, x, d]) => `<div class="feed-item"><span class="feed-icon ${t}">${icon(i)}</span><div><div class="feed-text">${x}</div><div class="feed-time">${d}</div></div></div>`).join('')}</div>`)}</div>`;
    if (k === 'attendance') {
      const r = mulberry32(55);
      return `<div class="grid grid-3">${[['This month', '96.8%', 'Attendance rate'], ['Avg. check-in', '08:49 AM', 'Last 30 days'], ['Hours this week', '25h 40m', 'of 40h target']].map(([a, b, c]) => `<div class="card kpi compact"><span class="kpi-label">${a}</span><div class="kpi-value">${b}</div><span class="muted" style="font-size:12px">${c}</span></div>`).join('')}</div>
        <div class="mt-20">${card('Recent Check-ins', `<div class="table-wrap"><table class="table no-top" style="min-width:520px"><thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead><tbody>${ATT_DATES.map((d, i) => { const cin = 8 * 60 + 35 + Math.floor(r() * 30); const late = cin > 9 * 60 + 5; const cout = i === 0 ? null : 17 * 60 + 20 + Math.floor(r() * 50); return `<tr><td class="tnum">${DAYS[d.getDay()]}, ${fmtShort(d)}</td><td class="tnum">${i === 0 ? ampm(state.clockIn) : ampm(cin)}</td><td class="tnum">${cout ? ampm(cout) : '—'}</td><td class="tnum">${cout ? `${Math.floor((cout - cin - 45) / 60)}h ${String((cout - cin - 45) % 60).padStart(2, '0')}m` : 'In progress'}</td><td>${pill(i === 0 ? 'Present' : late ? 'Late' : 'Present')}</td></tr>`; }).join('')}</tbody></table></div>`)}</div>`;
    }
    if (k === 'leave') return `
      <div class="grid grid-3">${[['Annual', e.leave.annual, 20, 'var(--primary)'], ['Sick', e.leave.sick, 10, 'var(--red-500)'], ['Casual', e.leave.casual, 6, 'var(--amber-500)']].map(([t, v, m, c]) => `<div class="card"><div class="card-body balance-row"><div class="ring">${ring(v, m, c)}<div class="rv"><div><b>${v}</b><span>of ${m}</span></div></div></div><div><b style="font-size:15px">${t} Leave</b><p class="muted" style="font-size:12.5px">${m - v} days used this year</p><button class="link-btn mt-8" data-action="ess-leave" data-type="${t} Leave">Request ${icon('arrow-right')}</button></div></div></div>`).join('')}</div>
      <div class="mt-20">${card('My Leave History', LEAVES.filter((l) => l.emp === e).concat([{ type: 'Annual Leave', start: new Date(2026, 6, 6), end: new Date(2026, 6, 10), days: 5, status: 'Approved' }, { type: 'Sick Leave', start: new Date(2026, 3, 14), end: new Date(2026, 3, 14), days: 1, status: 'Approved' }]).map((l) => `<div class="list-row"><span class="feed-icon blue">${icon('calendar')}</span><div class="grow"><b style="font-size:13px">${l.type}</b><div class="muted" style="font-size:12px">${fmtShort(l.start)}${l.days > 1 ? ' – ' + fmtShort(l.end) : ''}, ${l.start.getFullYear()} · ${l.days} day${l.days > 1 ? 's' : ''}</div></div>${pill(l.status)}</div>`).join(''), `<button class="btn btn-primary btn-xs" data-action="ess-leave">${icon('plus', 'xs')} New request</button>`)}</div>`;
    if (k === 'payslips') return card('My Payslips', `<div class="table-wrap"><table class="table no-top" style="min-width:520px"><thead><tr><th>Period</th><th>Pay Date</th><th class="num">Gross</th><th class="num">Net Pay</th><th class="num">Action</th></tr></thead><tbody>${['September', 'August', 'July', 'June', 'May', 'April'].map((m, i) => `<tr><td class="strong">${m} 2026</td><td class="tnum muted">${['Sep 30', 'Aug 28', 'Jul 31', 'Jun 30', 'May 29', 'Apr 30'][i]}, 2026</td><td class="num">${money(e.basic + e.allowances)}</td><td class="num strong">${money(e.net)}</td><td class="num"><button class="btn btn-secondary btn-xs" data-action="payslip" data-id="${e.id}">${icon('eye', 'xs')} View</button></td></tr>`).join('')}</tbody></table></div>`, `<span class="muted" style="font-size:12.5px">YTD net: <b style="color:var(--text)">${money(e.net * 9)}</b></span>`);
    if (k === 'benefits') return `<div class="grid grid-2">${BENEFITS.slice(0, 6).map((b, i) => `<div class="card"><div class="card-body row" style="gap:14px"><span class="kpi-icon blue" style="width:42px;height:42px">${icon(b.icon)}</span><div class="grow"><b style="font-size:14px">${b.name}</b><div class="muted" style="font-size:12.5px">${esc(b.provider)}</div></div>${i === 4 ? `<button class="btn btn-secondary btn-xs" data-action="toast" data-title="Enrollment requested" data-msg="HR will confirm your ${b.name} enrollment (demo).">Enroll</button>` : pill('Enrolled', 'success')}</div></div>`).join('')}</div>`;
    if (k === 'documents') return card('My Documents', [['Employment Contract.pdf', 'Contracts', 'pdf', 'Signed'], ['Offer Letter.pdf', 'Contracts', 'pdf', 'Signed'], ['ID Verification.jpg', 'Identity', 'img', 'Verified'], ['Tax Form W-4 (2026).pdf', 'Tax', 'pdf', 'Verified'], ['Benefits Enrollment Confirmation.pdf', 'Benefits', 'pdf', 'Published']].map(([n, c, t, s]) => `<div class="list-row"><span class="file-ic ${t}">${t.toUpperCase()}</span><div class="grow"><b style="font-size:13px">${n}</b><div class="muted" style="font-size:12px">${c}</div></div>${pill(s)}<button class="icon-btn sm" data-action="toast" data-title="Download started" data-msg="${n} (demo file)" aria-label="Download">${icon('download')}</button></div>`).join(''), `<button class="btn btn-secondary btn-xs" data-action="upload-doc">${icon('upload', 'xs')} Upload</button>`);
    return card('My Requests', `<div class="table-wrap"><table class="table no-top" style="min-width:520px"><thead><tr><th>Request</th><th>Type</th><th>Details</th><th>Submitted</th><th>Status</th></tr></thead><tbody>${state.myRequests.map((r) => `<tr class="${r.fresh ? 'flash' : ''}"><td class="mono">${r.id}</td><td class="strong">${esc(r.type)}</td><td>${esc(r.detail)}</td><td class="muted">${r.date}</td><td>${pill(r.status, r.status === 'Completed' ? 'success' : undefined)}</td></tr>`).join('')}</tbody></table></div>`, `<button class="btn btn-primary btn-xs" data-action="ess-new-request">${icon('plus', 'xs')} New request</button>`);
  }
  PAGES.selfservice.mount = function () {
    const tick = () => { const c = $('#essClock'); if (c) c.innerHTML = essClockHTML(); };
    tick();
    clearInterval(state.essTimer);
    state.essTimer = setInterval(() => { if (!$('#essClock')) { clearInterval(state.essTimer); return; } tick(); }, 15000);
  };

  /* ------------------------------------------------------------------
     Forms & dialogs
     ------------------------------------------------------------------ */
  function formModal({ title, sub, fields, submit, size = 'md', onSubmit }) {
    const f = (x) => {
      const id = 'f_' + x.name;
      let ctl;
      if (x.type === 'select') ctl = `<select class="select" id="${id}" name="${x.name}">${selectOpts(x.options, x.value)}</select>`;
      else if (x.type === 'textarea') ctl = `<textarea class="textarea" id="${id}" name="${x.name}" placeholder="${esc(x.placeholder || '')}">${esc(x.value || '')}</textarea>`;
      else ctl = `<input class="input" id="${id}" name="${x.name}" type="${x.type || 'text'}" value="${esc(x.value || '')}" placeholder="${esc(x.placeholder || '')}" ${x.required ? 'required' : ''} ${x.autofocus ? 'autofocus' : ''} ${x.min ? `min="${x.min}"` : ''}>`;
      return `<div class="field ${x.span ? 'span-2' : ''}"><label for="${id}">${x.label}</label>${ctl}${x.hint ? `<span class="hint">${x.hint}</span>` : ''}</div>`;
    };
    openModal(`<form id="dlgForm" novalidate>${modalHead(title, sub)}<div class="modal-body"><div class="form-grid">${fields.map(f).join('')}</div></div>
      <div class="modal-foot"><span class="left">${icon('info', 'sm')} Demo form — nothing is saved to a server</span><button type="button" class="btn btn-secondary btn-sm" data-close>Cancel</button><button type="submit" class="btn btn-primary btn-sm">${submit}</button></div></form>`, size, (m) => {
      $('#dlgForm', m).addEventListener('submit', (ev) => {
        ev.preventDefault();
        const data = Object.fromEntries(new FormData(ev.target).entries());
        const missing = fields.filter((x) => x.required && !String(data[x.name] || '').trim());
        if (missing.length) {
          missing.forEach((x) => { const el = $('#f_' + x.name, m); el.style.borderColor = 'var(--red-500)'; el.addEventListener('input', () => (el.style.borderColor = ''), { once: true }); });
          $('#f_' + missing[0].name, m).focus();
          return;
        }
        if (onSubmit(data) !== false) closeModal();
      });
    });
  }

  function addEmployee() {
    const d = DEPTS[0];
    formModal({
      title: 'Add Employee', sub: 'Create a new employee record (demo)', submit: `${icon('user-plus', 'sm')} Create Employee`,
      fields: [
        { name: 'first', label: 'First name', required: true, autofocus: true, placeholder: 'e.g. Jordan' },
        { name: 'last', label: 'Last name', required: true, placeholder: 'e.g. Ellis' },
        { name: 'dept', label: 'Department', type: 'select', options: DEPT_NAMES, value: d.name },
        { name: 'position', label: 'Position', placeholder: 'e.g. Software Engineer', value: '' },
        { name: 'join', label: 'Joining date', type: 'date', value: iso(addDays(TODAY, 7)) },
        { name: 'type', label: 'Employment type', type: 'select', options: ['Full-time', 'Part-time', 'Contract'], value: 'Full-time' },
        { name: 'email', label: 'Work email', placeholder: 'auto-generated if left blank', span: true }
      ],
      onSubmit: (v) => {
        const first = v.first.trim(), last = v.last.trim(), name = `${first} ${last}`;
        const dept = DEPTS.find((x) => x.name === v.dept);
        const position = v.position.trim() || dept.positions[0][0];
        const basic = (dept.positions.find((p) => p[0] === position) || dept.positions[0])[1];
        const allowances = Math.round(basic * 0.1), tax = Math.round((basic + allowances) * 0.16), pension = Math.round(basic * 0.05);
        const e = {
          id: 'NC-' + (1001 + EMPLOYEES.length), name, first, last, dept: dept.name, position, status: 'Probation', join: new Date((v.join || iso(TODAY)) + 'T00:00:00'),
          email: (v.email.trim() || `${first}.${last}@novacore-demo.com`).toLowerCase().replace(/\s+/g, ''), phone: '+1 (555) 0100-0000', location: 'Austin HQ', manager: dept.lead, type: v.type,
          basic, allowances, tax, benefitsDed: 250, pension, deductions: tax + 250 + pension, net: basic + allowances - tax - 250 - pension, payStatus: 'Pending',
          attendance: 100, leave: { annual: 20, sick: 10, casual: 6 }, perf: 3.5, goalsTotal: 3, goalsDone: 0, review: 'Not Started', av: AV_COLORS[EMPLOYEES.length % AV_COLORS.length], fresh: true
        };
        EMPLOYEES.unshift(e);
        logActivity('user-plus', 'green', `<b>${esc(name)}</b> was added to ${esc(dept.name)} as ${esc(position)}`);
        logAudit(`Created employee record ${e.id}`, 'Employees');
        if (isPrem() && WORKFLOWS.find((w) => w.id === 'wf2').on) setTimeout(() => toast('Automation ran: Employee Onboarding', `Checklist created for ${first}`, 'info'), 900);
        toast('Employee created', `${name} · ${e.id}`);
        Object.assign(ui.emp, { q: '', dept: 'all', status: 'all', page: 1 });
        if (state.page !== 'employees') navigate('employees'); else render();
      }
    });
  }

  function newLeave(prefill = {}) {
    const actives = EMPLOYEES.filter((e) => e.status !== 'On Leave').slice(0, 40);
    formModal({
      title: prefill.self ? 'Request Leave' : 'New Leave Request', sub: prefill.self ? 'Your manager will be notified automatically' : 'Submit a leave request on behalf of an employee', submit: `${icon('send', 'sm')} Submit Request`,
      fields: [
        ...(prefill.self ? [] : [{ name: 'emp', label: 'Employee', type: 'select', options: actives.map((e) => [e.id, `${e.name} — ${e.dept}`]), value: actives[0].id, span: true }]),
        { name: 'type', label: 'Leave type', type: 'select', options: ['Annual Leave', 'Sick Leave', 'Casual Leave'], value: prefill.type || 'Annual Leave' },
        { name: 'days', label: 'Duration (working days)', type: 'number', value: '2', min: 1, required: true },
        { name: 'start', label: 'Start date', type: 'date', value: iso(addDays(TODAY, 14)), required: true, span: true },
        { name: 'reason', label: 'Reason', type: 'textarea', placeholder: 'Brief reason for the request', span: true, required: true }
      ],
      onSubmit: (v) => {
        const emp = prefill.self ? ME() : empById(v.emp);
        const days = clamp(parseInt(v.days, 10) || 1, 1, 30);
        const l = mkLeave(emp, v.type, v.start, days, v.reason.trim(), 'Pending');
        l.submitted = TODAY;
        LEAVES.unshift(l);
        if (prefill.self) {
          state.myRequests.unshift({ id: 'RQ-' + (312 + state.myRequests.length), type: v.type, detail: `${fmtShort(l.start)} – ${fmtShort(l.end)} · ${days} day${days > 1 ? 's' : ''}`, status: 'Pending', date: 'Today', fresh: true });
          state.ess = 'requests';
        }
        NOTIFS.unshift({ id: Date.now(), icon: 'calendar', tone: 'amber', text: `<b>${esc(emp.name)}</b> requested ${days} day${days > 1 ? 's' : ''} of ${esc(v.type)}`, time: 'Just now', unread: true, page: 'leave' });
        logAudit(`Submitted leave request ${l.id}`, 'Leave');
        toast('Leave request submitted', `${emp.name} · ${v.type} · ${days} day${days > 1 ? 's' : ''}`);
        if (isPrem() && WORKFLOWS.find((w) => w.id === 'wf1').on) setTimeout(() => toast('Automation ran: Leave Request Notification', `Manager ${emp.manager} was notified`, 'info'), 900);
        updateBadges(); renderNotifs();
        ui.leaveTab = 'Pending';
        rerender();
      }
    });
  }

  function openPremiumModal(feature) {
    const page = Object.keys(PAGES).find((k) => PAGES[k].label === feature);
    const meta = page ? PAGES[page] : null;
    const desc = meta ? meta.blurb : {
      'Advanced Reports': 'Turnover, cost analysis, performance distribution and hiring funnel reports.',
      'Scheduled Reports': 'Deliver reports to stakeholders automatically on any schedule.',
      'Custom Roles & Permissions': 'Create unlimited roles and fine-tune access to every module.',
      Notifications: 'Smart, automated notifications delivered in-app, by email, Slack or Teams.',
      'Audit Logs': 'A complete, searchable record of every change made in your HR system.'
    }[feature] || 'Advanced capabilities for scaling HR teams.';
    openModal(`
      <div class="pm-hero"><button class="icon-btn sm modal-close" data-close aria-label="Close" style="position:absolute;top:16px;right:18px">${icon('x')}</button>
        <div class="pm-icon">${icon(meta ? meta.icon : 'sparkles')}</div>
        <span class="premium-badge" style="margin-bottom:10px">${icon('crown')}Premium Feature</span>
        <h3>Premium Feature</h3>
        <p>This capability is available in the Premium HRM package.</p>
      </div>
      <div class="pm-feature"><span class="feed-icon">${icon(meta ? meta.icon : 'sparkles')}</span><div><b>${esc(feature)}</b><span>${esc(desc)}</span></div></div>
      <ul class="pm-list">${['Performance Management', 'Recruitment / ATS', 'HR Workflow Automation', 'Advanced Analytics', 'Document Management', 'Audit Logs', 'Employee Self-Service', 'Custom Roles & Permissions'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
      <div class="pm-actions"><button class="btn btn-secondary" data-close>Maybe later</button><button class="btn btn-premium" data-action="explore-premium" data-page="${page || ''}">${icon('sparkles', 'sm')} Explore Premium</button></div>`, 'sm');
  }

  /* ------------------------------------------------------------------
     Shell: sidebar, top bar, notifications, search
     ------------------------------------------------------------------ */
  function renderSidebar() {
    const prem = isPrem();
    const pend = pendingLeaves().length;
    const item = (k) => {
      const p = PAGES[k];
      const locked = p.tier === 'premium' && !prem;
      const badge = k === 'leave' && pend ? `<span class="nav-badge">${pend}</span>` : k === 'recruitment' && prem ? `<span class="nav-badge muted-b">${CANDIDATES.filter((c) => c.stage !== 'hired').length}</span>` : '';
      return `<button class="nav-item ${state.page === k ? 'active' : ''} ${locked ? 'locked' : ''}" data-action="${locked ? 'premium' : 'nav'}" data-page="${k}" data-feature="${esc(p.label)}" ${locked ? 'title="Available in Premium"' : ''}>${icon(p.icon)}<span>${p.label}</span>${locked ? icon('lock', 'lock') : badge}</button>`;
    };
    const keys = (g) => Object.keys(PAGES).filter((k) => PAGES[k].group === g);
    $('#sbNav').innerHTML = `
      <div class="sb-label">Core HR</div>${keys('main').map(item).join('')}
      <div class="sb-label">${prem ? 'Advanced' : 'Premium modules'} <span class="premium-badge">${icon(prem ? 'sparkles' : 'lock')}${prem ? 'Premium' : 'Locked'}</span></div>${keys('premium').map(item).join('')}
      <div class="sb-label">System</div>${keys('system').map(item).join('')}`;
    $('#sbPlan').innerHTML = `<div class="sb-plan ${prem ? 'premium' : ''}"><span class="pi">${icon(prem ? 'sparkles' : 'layers', 'sm')}</span><div><b>${prem ? 'Premium HRM' : 'Standard HRM'}</b><span>${COMPANY}</span></div></div>`;
    $('#sbFoot').innerHTML = prem
      ? `<div class="sb-user"><span class="avatar sm" style="--av-bg:#1e293b;--av-fg:#fff">AM</span><div><b>Alex Morgan</b><span>HR Administrator</span></div></div>`
      : `<div class="upgrade-card"><b>${icon('sparkles', 'sm')} Upgrade to Premium</b><p>Unlock 7 advanced modules including automation, ATS and analytics.</p><button class="btn btn-premium btn-sm" data-action="explore-premium">Explore Premium</button></div>`;
  }
  function renderSwitch() {
    const sw = $('#pkgSwitch'), btns = $$('button', sw), th = $('.thumb', sw);
    btns.forEach((b) => b.classList.toggle('active', b.dataset.pkg === state.pkg));
    const a = btns.find((b) => b.dataset.pkg === state.pkg);
    requestAnimationFrame(() => { th.style.width = a.offsetWidth + 'px'; th.style.transform = `translateX(${a.offsetLeft - 3}px)`; });
    $('#footPkg').textContent = isPrem() ? 'Premium' : 'Standard';
  }
  function updateBadges() {
    if (!$('#app').classList.contains('hidden')) renderSidebar();
    $('#notifDot').style.display = NOTIFS.some((n) => n.unread && (isPrem() || !n.premium)) ? '' : 'none';
  }
  function renderNotifs() {
    const list = NOTIFS.filter((n) => isPrem() || !n.premium);
    const shown = ui.notifTab === 'unread' ? list.filter((n) => n.unread) : list;
    const unread = list.filter((n) => n.unread).length;
    $('#notifPanel').innerHTML = `
      <div class="np-head"><b>Notifications</b><button class="link-btn" data-action="mark-read">${icon('check', 'xs')} Mark all as read</button></div>
      <div class="tabs np-tabs"><button class="tab ${ui.notifTab === 'all' ? 'active' : ''}" data-action="notif-tab" data-v="all">All <span class="count">${list.length}</span></button><button class="tab ${ui.notifTab === 'unread' ? 'active' : ''}" data-action="notif-tab" data-v="unread">Unread <span class="count">${unread}</span></button></div>
      <div class="np-list">${shown.length ? shown.map((n) => `<button class="np-item ${n.unread ? 'unread' : ''}" data-action="notif-open" data-id="${n.id}"><span class="feed-icon ${n.tone}">${icon(n.icon)}</span><div><div class="feed-text">${n.text}</div><div class="feed-time">${n.time}${n.premium ? ' · <span style="color:var(--premium)">Automated</span>' : ''}</div></div></button>`).join('') : `<div class="sr-empty">${icon('check-circle')}<div class="mt-8">You're all caught up</div></div>`}</div>
      <div class="np-foot">${isPrem() ? `<button class="btn btn-ghost btn-sm btn-block" data-action="nav" data-page="settings" data-settings="notifications">${icon('settings', 'sm')} Notification settings</button>` : `<button class="btn btn-ghost btn-sm btn-block" data-action="premium" data-feature="Notifications">${icon('sparkles', 'sm')} Smart notifications in Premium</button>`}</div>`;
    updateBadges();
  }
  function renderProfileMenu() {
    $('#profileMenu').innerHTML = `
      <div class="dd-head"><b>Alex Morgan</b><span>alex.morgan@novacore-demo.com</span></div><div class="dd-sep"></div>
      <button class="dd-item" data-action="nav" data-page="settings" data-settings="general">${icon('user')} Account settings</button>
      <button class="dd-item" data-action="nav" data-page="settings" data-settings="plan">${icon('card')} Plan &amp; billing</button>
      <button class="dd-item" data-action="switch-pkg" data-pkg="${isPrem() ? 'standard' : 'premium'}">${icon(isPrem() ? 'layers' : 'sparkles')} Switch to ${isPrem() ? 'Standard' : 'Premium'}</button>
      <div class="dd-sep"></div>
      <button class="dd-item" data-action="go-landing">${icon('grid')} Back to packages</button>
      <button class="dd-item danger" data-action="go-landing" data-signout="1">${icon('logout')} Sign out</button>`;
  }

  // Global search
  const searchInput = $('#searchInput'), searchResults = $('#searchResults');
  let srIndex = -1;
  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('open'); return; }
    const emps = EMPLOYEES.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.position.toLowerCase().includes(q)).slice(0, 6);
    const mods = Object.keys(PAGES).filter((k) => PAGES[k].label.toLowerCase().includes(q));
    let html = '';
    if (emps.length) html += '<div class="sr-label">Employees</div>' + emps.map((e) => `<button class="sr-item" data-action="employee" data-id="${e.id}">${av(e, 'sm')}<div><b>${esc(e.name)}</b><span>${esc(e.position)} · ${e.id}</span></div></button>`).join('');
    if (mods.length) html += '<div class="sr-label">Modules</div>' + mods.map((k) => { const locked = PAGES[k].tier === 'premium' && !isPrem(); return `<button class="sr-item" data-action="${locked ? 'premium' : 'nav'}" data-page="${k}" data-feature="${esc(PAGES[k].label)}"><span class="sr-ic">${icon(PAGES[k].icon)}</span><div><b>${PAGES[k].label}</b><span>Go to module</span></div>${locked ? `<span class="premium-badge">${icon('lock')}Premium</span>` : ''}</button>`; }).join('');
    searchResults.innerHTML = html || `<div class="sr-empty">No results for “${esc(searchInput.value)}”</div>`;
    searchResults.classList.add('open');
    srIndex = -1;
  }
  searchInput.addEventListener('input', debounce(runSearch, 80));
  searchInput.addEventListener('focus', runSearch);
  searchInput.addEventListener('keydown', (e) => {
    const items = $$('.sr-item', searchResults);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      srIndex = clamp(srIndex + (e.key === 'ArrowDown' ? 1 : -1), 0, items.length - 1);
      items.forEach((it, i) => it.classList.toggle('hl', i === srIndex));
    } else if (e.key === 'Enter' && items.length) {
      e.preventDefault(); (items[srIndex] || items[0]).click();
    } else if (e.key === 'Escape') { searchInput.blur(); searchResults.classList.remove('open'); }
  });
  function clearSearch() { searchInput.value = ''; searchResults.classList.remove('open'); $('#globalSearch').classList.remove('mobile-open'); }

  // Mobile sidebar
  function openSidebar() { $('#sidebar').classList.add('open'); $('#overlay').classList.add('show'); }
  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); }
  $('#menuBtn').addEventListener('click', openSidebar);
  $('#sbClose').addEventListener('click', closeSidebar);
  $('#overlay').addEventListener('click', closeSidebar);
  $('#searchToggle').addEventListener('click', (e) => { e.stopPropagation(); $('#globalSearch').classList.add('mobile-open'); searchInput.focus(); });
  searchInput.addEventListener('blur', () => setTimeout(() => { if (!searchInput.value) $('#globalSearch').classList.remove('mobile-open'); }, 150));

  $('#notifBtn').addEventListener('click', (e) => { e.stopPropagation(); const p = $('#notifPanel'); closeDropdowns(p); renderNotifs(); p.classList.toggle('open'); });
  $('#profileBtn').addEventListener('click', (e) => { e.stopPropagation(); const p = $('#profileMenu'); closeDropdowns(p); renderProfileMenu(); p.classList.toggle('open'); });
  $$('#pkgSwitch button').forEach((b) => b.addEventListener('click', () => switchPackage(b.dataset.pkg)));

  /* ------------------------------------------------------------------
     Router
     ------------------------------------------------------------------ */
  let route = location.hash;
  function setRoute(h, replace) {
    route = h;
    try { history[replace ? 'replaceState' : 'pushState'](null, '', h); } catch (_) { /* sandboxed host: keep route in memory */ }
  }
  function go(h) { setRoute(h); onRoute(); }
  function navigate(page, pkg = state.pkg) { go(`#/${pkg}/${page}`); }
  function switchPackage(pkg) {
    if (pkg === state.pkg) return;
    const target = PAGES[state.page].tier === 'premium' && pkg === 'standard' ? 'dashboard' : state.page;
    toast(pkg === 'premium' ? 'Premium HRM activated' : 'Standard HRM activated', pkg === 'premium' ? '7 advanced modules unlocked' : 'Showing the 8 core HR modules', pkg === 'premium' ? 'success' : 'info');
    navigate(target, pkg);
  }
  function parseHash() {
    const m = route.match(/^#\/?(standard|premium)(?:[\/-]([\w]+))?$/);
    return m ? { pkg: m[1], page: PAGES[m[2]] ? m[2] : 'dashboard' } : null;
  }
  function onRoute() {
    const r = parseHash();
    if (!r) { showLanding(); return; }
    if (r.pkg === 'standard' && PAGES[r.page].tier === 'premium') {
      const back = state.pkg === 'standard' && PAGES[state.page].tier !== 'premium' && !$('#app').classList.contains('hidden') ? state.page : 'dashboard';
      openPremiumModal(PAGES[r.page].label);
      setRoute(`#/standard/${back}`, true);
      r.page = back;
    }
    const pkgChanged = r.pkg !== state.pkg;
    state.pkg = r.pkg; state.page = r.page;
    showApp();
    render();
    if (pkgChanged) renderNotifs();
  }
  function showLanding() {
    $('#app').classList.add('hidden');
    $('#landing').classList.remove('hidden');
    closeModal();
    document.title = 'NovaCore HR — HR Management Platform (Demo)';
  }
  function showApp() {
    if ($('#app').classList.contains('hidden')) {
      $('#landing').classList.add('hidden');
      $('#app').classList.remove('hidden');
      window.scrollTo(0, 0);
    }
  }

  function render(opts = {}) {
    charts.length = 0;
    hideTip();
    closeDropdowns();
    closeSidebar();
    clearSearch();
    const p = PAGES[state.page];
    const view = $('#view');
    view.innerHTML = `<div class="page ${opts.quiet ? '' : ''}" ${opts.quiet ? 'style="animation:none"' : ''}>${p.render()}</div>`;
    if (p.refresh) p.refresh();
    if (p.mount) p.mount();
    renderSidebar();
    renderSwitch();
    updateBadges();
    document.title = `${p.label} · NovaCore HR ${isPrem() ? 'Premium' : 'Standard'} (Demo)`;
    if (!opts.quiet) window.scrollTo(0, 0);
  }
  function rerender() {
    const p = PAGES[state.page];
    if (p.refresh && !p.mount && state.page !== 'dashboard') { p.refresh(); renderSidebar(); }
    else { const y = window.scrollY; render({ quiet: true }); window.scrollTo(0, y); }
  }

  /* ------------------------------------------------------------------
     Actions (event delegation)
     ------------------------------------------------------------------ */
  function setUi(path, val) {
    const parts = path.split('.');
    if (parts.length === 2) { ui[parts[0]][parts[1]] = val; if ('page' in ui[parts[0]]) ui[parts[0]].page = 1; }
    else ui[path] = val;
  }
  function refreshPage() { const p = PAGES[state.page]; if (p.refresh) p.refresh(); }

  const ACTIONS = {
    nav: (el) => {
      if (el.dataset.settings) ui.settingsTab = el.dataset.settings;
      closeModal(); clearSearch();
      if (route === `#/${state.pkg}/${el.dataset.page}`) render(); else navigate(el.dataset.page);
    },
    'nav-filter': (el) => { setUi(el.dataset.key, el.dataset.val); navigate(el.dataset.page); },
    premium: (el) => { clearSearch(); closeDropdowns(); closeSidebar(); openPremiumModal(el.dataset.feature || 'Premium HRM'); },
    'explore-premium': (el) => {
      closeModal();
      const page = el.dataset.page && PAGES[el.dataset.page] ? el.dataset.page : state.page;
      if (!isPrem()) toast('Premium HRM activated', '7 advanced modules unlocked', 'success');
      navigate(page, 'premium');
    },
    'switch-pkg': (el) => { closeModal(); closeDropdowns(); switchPackage(el.dataset.pkg); },
    'go-landing': (el) => { closeDropdowns(); if (el.dataset.signout) toast('Signed out', 'Demo session ended', 'info'); go('#/'); window.scrollTo(0, 0); },
    employee: (el) => { clearSearch(); openEmployee(el.dataset.id); },
    'employee-tab': (el) => openEmployee(el.dataset.id, el.dataset.tab),
    payslip: (el) => openPayslip(el.dataset.id),
    approve: (el) => decideLeave(el.dataset.id, true),
    reject: (el) => decideLeave(el.dataset.id, false),
    set: (el) => { setUi(el.dataset.key, el.dataset.val); if (el.dataset.full) rerenderQuiet(); else refreshPage(); },
    page: (el) => { const k = el.dataset.key; ui[k].page = +el.dataset.p; refreshPage(); },
    'att-range': (el) => { ui.attRange = el.dataset.v; rerenderQuiet(); },
    'an-range': (el) => { ui.anRange = +el.dataset.v; rerenderQuiet(); },
    toast: (el) => toast(el.dataset.title, el.dataset.msg || '', el.dataset.tone || 'success'),
    print: () => window.print(),

    'export-summary': () => downloadCSV('novacore-dashboard-summary-demo.csv', [['Metric', 'Value'], ['Total Employees', EMPLOYEES.length], ['Present Today', attCounts(attendanceFor(0)).present], ['On Leave', attCounts(attendanceFor(0)).leave], ['Pending Requests', pendingLeaves().length], ['Monthly Payroll (gross)', payrollTotals().total], ...deptCounts().map((d) => ['Headcount — ' + d.name, d.value])]),
    'export-employees': () => downloadCSV('novacore-employees-demo.csv', [['Employee', 'Employee ID', 'Department', 'Position', 'Status', 'Joining Date'], ...filteredEmployees().map((e) => [e.name, e.id, e.dept, e.position, e.status, iso(e.join)])]),
    'export-attendance': () => downloadReport('attendance'),
    'export-payroll': () => downloadReport('payroll'),
    'export-benefits': () => downloadCSV('novacore-benefits-demo.csv', [['Benefit', 'Provider', 'Enrolled', 'Eligible', 'Monthly Cost', 'Eligibility', 'Status'], ...BENEFITS.map((b) => [b.name, b.provider, b.enrolled, b.eligible, b.cost, b.elig, b.status])]),
    'export-audit': () => downloadCSV('novacore-audit-log-demo.csv', [['Timestamp', 'User', 'Action', 'Module', 'IP Address', 'Status'], ...AUDIT.map((a) => [fmtStamp(a.time), a.user, a.action, a.module, a.ip, a.status])]),
    'download-report': (el) => downloadReport(el.dataset.key),
    'download-payslip': (el) => { const e = empById(el.dataset.id); downloadCSV(`payslip-${e.id}-oct-2026-demo.csv`, [['Payslip', 'October 2026'], ['Employee', e.name], ['Employee ID', e.id], ['Basic salary', e.basic], ['Allowances', e.allowances], ['Income tax', -e.tax], ['Health & benefits', -e.benefitsDed], ['Retirement', -e.pension], ['Net pay', e.net]]); },

    'add-employee': () => addEmployee(),
    'edit-employee': (el) => {
      const e = empById(el.dataset.id);
      formModal({
        title: 'Edit Employee', sub: `${esc(e.name)} · ${e.id}`, submit: `${icon('check', 'sm')} Save Changes`,
        fields: [
          { name: 'position', label: 'Job title', value: e.position, required: true },
          { name: 'dept', label: 'Department', type: 'select', options: DEPT_NAMES, value: e.dept },
          { name: 'status', label: 'Employment status', type: 'select', options: ['Active', 'On Leave', 'Probation', 'Notice Period'], value: e.status },
          { name: 'location', label: 'Location', type: 'select', options: [...new Set(LOCATIONS)], value: e.location },
          { name: 'phone', label: 'Phone', value: e.phone, span: true }
        ],
        onSubmit: (v) => {
          Object.assign(e, { position: v.position.trim(), dept: v.dept, status: v.status, location: v.location, phone: v.phone.trim(), fresh: true });
          logAudit(`Updated employee record ${e.id}`, 'Employees');
          toast('Employee updated', e.name);
          rerender();
          setTimeout(() => openEmployee(e.id), 10);
        }
      });
    },
    'mark-attendance': () => formModal({
      title: 'Manual Attendance Entry', sub: 'Record a check-in for an employee who could not clock in', submit: `${icon('check', 'sm')} Save Entry`,
      fields: [
        { name: 'emp', label: 'Employee', type: 'select', options: EMPLOYEES.slice(0, 30).map((e) => [e.id, e.name]), value: EMPLOYEES[0].id, span: true },
        { name: 'date', label: 'Date', type: 'date', value: iso(TODAY) },
        { name: 'status', label: 'Status', type: 'select', options: ['Present', 'Late', 'Absent'], value: 'Present' },
        { name: 'cin', label: 'Check in', type: 'time', value: '08:45' },
        { name: 'cout', label: 'Check out', type: 'time', value: '17:30' },
        { name: 'note', label: 'Note', type: 'textarea', placeholder: 'Reason for manual entry', span: true }
      ],
      onSubmit: (v) => { const e = empById(v.emp); logAudit(`Manual attendance entry for ${e.id}`, 'Attendance'); toast('Attendance recorded', `${e.name} · ${v.status} · ${v.cin}`); }
    }),
    'leave-policy': () => openModal(`${modalHead('Leave Policy', `${COMPANY} · Effective Jan 1, 2026`)}<div class="modal-body"><div class="table-wrap"><table class="table no-top" style="min-width:480px"><thead><tr><th>Leave type</th><th>Entitlement</th><th>Carry over</th><th>Approval</th></tr></thead><tbody>
      ${[['Annual Leave', '20 days / year', 'Up to 5 days', 'Line manager'], ['Sick Leave', '10 days / year', 'No', 'Auto-approved ≤ 2 days'], ['Casual Leave', '6 days / year', 'No', 'Line manager'], ['Parental Leave', '16 weeks', '—', 'HR'], ['Unpaid Leave', 'Case by case', '—', 'HR + Department head']].map((r) => `<tr>${r.map((c, i) => `<td class="${i === 0 ? 'strong' : ''}">${c}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div><p class="muted mt-12" style="font-size:12.5px">Policy content is illustrative demo text.</p></div><div class="modal-foot"><button class="btn btn-primary btn-sm" data-close>Done</button></div>`, 'md'),
    'new-leave': () => newLeave(),
    'run-payroll': () => runPayroll(),
    'add-benefit': () => formModal({
      title: 'Add Benefit Plan', sub: 'Create a new benefit offering', submit: `${icon('plus', 'sm')} Add Plan`,
      fields: [
        { name: 'name', label: 'Plan name', required: true, autofocus: true, placeholder: 'e.g. Vision Insurance' },
        { name: 'provider', label: 'Provider', placeholder: 'e.g. ClearView Vision (fictional)' },
        { name: 'cost', label: 'Monthly cost (USD)', type: 'number', value: '1500' },
        { name: 'elig', label: 'Eligibility', type: 'select', options: ['All employees', 'All full-time employees', 'After probation', 'After 6 months of service'], value: 'All full-time employees' }
      ],
      onSubmit: (v) => { BENEFITS.unshift({ name: v.name.trim(), icon: 'heart', provider: v.provider.trim() || 'Internal', enrolled: 0, eligible: 128, cost: Math.max(0, parseInt(v.cost, 10) || 0), elig: v.elig, status: 'Open Enrollment', fresh: true }); logAudit(`Created benefit plan: ${v.name.trim()}`, 'Benefits'); toast('Benefit plan added', v.name.trim()); rerenderQuiet(); BENEFITS.forEach((b) => delete b.fresh); }
    }),
    'schedule-report': () => formModal({
      title: 'Schedule Report', sub: 'Deliver a report automatically by email', submit: `${icon('calendar', 'sm')} Schedule`,
      fields: [
        { name: 'report', label: 'Report', type: 'select', options: [...STD_REPORTS, ...ADV_REPORTS].map((r) => r.name), value: 'Employee Report', span: true },
        { name: 'freq', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'], value: 'Weekly' },
        { name: 'fmt', label: 'Format', type: 'select', options: ['CSV', 'PDF', 'Excel'], value: 'PDF' },
        { name: 'to', label: 'Recipients', placeholder: 'leadership@novacore-demo.com', span: true }
      ],
      onSubmit: (v) => toast('Report scheduled', `${v.report} · ${v.freq} · ${v.fmt}`)
    }),
    'toggle-generic': (el) => toast(`${el.dataset.label} ${el.checked ? 'enabled' : 'disabled'}`, 'Setting updated (demo)', el.checked ? 'success' : 'info'),
    'chip-toggle': (el) => el.classList.toggle('active'),
    'perm-change': (el) => { logAudit('Changed role permissions', 'Settings', 'Warning'); toast('Permission updated', el.getAttribute('aria-label') + (el.checked ? ' · granted' : ' · revoked'), 'info'); },
    'add-role': () => formModal({
      title: 'Create Custom Role', sub: 'Define a role with tailored module access', submit: `${icon('plus', 'sm')} Create Role`, size: 'sm',
      fields: [{ name: 'name', label: 'Role name', required: true, autofocus: true, placeholder: 'e.g. Recruiter', span: true }, { name: 'base', label: 'Start from', type: 'select', options: ROLES_PREM, value: 'HR Manager', span: true }],
      onSubmit: (v) => { const n = v.name.trim().slice(0, 24); if (PERMS[n]) { toast('Role already exists', n, 'warning'); return false; } PERMS[n] = PERMS[v.base].slice(); state.customRoles.push(n); logAudit(`Created custom role: ${n}`, 'Settings'); toast('Custom role created', n); rerenderQuiet(); }
    }),
    'save-settings': () => { logAudit('Updated organization settings', 'Settings'); toast('Settings saved', 'Your changes have been applied'); },
    'start-review': (el) => { const e = empById(el.dataset.id); e.review = 'In Progress'; logAudit(`Started performance review for ${e.id}`, 'Performance'); toast('Review started', `${e.name} · ${e.manager} has been notified`); refreshPage(); },
    'new-cycle': () => formModal({
      title: 'New Review Cycle', sub: 'Launch a performance review cycle', submit: `${icon('play', 'sm')} Launch Cycle`,
      fields: [
        { name: 'name', label: 'Cycle name', value: 'Q4 2026 Review', required: true, span: true },
        { name: 'start', label: 'Start date', type: 'date', value: '2027-01-04' }, { name: 'end', label: 'Due date', type: 'date', value: '2027-01-29' },
        { name: 'type', label: 'Review type', type: 'select', options: ['Manager review', 'Self + manager', '360° feedback'], value: 'Self + manager' },
        { name: 'scope', label: 'Participants', type: 'select', options: ['All employees (128)', 'Engineering (34)', 'Sales (22)'], value: 'All employees (128)' }
      ],
      onSubmit: (v) => toast('Review cycle scheduled', `${v.name} · ${v.scope}`)
    }),
    'new-job': () => formModal({
      title: 'Post a Job', sub: 'Create a new open position', submit: `${icon('send', 'sm')} Publish Job`,
      fields: [
        { name: 'title', label: 'Job title', required: true, autofocus: true, placeholder: 'e.g. Data Analyst', span: true },
        { name: 'dept', label: 'Department', type: 'select', options: DEPT_NAMES, value: 'Engineering' },
        { name: 'loc', label: 'Location', type: 'select', options: ['Austin HQ', 'Denver Office', 'Toronto Office', 'Remote — US'], value: 'Austin HQ' }
      ],
      onSubmit: (v) => { JOBS.unshift({ id: 'J-' + (209 + JOBS.length), title: v.title.trim(), dept: v.dept, applicants: 0, posted: 0, loc: v.loc }); logAudit(`Published job: ${v.title.trim()}`, 'Recruitment'); toast('Job published', `${v.title.trim()} · careers page updated`); rerenderQuiet(); }
    }),
    'add-candidate': () => formModal({
      title: 'Add Candidate', sub: 'Add an applicant to the pipeline', submit: `${icon('user-plus', 'sm')} Add Candidate`,
      fields: [
        { name: 'name', label: 'Full name', required: true, autofocus: true, placeholder: 'e.g. Robin Hale' },
        { name: 'job', label: 'Position', type: 'select', options: JOBS.map((j) => [j.id, j.title]), value: JOBS[0].id },
        { name: 'source', label: 'Source', type: 'select', options: SOURCES, value: 'Referral' },
        { name: 'stage', label: 'Stage', type: 'select', options: STAGES.map((s) => [s.key, s.name]), value: 'applied' }
      ],
      onSubmit: (v) => { const j = JOBS.find((x) => x.id === v.job); CANDIDATES.unshift({ id: 'C-' + (600 + CANDIDATES.length), name: v.name.trim(), job: j.id, role: j.title, stage: v.stage, rating: 4, source: v.source, days: 0, av: AV_COLORS[CANDIDATES.length % AV_COLORS.length], dropped: true }); j.applicants++; toast('Candidate added', `${v.name.trim()} · ${j.title}`); refreshPage(); renderSidebar(); }
    }),
    'dd-toggle': (el, ev) => { ev.stopPropagation(); const d = el.nextElementSibling; const open = d.classList.contains('open'); closeDropdowns(); if (!open) d.classList.add('open'); },
    'move-cand': (el) => moveCandidate(el.dataset.id, el.dataset.stage),
    'filter-job': (el) => { ui.jobFilter = el.dataset.id; rerenderQuiet(); const k = $('#kanban'); if (k) k.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
    'wf-toggle': (el) => {
      const w = WORKFLOWS.find((x) => x.id === el.dataset.id);
      w.on = el.checked;
      const card = el.closest('.wf-card');
      card.outerHTML = wfCard(w);
      const a = $('#wfActive'); if (a) a.textContent = WORKFLOWS.filter((x) => x.on).length;
      logAudit(`${w.on ? 'Enabled' : 'Paused'} workflow: ${w.name}`, 'Automation', w.on ? 'Success' : 'Warning');
      toast(`Workflow ${w.on ? 'activated' : 'paused'}`, w.name, w.on ? 'success' : 'info');
    },
    'new-workflow': () => formModal({
      title: 'Create Workflow', sub: 'Choose a trigger and the action to perform', submit: `${icon('zap', 'sm')} Create & Activate`,
      fields: [
        { name: 'name', label: 'Workflow name', required: true, autofocus: true, placeholder: 'e.g. Contract Renewal Reminder', span: true },
        { name: 'trigger', label: 'When this happens (trigger)', type: 'select', options: ['Employee submits leave request', 'New employee created', 'Probation ending in 14 days', 'Payroll deadline in 3 days', 'Document expires in 30 days', 'Employee status changes', 'Candidate moved to Offer'], value: 'Employee status changes', span: true },
        { name: 'action', label: 'Do this (action)', type: 'select', options: ['Notify manager by email & in-app', 'Notify HR team', 'Create onboarding checklist', 'Create offboarding checklist', 'Send Slack message', 'Assign a task to HR'], value: 'Notify HR team', span: true }
      ],
      onSubmit: (v) => { WORKFLOWS.unshift({ id: 'wf' + Date.now(), name: v.name.trim(), desc: 'Custom workflow', icon: 'workflow', trigger: v.trigger, action: v.action, on: true, runs: 0, last: 'Never' }); logAudit(`Created workflow: ${v.name.trim()}`, 'Automation'); toast('Workflow created', `${v.name.trim()} is now active`); rerenderQuiet(); }
    }),
    'doc-cat': (el) => { ui.docCat = ui.docCat === el.dataset.val ? 'all' : el.dataset.val; refreshPage(); },
    'upload-doc': () => openModal(`${modalHead('Upload Document', 'Files stay in your browser — nothing is uploaded in this demo')}
      <div class="modal-body"><label class="dropzone" id="dz"><input type="file" id="dzInput" class="sr-only"><span class="di">${icon('upload')}</span><b>Click to choose a file or drag it here</b><p>PDF, DOCX, XLSX, JPG up to 25 MB</p></label>
        <div class="form-grid mt-20"><div class="field"><label>Category</label><select class="select" id="dzCat">${selectOpts(DOC_CATS.map((c) => c.key), 'Employee Documents')}</select></div><div class="field"><label>Visibility</label><select class="select">${selectOpts(['HR only', 'Employee + HR', 'Managers', 'Everyone'], 'HR only')}</select></div></div>
        <div class="upload-progress hidden" id="dzProg"><div class="row between" style="font-size:13px"><span id="dzName"></span><b id="dzPct">0%</b></div><div class="progress lg"><span id="dzBar" style="width:0"></span></div></div></div>
      <div class="modal-foot"><button class="btn btn-secondary btn-sm" data-close>Cancel</button><button class="btn btn-primary btn-sm" id="dzSample">${icon('file', 'sm')} Use sample file</button></div>`, 'md', (m) => {
      const dz = $('#dz', m);
      const go = (fname) => {
        $('#dzProg', m).classList.remove('hidden'); $('#dzName', m).textContent = fname; $('#dzSample', m).disabled = true;
        let p = 0;
        const iv = setInterval(() => {
          p = Math.min(100, p + 9 + Math.random() * 14);
          $('#dzBar', m).style.width = p + '%'; $('#dzPct', m).textContent = Math.round(p) + '%';
          if (p >= 100) {
            clearInterval(iv);
            const ext = (fname.split('.').pop() || '').toLowerCase();
            const type = ext === 'pdf' ? 'pdf' : /xls|csv/.test(ext) ? 'xls' : /png|jpe?g|gif|webp/.test(ext) ? 'img' : 'doc';
            DOCS.unshift({ id: 'D-' + Date.now(), name: fname, cat: $('#dzCat', m).value, owner: 'Alex Morgan', updated: TODAY, status: 'In Review', type, size: (0.3 + Math.random() * 2).toFixed(1) + ' MB', fresh: true });
            logAudit(`Uploaded document: ${fname}`, 'Documents');
            setTimeout(() => { closeModal(); toast('Document uploaded', fname); if (state.page === 'documents') { ui.docCat = 'all'; ui.docQ = ''; rerenderQuiet(); } else if (state.page === 'selfservice') toast('Shared with HR', 'Your document is pending review', 'info'); }, 300);
          }
        }, 120);
      };
      $('#dzInput', m).addEventListener('change', (e) => { const f = e.target.files[0]; if (f) go(f.name); });
      $('#dzSample', m).addEventListener('click', () => go('Signed NDA — Robin Hale.pdf'));
      ['dragover', 'dragenter'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((t) => dz.addEventListener(t, () => dz.classList.remove('over')));
      dz.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) go(f.name); });
    }),
    'view-doc': (el) => {
      const d = DOCS.find((x) => x.id === el.dataset.id);
      openModal(`${modalHead(esc(d.name), `${esc(d.cat)} · ${d.size} · Updated ${fmtDate(d.updated)}`)}
        <div class="modal-body"><div style="background:var(--surface-3);border-radius:12px;padding:24px;display:flex;justify-content:center"><div style="background:#fff;width:100%;max-width:420px;aspect-ratio:1/1.3;border-radius:6px;box-shadow:var(--shadow-md);padding:32px 28px">
          <div class="row" style="gap:8px;margin-bottom:22px"><span class="brand-mark" style="width:22px;height:22px;border-radius:6px"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M7 17V7l10 10V7"/></svg></span><b style="font-size:12px">${COMPANY}</b></div>
          <div style="height:10px;width:70%;background:var(--surface-3);border-radius:4px;margin-bottom:18px"></div>
          ${[92, 88, 95, 60, 0, 90, 84, 93, 70, 0, 86, 40].map((w) => w ? `<div style="height:6px;width:${w}%;background:#eef1f5;border-radius:3px;margin-bottom:9px"></div>` : '<div style="height:12px"></div>').join('')}
          <div style="margin-top:26px;font-size:10px;color:var(--subtle);text-align:center">DEMO DOCUMENT PREVIEW</div></div></div>
          <div class="row between mt-12"><span class="muted" style="font-size:12.5px">Owner: <b style="color:var(--text)">${esc(d.owner)}</b></span>${pill(d.status)}</div></div>
        <div class="modal-foot">${d.status === 'Pending Signature' ? `<button class="btn btn-secondary btn-sm" data-action="toast" data-title="Signature request resent" data-msg="${esc(d.name)}">${icon('send', 'sm')} Resend for signature</button>` : ''}<button class="btn btn-primary btn-sm" data-action="toast" data-title="Download started" data-msg="${esc(d.name)} (demo file)">${icon('download', 'sm')} Download</button></div>`, 'md');
    },
    'ess-tab': (el) => {
      state.ess = el.dataset.v;
      $$('.portal-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.v === state.ess));
      $('#essBody').innerHTML = essPanel();
    },
    clock: () => {
      const now = new Date();
      state.clockedIn = !state.clockedIn;
      if (state.clockedIn) state.clockIn = now.getHours() * 60 + now.getMinutes();
      toast(state.clockedIn ? 'Clocked in' : 'Clocked out', `${ME().name} · ${ampm(now.getHours() * 60 + now.getMinutes())}`, state.clockedIn ? 'success' : 'info');
      $('#essClock').innerHTML = essClockHTML();
      if (state.ess === 'attendance') $('#essBody').innerHTML = essPanel();
    },
    'ess-leave': (el) => newLeave({ self: true, type: el.dataset.type }),
    'ess-payslip': () => openPayslip(ME().id),
    'ess-expense': () => essRequest('Expense Claim'),
    'ess-new-request': () => essRequest(),
    'ess-update': () => formModal({
      title: 'Update My Details', sub: 'Changes are sent to HR for approval', submit: `${icon('send', 'sm')} Submit for Approval`,
      fields: [{ name: 'phone', label: 'Phone', value: ME().phone }, { name: 'address', label: 'Home address', placeholder: '123 Example Street (fictional)' }, { name: 'ec', label: 'Emergency contact', value: 'Mark Johnson (fictional)', span: true }],
      onSubmit: () => { state.myRequests.unshift({ id: 'RQ-' + (312 + state.myRequests.length), type: 'Profile Update', detail: 'Contact details change', status: 'Pending', date: 'Today', fresh: true }); toast('Update submitted', 'HR will review your changes'); }
    }),
    'mark-read': () => { NOTIFS.forEach((n) => (n.unread = false)); renderNotifs(); toast('All notifications marked as read', '', 'info'); },
    'notif-tab': (el, ev) => { ev.stopPropagation(); ui.notifTab = el.dataset.v; renderNotifs(); },
    'notif-open': (el) => {
      const n = NOTIFS.find((x) => String(x.id) === el.dataset.id); if (!n) return;
      n.unread = false; closeDropdowns(); updateBadges();
      if (PAGES[n.page].tier === 'premium' && !isPrem()) openPremiumModal(PAGES[n.page].label);
      else if (state.page === n.page) render(); else navigate(n.page);
    }
  };
  function essRequest(type) {
    formModal({
      title: type === 'Expense Claim' ? 'Submit Expense Claim' : 'New Request', sub: 'Your request will be routed to the right approver', submit: `${icon('send', 'sm')} Submit`,
      fields: [
        { name: 'type', label: 'Request type', type: 'select', options: ['Expense Claim', 'Equipment', 'Document', 'Training', 'Remote Work'], value: type || 'Equipment' },
        { name: 'amount', label: 'Amount (if applicable)', placeholder: '$0.00' },
        { name: 'detail', label: 'Details', type: 'textarea', required: true, placeholder: 'Describe your request', span: true }
      ],
      onSubmit: (v) => {
        state.myRequests.unshift({ id: 'RQ-' + (312 + state.myRequests.length), type: v.type, detail: v.detail.trim().slice(0, 60) + (v.amount ? ` · ${v.amount}` : ''), status: 'Pending', date: 'Today', fresh: true });
        toast('Request submitted', `${v.type} · routed to ${ME().manager}`);
        state.ess = 'requests';
        if (state.page === 'selfservice') rerenderQuiet();
      }
    });
  }
  function rerenderQuiet() { const y = window.scrollY; render({ quiet: true }); window.scrollTo(0, y); }

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'A') ev.preventDefault();
    fn(el, ev);
  });
  const onFilter = (ev) => {
    const el = ev.target.closest('[data-filter]');
    if (!el) return;
    if (ev.type === 'input' && el.tagName === 'SELECT') return;
    setUi(el.dataset.filter, el.value);
    refreshPage();
  };
  $('#view').addEventListener('input', debounce(onFilter, 120));
  $('#view').addEventListener('change', onFilter);

  /* ------------------------------------------------------------------
     Landing page
     ------------------------------------------------------------------ */
  function initLanding() {
    const yes = (p) => `<span class="yes ${p ? 'p' : ''}">${icon('check')}</span>`;
    const no = '<span class="no">—</span>';
    const core = [['Employee Management & Profiles', 'Central records, profiles and employment history'], ['Employee Search', 'Find anyone instantly by name, ID or role'], ['HR Dashboard', 'Real-time workforce overview'], ['Attendance Management', 'Check-ins, lateness and working hours'], ['Leave Management', 'Requests, approvals and balances'], ['Payroll Management', 'Pay runs, registers and payslips'], ['Benefits Management', 'Plans, enrollment and costs'], ['Basic HR Reports', 'Employee, attendance, payroll and leave'], ['Role-Based Access', 'Built-in Admin, HR Manager and Employee roles']];
    const adv = [['Performance Management', 'Review cycles, goals and scores'], ['Recruitment / ATS', 'Job postings and drag-and-drop pipeline'], ['Employee Self-Service', 'Portal for employees on web and mobile'], ['HR Workflow Automation', 'No-code triggers and actions'], ['Advanced Analytics', 'Executive dashboards and trends'], ['Document Management', 'Secure library with e-signature status'], ['Advanced & Scheduled Reports', 'Turnover, cost and funnel analysis'], ['Smart Notifications', 'Automated alerts across channels'], ['Custom Roles & Permissions', 'Unlimited roles, granular access'], ['Audit Logs', 'Complete change history with IP tracking'], ['Advanced Workforce Insights', 'Attrition risk and overtime signals']];
    const row = ([f, s], std) => `<tr><td><span class="feat">${f}</span><span class="feat-sub">${s}</span></td><td class="c">${std ? yes() : no}</td><td class="c">${yes(!std)}</td></tr>`;
    $('#compareTable').innerHTML = `<thead><tr><th>Capability</th><th class="c">Standard</th><th class="c">Premium</th></tr></thead><tbody>
      <tr class="group"><td colspan="3">Core HR operations</td></tr>${core.map((r) => row(r, true)).join('')}
      <tr class="group"><td colspan="3">Advanced HR &amp; automation</td></tr>${adv.map((r) => row(r, false)).join('')}
      <tr><td></td><td class="c"><a class="btn btn-secondary btn-sm" href="#/standard/dashboard">Try Standard</a></td><td class="c"><a class="btn btn-premium btn-sm" href="#/premium/dashboard">Try Premium</a></td></tr></tbody>`;
    const descs = {
      dashboard: 'Headcount, attendance, payroll progress and approvals at a glance.', employees: 'Searchable directory with rich employee profiles.', attendance: 'Daily logs, punctuality trends and working hours.', leave: 'One-click approvals, balances and a team calendar.', payroll: 'Pay cycles, registers and polished payslips.', benefits: 'Plans, enrollment rates and monthly costs.', reports: 'Downloadable reports for every HR area.', settings: 'Organization, roles, notifications and security.'
    };
    $('#moduleGrid').innerHTML = Object.keys(PAGES).map((k) => {
      const p = PAGES[k], prem = p.tier === 'premium';
      return `<a class="module-card ${prem ? 'p' : ''}" href="#/${prem ? 'premium' : 'standard'}/${k}"><span class="mi">${icon(p.icon)}</span><h4>${p.label}${prem ? ` <span class="premium-badge">${icon('crown')}Premium</span>` : ''}</h4><p>${prem ? p.blurb : descs[k]}</p></a>`;
    }).join('');
    $$('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const t = $(a.getAttribute('href'));
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    }));
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  hydrateIcons();
  initLanding();
  renderNotifs();
  const syncFromUrl = () => { route = location.hash; onRoute(); };
  window.addEventListener('hashchange', syncFromUrl);
  window.addEventListener('popstate', syncFromUrl);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented) return;
    e.preventDefault();
    go(a.getAttribute('href'));
  });
  onRoute();
})();
