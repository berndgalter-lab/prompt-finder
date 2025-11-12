/**
 * Prompt Finder — Variables v1 Frontend Resolver
 * Priority: Step > Workflow > Global (Profile) > Default (ACF) > Fallback
 * Supports:
 *  - {key} and {key|fallback}
 *  - workflow_var_injection_mode: 'conditional' (default) | 'direct'
 *  - *_profile_key (alias to global)
 *  - *_prefer_system (system keys before workflow/global)
 *  - Per-step allowProfile via [data-uses-global-vars]
 */

(function(){

  'use strict';

  // ============================================================
  // INIT GUARD: Prevent double initialization
  // ============================================================
  window.PF = window.PF || {};
  if (window.PF.__INIT_DONE__) {
    console.warn('[PF Workflows] Init skipped (already initialized)');
    return; // Abort early – do not bind events again
  }
  window.PF.__INIT_DONE__ = true;
  console.log('[PF Workflows] Initializing (single orchestrator mode)...');

  // Localized from PHP (Prompt 2). Always includes sys_*; profile keys only when allowed.
  const PF_USER_VARS = (typeof window.PF_USER_VARS === 'object' && window.PF_USER_VARS) ? window.PF_USER_VARS : {};

  // Unified live store for user-typed values across workflow+steps
  const PF_FORM_STORE = window.PF_FORM_STORE || {};

  // --- Helpers ---------------------------------------------------------------

  const keyNorm = k => String(k||'').trim().toLowerCase();

  function parseOptions(json){
    try {
      const v = JSON.parse(json || 'null');
      if (Array.isArray(v)) return v.map(x => ({ value: String(x), label: String(x) }));
      if (v && typeof v === 'object') return Object.entries(v).map(([value,label]) => ({ value, label: String(label) }));
    } catch(e){}
    return [];
  }

  function buildWorkflowMap(rows){
    const map = {};
    (rows || []).forEach(row=>{
      const k = keyNorm(row.workflow_var_key);
      if (!k) return;
      map[k] = {
        label: row.workflow_var_label || '',
        placeholder: row.workflow_var_placeholder || '',
        required: !!row.workflow_var_required,
        defaultValue: row.workflow_var_default_value ?? '',
        type: row.workflow_var_type || 'text',
        options: parseOptions(row.workflow_var_options_json),
        profileKey: keyNorm(row.workflow_var_profile_key || ''),
        preferSystem: !!row.workflow_var_prefer_system,
        hint: row.workflow_var_hint || '',
        injectionMode: row.workflow_var_injection_mode || 'conditional', // default
      };
    });
    return map;
  }

  function buildStepMap(rows){
    const map = {};
    (rows || []).forEach(row=>{
      const k = keyNorm(row.step_var_name);
      if (!k) return;
      map[k] = {
        label: row.step_var_label || '',
        placeholder: row.step_var_placeholder || '',
        description: row.step_var_description || '',
        required: !!row.step_var_required,
        defaultValue: (row.step_var_default ?? row.step_var_example_value ?? ''),
        type: row.step_var_type || 'text',
        options: parseOptions(row.step_var_options_json),
        profileKey: keyNorm(row.step_var_profile_key || ''),
        preferSystem: !!row.step_var_prefer_system,
        hint: row.step_var_hint || '',
        // Step rows do not carry injection mode; default to conditional
        injectionMode: 'conditional',
      };
    });
    return map;
  }

  function getTierForVariable(rawKey, ctx){
    const k = keyNorm(rawKey);
    if (ctx?.stepMap && ctx.stepMap[k]) return 'step';
    if (ctx?.workflowMap && ctx.workflowMap[k]) return 'workflow';
    return 'profile';
  }

  /**
   * Resolve a single key with full priority & flags.
   * ctx = { stepMap, workflowMap, allowProfile }
   * Returns { value, resolved, injMode, tier }
   */
  function resolveKey(rawKey, ctx){
    const k = keyNorm(rawKey);
    const { stepMap, workflowMap, allowProfile } = ctx;
    const sDef = stepMap[k];
    const wDef = workflowMap[k];
    const baseTier = getTierForVariable(k, ctx);
    let tier = baseTier;

    // 0) user-typed value (live form store)
    if (Object.prototype.hasOwnProperty.call(PF_FORM_STORE, k) && PF_FORM_STORE[k] !== '') {
      tier = baseTier;
      return { value: String(PF_FORM_STORE[k]), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
    }

    // Prefer system?
    const preferSystem = !!(sDef?.preferSystem || wDef?.preferSystem);
    if (preferSystem) {
      // System keys usually start with sys_; but allow explicit profileKey usage for system-like aliases
      const sysKey = k.startsWith('sys_') ? k : (sDef?.profileKey || wDef?.profileKey || '');
      if (sysKey && PF_USER_VARS[sysKey] != null) {
        tier = 'profile';
        return { value: String(PF_USER_VARS[sysKey]), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
      }
      if (k.startsWith('sys_') && PF_USER_VARS[k] != null) {
        tier = 'profile';
        return { value: String(PF_USER_VARS[k]), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
      }
    }

    // 1) Workflow-level prefilled value? (Optional: you can prefill PF_FORM_STORE from server)
    // Skipped here; we rely on defaults below if not typed.

    // 2) Global/Profile layer (only if allowed for this step)
    if (allowProfile) {
      const alias = sDef?.profileKey || wDef?.profileKey || '';
      const fromProfile = alias ? PF_USER_VARS[alias] : PF_USER_VARS[k];
      if (fromProfile != null && fromProfile !== '') {
        tier = 'profile';
        return { value: String(fromProfile), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
      }
    }

    // 3) Defaults (step first, then workflow)
    if (sDef?.defaultValue) {
      tier = 'step';
      return { value: String(sDef.defaultValue), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
    }
    if (wDef?.defaultValue) {
      tier = 'workflow';
      return { value: String(wDef.defaultValue), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
    }

    // 4) Unresolved -> keep placeholder; injMode carried for caller
    return { value: `{${k}}`, resolved: false, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional'), tier };
  }

  function renderPrompt(template, ctx, meta){
    const collect = meta || {};
    collect.sources = collect.sources || {};
    const output = String(template || '').replace(/\{([^}]+)\}/g, (_m, token) => {
      const [rawKey, fallback] = String(token).split('|');
      const r = resolveKey(rawKey, ctx);
      collect.sources[keyNorm(rawKey)] = r.tier;
      collect.lastTier = r.tier;
      if (!r.resolved) {
        // unresolved: depend on injection mode
        if ((r.injMode || 'conditional') === 'direct') {
          return (fallback !== undefined) ? fallback : '';
        }
        return (fallback !== undefined) ? fallback : `{${rawKey}}`;
      }
      return r.value;
    });
    return output;
  }

  // Render all prompts within a step section
  function renderStep(sectionEl, ctx){
    sectionEl.querySelectorAll('[data-prompt-template]').forEach(area=>{
      const base = area.getAttribute('data-base') || area.value || '';
      const meta = {};
      const out  = renderPrompt(base, ctx, meta);
      if (area.tagName === 'TEXTAREA' || area.tagName === 'INPUT') {
        area.value = out;
      } else {
        area.textContent = out;
      }
      if (meta.lastTier) {
        const label = meta.lastTier === 'profile' ? '✓ From Profile' : meta.lastTier === 'workflow' ? '✓ From Workflow' : '✓ From Step';
        area.setAttribute('data-source-tier', meta.lastTier);
        area.setAttribute('title', label);
      }
    });
  }

  // Bind inputs to PF_FORM_STORE and re-render
  function bindStep(sectionEl, ctx){
    sectionEl.querySelectorAll('[data-var-name]').forEach(inp=>{
      // Set placeholder from definitions if available
      const name = keyNorm(inp.getAttribute('data-var-name'));
      const sDef = ctx.stepMap[name];
      const wDef = ctx.workflowMap[name];
      const ph = sDef?.placeholder || wDef?.placeholder || '';
      if (ph && !inp.getAttribute('placeholder')) inp.setAttribute('placeholder', ph);

      // Init from current value if present
      if (inp.value && inp.value.trim() !== '') {
        PF_FORM_STORE[name] = inp.value;
      }

      inp.addEventListener('input', ()=>{
        PF_FORM_STORE[name] = inp.value;
        renderStep(sectionEl, ctx);
      });
    });
  }

  // Entry point: boot all steps on page
  function boot(){
    const wfEl = document.querySelector('[data-wf-vars]');
    const wfVarsJson = wfEl ? wfEl.getAttribute('data-wf-vars') : '[]';
    let wfRows = [];
    try { wfRows = JSON.parse(wfVarsJson || '[]'); } catch(e){ wfRows = []; }
    const workflowMap = buildWorkflowMap(wfRows);

    document.querySelectorAll('[data-pf-step]').forEach(section=>{
      const stepVarsJson = section.getAttribute('data-step-vars') || '[]';
      let stepRows = [];
      try { stepRows = JSON.parse(stepVarsJson); } catch(e){ stepRows = []; }
      const stepMap = buildStepMap(stepRows);

      const allowProfile = (section.getAttribute('data-uses-global-vars') === '1' || section.getAttribute('data-uses-global-vars') === 'true');

      const ctx = { stepMap, workflowMap, allowProfile };
      bindStep(section, ctx);
      renderStep(section, ctx);
    });
  }

// === UI helpers (append below existing code in pf-workflows.js) =============

// ====== UNIFIED VARIABLE RENDERING (v1.7) ======================================

/**
 * Escape HTML for safe display
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Render input element based on type
 */
function renderInput({ id, type, placeholder, value, options }) {
  switch ((type || 'text').toLowerCase()) {
    case 'textarea':
      return `<textarea class="pf-var-textarea" id="${id}" placeholder="${escapeHtml(placeholder || '')}">${escapeHtml(value || '')}</textarea>`;
    
    case 'select':
      const opts = (options || []).map(opt => {
        const val = escapeHtml(String(opt.value ?? opt));
        const label = escapeHtml(String(opt.label ?? opt.value ?? opt));
        const selected = String(value) === String(opt.value ?? opt) ? ' selected' : '';
        return `<option value="${val}"${selected}>${label}</option>`;
      }).join('');
      return `<select class="pf-var-select" id="${id}"><option value="">— select —</option>${opts}</select>`;
    
    case 'number':
      return `<input class="pf-var-input" type="number" id="${id}" placeholder="${escapeHtml(placeholder || '')}" value="${escapeHtml(String(value || ''))}" />`;
    
    case 'email':
      return `<input class="pf-var-input" type="email" id="${id}" placeholder="${escapeHtml(placeholder || '')}" value="${escapeHtml(String(value || ''))}" />`;
    
    case 'url':
      return `<input class="pf-var-input" type="url" id="${id}" placeholder="${escapeHtml(placeholder || '')}" value="${escapeHtml(String(value || ''))}" />`;
    
    case 'boolean':
      const checked = (value === '1' || value === 'true' || value === true) ? ' checked' : '';
      return `<input type="checkbox" id="${id}"${checked} />`;
    
    default:
      return `<input class="pf-var-input" type="text" id="${id}" placeholder="${escapeHtml(placeholder || '')}" value="${escapeHtml(String(value || ''))}" />`;
  }
}

/**
 * Unified variable row renderer (v2.1 - Best Practice UX/UI)
 * Clean structure, proper hierarchy, modern SaaS design
 * Returns HTML string for a single variable input row
 */
function renderVar({ id, label, required, type, placeholder, hint, defVal, value, options }) {
  const isFilled = value && String(value).trim() !== '';
  const status = required 
    ? (isFilled ? 'required-filled' : 'required-empty')
    : (isFilled ? 'optional-filled' : 'optional-empty');
  
  const badgeClass = required ? 'pf-var-required-badge' : 'pf-var-optional-badge';
  const badgeText = required ? 'REQUIRED' : 'optional';
  
  // Checkmark icon (filled checkmark or empty circle)
  const iconSvg = `
    <svg class="pf-var-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${isFilled 
        ? '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>'
        : '<circle cx="12" cy="12" r="10"></circle>'}
    </svg>
  `;
  
  // Hint icon (lightbulb SVG)
  const hintIconSvg = `
    <svg class="pf-var-hint-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2v1m0 18v1M4.22 4.22l.71.71m14.14 14.14.71.71M2 12h1m18 0h1M4.22 19.78l.71-.71m14.14-14.14.71-.71"/>
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 12v.01"/>
    </svg>
  `;
  
  return `
    <div class="pf-var ${required ? 'is-required' : 'is-optional'}" 
         data-var="${id}" 
         data-status="${status}"
         data-required="${required}">
      
      <!-- Checkmark Icon (left column) -->
      ${iconSvg}
      
      <!-- Content Area -->
      <div class="pf-var-content">
        
        <!-- 1. Label Row: Label (left) + Badge (right) -->
        <div class="pf-var-label-row">
          <label class="pf-var-label" for="${id}">${escapeHtml(label)}</label>
          <span class="${badgeClass}">${badgeText}</span>
        </div>
        
        <!-- 2. Input Field: Placeholder is INSIDE input -->
        <div class="pf-var-input-wrapper">
          ${renderInput({ id, type, placeholder, value, options })}
        </div>
        
        <!-- 3. Hint (optional, under input) -->
        ${hint ? `
          <div class="pf-var-hint">
            ${hintIconSvg}
            <span>${escapeHtml(hint)}</span>
          </div>
        ` : ''}
        
        <!-- 4. Meta Info (optional, shows default value if present) -->
        ${defVal && !isFilled ? `
          <div class="pf-var-meta">
            <span class="pf-var-default" title="Default value">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Default: ${escapeHtml(String(defVal))}
            </span>
          </div>
        ` : ''}
        
        <!-- 5. Error Message (hidden by default) -->
        <div class="pf-var__error" id="${id}-error" role="alert" aria-live="polite"></div>
        
      </div>
    </div>
  `;
}

/**
 * Setup accessibility & validation after inserting a variable
 */
function afterInsertVar(id, required) {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute('aria-describedby', `${id}-error`);
  if (required) el.setAttribute('aria-required', 'true');
  
  // Add event listener to update visual status on input
  el.addEventListener('input', () => updateVarStatus(id, required));
  el.addEventListener('change', () => updateVarStatus(id, required));
}

/**
 * Update visual status of a variable (checkmark + color border)
 */
function updateVarStatus(id, required) {
  // Find input by data-var-name attribute
  const el = document.querySelector(`[data-var-name="${id}"]`);
  if (!el) return;
  
  // Find wrapper by data-field-name
  const varWrap = document.querySelector(`.pf-var[data-field-name="${id}"]`);
  if (!varWrap) return;
  
  const value = el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value;
  const isFilled = value && String(value).trim() !== '';
  const status = required 
    ? (isFilled ? 'required-filled' : 'required-empty')
    : (isFilled ? 'optional-filled' : 'optional-empty');
  
  // Update data-status attribute
  varWrap.setAttribute('data-status', status);
  
  // Update checkmark icon
  const icon = varWrap.querySelector('.pf-var-status-icon');
  if (icon) {
    icon.innerHTML = isFilled
      ? '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>'
      : '<circle cx="12" cy="12" r="10"></circle>';
  }
  
  // Hide/show meta info (default value) when user fills input
  const metaInfo = varWrap.querySelector('.pf-var-meta');
  if (metaInfo) {
    metaInfo.style.display = isFilled ? 'none' : 'flex';
  }
  
  // Update counter
  updateVariablesCounter();
}

/**
 * Update the variables counter (X of Y completed)
 */
function updateVariablesCounter() {
  const counter = document.querySelector('.pf-variables-counter');
  if (!counter) return;
  
  const total = parseInt(counter.getAttribute('data-variables-total')) || 0;
  const allVars = document.querySelectorAll('.pf-var[data-field-name]');
  let filled = 0;
  
  allVars.forEach(varEl => {
    const fieldName = varEl.getAttribute('data-field-name');
    // Try both formats: "workflow-fieldname" and just "fieldname"
    let input = document.querySelector(`[data-var-name="${fieldName}"]`);
    if (!input) {
      input = document.getElementById(fieldName);
    }
    if (!input) {
      input = document.getElementById(`workflow-${fieldName}`);
    }
    
    if (input) {
      const value = input.type === 'checkbox' ? (input.checked ? '1' : '') : input.value;
      if (value && String(value).trim() !== '') {
        filled++;
      }
    }
  });
  
  const numberEl = counter.querySelector('.pf-counter-number');
  if (numberEl) numberEl.textContent = filled;
  
  // Update data attribute
  counter.setAttribute('data-variables-filled', filled);
}

/**
 * Set validity state for a variable
 */
function setVarValidity(id, isValid, msg = '') {
  const wrap = document.querySelector(`.pf-var[data-var="${id}"]`);
  const err = document.getElementById(`${id}-error`);
  if (!wrap || !err) return;
  
  wrap.classList.toggle('is-invalid', !isValid);
  
  const input = wrap.querySelector('.pf-var__input :is(input, textarea, select)');
  if (input) input.setAttribute('aria-invalid', (!isValid).toString());
  
  err.textContent = isValid ? '' : msg;
}

/**
 * Mount a variables area with single card wrapper
 */
function mountWorkflowVars(hostSel, title = 'Workflow variables', sub = 'Set required inputs to run this workflow.') {
  const host = document.querySelector(hostSel);
  if (!host) return null;
  
  host.innerHTML = [
    '<section class="pf-vars-card">',
      '<div class="pf-vars-card__head">',
        `<h2 class="pf-vars-card__title">${escapeHtml(title)}</h2>`,
        `<p class="pf-vars-card__sub">${escapeHtml(sub)}</p>`,
      '</div>',
      '<div class="pf-vars-list" id="pf-vars-list"></div>',
    '</section>'
  ].join('');
  
  return document.getElementById('pf-vars-list');
}

// ====== END UNIFIED RENDERING ======================================


function coerceBool(v){
  const s = String(v ?? '').trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on' || s === 'y';
}


  function ensureStaticBadge(container, id, text, modifier){
    if (!container) return;
    let badge = container.querySelector(`.pf-var-source-badge[data-badge="${id}"]`);
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'pf-var-source-badge';
      badge.dataset.badge = id;
      container.appendChild(badge);
    }
    badge.classList.remove('pf-var-source-badge--profile', 'pf-var-source-badge--workflow');
    if (modifier) badge.classList.add(modifier);
    badge.textContent = text;
  }

  function updateVariableSourceIndicator(wrap, key, ctx){
    if (!wrap) return;
    const resolved = resolveKey(key, ctx);
    const tier = resolved.resolved ? resolved.tier : 'unset';
    let badge = wrap.querySelector('.pf-var-source-badge[data-role="value-source"]');
    if (!badge) {
      const labelTarget = wrap.querySelector('.pf-field-label, .pf-var-label');
      badge = document.createElement('span');
      badge.className = 'pf-var-source-badge';
      badge.dataset.role = 'value-source';
      (labelTarget || wrap).appendChild(badge);
    }
    badge.classList.remove('pf-var-source-badge--profile', 'pf-var-source-badge--workflow', 'pf-var-source-badge--step');
    let label = '✓ From Step';
    if (tier === 'profile') {
      badge.classList.add('pf-var-source-badge--profile');
      label = '✓ From Profile';
    } else if (tier === 'workflow') {
      badge.classList.add('pf-var-source-badge--workflow');
      label = '✓ From Workflow';
    } else if (tier === 'step') {
      badge.classList.add('pf-var-source-badge--step');
      label = '✓ From Step';
    } else {
      badge.textContent = '⧗ Unresolved';
      wrap.dataset.valueSource = 'unset';
      return;
    }
    badge.textContent = label;
    wrap.dataset.valueSource = tier;
  }

  /**
   * Render a single control for a variable.
   * - container: element to append into
   * - level: 'workflow' | 'step'
   * - key: normalized key
   * - def: map entry
   */
  function renderVarControl(container, level, key, def, ctx, onChange){
    const type = (def.type || 'text').toLowerCase();
    const tierTag = getTierForVariable(key, ctx);
    const wrap = document.createElement('div');
    wrap.className = `pf-var pf-field pf-var-${level} pf-var-${type}`;
    wrap.classList.add('pf-var-item', `pf-var-item--${tierTag}`);
    wrap.setAttribute('data-variable-tier', tierTag);
    wrap.dataset.variableTier = tierTag;
    wrap.dataset.fieldName = key;
    wrap.dataset.state = 'pristine';
    wrap.dataset.var = key; // For updateVarStatus compatibility
    const workflowDef = ctx.workflowMap ? ctx.workflowMap[key] : undefined;
    const profileAlias = def.profileKey || workflowDef?.profileKey || '';

    wrap.dataset.required = def.required ? 'true' : 'false';

    const id = `${level}-${key}`;
    
    // Get initial value to determine status
    const initResolved = resolveKey(key, ctx);
    const initialValue = initResolved.resolved ? initResolved.value : (def.defaultValue ?? '');
    const isFilled = initialValue && String(initialValue).trim() !== '';
    const status = def.required 
      ? (isFilled ? 'required-filled' : 'required-empty')
      : (isFilled ? 'optional-filled' : 'optional-empty');
    wrap.dataset.status = status;
    
    // Add checkmark icon (left column) - Best Practice
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('class', 'pf-var-status-icon');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.setAttribute('stroke', 'currentColor');
    iconSvg.setAttribute('stroke-width', '2.5');
    iconSvg.setAttribute('stroke-linecap', 'round');
    iconSvg.setAttribute('stroke-linejoin', 'round');
    iconSvg.setAttribute('aria-hidden', 'true');
    iconSvg.innerHTML = isFilled
      ? '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>'
      : '<circle cx="12" cy="12" r="10"></circle>';
    wrap.appendChild(iconSvg);
    
    // Create content wrapper
    const contentWrap = document.createElement('div');
    contentWrap.className = 'pf-var-content';
    
    // Label Row (Label + Badge) - Best Practice
    const labelRow = document.createElement('div');
    labelRow.className = 'pf-var-label-row';
    
    const label = document.createElement('label');
    label.className = 'pf-var-label';
    label.htmlFor = id;
    const labelText = def.label || key;
    label.textContent = labelText; // Clean label without asterisk

    // Badge (REQUIRED = prominent, optional = subtle) - Best Practice
    const requirementBadge = document.createElement('span');
    requirementBadge.className = def.required ? 'pf-var-required-badge' : 'pf-var-optional-badge';
    requirementBadge.textContent = def.required ? 'REQUIRED' : 'optional';
    
    labelRow.appendChild(label);
    labelRow.appendChild(requirementBadge);
    contentWrap.appendChild(labelRow);

    // Input Wrapper - Best Practice
    const inputWrap = document.createElement('div');
    inputWrap.className = 'pf-var-input-wrapper';

    const placeholder = def.placeholder || '';

    let ctrl;
    switch (type) {
      case 'textarea': {
        ctrl = document.createElement('textarea');
        ctrl.rows = 4;
        ctrl.value = initialValue;
        if (placeholder) ctrl.setAttribute('placeholder', placeholder);
        break;
      }
      case 'number': {
        ctrl = document.createElement('input');
        ctrl.type = 'number';
        if (initialValue !== '') ctrl.value = initialValue;
        if (placeholder) ctrl.setAttribute('placeholder', placeholder);
        ctrl.inputMode = 'decimal';
        break;
      }
      case 'email': {
        ctrl = document.createElement('input');
        ctrl.type = 'email';
        if (initialValue !== '') ctrl.value = initialValue;
        if (placeholder) ctrl.setAttribute('placeholder', placeholder);
        break;
      }
      case 'url': {
        ctrl = document.createElement('input');
        ctrl.type = 'url';
        if (initialValue !== '') ctrl.value = initialValue;
        if (placeholder) ctrl.setAttribute('placeholder', placeholder);
        break;
      }
      case 'select': {
        ctrl = document.createElement('select');
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = placeholder || '— select —';
        ctrl.appendChild(emptyOpt);
        (def.options || []).forEach(optDef => {
          const opt = document.createElement('option');
          opt.value = String(optDef.value);
          opt.textContent = String(optDef.label ?? optDef.value);
          ctrl.appendChild(opt);
        });
        if (initialValue !== '') {
          ctrl.value = initialValue;
        }
        break;
      }
      case 'boolean': {
        ctrl = document.createElement('input');
        ctrl.type = 'checkbox';
        ctrl.checked = coerceBool(initialValue);
        inputWrap.classList.add('pf-field-input-wrapper--checkbox');
        break;
      }
      default: {
        ctrl = document.createElement('input');
        ctrl.type = 'text';
        if (initialValue !== '') ctrl.value = initialValue;
        if (placeholder) ctrl.setAttribute('placeholder', placeholder);
      }
    }

    ctrl.id = id;
    ctrl.setAttribute('data-var-name', key);
    ctrl.dataset.varName = key;
    ctrl.dataset.fieldType = type;
    ctrl.autocomplete = 'off';
    if (def.required) {
      ctrl.required = true;
      ctrl.setAttribute('aria-required', 'true');
    } else {
      ctrl.removeAttribute('required');
      ctrl.removeAttribute('aria-required');
    }

    // Add CSS classes for styling
    if (ctrl.tagName === 'TEXTAREA') {
      ctrl.classList.add('pf-var-textarea');
    } else if (ctrl.tagName === 'SELECT') {
      ctrl.classList.add('pf-var-select');
    } else if (ctrl.type === 'checkbox') {
      ctrl.classList.add('pf-var-checkbox');
      inputWrap.classList.add('pf-var-input-wrapper--checkbox');
    } else {
      ctrl.classList.add('pf-var-input');
    }

    inputWrap.appendChild(ctrl);
    contentWrap.appendChild(inputWrap);

    // Hint (under input with icon) - Best Practice
    const hintText = (def.description && def.description.trim()) || (def.hint && def.hint.trim()) || '';
    if (hintText) {
      const hintId = `${id}-hint`;
      const hint = document.createElement('div');
      hint.id = hintId;
      hint.className = 'pf-var-hint';
      
      // Lightbulb icon
      const hintIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      hintIcon.setAttribute('class', 'pf-var-hint-icon');
      hintIcon.setAttribute('width', '14');
      hintIcon.setAttribute('height', '14');
      hintIcon.setAttribute('viewBox', '0 0 24 24');
      hintIcon.setAttribute('fill', 'none');
      hintIcon.setAttribute('stroke', 'currentColor');
      hintIcon.setAttribute('stroke-width', '2');
      hintIcon.setAttribute('stroke-linecap', 'round');
      hintIcon.setAttribute('stroke-linejoin', 'round');
      hintIcon.setAttribute('aria-hidden', 'true');
      hintIcon.innerHTML = '<path d="M12 2v1m0 18v1M4.22 4.22l.71.71m14.14 14.14.71.71M2 12h1m18 0h1M4.22 19.78l.71-.71m14.14-14.14.71-.71"/><circle cx="12" cy="12" r="5"/><path d="M12 12v.01"/>';
      
      const hintSpan = document.createElement('span');
      hintSpan.textContent = hintText;
      
      hint.appendChild(hintIcon);
      hint.appendChild(hintSpan);
      contentWrap.appendChild(hint);
      
      // Link input to hint for accessibility
      ctrl.setAttribute('aria-describedby', hintId);
    }

    // Meta Info (Default Value) - Best Practice
    if (def.defaultValue && !isFilled) {
      const metaInfo = document.createElement('div');
      metaInfo.className = 'pf-var-meta';
      
      const defaultSpan = document.createElement('span');
      defaultSpan.className = 'pf-var-default';
      defaultSpan.title = 'Default value';
      
      const refreshIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      refreshIcon.setAttribute('width', '12');
      refreshIcon.setAttribute('height', '12');
      refreshIcon.setAttribute('viewBox', '0 0 24 24');
      refreshIcon.setAttribute('fill', 'none');
      refreshIcon.setAttribute('stroke', 'currentColor');
      refreshIcon.setAttribute('stroke-width', '2');
      refreshIcon.setAttribute('stroke-linecap', 'round');
      refreshIcon.setAttribute('stroke-linejoin', 'round');
      refreshIcon.setAttribute('aria-hidden', 'true');
      refreshIcon.innerHTML = '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>';
      
      defaultSpan.appendChild(refreshIcon);
      defaultSpan.appendChild(document.createTextNode(' Default: ' + def.defaultValue));
      metaInfo.appendChild(defaultSpan);
      contentWrap.appendChild(metaInfo);
    }

    // Error Message - Best Practice
    const errorEl = document.createElement('div');
    errorEl.className = 'pf-var__error';
    errorEl.id = `${id}-error`;
    errorEl.style.display = 'none';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'polite');
    contentWrap.appendChild(errorEl);

    // Append content wrapper to main wrap
    wrap.appendChild(contentWrap);
    
    // Add to container
    container.appendChild(wrap);

    const isBoolean = type === 'boolean';
    const required = !!def.required;
    let touched = false;

    function storeValue(){
      if (ctrl.type === 'checkbox') {
        PF_FORM_STORE[key] = ctrl.checked ? '1' : '0';
      } else {
        PF_FORM_STORE[key] = ctrl.value;
      }
    }

    function getValidationValue(){
      if (isBoolean) {
        return ctrl.checked ? '1' : '';
      }
      if (ctrl.tagName === 'SELECT') {
        return ctrl.value;
      }
      return (ctrl.value || '').trim();
    }

    function applyState(state, message){
      wrap.dataset.state = state;
      validation.dataset.state = state;
      
      // Toggle .is-empty class for required fields
      const isEmpty = !getValidationValue();
      if (required && isEmpty) {
        ctrl.classList.add('is-empty');
        wrap.classList.add('is-required');
      } else {
        ctrl.classList.remove('is-empty');
        if (!required) {
          wrap.classList.remove('is-required');
        }
      }
      
      if (state === 'valid') {
        validation.style.opacity = '1';
        validation.textContent = '✓';
      } else if (state === 'invalid') {
        validation.style.opacity = '1';
        validation.textContent = '!';
      } else {
        validation.style.opacity = '0';
        validation.textContent = '✓';
      }

      if (required) {
        if (state === 'invalid') {
          errorEl.style.display = 'block';
          errorEl.textContent = message || 'This field is required';
          ctrl.classList.add('invalid');
          ctrl.classList.remove('valid');
          ctrl.setAttribute('aria-invalid', 'true');
        } else {
          errorEl.style.display = 'none';
          errorEl.textContent = '';
          ctrl.classList.remove('invalid');
          if (state === 'valid') {
            ctrl.classList.add('valid');
            ctrl.setAttribute('aria-invalid', 'false');
          } else {
            ctrl.classList.remove('valid');
            ctrl.removeAttribute('aria-invalid');
          }
        }
      } else {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
        ctrl.classList.remove('invalid');
        ctrl.classList.remove('valid');
        if (state === 'invalid') {
          ctrl.setAttribute('aria-invalid', 'true');
          errorEl.style.display = 'block';
          errorEl.textContent = message || 'This field is required';
        } else if (state === 'valid') {
          ctrl.setAttribute('aria-invalid', 'false');
          errorEl.style.display = 'none';
          errorEl.textContent = '';
        } else {
          ctrl.removeAttribute('aria-invalid');
          errorEl.style.display = 'none';
          errorEl.textContent = '';
        }
      }
    }

    function runValidation(trigger){
      if (isBoolean) {
        const shouldFlagRequired = required && (trigger === 'blur' || trigger === 'change');
        const state = ctrl.checked ? 'valid' : (shouldFlagRequired ? 'invalid' : 'pristine');
        const message = state === 'invalid' ? 'This field is required' : '';
        applyState(state, message);
        return state;
      }

      if (trigger === 'blur' || trigger === 'change') {
        touched = true;
      }

      const trimmed = getValidationValue();
      if (!touched && trimmed !== '') {
        touched = true;
      }

      const check = validateValueByType(type, trimmed);
      let state = 'pristine';
      let message = '';

      if (trimmed !== '' && !check.ok) {
        state = 'invalid';
        message = check.msg || 'Invalid value';
      } else if (trimmed !== '') {
        state = 'valid';
      } else if (required && touched) {
        state = 'invalid';
        message = 'This field is required';
      }

      applyState(state, message);
      return state;
    }

    if (isBoolean) {
      touched = ctrl.checked;
    } else {
      touched = getValidationValue() !== '';
    }

    runValidation('init');

    const emitChange = ()=>{
      markDirty();
      updateVariableSourceIndicator(wrap, key, ctx);
      updateStatusBar(ctx.workflowMap || {});
      if (typeof onChange === 'function') onChange();
    };

    const handleValueChange = (trigger)=>{
      storeValue();
      runValidation(trigger);
      emitChange();
      // Update visual status (checkmark + border color) - Best Practice
      updateVarStatus(key, required);
    };

    if (isBoolean || ctrl.tagName === 'SELECT') {
      ctrl.addEventListener('change', ()=>handleValueChange('change'));
    } else {
      ctrl.addEventListener('input', ()=>handleValueChange('input'));
      ctrl.addEventListener('change', ()=>handleValueChange('change'));
    }

    ctrl.addEventListener('blur', ()=>{
      runValidation('blur');
    });
  }


function isProfileEnabled(){
  const container = document.querySelector('.pf-workflow-container');
  return !!(container && container.getAttribute('data-profile-enabled') === 'true');
}


function updateWorkflowProgressVisual(filled, total){
  const wrap = document.querySelector('[data-variables-progress]');
  if (!wrap) return;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  wrap.dataset.filled = String(filled);
  wrap.dataset.total = String(total);
  const textEl = wrap.querySelector('[data-variables-progress-text]');
  if (textEl) {
    textEl.textContent = `${filled} of ${total} completed`;
  }
  const barEl = wrap.querySelector('[role="progressbar"]');
  if (barEl) {
    barEl.setAttribute('aria-valuenow', String(pct));
  }
  const fillEl = wrap.querySelector('[data-variables-progress-fill]');
  if (fillEl) {
    fillEl.style.width = `${pct}%`;
    fillEl.setAttribute('aria-valuenow', String(pct));
  }
}


function renderWorkflowCounter(workflowMap){
  const counter = document.querySelector('.pf-workflow-vars-card .pf-variables-counter') || document.querySelector('.pf-variables--workflow .pf-variables-counter');
  if (!counter) return;
  const keys = Object.keys(workflowMap || {});
  const allowProfile = isProfileEnabled();
  let filled = 0;
  keys.forEach(k => {
    const res = resolveKey(k, { stepMap: {}, workflowMap, allowProfile });
    if (isResolved(res.value)) filled++;
  });
  counter.dataset.variablesFilled = String(filled);
  counter.dataset.variablesTotal = String(keys.length);
  const numberEl = counter.querySelector('.pf-counter-number');
  const totalEl = counter.querySelector('.pf-counter-total');
  if (numberEl) numberEl.textContent = String(filled);
  if (totalEl) totalEl.textContent = keys.length ? `/ ${keys.length}` : '/ 0';
  updateWorkflowProgressVisual(filled, keys.length);
  updateStatusBar(workflowMap);
}


let statusListenersBound = false;


function getActiveStepSection(){
  const steps = Array.from(document.querySelectorAll('[data-pf-step]')).filter(step => !step.classList.contains('pf-step--locked'));
  if (!steps.length) return null;
  const expanded = steps.find(step => !step.classList.contains('is-collapsed'));
  return expanded || steps[0];
}


function computeStepTierStatus(sectionEl, workflowMap){
  if (!sectionEl) {
    return { filled: 0, total: 0 };
  }
  const raw = sectionEl.getAttribute('data-step-vars') || '[]';
  let rows = [];
  try { rows = JSON.parse(raw); } catch(e) { rows = []; }
  const stepMap = buildStepMap(rows);
  const allowProfileFlag = (sectionEl.getAttribute('data-uses-global-vars') === '1' || sectionEl.getAttribute('data-uses-global-vars') === 'true') && isProfileEnabled();
  const keys = Object.keys(stepMap);
  let filled = 0;
  keys.forEach(k => {
    const res = resolveKey(k, { stepMap, workflowMap, allowProfile: allowProfileFlag });
    if (isResolved(res.value)) filled++;
  });
  return { filled, total: keys.length };
}


function updateStatusBar(workflowMap){
  const bar = document.querySelector('.pf-variable-status-bar');
  if (!bar) return;

  const countEl = bar.querySelector('.pf-status-count');
  const simpleEl = bar.querySelector('.pf-status-simple');
  if (!countEl || !simpleEl) return;

  let totalFilled = 0;
  let totalCount = 0;

  // 1. Count workflow-level variables
  const workflowKeys = Object.keys(workflowMap || {});
  totalCount += workflowKeys.length;
  const allowProfile = isProfileEnabled();
  workflowKeys.forEach(k => {
    const res = resolveKey(k, { stepMap: {}, workflowMap, allowProfile });
    if (isResolved(res.value)) totalFilled++;
  });

  // 2. Count ALL step variables (not just active step)
  document.querySelectorAll('[data-pf-step]').forEach(sectionEl => {
    const stepVarsJson = sectionEl.getAttribute('data-step-vars') || '[]';
    let stepRows = [];
    try { stepRows = JSON.parse(stepVarsJson); } catch(e) { stepRows = []; }
    const stepMap = buildStepMap(stepRows);
    const stepKeys = Object.keys(stepMap);
    totalCount += stepKeys.length;
    
    stepKeys.forEach(k => {
      const res = resolveKey(k, { stepMap, workflowMap, allowProfile });
      if (isResolved(res.value)) totalFilled++;
    });
  });

  // Update display
  countEl.textContent = `${totalFilled} of ${totalCount}`;
  countEl.dataset.filled = String(totalFilled);
  countEl.dataset.total = String(totalCount);

  // Visual feedback when complete
  const statusContainer = document.querySelector('.pf-variable-status');
  const successMessage = document.querySelector('.pf-variable-status-success');
  
  if (totalCount > 0 && totalFilled === totalCount) {
    simpleEl.classList.add('is-complete');
    
    // Auto-hide logic with celebration
    if (statusContainer && statusContainer.dataset.autoHide === 'true') {
      // Add complete state
      statusContainer.classList.add('is-complete');
      
      // Celebrate first
      statusContainer.classList.add('is-celebrating');
      
      // Show success message
      if (successMessage) {
        successMessage.classList.add('is-visible');
      }
      
      // Hide after 2 seconds
      setTimeout(() => {
        statusContainer.classList.add('is-hidden');
        statusContainer.classList.remove('is-celebrating');
      }, 2000);
    }
  } else {
    simpleEl.classList.remove('is-complete');
    
    // Reset if user unfills inputs
    if (statusContainer) {
      statusContainer.classList.remove('is-complete', 'is-hidden', 'is-celebrating');
    }
    if (successMessage) {
      successMessage.classList.remove('is-visible');
    }
  }

  // Announce to screen readers
  countEl.setAttribute('aria-label', `${totalFilled} of ${totalCount} inputs filled`);
}


function bindVariableStatusListeners(workflowMap){
  if (statusListenersBound) return;
  statusListenersBound = true;

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="toggle-step"]')) {
      requestAnimationFrame(() => updateStatusBar(workflowMap));
    }
  });

  document.addEventListener('stepCompleted', () => {
    updateStatusBar(workflowMap);
  });

  // Tooltip toggle for info button
  const infoBtn = document.querySelector('.pf-status-info');
  const tooltip = document.querySelector('.pf-status-tooltip');
  
  if (infoBtn && tooltip) {
    infoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = tooltip.hasAttribute('hidden');
      if (isHidden) {
        tooltip.removeAttribute('hidden');
        infoBtn.setAttribute('aria-expanded', 'true');
      } else {
        tooltip.setAttribute('hidden', '');
        infoBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pf-variable-status-bar')) {
        tooltip.setAttribute('hidden', '');
        infoBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !tooltip.hasAttribute('hidden')) {
        tooltip.setAttribute('hidden', '');
        infoBtn.setAttribute('aria-expanded', 'false');
        infoBtn.focus();
      }
    });
  }
}


/**
 * Render the workflow-level form (affects all steps).
 * Expects a container with [data-wf-form].
 */
function renderWorkflowForm(containerEl, workflowMap, ctx, rerenderAllSteps){
  if (!containerEl) return;
  
  // Apply PF-UI Contract classes to root
  if (!containerEl.classList.contains('pf-card')) {
    containerEl.classList.add('pf-card', 'pf-stack', 'pf-grid-2', 'pf-vars--workflow');
  }
  
  containerEl.innerHTML = '';
  const handleChange = ()=>{
    if (typeof rerenderAllSteps === 'function') rerenderAllSteps();
    renderWorkflowCounter(workflowMap);
  };
  Object.keys(workflowMap).forEach(k=>{
    renderVarControl(containerEl, 'workflow', k, workflowMap[k], ctx, handleChange);
  });
  initAutoSaveIntegration();
  renderWorkflowCounter(workflowMap);
}


/**
 * Render step-level variable controls inside a step section.
 * Expects a child container [data-step-vars-ui].
 */
function renderStepForm(sectionEl, stepMap, ctx){
  const target = sectionEl.querySelector('[data-step-vars-ui]');
  if (!target) return;
  
  // Apply PF-UI Contract classes to root
  if (!target.classList.contains('pf-card')) {
    target.classList.add('pf-card', 'pf-stack', 'pf-grid-2', 'pf-vars--steps');
  }
  
  target.innerHTML = '';
  const handleChange = ()=>{
    renderStep(sectionEl, ctx);
    updateStatusBar(ctx.workflowMap || {});
  };
  Object.keys(stepMap).forEach(k=>{
    renderVarControl(target, 'step', k, stepMap[k], ctx, handleChange);
  });
  initAutoSaveIntegration();
  updateStatusBar(ctx.workflowMap || {});
}


// === integrate into boot() (replace the end of boot with this) ==============

const _orig_boot = boot;

boot = function(){
  bindMobileInputScroll();
  const wfEl = document.querySelector('[data-wf-vars]');
  const wfVarsJson = wfEl ? wfEl.getAttribute('data-wf-vars') : '[]';
  let wfRows = [];
  try { wfRows = JSON.parse(wfVarsJson || '[]'); } catch(e){ wfRows = []; }
  const workflowMap = buildWorkflowMap(wfRows);

  // render workflow-level form if present
  const wfForm = document.querySelector('[data-wf-form]');
  const rerenderAll = ()=> {
    document.querySelectorAll('[data-pf-step]').forEach(section=>{
      const stepVarsJson = section.getAttribute('data-step-vars') || '[]';
      let stepRows = [];
      try { stepRows = JSON.parse(stepVarsJson); } catch(e){ stepRows = []; }
      const allowProfile = (section.getAttribute('data-uses-global-vars') === '1' || section.getAttribute('data-uses-global-vars') === 'true') && isProfileEnabled();
      const stepMap = buildStepMap(stepRows);
      const ctx = { stepMap, workflowMap, allowProfile };
      renderStep(section, ctx);
      const bar = section.querySelector('.pf-step-toolbar');
      const statusEl = bar ? bar.querySelector('[data-step-status]') : null;
      if (statusEl) {
        const s = computeStatus(stepMap, workflowMap, allowProfile);
        renderStatus(statusEl, s);
      }
    });
    renderWorkflowCounter(workflowMap);
    updateStatusBar(workflowMap);
  };
  const workflowCtx = { stepMap: {}, workflowMap, allowProfile: isProfileEnabled() };
  renderWorkflowForm(wfForm, workflowMap, workflowCtx, rerenderAll);

  // Boot each step: render controls + initial render
  document.querySelectorAll('[data-pf-step]').forEach(section=>{
    const stepVarsJson = section.getAttribute('data-step-vars') || '[]';
    let stepRows = [];
    try { stepRows = JSON.parse(stepVarsJson); } catch(e){ stepRows = []; }
    const allowProfile = (section.getAttribute('data-uses-global-vars') === '1' || section.getAttribute('data-uses-global-vars') === 'true') && isProfileEnabled();
    const stepMap = buildStepMap(stepRows);
    const ctx = { stepMap, workflowMap, allowProfile };

    renderStepForm(section, stepMap, ctx);
    bindStep(section, ctx); // keeps manual binds for any pre-existing inputs
    renderStep(section, ctx);
  });
  updateStatusBar(workflowMap);
  bindVariableStatusListeners(workflowMap);
};


// ====== VALIDATION & UX POLISH =============================================


// Namespacing for localStorage
function getStorageKey(){
  const root = document.querySelector('[data-wf-root]');
  if (!root) return 'pf:vars';
  const wfId = root.getAttribute('data-wf-id') || 'wf';
  const uid  = root.getAttribute('data-user-uid') || 'anon';
  return `pf:vars:${wfId}:${uid}`;
}


const AUTOSAVE_DEBOUNCE_MS = 10000;
let autosaveTimer = null;
let autosaveStatusEl = null;
let mobileFocusBound = false;
let hasUnsavedChanges = false;

function getAutosaveStatusEl(){
  if (!autosaveStatusEl) {
    autosaveStatusEl = document.querySelector('.pf-autosave-status');
  }
  return autosaveStatusEl;
}

function setAutosaveStatus(state, message){
  const el = getAutosaveStatusEl();
  if (!el) return;
  if (state) {
    el.setAttribute('data-status', state);
  }
  if (message) {
    const textEl = el.querySelector('.pf-autosave-text');
    if (textEl) textEl.textContent = message;
  }
}

function scheduleAutosave(){
  if (autosaveTimer) {
    window.clearTimeout(autosaveTimer);
  }
  autosaveTimer = window.setTimeout(()=>{
    autosaveTimer = null;
    if (!hasUnsavedChanges) return;
    setAutosaveStatus('saving', 'Saving...');
    saveDraft();
  }, AUTOSAVE_DEBOUNCE_MS);
}

function bindMobileInputScroll(){
  if (mobileFocusBound) return;
  const mq = window.matchMedia('(max-width: 768px)');
  if (!mq.matches) return;
  mobileFocusBound = true;
  document.addEventListener('focusin', (event)=>{
    const el = event.target;
    if (!el || !el.classList || !el.classList.contains('pf-field-input')) return;
    window.setTimeout(()=>{
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {}
    }, 150);
  });
}


function initSmoothSidebarScroll(){
  const links = document.querySelectorAll('.pf-sidebar-link[href^="#"]');
  if (!links.length) return;
  links.forEach(link => {
    if (link.dataset.smoothScrollBound === '1') return;
    link.dataset.smoothScrollBound = '1';
    link.addEventListener('click', function(event){
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      event.preventDefault();
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      const headerOffset = 100;
      const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      document.querySelectorAll('.pf-sidebar-link.is-active').forEach(l => l.classList.remove('is-active'));
      this.classList.add('is-active');
      if (targetEl.matches('[data-pf-step]')) {
        focusStepElement(targetEl);
      }
    });
  });
}


let keyboardShortcutsBound = false;
function initKeyboardShortcuts(){
  if (keyboardShortcutsBound) return;
  keyboardShortcutsBound = true;
  document.addEventListener('keydown', (event)=>{
    if (event.defaultPrevented) return;
    if (event.target && (event.target.matches('input, textarea, select') || event.target.isContentEditable)) return;
    const steps = Array.from(document.querySelectorAll('.pf-step')).filter(step => !step.classList.contains('pf-step--locked'));
    if (!steps.length) return;
    const active = document.querySelector('.pf-step--active') || steps[0];
    const currentIndex = steps.indexOf(active);
    const key = event.key.toLowerCase();

    if (key === 'j' && currentIndex < steps.length - 1) {
      event.preventDefault();
      const next = steps[currentIndex + 1];
      focusStepElement(next, active);
    } else if (key === 'k' && currentIndex > 0) {
      event.preventDefault();
      const prev = steps[currentIndex - 1];
      focusStepElement(prev, active);
    } else if (key === 'c' && (event.metaKey || event.ctrlKey)) {
      const copyBtn = active ? active.querySelector('.pf-btn-copy-hero') : null;
      if (copyBtn) {
        event.preventDefault();
        copyBtn.click();
      }
    }
  });

  console.log('Keyboard shortcuts: J (next), K (prev), Cmd/Ctrl+C (copy prompt)');
}


function focusStepElement(stepElement, previousStep){
  if (!stepElement) return;
  if (window.WorkflowSteps && typeof window.WorkflowSteps.navigateToStep === 'function') {
    window.WorkflowSteps.navigateToStep(stepElement);
  } else {
    document.querySelectorAll('.pf-step').forEach(step => step.classList.remove('pf-step--active'));
    stepElement.classList.add('pf-step--active');
    stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  highlightSidebarLink(stepElement.id || stepElement.getAttribute('data-step-id'));
}


function highlightSidebarLink(stepId){
  if (!stepId) return;
  document.querySelectorAll('.pf-sidebar-link.is-active').forEach(link => link.classList.remove('is-active'));
  try {
    const selector = `.pf-sidebar-link[href="#${CSS.escape(stepId)}"]`;
    const link = document.querySelector(selector);
    if (link) link.classList.add('is-active');
  } catch(e){
    const link = document.querySelector(`.pf-sidebar-link[href="#${stepId}"]`);
    if (link) link.classList.add('is-active');
  }
}


function initAutoSaveIntegration(){
  document.querySelectorAll('.pf-field-input, .pf-var-input').forEach(input => {
    if (input.dataset.autosaveBound === '1') return;
    input.dataset.autosaveBound = '1';
    input.addEventListener('input', () => markDirty());
    input.addEventListener('change', () => markDirty());
  });
}


function updateProgressBarFallback(){
  const steps = document.querySelectorAll('.pf-step');
  const total = steps.length;
  const completed = document.querySelectorAll('.pf-step-checkbox:checked').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.querySelectorAll('.pf-progress-fill, .pf-progress-fill-hero').forEach(bar => {
    bar.style.width = `${pct}%`;
    bar.dataset.progress = String(pct);
  });
  const heroLabel = document.querySelector('.pf-progress-label[data-progress-label]');
  if (heroLabel) {
    heroLabel.textContent = `${pct}%`;
  }
  const summary = document.querySelector('[data-progress-summary]');
  if (summary) summary.textContent = `${completed} of ${total} steps completed`;
}


function bindProgressPersistence(){
  const workflowId = getWorkflowId();
  if (!workflowId) return;
  const storageKey = `pf_workflow_${workflowId}_progress`;

  function getStepStorageKey(step){
    if (!step) return null;
    if (step.dataset.progressKey) return step.dataset.progressKey;
    const key = step.id || step.getAttribute('data-step-id') || step.getAttribute('data-step-number');
    if (key) step.dataset.progressKey = key;
    return key;
  }

  function saveProgressState(){
    const progress = {};
    document.querySelectorAll('.pf-step-checkbox').forEach(cb => {
      const step = cb.closest('.pf-step');
      const key = getStepStorageKey(step);
      if (!key) return;
      progress[key] = cb.checked;
      if (step) step.classList.toggle('pf-step--completed', cb.checked);
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (e) {}
    if (window.WorkflowProgress && typeof window.WorkflowProgress.update === 'function') {
      window.WorkflowProgress.update();
    } else {
      updateProgressBarFallback();
    }
    if (window.WorkflowSteps && typeof window.WorkflowSteps.updateProgressCounter === 'function') {
      window.WorkflowSteps.updateProgressCounter();
    }
  }

  function restoreProgressState(){
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
    } catch (e) {
      stored = {};
    }

    document.querySelectorAll('.pf-step-checkbox').forEach(cb => {
      const step = cb.closest('.pf-step');
      const key = getStepStorageKey(step);
      const hasStored = key && Object.prototype.hasOwnProperty.call(stored, key);
      const shouldCheck = hasStored ? !!stored[key] : cb.checked;
      cb.checked = shouldCheck;
      if (step) step.classList.toggle('pf-step--completed', cb.checked);
    });

    if (window.WorkflowProgress && typeof window.WorkflowProgress.update === 'function') {
      window.WorkflowProgress.update();
    } else {
      updateProgressBarFallback();
    }
    if (window.WorkflowSteps && typeof window.WorkflowSteps.updateProgressCounter === 'function') {
      window.WorkflowSteps.updateProgressCounter();
    }
  }

  document.querySelectorAll('.pf-step-checkbox').forEach(cb => {
    if (cb.dataset.progressBound === '1') return;
    cb.dataset.progressBound = '1';
    cb.addEventListener('change', saveProgressState);
  });

  restoreProgressState();
  saveProgressState();
}

// Load/save PF_FORM_STORE
function loadDraft(){
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object'){
      Object.assign(PF_FORM_STORE, obj);
    }
  } catch(e){}
}
function saveDraft(){
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(PF_FORM_STORE));
  } catch(e){}
  persistWorkflowSnapshot();
  if (autosaveTimer) {
    window.clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  DIRTY = false;
  hasUnsavedChanges = false;
  setAutosaveStatus('saved', 'All changes saved');
}


function getWorkflowContainer(){
  return document.querySelector('.pf-workflow-container');
}


function getWorkflowId(){
  const container = getWorkflowContainer();
  return container ? container.getAttribute('data-post-id') : null;
}


function persistWorkflowSnapshot(){
  const workflowId = getWorkflowId();
  if (!workflowId) return;
  try {
    localStorage.setItem(`pf_workflow_${workflowId}_vars`, JSON.stringify(PF_FORM_STORE));
  } catch(e){}
}


function restoreLocalWorkflowVars(){
  const workflowId = getWorkflowId();
  if (!workflowId) return;
  try {
    const raw = localStorage.getItem(`pf_workflow_${workflowId}_vars`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      Object.assign(PF_FORM_STORE, parsed);
    }
  } catch(e){}
}


// Simple validators
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const URL_RE   = /^(https?:\/\/|\/)[^\s]+$/i;


function validateValueByType(type, val){
  const v = String(val ?? '').trim();
  if (v === '') return { ok: true };
  switch ((type||'text').toLowerCase()){
    case 'email':  return { ok: EMAIL_RE.test(v), msg: 'Invalid email format' };
    case 'url':    return { ok: URL_RE.test(v),   msg: 'Invalid URL (use http(s):// or /)' };
    case 'number': return { ok: !isNaN(Number(v)), msg: 'Must be a number' };
    case 'boolean': return { ok: v === '1' || v === '0' || v === '' };
    default: return { ok: true };
  }
}


function isResolved(val){ return val !== undefined && val !== null && String(val) !== '' && !/^\{.+\}$/.test(String(val)); }


// Compute per-step status
function computeStatus(stepMap, workflowMap, allowProfile){
  // Collect keys from step first (local tunables), then include workflow keys
  const keys = Array.from(new Set([...Object.keys(stepMap), ...Object.keys(workflowMap)]));
  let filled = 0, totalReq = 0, errors = [];

  keys.forEach(k=>{
    // Resolve without rendering to check requirement + type
    const r = resolveKey(k, { stepMap, workflowMap, allowProfile });
    const def = stepMap[k] || workflowMap[k] || {};
    const required = !!def.required;
    const type = def.type || 'text';

    const val = isResolved(r.value) ? r.value : '';
    const check = validateValueByType(type, val);

    if (required) {
      totalReq++;
      if (val === '') {
        errors.push({key:k, msg:'Required'});
      }
    }
    if (!check.ok) {
      errors.push({key:k, msg:check.msg});
    }
    if (val !== '') filled++;
  });

  return { filled, totalReq, errors };
}


// Render status bar inside a step (or workflow header)
function renderStatus(container, status){
  if (!container) return;
  container.innerHTML = '';
  const info = document.createElement('div');
  info.className = 'pf-status-info';
  info.textContent = `Filled: ${status.filled} • Required: ${status.totalReq} • Errors: ${status.errors.length}`;
  container.appendChild(info);

  if (status.errors.length){
    const list = document.createElement('ul');
    list.className = 'pf-status-errors';
    status.errors.slice(0,5).forEach(e=>{
      const li = document.createElement('li');
      li.textContent = `${e.key}: ${e.msg}`;
      list.appendChild(li);
    });
    container.appendChild(list);
  }
}


// Copy helper
async function copyToClipboard(text){
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch(e){
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e2){}
    document.body.removeChild(ta);
    return true;
  }
}


function ensureStepToolbar(sectionEl){
  if (!sectionEl) return null;
  let bar = sectionEl.querySelector('.pf-step-toolbar');
  if (!bar){
    bar = document.createElement('div');
    bar.className = 'pf-step-toolbar';
    bar.innerHTML = `
      <div class="pf-step-status" data-step-status></div>
    `;

    const promptEl = sectionEl.querySelector('[data-prompt-template]');
    const stepContent = sectionEl.querySelector('.pf-step-content');
    const parent = promptEl ? promptEl.parentNode : (stepContent || sectionEl);

    if (promptEl && parent && parent.contains(promptEl)) {
      try {
        parent.insertBefore(bar, promptEl);
      } catch (err) {
        parent.appendChild(bar);
      }
    } else if (stepContent) {
      stepContent.insertAdjacentElement('afterbegin', bar);
    } else if (parent) {
      parent.appendChild(bar);
    } else {
      sectionEl.appendChild(bar);
    }
  }
  return bar;
}


// Attach workflow toolbar
function ensureWorkflowToolbar(){
  const root = document.querySelector('[data-wf-root]');
  if (!root) return null;
  let bar = root.querySelector('.pf-wf-toolbar');
  if (!bar){
    bar = document.createElement('div');
    bar.className = 'pf-wf-toolbar';
    bar.innerHTML = `
      <div class="pf-wf-actions">
        <button type="button" class="pf-btn pf-btn-reset" data-action="reset-wf">Reset Workflow Vars</button>
        <button type="button" class="pf-btn pf-btn-clear" data-action="clear-draft">Clear Draft</button>
      </div>
    `;
    const wfForm = root.querySelector('[data-wf-form]');
    if (wfForm && wfForm.parentNode === root){
      root.insertBefore(bar, wfForm.nextSibling);
    } else {
      const firstStep = root.querySelector('[data-pf-step]');
      if (firstStep && firstStep.parentNode){
        firstStep.parentNode.insertBefore(bar, firstStep);
      } else {
        root.appendChild(bar);
      }
    }
  }
  return bar;
}


// Reset helpers
function resetStep(sectionEl){
  sectionEl.querySelectorAll('[data-step-vars-ui] [data-var-name]').forEach(inp=>{
    const k = inp.getAttribute('data-var-name');
    if (inp.type === 'checkbox') {
      inp.checked = false;
      PF_FORM_STORE[k] = '';
    } else {
      inp.value = '';
      PF_FORM_STORE[k] = '';
    }
  });
  markDirty();
}
function resetWorkflowVars(){
  const wrap = document.querySelector('[data-wf-form]');
  if (!wrap) return;
  wrap.querySelectorAll('[data-var-name]').forEach(inp=>{
    const k = inp.getAttribute('data-var-name');
    if (inp.type === 'checkbox') {
      inp.checked = false;
      PF_FORM_STORE[k] = '';
    } else {
      inp.value = '';
      PF_FORM_STORE[k] = '';
    }
  });
  markDirty();
}


// Dirty state
let DIRTY = false;
function markDirty(){
  DIRTY = true;
  hasUnsavedChanges = true;
  setAutosaveStatus('unsaved', 'Unsaved changes');
  scheduleAutosave();
}
window.addEventListener('beforeunload', function(e){
  if (DIRTY){
    e.preventDefault();
    e.returnValue = '';
  }
});


// Hook existing inputs to mark dirty
(function hookDirty(){
  document.addEventListener('input', function(e){
    const t = e.target;
    if (t && t.matches('[data-var-name], [data-prompt-template]')) markDirty();
  }, true);
})();


// Integrate with boot(): autosave load, toolbars, status updating
const _boot5_prev = boot;

boot = function(){
  bindMobileInputScroll();
  // Ensure root dataset (workflow id, user uid) via PHP attributes
  const root = document.querySelector('[data-wf-root]');
  restoreLocalWorkflowVars();
  loadDraft(); // load local draft early (fills PF_FORM_STORE)

  _boot5_prev(); // previous initialization renders everything

  // Workflow toolbar
  const wfBar = ensureWorkflowToolbar();
  if (wfBar && !wfBar.dataset.bound){
    wfBar.dataset.bound = '1';
    wfBar.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'reset-wf'){
        resetWorkflowVars();
        // Re-render all steps
        if (window.PF_RenderAll) window.PF_RenderAll();
      } else if (action === 'clear-draft'){
        localStorage.removeItem(getStorageKey());
        location.reload();
      }
    });
  }

  // Per-step toolbars + status
  document.querySelectorAll('[data-pf-step]').forEach(section=>{
    const wfEl = document.querySelector('[data-wf-vars]');
    let wfRows = [];
    try { wfRows = JSON.parse(wfEl ? wfEl.getAttribute('data-wf-vars') : '[]'); } catch(e){ wfRows = []; }
    const workflowMap = buildWorkflowMap(wfRows);

    const stepVarsJson = section.getAttribute('data-step-vars') || '[]';
    let stepRows = [];
    try { stepRows = JSON.parse(stepVarsJson); } catch(e){ stepRows = []; }
    const allowProfile = (section.getAttribute('data-uses-global-vars') === '1' || section.getAttribute('data-uses-global-vars') === 'true') && isProfileEnabled();
    const stepMap = buildStepMap(stepRows);
    const ctx = { stepMap, workflowMap, allowProfile };

    const bar = ensureStepToolbar(section);
    if (!bar) return;
    const statusEl = bar.querySelector('[data-step-status]');

    function updateStatus(){
      const s = computeStatus(stepMap, workflowMap, allowProfile);
      renderStatus(statusEl, s);
    }
    updateStatus();

    // Recompute status on input changes
    if (!section.dataset.boundInputs){
      section.dataset.boundInputs = '1';
      section.addEventListener('input', (e)=>{
        if (e.target && e.target.matches('[data-var-name]')){
          updateStatus();
          markDirty();
        }
      });
      section.addEventListener('change', (e)=>{
        if (e.target && e.target.matches('[data-var-name]')){
          updateStatus();
          markDirty();
        }
      });
    }
  });

  // Save draft after initial render (to store defaults resolved by profile)
  initSmoothSidebarScroll();
  initKeyboardShortcuts();
  initAutoSaveIntegration();
  bindProgressPersistence();
  saveDraft();
};


window.PF_RenderAll = boot;
window.PF_FORM_STORE = PF_FORM_STORE;

// Re-run with new boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// ============================================================
// UNIFIED RENDERERS (v2) — Exposed on PF namespace
// ============================================================

/**
 * Unified Variable Renderer (Workflow-level)
 * Outputs: <div class="pf-row pf-form-control">...</div>
 */
window.PF.renderWorkflowVar = function(item) {
  const type = (item.workflow_var_type || 'text').toLowerCase();
  const key = keyNorm(item.workflow_var_key || item.workflow_var_label || 'var');
  const label = item.workflow_var_label || key;
  const placeholder = item.workflow_var_placeholder || '';
  const required = !!item.workflow_var_required;
  const hint = item.workflow_var_hint || '';
  const defaultVal = item.workflow_var_default_value || '';

  // Main row wrapper (unified pattern)
  const row = document.createElement('div');
  row.className = 'pf-row pf-form-control';
  row.dataset.key = key;

  // LEFT COLUMN: Label + Badge
  const leftCol = document.createElement('div');
  
  const lab = document.createElement('label');
  lab.className = 'pf-label';
  lab.setAttribute('for', `pf-var-input-${key}`);
  lab.textContent = label;
  
  const badge = document.createElement('span');
  badge.className = `pf-badge pf-badge--${required ? 'required' : 'optional'}`;
  badge.textContent = required ? 'Required' : 'Optional';
  
  leftCol.appendChild(lab);
  leftCol.appendChild(badge);

  // RIGHT COLUMN: Input + Hint + Error
  const rightCol = document.createElement('div');

  let input;
  if (type === 'select' && item.workflow_var_options_json) {
    input = document.createElement('select');
    input.className = 'pf-select';
    try {
      const opts = JSON.parse(item.workflow_var_options_json);
      if (Array.isArray(opts)) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = placeholder || '— choose —';
        input.appendChild(empty);
        opts.forEach(o => {
          const opt = document.createElement('option');
          if (typeof o === 'string') {
            opt.value = o;
            opt.textContent = o;
          } else {
            opt.value = o.value ?? o.key ?? '';
            opt.textContent = o.label ?? o.value ?? '';
          }
          input.appendChild(opt);
        });
      }
    } catch(e) {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'pf-input';
    }
  } else if (type === 'textarea') {
    input = document.createElement('textarea');
    input.className = 'pf-textarea';
    input.rows = 4;
  } else {
    input = document.createElement('input');
    input.className = 'pf-input';
    input.type = type === 'number' ? 'number' : (type === 'email' ? 'email' : (type === 'url' ? 'url' : 'text'));
  }

  input.id = `pf-var-input-${key}`;
  input.dataset.varKey = key;
  if (placeholder) input.placeholder = placeholder;
  if (required) {
    input.required = true;
    input.setAttribute('aria-required', 'true');
  }
  input.value = defaultVal;

  const hintId = `hint-${key}`;
  const errorId = `error-${key}`;

  if (hint) {
    const hintEl = document.createElement('div');
    hintEl.id = hintId;
    hintEl.className = 'pf-hint';
    hintEl.textContent = hint;
    input.setAttribute('aria-describedby', `${hintId} ${errorId}`);
    rightCol.appendChild(input);
    rightCol.appendChild(hintEl);
  } else {
    input.setAttribute('aria-describedby', errorId);
    rightCol.appendChild(input);
  }

  const errorEl = document.createElement('div');
  errorEl.id = errorId;
  errorEl.className = 'pf-error';
  errorEl.textContent = 'Bitte Feld prüfen.';
  rightCol.appendChild(errorEl);

  // Assemble row
  row.appendChild(leftCol);
  row.appendChild(rightCol);

  // Validation handlers
  const validateInput = () => {
    if (!required) {
      row.classList.remove('is-invalid', 'is-valid');
      input.removeAttribute('aria-invalid');
      return;
    }
    const val = (input.value || '').trim();
    const isInvalid = !val;
    row.classList.toggle('is-invalid', isInvalid);
    row.classList.toggle('is-valid', !isInvalid);
    input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
  };

  input.addEventListener('input', validateInput);
  input.addEventListener('blur', validateInput);

  // Initial validation
  setTimeout(validateInput, 0);

  return row;
};

/**
 * Unified Variable Renderer (Step-level)
 * Outputs: <div class="pf-row pf-form-control">...</div>
 */
window.PF.renderStepVar = function(item, stepId) {
  const type = (item.step_var_type || 'text').toLowerCase();
  const key = keyNorm(item.step_var_name || item.step_var_label || 'var');
  const label = item.step_var_label || key;
  const placeholder = item.step_var_placeholder || '';
  const required = !!item.step_var_required;
  const hint = item.step_var_hint || '';
  const defaultVal = item.step_var_default || '';

  // Main row wrapper (unified pattern)
  const row = document.createElement('div');
  row.className = 'pf-row pf-form-control';
  row.dataset.key = key;
  row.dataset.stepId = stepId;

  // LEFT COLUMN: Label + Badge
  const leftCol = document.createElement('div');
  
  const lab = document.createElement('label');
  lab.className = 'pf-label';
  lab.setAttribute('for', `pf-step-${stepId}-var-input-${key}`);
  lab.textContent = label;
  
  const badge = document.createElement('span');
  badge.className = `pf-badge pf-badge--${required ? 'required' : 'optional'}`;
  badge.textContent = required ? 'Required' : 'Optional';
  
  leftCol.appendChild(lab);
  leftCol.appendChild(badge);

  // RIGHT COLUMN: Input + Hint + Error
  const rightCol = document.createElement('div');

  let input;
  if (type === 'select' && item.step_var_options_json) {
    input = document.createElement('select');
    input.className = 'pf-select';
    try {
      const opts = JSON.parse(item.step_var_options_json);
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = placeholder || '— choose —';
      input.appendChild(empty);
      (opts || []).forEach(o => {
        const opt = document.createElement('option');
        if (typeof o === 'string') { opt.value = o; opt.textContent = o; }
        else { opt.value = o.value ?? o.key ?? ''; opt.textContent = o.label ?? o.value ?? ''; }
        input.appendChild(opt);
      });
    } catch(e) {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'pf-input';
    }
  } else if (type === 'textarea') {
    input = document.createElement('textarea');
    input.className = 'pf-textarea';
    input.rows = 4;
  } else {
    input = document.createElement('input');
    input.className = 'pf-input';
    input.type = type === 'number' ? 'number' : (type === 'email' ? 'email' : (type === 'url' ? 'url' : 'text'));
  }

  input.id = `pf-step-${stepId}-var-input-${key}`;
  input.dataset.varKey = key;
  if (placeholder) input.placeholder = placeholder;
  if (required) {
    input.required = true;
    input.setAttribute('aria-required', 'true');
  }
  input.value = defaultVal;

  const hintId = `hint-step-${stepId}-${key}`;
  const errorId = `error-step-${stepId}-${key}`;

  if (hint) {
    const hintEl = document.createElement('div');
    hintEl.id = hintId;
    hintEl.className = 'pf-hint';
    hintEl.textContent = hint;
    input.setAttribute('aria-describedby', `${hintId} ${errorId}`);
    rightCol.appendChild(input);
    rightCol.appendChild(hintEl);
  } else {
    input.setAttribute('aria-describedby', errorId);
    rightCol.appendChild(input);
  }

  const errorEl = document.createElement('div');
  errorEl.id = errorId;
  errorEl.className = 'pf-error';
  errorEl.textContent = 'Bitte Feld prüfen.';
  rightCol.appendChild(errorEl);

  // Assemble row
  row.appendChild(leftCol);
  row.appendChild(rightCol);

  // Validation handlers
  const validateInput = () => {
    if (!required) {
      row.classList.remove('is-invalid', 'is-valid');
      input.removeAttribute('aria-invalid');
      return;
    }
    const val = (input.value || '').trim();
    const isInvalid = !val;
    row.classList.toggle('is-invalid', isInvalid);
    row.classList.toggle('is-valid', !isInvalid);
    input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
  };

  input.addEventListener('input', validateInput);
  input.addEventListener('blur', validateInput);

  // Initial validation
  setTimeout(validateInput, 0);

  return row;
};

/**
 * Validation Helper
 * Toggles .is-valid/.is-invalid on row, sets aria-invalid
 */
window.PF.validate = function(row) {
  const input = row.querySelector('.pf-input, .pf-select, .pf-textarea');
  if (!input) return;
  
  const required = input.required;
  if (!required) {
    row.classList.remove('is-invalid', 'is-valid');
    input.removeAttribute('aria-invalid');
    return;
  }
  
  const val = (input.value || '').trim();
  const isInvalid = !val;
  row.classList.toggle('is-invalid', isInvalid);
  row.classList.toggle('is-valid', !isInvalid);
  input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
};

// Expose state
window.PF.state = { formStore: PF_FORM_STORE, userVars: PF_USER_VARS };

// ========== v1.7 Unified Variable Rendering API ==========
// Expose new unified functions on PF namespace
window.PF.renderVar = renderVar;
window.PF.renderInput = renderInput;
window.PF.afterInsertVar = afterInsertVar;
window.PF.setVarValidity = setVarValidity;
window.PF.mountWorkflowVars = mountWorkflowVars;
window.PF.escapeHtml = escapeHtml;

// Log ready
console.log('✓ PF ready — Unified renderers available: PF.renderWorkflowVar(), PF.renderStepVar(), PF.validate()');
console.log('✓ PF v1.7 — Unified Variable API: renderVar(), setVarValidity(), mountWorkflowVars()');

})();


