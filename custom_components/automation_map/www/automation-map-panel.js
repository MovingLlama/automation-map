/**
 * Automation Map Panel — Home Assistant Custom Component
 * Interactive graph visualization for automations, entities, and helpers.
 * Uses Cytoscape.js for graph rendering via dynamic import from unpkg.
 * 
 * @version 1.0.0
 * @author MovingLlama
 */

// ─── Styles ──────────────────────────────────────────────────────────────────
const STYLES = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: var(--primary-font-family, 'Roboto', sans-serif);
  }

  .am-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background: var(--primary-background-color, #111827);
    color: var(--primary-text-color, #f1f5f9);
    position: relative;
  }

  /* ─── Toolbar ─────────────────────────────────────────── */
  .am-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    min-height: 56px;
    height: auto;
    flex-shrink: 0;
    background: var(--app-header-background-color, #1e293b);
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    z-index: 100;
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  }

  .am-toolbar-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--app-header-text-color, #f1f5f9);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .am-toolbar-title svg {
    width: 22px; height: 22px;
    opacity: 0.9;
    color: var(--accent-color, #38bdf8);
  }

  .am-toolbar-spacer { flex: 1; }

  .am-filter-group {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .am-filter-label {
    font-size: 12px;
    color: var(--secondary-text-color, #94a3b8);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .am-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    background: var(--secondary-background-color, rgba(255,255,255,0.05));
    color: var(--primary-text-color, #f1f5f9);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .am-btn:hover {
    background: var(--primary-color, #38bdf8);
    border-color: var(--primary-color, #38bdf8);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(56,189,248,0.25);
  }

  .am-btn.active {
    background: var(--primary-color, #38bdf8);
    border-color: var(--primary-color, #38bdf8);
    color: white;
  }

  .am-btn svg { width: 14px; height: 14px; }

  /* ─── Main Layout ──────────────────────────────────────── */
  .am-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* ─── Graph Canvas ─────────────────────────────────────── */
  #am-cy {
    flex: 1;
    min-width: 0;
    background: transparent;
    position: relative;
  }

  #am-cy canvas { display: block; }

  /* ─── Loading Overlay ──────────────────────────────────── */
  .am-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: var(--primary-background-color, #111827);
    z-index: 200;
    transition: opacity 0.4s ease;
  }

  .am-loading.hidden { opacity: 0; pointer-events: none; }

  .am-spinner {
    width: 48px; height: 48px;
    border: 3px solid rgba(56,189,248,0.15);
    border-top-color: var(--primary-color, #38bdf8);
    border-radius: 50%;
    animation: am-spin 0.8s linear infinite;
  }

  @keyframes am-spin { to { transform: rotate(360deg); } }

  .am-loading-text {
    font-size: 14px;
    color: var(--secondary-text-color, #94a3b8);
  }

  /* ─── Detail Sidebar ───────────────────────────────────── */
  .am-detail {
    width: 360px;
    flex-shrink: 0;
    background: var(--card-background-color, #1e293b);
    border-left: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateX(100%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: -8px 0 32px rgba(0,0,0,0.3);
  }

  .am-detail.open { transform: translateX(0); }

  .am-detail-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 20px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.08));
  }

  .am-detail-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .am-detail-title-wrap { flex: 1; min-width: 0; }

  .am-detail-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--primary-text-color, #f1f5f9);
    word-break: break-word;
    line-height: 1.3;
  }

  .am-detail-domain {
    font-size: 12px;
    color: var(--secondary-text-color, #94a3b8);
    margin-top: 2px;
  }

  .am-detail-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color, #94a3b8);
    padding: 4px;
    border-radius: 6px;
    line-height: 0;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .am-detail-close:hover { color: var(--primary-text-color, #f1f5f9); }
  .am-detail-close svg { width: 18px; height: 18px; }

  .am-detail-body { flex: 1; overflow-y: auto; padding: 16px 20px; }

  .am-section {
    margin-bottom: 20px;
  }

  .am-section-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--secondary-text-color, #64748b);
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.06));
  }

  .am-prop-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 7px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.04));
    gap: 8px;
  }

  .am-prop-row:last-child { border-bottom: none; }

  .am-prop-key {
    color: var(--secondary-text-color, #94a3b8);
    flex-shrink: 0;
    max-width: 45%;
  }

  .am-prop-val {
    color: var(--primary-text-color, #f1f5f9);
    text-align: right;
    word-break: break-word;
    font-family: monospace;
    font-size: 12px;
  }

  .am-state-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .am-state-badge.on { background: rgba(34,197,94,0.15); color: #4ade80; }
  .am-state-badge.off { background: rgba(100,116,139,0.15); color: #94a3b8; }
  .am-state-badge.unavailable { background: rgba(239,68,68,0.15); color: #f87171; }

  .am-trigger-item {
    background: var(--secondary-background-color, rgba(255,255,255,0.04));
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.5;
    border-left: 3px solid var(--primary-color, #38bdf8);
  }

  .am-trigger-type {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--primary-color, #38bdf8);
    margin-bottom: 4px;
  }

  .am-trigger-val { color: var(--primary-text-color, #e2e8f0); }

  .am-action-item {
    background: var(--secondary-background-color, rgba(255,255,255,0.04));
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.5;
    border-left: 3px solid #a78bfa;
  }

  .am-action-type {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #a78bfa;
    margin-bottom: 4px;
  }

  .am-condition-item {
    background: var(--secondary-background-color, rgba(255,255,255,0.04));
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.5;
    border-left: 3px solid #fbbf24;
  }

  .am-condition-type {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #fbbf24;
    margin-bottom: 4px;
  }

  .am-link-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--primary-color, #38bdf8);
    background: transparent;
    color: var(--primary-color, #38bdf8);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    text-decoration: none;
    margin-top: 8px;
  }

  .am-link-btn:hover {
    background: var(--primary-color, #38bdf8);
    color: white;
  }

  .am-link-btn svg { width: 15px; height: 15px; }

  /* ─── Legend ───────────────────────────────────────────── */
  .am-legend {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: var(--card-background-color, rgba(30,41,59,0.95));
    border: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    border-radius: 12px;
    padding: 12px 16px;
    backdrop-filter: blur(12px);
    z-index: 40;
    min-width: 160px;
  }

  .am-legend-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--secondary-text-color, #64748b);
    margin-bottom: 10px;
  }

  .am-legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 7px;
    font-size: 12px;
    color: var(--primary-text-color, #e2e8f0);
  }

  .am-legend-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.2);
  }

  .am-legend-line {
    width: 24px; height: 2px;
    flex-shrink: 0;
    border-radius: 2px;
  }

  /* ─── Minimap ──────────────────────────────────────────── */
  .am-minimap-placeholder {
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 11px;
    color: var(--secondary-text-color, #64748b);
    background: var(--card-background-color, rgba(30,41,59,0.8));
    border-radius: 8px;
    padding: 8px 12px;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.08));
  }

  /* ─── Toast ────────────────────────────────────────────── */
  .am-toast {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px;
    z-index: 300;
    opacity: 0;
    pointer-events: none;
    transition: all 0.25s ease;
  }
  .am-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* ─── Search box ───────────────────────────────────────── */
  .am-search {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--secondary-background-color, rgba(255,255,255,0.06));
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 8px;
    padding: 5px 10px;
    transition: border-color 0.15s;
    flex-shrink: 0;
  }

  .am-search:focus-within { border-color: var(--primary-color, #38bdf8); }

  .am-search svg { width: 14px; height: 14px; color: var(--secondary-text-color, #64748b); }

  .am-search input {
    background: none;
    border: none;
    outline: none;
    color: var(--primary-text-color, #f1f5f9);
    font-size: 13px;
    width: 160px;
  }

  .am-search input::placeholder { color: var(--secondary-text-color, #64748b); }

  /* ─── Group labels ─────────────────────────────────────── */
  .am-no-data {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--secondary-text-color, #64748b);
    font-size: 14px;
    pointer-events: none;
  }

  .am-no-data svg { width: 48px; height: 48px; opacity: 0.3; }
`;

// ─── Color Palette ─────────────────────────────────────────────────────────
const NODE_COLORS = {
  automation: { bg: '#1d4ed8', border: '#3b82f6', text: '#bfdbfe', icon: '⚡' },
  light:      { bg: '#92400e', border: '#f59e0b', text: '#fef3c7', icon: '💡' },
  cover:      { bg: '#065f46', border: '#10b981', text: '#d1fae5', icon: '🪟' },
  climate:    { bg: '#7c3aed', border: '#8b5cf6', text: '#ede9fe', icon: '🌡️' },
  switch:     { bg: '#1e3a5f', border: '#60a5fa', text: '#dbeafe', icon: '🔘' },
  sensor:     { bg: '#1f2937', border: '#6b7280', text: '#d1d5db', icon: '📡' },
  binary_sensor: { bg: '#1f2937', border: '#9ca3af', text: '#e5e7eb', icon: '◉' },
  input_boolean: { bg: '#3f1f5f', border: '#a855f7', text: '#f3e8ff', icon: '🔷' },
  input_number: { bg: '#1f3f5f', border: '#67e8f9', text: '#e0f7fa', icon: '#️⃣' },
  input_select: { bg: '#3f2f1f', border: '#fb923c', text: '#ffedd5', icon: '📋' },
  input_text:   { bg: '#2f1f3f', border: '#c084fc', text: '#f3e8ff', icon: '📝' },
  input_datetime: { bg: '#1f3f2f', border: '#34d399', text: '#d1fae5', icon: '📅' },
  person:     { bg: '#4c1d1d', border: '#f87171', text: '#fee2e2', icon: '👤' },
  zone:       { bg: '#1a2f1a', border: '#4ade80', text: '#dcfce7', icon: '📍' },
  default:    { bg: '#1e293b', border: '#475569', text: '#cbd5e1', icon: '⚙️' },
};

function getDomainColor(domain) {
  return NODE_COLORS[domain] || NODE_COLORS.default;
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────
const ICONS = {
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
  fitView: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  layout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
};

// ─── Trigger Description Helper ─────────────────────────────────────────────
function describeTrigger(trigger) {
  if (!trigger) return 'Unknown trigger';
  const t = trigger.trigger || trigger.platform || '';
  switch (t) {
    case 'state': {
      const ent = Array.isArray(trigger.entity_id) ? trigger.entity_id.join(', ') : (trigger.entity_id || '');
      let desc = `Entity: ${ent}`;
      if (trigger.from) desc += `\nFrom: ${trigger.from}`;
      if (trigger.to) desc += `\nTo: ${trigger.to}`;
      if (trigger.for) desc += `\nFor: ${JSON.stringify(trigger.for)}`;
      return desc;
    }
    case 'numeric_state': {
      const ent = Array.isArray(trigger.entity_id) ? trigger.entity_id.join(', ') : (trigger.entity_id || '');
      let desc = `Entity: ${ent}`;
      if (trigger.above !== undefined) desc += `\nAbove: ${trigger.above}`;
      if (trigger.below !== undefined) desc += `\nBelow: ${trigger.below}`;
      if (trigger.value_template) desc += `\nTemplate: ${trigger.value_template}`;
      return desc;
    }
    case 'time': return `Time: ${trigger.at || ''}`;
    case 'time_pattern': {
      const parts = [];
      if (trigger.hours !== undefined) parts.push(`hours: ${trigger.hours}`);
      if (trigger.minutes !== undefined) parts.push(`minutes: ${trigger.minutes}`);
      if (trigger.seconds !== undefined) parts.push(`seconds: ${trigger.seconds}`);
      return parts.join(', ');
    }
    case 'sun': return `Sun: ${trigger.event || ''}${trigger.offset ? ' offset '+trigger.offset : ''}`;
    case 'homeassistant': return `HA Event: ${trigger.event || ''}`;
    case 'event': return `Event: ${trigger.event_type || ''}`;
    case 'webhook': return `Webhook: ${trigger.webhook_id || ''}`;
    case 'mqtt': return `MQTT: ${trigger.topic || ''}`;
    case 'template': return `Template: ${String(trigger.value_template || '').substring(0, 80)}`;
    case 'device': return `Device: ${trigger.device_id || ''} — ${trigger.type || ''}`;
    default: return JSON.stringify(trigger).substring(0, 120);
  }
}

function describeCondition(cond) {
  if (!cond) return '';
  const t = cond.condition || '';
  switch (t) {
    case 'state': return `${cond.entity_id} is ${cond.state}`;
    case 'numeric_state': {
      let d = `${cond.entity_id}`;
      if (cond.above !== undefined) d += ` > ${cond.above}`;
      if (cond.below !== undefined) d += ` < ${cond.below}`;
      return d;
    }
    case 'time': return `${cond.after || ''} – ${cond.before || ''}`;
    case 'sun': return `Sun ${cond.after || ''} offset ${cond.after_offset || ''}`;
    case 'template': return String(cond.value_template || '').substring(0, 80);
    case 'and': return `AND (${(cond.conditions||[]).length} conditions)`;
    case 'or': return `OR (${(cond.conditions||[]).length} conditions)`;
    case 'not': return `NOT (${(cond.conditions||[]).length} conditions)`;
    default: return JSON.stringify(cond).substring(0, 80);
  }
}

function describeAction(action) {
  if (!action) return '';
  if (action.service || action.action) {
    const svc = action.service || action.action || '';
    const target = action.target?.entity_id
      ? (Array.isArray(action.target.entity_id) ? action.target.entity_id.join(', ') : action.target.entity_id)
      : '';
    const data = action.data ? JSON.stringify(action.data).substring(0, 60) : '';
    return `${svc}${target ? '\n→ ' + target : ''}${data ? '\n' + data : ''}`;
  }
  if (action.delay) return `Delay: ${JSON.stringify(action.delay)}`;
  if (action.wait_template) return `Wait: ${String(action.wait_template).substring(0,60)}`;
  if (action.choose) return `Choose (${action.choose.length} options)`;
  if (action.if) return `If/Then/Else block`;
  if (action.repeat) return `Repeat: ${JSON.stringify(action.repeat.count || '')} times`;
  return JSON.stringify(action).substring(0, 80);
}

// ─── Entity IDs extracted from automation ──────────────────────────────────
function extractEntityIds(automation) {
  const ids = new Set();

  function scan(obj) {
    if (!obj) return;
    if (typeof obj === 'string') {
      if (obj.includes('.') && !obj.includes(' ') && !obj.startsWith('{{')) {
        const parts = obj.split('.');
        if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
          ids.add(obj);
        }
      }
      return;
    }
    if (Array.isArray(obj)) { obj.forEach(scan); return; }
    if (typeof obj === 'object') { Object.values(obj).forEach(scan); }
  }

  if (automation.trigger) scan(automation.trigger);
  if (automation.condition) scan(automation.condition);
  if (automation.action) scan(automation.action);
  return ids;
}

// ─── Main Panel Element ─────────────────────────────────────────────────────
class AutomationMapPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._cy = null;
    this._wsConn = null;
    this._msgId = 1;
    this._pendingMsgs = new Map();
    this._stateCache = {};
    this._automationConfigs = {};
    this._areas = {};
    this._hiddenNodes = new Set();
    this._filterTypes = new Set(['automation', 'entity', 'helper']);
    this._searchTerm = '';
    this._cyInitialized = false;
    this._initialFitDone = false;
  }

  set hass(value) {
    const wasNull = this._hass === null;
    this._hass = value;
    if (wasNull && value) {
      this._init();
    }
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="am-container">
        <div class="am-toolbar">
          <div class="am-toolbar-title">
            ${ICONS.map} Automation Map
          </div>

          <div class="am-search">
            ${ICONS.search}
            <input type="text" id="am-search-input" placeholder="Suchen…" autocomplete="off"/>
          </div>

          <div class="am-toolbar-spacer"></div>

          <div class="am-filter-group">
            <span class="am-filter-label">${ICONS.filter} Filter:</span>
            <button class="am-btn active" id="filter-automation" data-type="automation">⚡ Automationen</button>
            <button class="am-btn active" id="filter-entity" data-type="entity">📡 Entitäten</button>
            <button class="am-btn active" id="filter-helper" data-type="helper">🔷 Helfer</button>
          </div>

          <button class="am-btn" id="btn-fit">${ICONS.fitView} Übersicht</button>
          <button class="am-btn" id="btn-layout">${ICONS.layout} Neu anordnen</button>
          <button class="am-btn" id="btn-refresh">${ICONS.refresh} Neu laden</button>
        </div>

        <div class="am-body">
          <div id="am-cy"></div>

          <div class="am-loading" id="am-loading">
            <div class="am-spinner"></div>
            <div class="am-loading-text" id="am-loading-text">Lade Daten aus Home Assistant…</div>
          </div>

          <div class="am-legend" id="am-legend">
            <div class="am-legend-title">Legende</div>
            <div class="am-legend-item"><div class="am-legend-dot" style="background:#3b82f6;border-color:#1d4ed8"></div>Automatisierung</div>
            <div class="am-legend-item"><div class="am-legend-dot" style="background:#f59e0b;border-color:#92400e"></div>Licht</div>
            <div class="am-legend-item"><div class="am-legend-dot" style="background:#10b981;border-color:#065f46"></div>Rolladen/Markise</div>
            <div class="am-legend-item"><div class="am-legend-dot" style="background:#8b5cf6;border-color:#7c3aed"></div>Klima</div>
            <div class="am-legend-item"><div class="am-legend-dot" style="background:#6b7280;border-color:#374151"></div>Sensor</div>
            <div class="am-legend-item"><div class="am-legend-dot" style="background:#a855f7;border-color:#3f1f5f"></div>Helfer</div>
            <div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.06);padding-top:8px">
              <div class="am-legend-item"><div class="am-legend-line" style="background:#38bdf8"></div>Trigger</div>
              <div class="am-legend-item"><div class="am-legend-line" style="background:#a78bfa"></div>Aktion</div>
              <div class="am-legend-item"><div class="am-legend-line" style="background:rgba(100,116,139,0.5)"></div>Bedingung</div>
            </div>
          </div>

          <div class="am-detail" id="am-detail">
            <div class="am-detail-header">
              <div class="am-detail-icon" id="detail-icon"></div>
              <div class="am-detail-title-wrap">
                <div class="am-detail-name" id="detail-name">—</div>
                <div class="am-detail-domain" id="detail-domain">—</div>
              </div>
              <button class="am-detail-close" id="detail-close">${ICONS.close}</button>
            </div>
            <div class="am-detail-body" id="detail-body"></div>
          </div>
        </div>

        <div class="am-toast" id="am-toast"></div>
      </div>
    `;

    this._bindToolbarEvents();
  }

  _bindToolbarEvents() {
    const root = this.shadowRoot;

    root.getElementById('detail-close')?.addEventListener('click', () => this._closeDetail());
    root.getElementById('btn-fit')?.addEventListener('click', () => this._cy?.fit(undefined, 60));
    root.getElementById('btn-layout')?.addEventListener('click', () => this._runLayout());
    root.getElementById('btn-refresh')?.addEventListener('click', () => this._loadData());

    ['filter-automation', 'filter-entity', 'filter-helper'].forEach(id => {
      root.getElementById(id)?.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        if (this._filterTypes.has(type)) {
          this._filterTypes.delete(type);
          e.currentTarget.classList.remove('active');
        } else {
          this._filterTypes.add(type);
          e.currentTarget.classList.add('active');
        }
        this._applyFilters();
      });
    });

    const searchInput = root.getElementById('am-search-input');
    searchInput?.addEventListener('input', (e) => {
      this._searchTerm = e.target.value.toLowerCase();
      this._applyFilters();
    });
  }

  async _init() {
    await this._loadCytoscape();
    this._initCytoscape();
    await this._connectWebSocket();
    await this._loadData();
  }

  async _loadCytoscape() {
    // Load cytoscape from CDN or try bundled
    if (window.cytoscape) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Use jsdelivr as fallback — production installs should bundle locally
      script.src = 'https://cdn.jsdelivr.net/npm/cytoscape@3.28.1/dist/cytoscape.min.js';
      script.onload = resolve;
      script.onerror = () => {
        // Try cdnjs
        const s2 = document.createElement('script');
        s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js';
        s2.onload = resolve;
        s2.onerror = reject;
        document.head.appendChild(s2);
      };
      document.head.appendChild(script);
    });
  }

  _initCytoscape() {
    if (this._cyInitialized) return;
    const container = this.shadowRoot.getElementById('am-cy');
    if (!container || typeof cytoscape === 'undefined') return;

    this._cy = cytoscape({
      container,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(bgColor)',
            'border-color': 'data(borderColor)',
            'border-width': 2,
            'label': 'data(label)',
            'color': 'var(--primary-text-color, #f1f5f9)',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 4,
            'width': 'data(size)',
            'height': 'data(size)',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'shape': 'data(shape)',
            'text-background-color': 'transparent',
            'text-background-opacity': 0,
          }
        },
        {
          selector: 'node[?isGroup]',
          style: {
            'background-color': 'rgba(255,255,255,0.02)',
            'border-color': 'rgba(255,255,255,0.08)',
            'border-width': 1,
            'border-style': 'dashed',
            'label': 'data(label)',
            'color': 'var(--secondary-text-color, #64748b)',
            'font-size': '13px',
            'font-weight': 'bold',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -8,
            'shape': 'roundrectangle',
            'text-wrap': 'none',
            'padding': '20px',
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
          }
        },
        {
          selector: 'node.dimmed',
          style: { 'opacity': 0.2 }
        },
        {
          selector: 'node.hidden',
          style: { 'display': 'none' }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'data(edgeColor)',
            'target-arrow-color': 'data(edgeColor)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
            'opacity': 0.7,
          }
        },
        {
          selector: 'edge[label]',
          style: {
            'label': 'data(label)',
            'font-size': '9px',
            'color': 'var(--secondary-text-color, #64748b)',
            'text-rotation': 'autorotate',
            'text-background-color': 'transparent',
          }
        },
        {
          selector: 'edge.hidden',
          style: { 'display': 'none' }
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#38bdf8',
            'border-width': 3,
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
          }
        }
      ],
      layout: { name: 'preset' },
      wheelSensitivity: 0.3,
      minZoom: 0.05,
      maxZoom: 4,
    });

    // Node click → show detail
    this._cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (node.data('isGroup')) return;
      this._showDetail(node.data());
    });

    // Background click → close detail
    this._cy.on('tap', (evt) => {
      if (evt.target === this._cy) this._closeDetail();
    });

    this._cyInitialized = true;
  }

  // ─── WebSocket Connection ─────────────────────────────────────────────────
  async _connectWebSocket() {
    if (!this._hass) return;
    try {
      // Use the HA connection object directly if available
      if (this._hass.connection) {
        this._haConn = this._hass.connection;
        // Subscribe to state changed events
        this._haConn.subscribeEvents((event) => {
          this._onStateChanged(event);
        }, 'state_changed');
      }
    } catch (e) {
      console.warn('[AutomationMap] WebSocket subscribe failed:', e);
    }
  }

  _onStateChanged(event) {
    const { entity_id, new_state } = event.data || {};
    if (!entity_id || !new_state) return;
    this._stateCache[entity_id] = new_state;

    // Update node label if visible
    if (this._cy) {
      const node = this._cy.$(`#node-${entity_id.replace(/\./g, '_')}`);
      if (node && node.length) {
        const state = new_state.state;
        const unit = new_state.attributes?.unit_of_measurement || '';
        const friendly = new_state.attributes?.friendly_name || entity_id;
        const domain = entity_id.split('.')[0];
        const color = getDomainColor(domain);
        const label = `${color.icon} ${this._shortName(friendly)}\n${state}${unit ? ' ' + unit : ''}`;
        node.data('label', label);
        node.data('stateStr', state);
        node.data('unit', unit);
        node.data('attrs', new_state.attributes);

        // Pulse animation on change
        node.addClass('highlighted');
        setTimeout(() => node.removeClass('highlighted'), 1500);
      }
    }
  }

  _shortName(name, max = 18) {
    if (!name) return '';
    return name.length > max ? name.substring(0, max) + '…' : name;
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────
  async _loadData() {
    this._setLoading(true, 'Lade Bereiche (Areas)…');
    try {
      const conn = this._hass.connection;

      // Load areas
      const areasResult = await conn.sendMessagePromise({ type: 'config/area_registry/list' });
      this._areas = {};
      (areasResult || []).forEach(a => { this._areas[a.area_id] = a; });

      // Load entities with area assignments
      this._setLoading(true, 'Lade Entitäten…');
      const entitiesResult = await conn.sendMessagePromise({ type: 'config/entity_registry/list' });
      this._entityRegistry = {};
      (entitiesResult || []).forEach(e => { this._entityRegistry[e.entity_id] = e; });

      // Load devices
      const devicesResult = await conn.sendMessagePromise({ type: 'config/device_registry/list' });
      this._deviceRegistry = {};
      (devicesResult || []).forEach(d => { this._deviceRegistry[d.id] = d; });

      // Load all states
      this._setLoading(true, 'Lade Status-Werte…');
      const states = await conn.sendMessagePromise({ type: 'get_states' });
      this._stateCache = {};
      (states || []).forEach(s => { this._stateCache[s.entity_id] = s; });

      // Load automation configs
      this._setLoading(true, 'Lade Automatisierungen…');
      const automationStates = (states || []).filter(s => s.entity_id.startsWith('automation.'));
      this._automationConfigs = {};

      // Load each automation config
      for (const autoState of automationStates.slice(0, 200)) { // cap at 200
        try {
          const config = await conn.sendMessagePromise({
            type: 'automation/config',
            entity_id: autoState.entity_id,
          });
          if (config) this._automationConfigs[autoState.entity_id] = config;
        } catch (e) {
          // Some automations might not expose config via WS
        }
      }

      this._setLoading(true, 'Baue Graphen…');
      this._buildGraph();
      this._setLoading(false);
    } catch (e) {
      console.error('[AutomationMap] Error loading data:', e);
      this._setLoading(false);
      this._showToast('Fehler beim Laden: ' + (e.message || String(e)));
    }
  }

  // ─── Graph Building ───────────────────────────────────────────────────────
  _buildGraph() {
    if (!this._cy) return;
    this._cy.elements().remove();

    const nodes = [];
    const edges = [];
    const addedNodes = new Set();
    const connectedEntityIds = new Set();

    // Helper: add a node safely
    const addNode = (id, data) => {
      if (addedNodes.has(id)) return;
      addedNodes.add(id);
      nodes.push({ data: { id, ...data } });
    };

    // ─── Area group nodes ───────────────────────────────────────
    const areaIds = Object.keys(this._areas);
    areaIds.forEach(areaId => {
      const area = this._areas[areaId];
      addNode(`area-${areaId}`, {
        label: area.name,
        isGroup: true,
        areaId,
      });
    });
    // "No area" group
    addNode('area-none', { label: '🏠 Ohne Bereich', isGroup: true, areaId: null });

    // ─── Helper to get area for entity ─────────────────────────
    const getEntityArea = (entityId) => {
      const reg = this._entityRegistry[entityId];
      if (reg?.area_id) return reg.area_id;
      if (reg?.device_id) {
        const dev = this._deviceRegistry[reg.device_id];
        if (dev?.area_id) return dev.area_id;
      }
      return null;
    };

    // ─── Automation nodes ───────────────────────────────────────
    const automationStates = Object.values(this._stateCache).filter(s =>
      s.entity_id.startsWith('automation.')
    );

    automationStates.forEach(state => {
      const entityId = state.entity_id;
      const friendly = state.attributes?.friendly_name || entityId;
      const isOn = state.state === 'on';
      const color = getDomainColor('automation');
      const nodeId = `node-${entityId.replace(/\./g, '_')}`;
      const config = this._automationConfigs[entityId];
      const areaId = getEntityArea(entityId);

      addNode(nodeId, {
        label: `${color.icon} ${this._shortName(friendly)}\n${isOn ? '● aktiv' : '○ inaktiv'}`,
        entityId,
        friendly,
        domain: 'automation',
        nodeType: 'automation',
        stateStr: state.state,
        attrs: state.attributes || {},
        config: config || null,
        bgColor: color.bg,
        borderColor: isOn ? '#22c55e' : color.border,
        textColor: color.text,
        shape: 'roundrectangle',
        size: 52,
        areaId: areaId || 'none',
        parent: areaId ? `area-${areaId}` : 'area-none',
      });

      // Extract and link trigger entities
      if (config?.trigger) {
        const triggers = Array.isArray(config.trigger) ? config.trigger : [config.trigger];
        triggers.forEach((trig, i) => {
          const trigEntityIds = [];
          if (trig.entity_id) {
            (Array.isArray(trig.entity_id) ? trig.entity_id : [trig.entity_id]).forEach(id => trigEntityIds.push(id));
          }
          trigEntityIds.forEach(trigEnt => {
            if (this._stateCache[trigEnt]) {
              connectedEntityIds.add(trigEnt);
              const targetNodeId = `node-${trigEnt.replace(/\./g, '_')}`;
              edges.push({
                data: {
                  id: `edge-trigger-${entityId}-${trigEnt}-${i}`,
                  source: targetNodeId,
                  target: nodeId,
                  edgeColor: '#38bdf8',
                  edgeType: 'trigger',
                }
              });
            }
          });
        });
      }

      // Extract and link condition entities
      if (config?.condition) {
        const conditions = Array.isArray(config.condition) ? config.condition : [config.condition];
        conditions.forEach((cond, i) => {
          const condEntityIds = [];
          const scanCondition = (c) => {
            if (!c) return;
            if (c.entity_id) {
              (Array.isArray(c.entity_id) ? c.entity_id : [c.entity_id]).forEach(id => condEntityIds.push(id));
            }
            if (c.conditions) {
              c.conditions.forEach(scanCondition);
            }
          };
          scanCondition(cond);

          condEntityIds.forEach(condEnt => {
            if (this._stateCache[condEnt]) {
              connectedEntityIds.add(condEnt);
              const targetNodeId = `node-${condEnt.replace(/\./g, '_')}`;
              edges.push({
                data: {
                  id: `edge-condition-${entityId}-${condEnt}-${i}`,
                  source: targetNodeId,
                  target: nodeId,
                  edgeColor: 'rgba(148, 163, 184, 0.5)',
                  edgeType: 'condition',
                }
              });
            }
          });
        });
      }

      // Extract action targets
      if (config?.action) {
        const actions = Array.isArray(config.action) ? config.action : [config.action];
        actions.forEach((act, i) => {
          if (!act) return;
          const targetIds = [];
          const target = act.target?.entity_id;
          if (target) {
            (Array.isArray(target) ? target : [target]).forEach(id => targetIds.push(id));
          }
          targetIds.forEach(targEnt => {
            if (this._stateCache[targEnt]) {
              connectedEntityIds.add(targEnt);
              const targetNodeId = `node-${targEnt.replace(/\./g, '_')}`;
              edges.push({
                data: {
                  id: `edge-action-${entityId}-${targEnt}-${i}`,
                  source: nodeId,
                  target: targetNodeId,
                  edgeColor: '#a78bfa',
                  edgeType: 'action',
                }
              });
            }
          });
        });
      }
    });

    // ─── Regular entity & helper nodes ─────────────────────────
    const HELPER_DOMAINS = new Set(['input_boolean', 'input_number', 'input_select', 'input_text', 'input_datetime', 'input_button', 'timer', 'counter']);
    const SHOW_DOMAINS = new Set([
      'light', 'cover', 'climate', 'switch', 'sensor', 'binary_sensor',
      'fan', 'media_player', 'lock', 'vacuum', 'water_heater', 'scene',
      ...HELPER_DOMAINS
    ]);

    Object.values(this._stateCache).forEach(state => {
      const entityId = state.entity_id;
      const domain = entityId.split('.')[0];
      if (!SHOW_DOMAINS.has(domain)) return;
      if (entityId.startsWith('automation.')) return;

      // Only display entities that are connected to at least one automation
      if (!connectedEntityIds.has(entityId)) return;

      const nodeId = `node-${entityId.replace(/\./g, '_')}`;
      if (addedNodes.has(nodeId)) return; // already added (edge target)

      const friendly = state.attributes?.friendly_name || entityId;
      const stateVal = state.state;
      const unit = state.attributes?.unit_of_measurement || '';
      const color = getDomainColor(domain);
      const isHelper = HELPER_DOMAINS.has(domain);
      const areaId = getEntityArea(entityId);

      addNode(nodeId, {
        label: `${color.icon} ${this._shortName(friendly)}\n${stateVal}${unit ? ' ' + unit : ''}`,
        entityId,
        friendly,
        domain,
        nodeType: isHelper ? 'helper' : 'entity',
        stateStr: stateVal,
        unit,
        attrs: state.attributes || {},
        config: null,
        bgColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        shape: isHelper ? 'diamond' : 'ellipse',
        size: isHelper ? 44 : 40,
        areaId: areaId || 'none',
        parent: areaId ? `area-${areaId}` : 'area-none',
      });
    });

    // ─── Add all to graph ───────────────────────────────────────
    // Filter out group nodes if they have no children
    const groupsWithChildren = new Set();
    nodes.filter(n => !n.data.isGroup).forEach(n => {
      groupsWithChildren.add(n.data.parent);
    });

    const filteredNodes = nodes.filter(n => {
      if (n.data.isGroup) {
        return groupsWithChildren.has(n.data.id);
      }
      return true;
    });

    this._cy.add(filteredNodes);
    this._cy.add(edges.filter(e => {
      const src = this._cy.$(`#${e.data.source}`);
      const tgt = this._cy.$(`#${e.data.target}`);
      return src.length > 0 && tgt.length > 0;
    }));

    // Remove orphan group nodes from the graph
    const finalGroupsWithChildren = new Set();
    this._cy.nodes().not('[?isGroup]').forEach(n => {
      if (n.data('parent')) finalGroupsWithChildren.add(n.data('parent'));
    });
    this._cy.nodes('[?isGroup]').forEach(n => {
      if (!finalGroupsWithChildren.has(n.id())) n.remove();
    });

    this._runLayout();
    this._applyFilters();
  }

  _runLayout() {
    if (!this._cy || this._cy.nodes().length === 0) return;

    // Use compound layout (cola or cose-bilkent with compounds)
    // Fallback to cose if extensions not loaded
    const opts = {
      name: 'cose',
      animate: true,
      animationDuration: 600,
      animationEasing: 'ease-in-out-sine',
      fit: true,
      padding: 80,
      componentSpacing: 80,
      nodeRepulsion: () => 5000,
      nodeOverlap: 20,
      idealEdgeLength: () => 120,
      edgeElasticity: () => 32,
      nestingFactor: 1.2,
      gravity: 0.25,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
      randomize: false,
    };

    this._cy.layout(opts).run();
  }

  // ─── Filters ──────────────────────────────────────────────────────────────
  _applyFilters() {
    if (!this._cy) return;
    const search = this._searchTerm;
    const showAuto = this._filterTypes.has('automation');
    const showEntity = this._filterTypes.has('entity');
    const showHelper = this._filterTypes.has('helper');

    this._cy.nodes().not('[?isGroup]').forEach(node => {
      const type = node.data('nodeType');
      const friendly = (node.data('friendly') || '').toLowerCase();
      const entityId = (node.data('entityId') || '').toLowerCase();

      const typeOk = (type === 'automation' && showAuto) ||
                     (type === 'entity' && showEntity) ||
                     (type === 'helper' && showHelper);

      const searchOk = !search || friendly.includes(search) || entityId.includes(search);

      if (!typeOk || !searchOk || this._hiddenNodes.has(node.id())) {
        node.addClass('hidden');
      } else {
        node.removeClass('hidden');
      }
    });

    // Hide/show group nodes based on whether they have visible children
    this._cy.nodes('[?isGroup]').forEach(groupNode => {
      const visibleChildren = groupNode.children().not('.hidden');
      if (visibleChildren.length === 0) {
        groupNode.addClass('hidden');
      } else {
        groupNode.removeClass('hidden');
      }
    });

    // Hide edges where either endpoint is hidden
    this._cy.edges().forEach(edge => {
      const src = edge.source();
      const tgt = edge.target();
      if (src.hasClass('hidden') || tgt.hasClass('hidden')) {
        edge.addClass('hidden');
      } else {
        edge.removeClass('hidden');
      }
    });
  }

  // ─── Detail Panel ─────────────────────────────────────────────────────────
  _showDetail(data) {
    if (!data || data.isGroup) return;
    const panel = this.shadowRoot.getElementById('am-detail');
    if (!panel) return;

    const color = getDomainColor(data.domain || 'default');

    // Header
    const iconEl = this.shadowRoot.getElementById('detail-icon');
    iconEl.textContent = color.icon;
    iconEl.style.background = color.bg;
    iconEl.style.border = `2px solid ${color.border}`;

    this.shadowRoot.getElementById('detail-name').textContent = data.friendly || data.entityId || '—';
    this.shadowRoot.getElementById('detail-domain').textContent = data.domain + ' · ' + (data.entityId || '');

    const body = this.shadowRoot.getElementById('detail-body');
    const stateStr = data.stateStr || '—';
    const unit = data.unit || '';
    const attrs = data.attrs || {};

    let html = '';

    // State section
    html += `<div class="am-section">
      <div class="am-section-title">Status</div>
      <div class="am-prop-row">
        <span class="am-prop-key">Aktueller Zustand</span>
        <span class="am-prop-val">${this._renderStateBadge(stateStr)}${unit ? ' ' + unit : ''}</span>
      </div>`;

    // Key attributes
    const importantAttrs = ['friendly_name', 'brightness', 'color_temp', 'hvac_mode', 'temperature',
      'current_temperature', 'position', 'tilt_position', 'battery_level', 'unit_of_measurement',
      'device_class', 'last_triggered', 'mode', 'preset_mode'];

    importantAttrs.forEach(key => {
      if (attrs[key] !== undefined && key !== 'friendly_name' && key !== 'unit_of_measurement') {
        html += `<div class="am-prop-row">
          <span class="am-prop-key">${key}</span>
          <span class="am-prop-val">${this._formatAttrVal(attrs[key])}</span>
        </div>`;
      }
    });

    html += '</div>';

    // Automation-specific
    if (data.nodeType === 'automation' && data.config) {
      const config = data.config;

      // Triggers
      if (config.trigger || config.triggers) {
        const triggers = config.trigger || config.triggers;
        const tArr = Array.isArray(triggers) ? triggers : [triggers];
        if (tArr.length) {
          html += `<div class="am-section"><div class="am-section-title">Trigger (${tArr.length})</div>`;
          tArr.forEach((t, i) => {
            const type = t.trigger || t.platform || 'unknown';
            const desc = describeTrigger(t);
            html += `<div class="am-trigger-item">
              <div class="am-trigger-type">${type}</div>
              <div class="am-trigger-val">${this._escHtml(desc)}</div>
            </div>`;
          });
          html += '</div>';
        }
      }

      // Conditions
      if (config.condition || config.conditions) {
        const conditions = config.condition || config.conditions;
        const cArr = Array.isArray(conditions) ? conditions : [conditions];
        if (cArr.length) {
          html += `<div class="am-section"><div class="am-section-title">Bedingungen (${cArr.length})</div>`;
          cArr.forEach(c => {
            html += `<div class="am-condition-item">
              <div class="am-condition-type">${c.condition || 'unknown'}</div>
              <div class="am-trigger-val">${this._escHtml(describeCondition(c))}</div>
            </div>`;
          });
          html += '</div>';
        }
      }

      // Actions (first 5)
      if (config.action || config.actions) {
        const actions = config.action || config.actions;
        const aArr = (Array.isArray(actions) ? actions : [actions]).slice(0, 8);
        if (aArr.length) {
          html += `<div class="am-section"><div class="am-section-title">Aktionen (${aArr.length}${aArr.length === 8 ? '+' : ''})</div>`;
          aArr.forEach(a => {
            if (!a) return;
            const type = a.service || a.action || (a.delay ? 'delay' : a.choose ? 'choose' : a.if ? 'if/then' : 'unbekannt');
            html += `<div class="am-action-item">
              <div class="am-action-type">${type}</div>
              <div class="am-trigger-val">${this._escHtml(describeAction(a))}</div>
            </div>`;
          });
          html += '</div>';
        }
      }

      // Link to HA automation editor
      const haOrigin = this._getHAOrigin();
      if (haOrigin && data.entityId) {
        const autoId = data.entityId.replace('automation.', '');
        html += `<a class="am-link-btn" href="${haOrigin}/config/automation/edit/${data.attrs?.id || autoId}" target="_top">
          ${ICONS.link} In HA öffnen
        </a>`;
      }
    } else {
      // Entity/helper: show more attributes
      const allAttrs = Object.entries(attrs).filter(([k]) =>
        !['friendly_name', 'icon', 'entity_picture'].includes(k)
      ).slice(0, 12);

      if (allAttrs.length > 0) {
        html += `<div class="am-section"><div class="am-section-title">Attribute</div>`;
        allAttrs.forEach(([k, v]) => {
          html += `<div class="am-prop-row">
            <span class="am-prop-key">${k}</span>
            <span class="am-prop-val">${this._formatAttrVal(v)}</span>
          </div>`;
        });
        html += '</div>';
      }

      // Link to HA entity
      const haOrigin = this._getHAOrigin();
      if (haOrigin && data.entityId) {
        html += `<button class="am-link-btn" onclick="window.open('${haOrigin}/config/entities?search=${encodeURIComponent(data.entityId)}', '_top')">
          ${ICONS.link} In HA öffnen
        </button>`;
      }
    }

    body.innerHTML = html;
    panel.classList.add('open');
  }

  _closeDetail() {
    this.shadowRoot.getElementById('am-detail')?.classList.remove('open');
  }

  _renderStateBadge(state) {
    const cls = state === 'on' ? 'on' : state === 'off' ? 'off' : state === 'unavailable' ? 'unavailable' : '';
    return `<span class="am-state-badge ${cls}">${state}</span>`;
  }

  _formatAttrVal(val) {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'ja' : 'nein';
    if (typeof val === 'object') return JSON.stringify(val).substring(0, 80);
    return String(val);
  }

  _escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  _getHAOrigin() {
    // Try to find the HA origin
    if (window.location.hostname) {
      return window.location.origin;
    }
    return null;
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────
  _setLoading(show, text = '') {
    const el = this.shadowRoot.getElementById('am-loading');
    const txt = this.shadowRoot.getElementById('am-loading-text');
    if (!el) return;
    if (show) {
      el.classList.remove('hidden');
      if (txt) txt.textContent = text || 'Lade…';
    } else {
      el.classList.add('hidden');
    }
  }

  _showToast(message, duration = 3000) {
    const toast = this.shadowRoot.getElementById('am-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
}

customElements.define('automation-map-panel', AutomationMapPanel);
