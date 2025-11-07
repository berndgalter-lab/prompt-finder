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
    wrap.className = `pf-field pf-var pf-var-${level} pf-var-${type}`;
    wrap.classList.add('pf-var-item', `pf-var-item--${tierTag}`);
    wrap.setAttribute('data-variable-tier', tierTag);
    wrap.dataset.variableTier = tierTag;
    wrap.dataset.fieldName = key;
    wrap.dataset.state = 'pristine';
    const workflowDef = ctx.workflowMap ? ctx.workflowMap[key] : undefined;
    const profileAlias = def.profileKey || workflowDef?.profileKey || '';

    if (def.required) {
      wrap.dataset.required = 'true';
    }

    const id = `${level}-${key}`;
    const label = document.createElement('label');
    label.className = 'pf-field-label pf-var-label';
    label.htmlFor = id;
    label.textContent = def.label || key;

    if (def.required) {
      const star = document.createElement('span');
      star.className = 'pf-var-required';
      star.textContent = ' *';
      label.appendChild(star);
    }

    if (level === 'workflow' && profileAlias) {
      ensureStaticBadge(label, 'profile-alias', 'Inherits Profile', 'pf-var-source-badge--profile');
    }
    if (level === 'step') {
      if (workflowDef) {
        ensureStaticBadge(label, 'overrides-workflow', 'Overrides Workflow', 'pf-var-source-badge--workflow');
      }
      if (profileAlias) {
        ensureStaticBadge(label, 'overrides-profile', 'Overrides Profile', 'pf-var-source-badge--profile');
      }
    }

    const inputWrap = document.createElement('div');
    inputWrap.className = 'pf-field-input-wrapper';

    const initResolved = resolveKey(key, ctx);
    const initialValue = initResolved.resolved ? initResolved.value : (def.defaultValue ?? '');
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
    if (def.required && ctrl.type !== 'checkbox') {
      ctrl.required = true;
    }

    ctrl.classList.add('pf-field-input');

    if (ctrl.tagName === 'TEXTAREA') {
      ctrl.classList.add('pf-field-input--textarea');
    }
    if (ctrl.type === 'checkbox') {
      ctrl.classList.add('pf-field-input--checkbox');
    }

    const validation = document.createElement('span');
    validation.className = 'pf-field-validation';
    validation.dataset.state = 'idle';
    validation.setAttribute('aria-hidden', 'true');
    validation.textContent = '✓';

    inputWrap.appendChild(ctrl);
    inputWrap.appendChild(validation);

    wrap.appendChild(label);
    wrap.appendChild(inputWrap);

    const hintText = (def.description && def.description.trim()) || (def.hint && def.hint.trim()) || '';
    if (hintText) {
      const hint = document.createElement('span');
      hint.className = 'pf-field-hint pf-var-hint';
      hint.textContent = hintText;
      wrap.appendChild(hint);
    }

    const errorEl = document.createElement('span');
    errorEl.className = 'pf-field-error';
    errorEl.style.display = 'none';
    errorEl.setAttribute('role', 'alert');
    wrap.appendChild(errorEl);

    updateVariableSourceIndicator(wrap, key, ctx);
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
      if (state === 'valid') {
        validation.style.opacity = '1';
        validation.textContent = '✓';
        errorEl.style.display = 'none';
        errorEl.textContent = '';
        ctrl.classList.remove('is-error');
      } else if (state === 'invalid') {
        validation.style.opacity = '1';
        validation.textContent = '!';
        errorEl.style.display = '';
        errorEl.textContent = message || 'Check this field';
        ctrl.classList.add('is-error');
      } else {
        validation.style.opacity = '0';
        validation.textContent = '✓';
        errorEl.style.display = 'none';
        errorEl.textContent = '';
        ctrl.classList.remove('is-error');
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
  const counter = document.querySelector('.pf-variables--workflow .pf-variables-counter');
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

  const profileTier = bar.querySelector('.pf-status--profile .pf-status-count');
  if (profileTier) {
    if (!isProfileEnabled()) {
      profileTier.textContent = '—';
    } else {
      const profileData = (PF_USER_VARS.profile && typeof PF_USER_VARS.profile === 'object') ? PF_USER_VARS.profile : {};
      const keys = Object.keys(profileData).filter(k => !/^sys_/i.test(k));
      const filled = keys.filter(k => {
        const val = profileData[k];
        return val != null && String(val).trim() !== '';
      }).length;
      profileTier.textContent = `${filled}/${keys.length}`;
    }
  }

  const workflowTier = bar.querySelector('.pf-status--workflow .pf-status-count');
  if (workflowTier) {
    const keys = Object.keys(workflowMap || {});
    const allowProfile = isProfileEnabled();
    let filled = 0;
    keys.forEach(k => {
      const res = resolveKey(k, { stepMap: {}, workflowMap, allowProfile });
      if (isResolved(res.value)) filled++;
    });
    workflowTier.textContent = keys.length ? `${filled}/${keys.length}` : '0/0';
  }

  const stepTier = bar.querySelector('.pf-status--step .pf-status-count');
  if (stepTier) {
    const active = getActiveStepSection();
    const status = computeStepTierStatus(active, workflowMap);
    if (!status.total) {
      stepTier.textContent = '-';
    } else {
      stepTier.textContent = `${status.filled}/${status.total}`;
    }
  }
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
}


/**
 * Render the workflow-level form (affects all steps).
 * Expects a container with [data-wf-form].
 */
function renderWorkflowForm(containerEl, workflowMap, ctx, rerenderAllSteps){
  if (!containerEl) return;
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
      const copyBtn = active ? active.querySelector('.pf-btn-copy-primary') : null;
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
  document.querySelectorAll('.pf-progress-fill, .pf-progress-fill-large').forEach(bar => {
    bar.style.width = `${pct}%`;
    bar.dataset.progress = String(pct);
  });
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

// ====== PRESETS (localStorage) =============================================

function getPresetsKey(){
  const root = document.querySelector('[data-wf-root]');
  if (!root) return 'pf:presets';
  const wfId = root.getAttribute('data-wf-id') || 'wf';
  const uid  = root.getAttribute('data-user-uid') || 'anon';
  return `pf:presets:${wfId}:${uid}`;
}
function loadPresets(){
  try { return JSON.parse(localStorage.getItem(getPresetsKey())||'{}') || {}; } catch(e){ return {}; }
}
function savePresets(presets){
  try { localStorage.setItem(getPresetsKey(), JSON.stringify(presets)); } catch(e){}
}
function listPresetNames(){
  return Object.keys(loadPresets()).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}));
}
function savePreset(name){
  if (!name || !name.trim()) return false;
  const presets = loadPresets();
  presets[name] = { ts: Date.now(), data: {...PF_FORM_STORE} };
  savePresets(presets);
  return true;
}
function loadPreset(name){
  const presets = loadPresets();
  const p = presets[name];
  if (!p) return false;
  Object.keys(PF_FORM_STORE).forEach(k=>delete PF_FORM_STORE[k]);
  Object.assign(PF_FORM_STORE, p.data || {});
  markDirty();
  return true;
}
function deletePreset(name){
  const presets = loadPresets();
  if (!(name in presets)) return false;
  delete presets[name];
  savePresets(presets);
  return true;
}
function exportPresets(){
  const data = JSON.stringify(loadPresets(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pf-variable-presets.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importPresets(file, cb){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const isObj = parsed && typeof parsed === 'object' && !Array.isArray(parsed);
      if (isObj) {
        const current = loadPresets();
        savePresets({...current, ...parsed});
        if (typeof cb === 'function') cb(true);
      } else { if (typeof cb === 'function') cb(false); }
    } catch(e){ if (typeof cb === 'function') cb(false); }
  };
  reader.readAsText(file);
}

const _ensureWorkflowToolbar_prev = ensureWorkflowToolbar;
ensureWorkflowToolbar = function(){
  const bar = _ensureWorkflowToolbar_prev();
  if (!bar) return bar;

  if (!bar.querySelector('.pf-wf-presets')){
    const box = document.createElement('div');
    box.className = 'pf-wf-presets';
    box.innerHTML = `
      <div class="pf-wf-presets-row">
        <input type="text" class="pf-preset-name" placeholder="Preset name…" />
        <button type="button" class="pf-btn" data-action="preset-save">Save</button>
        <select class="pf-preset-select"><option value="">Load preset…</option></select>
        <button type="button" class="pf-btn" data-action="preset-delete" disabled>Delete</button>
        <button type="button" class="pf-btn" data-action="preset-export">Export</button>
        <label class="pf-btn pf-btn-file">
          Import<input type="file" class="pf-preset-import" accept="application/json" hidden />
        </label>
      </div>
    `;
    bar.appendChild(box);

    const nameInp = box.querySelector('.pf-preset-name');
    const select  = box.querySelector('.pf-preset-select');
    const delBtn  = box.querySelector('[data-action="preset-delete"]');
    const fileInp = box.querySelector('.pf-preset-import');

    function refreshList(){
      const names = listPresetNames();
      const current = select.value;
      select.innerHTML = `<option value="">Load preset…</option>`;
      names.forEach(n=>{
        const opt = document.createElement('option');
        opt.value = n; opt.textContent = n;
        select.appendChild(opt);
      });
      if (names.includes(current)) select.value = current;
      delBtn.disabled = !select.value;
    }
    if (!SERVER_PRESETS_AVAILABLE) {
      refreshList();

      box.addEventListener('click', (e)=>{
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');

        if (action === 'preset-save'){
          const ok = savePreset(nameInp.value.trim());
          if (ok){ refreshList(); btn.classList.add('pf-success'); setTimeout(()=>btn.classList.remove('pf-success'), 1000); }
        } else if (action === 'preset-delete'){
          if (!select.value) return;
          const ok = deletePreset(select.value);
          if (ok){ refreshList(); }
        } else if (action === 'preset-export'){
          exportPresets();
        }
      });

      select.addEventListener('change', ()=>{
        delBtn.disabled = !select.value;
        if (!select.value) return;
        if (loadPreset(select.value)) {
          if (window.PF_RenderAll) window.PF_RenderAll();
        }
      });

      fileInp.addEventListener('change', ()=>{
        const f = fileInp.files && fileInp.files[0];
        if (!f) return;
        importPresets(f, ok=>{
          if (ok){ refreshList(); fileInp.value=''; }
        });
      });
    } else {
      delBtn.disabled = true;
    }
  }
  return bar;
};

const SERVER_PRESETS = (window.PF_FLAGS && (window.PF_FLAGS.server_presets === true || window.PF_FLAGS.server_presets === 'true'));
const SERVER_PRESETS_AVAILABLE = !!(SERVER_PRESETS && window.PF_API && window.PF_API.base);

async function apiFetch(method, path, body){
  if (!window.PF_API || !PF_API.base) throw new Error('API not configured');
  const res = await fetch(PF_API.base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': PF_API.nonce || ''
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin'
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(`API ${method} ${path} failed: ${res.status} ${t}`);
  }
  return res.json();
}

function getWorkflowId(){
  const root = document.querySelector('[data-wf-root]');
  return root ? parseInt(root.getAttribute('data-wf-id') || '0', 10) : 0;
}

async function serverListPresets(){ return apiFetch('GET', `presets?workflow_id=${getWorkflowId()}`); }
async function serverGetPreset(name){ return apiFetch('GET', `presets/${encodeURIComponent(name)}?workflow_id=${getWorkflowId()}`); }
async function serverSavePreset(name){ return apiFetch('POST', 'presets', {workflow_id:getWorkflowId(), name, data:{...PF_FORM_STORE}}); }
async function serverDeletePreset(name){ return apiFetch('DELETE', 'presets', {workflow_id:getWorkflowId(), name}); }
async function serverExportPresets(){ return apiFetch('GET', `presets/export?workflow_id=${getWorkflowId()}`); }
async function serverImportPresets(presets){ return apiFetch('POST', 'presets/import', {workflow_id:getWorkflowId(), presets}); }

async function serverListNames(){
  const map = await serverListPresets();
  return Object.keys(map || {}).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}));
}

(function enhanceToolbarForServer(){
  if (!SERVER_PRESETS_AVAILABLE) return;

  const bar = document.querySelector('.pf-wf-toolbar');
  if (bar && !bar.querySelector('.pf-wf-storage')){
    const tag = document.createElement('span');
    tag.className = 'pf-wf-storage';
    tag.textContent = 'Storage: Server';
    bar.insertBefore(tag, bar.firstChild);
  }

  const box = document.querySelector('.pf-wf-presets');
  if (!box) return;
  const nameInp = box.querySelector('.pf-preset-name');
  const select  = box.querySelector('.pf-preset-select');
  const delBtn  = box.querySelector('[data-action="preset-delete"]');
  const fileInp = box.querySelector('.pf-preset-import');
  const saveBtn = box.querySelector('[data-action="preset-save"]');

  async function refreshList(){
    try {
      const names = await serverListNames();
      const current = select.value;
      select.innerHTML = `<option value="">Load preset…</option>`;
      names.forEach(n=>{
        const opt = document.createElement('option'); opt.value = n; opt.textContent = n; select.appendChild(opt);
      });
      if (names.includes(current)) select.value = current;
      delBtn.disabled = !select.value;
    } catch(e) {
      console.warn('Server presets list failed, retaining local fallback.', e);
    }
  }
  refreshList();

  box.addEventListener('click', async (e)=>{
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');

    try {
      if (action === 'preset-save'){
        if (!nameInp.value.trim()) return;
        await serverSavePreset(nameInp.value.trim());
        await refreshList();
        btn.classList.add('pf-success'); setTimeout(()=>btn.classList.remove('pf-success'), 1000);
      } else if (action === 'preset-delete'){
        if (!select.value) return;
        await serverDeletePreset(select.value);
        await refreshList();
      } else if (action === 'preset-export'){
        const data = await serverExportPresets();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'pf-variable-presets.server.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      }
    } catch(err) {
      console.warn('Server presets action failed', err);
    }
  });

  select.addEventListener('change', async ()=>{
    delBtn.disabled = !select.value;
    if (!select.value) return;
    try {
      const one = await serverGetPreset(select.value);
      Object.keys(PF_FORM_STORE).forEach(k=>delete PF_FORM_STORE[k]);
      Object.assign(PF_FORM_STORE, one?.data || {});
      if (window.PF_RenderAll) window.PF_RenderAll();
    } catch(err) {
      console.warn('Server preset load failed', err);
    }
  });

  fileInp.addEventListener('change', async ()=>{
    const f = fileInp.files && fileInp.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async ()=>{
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed && typeof parsed === 'object') {
          await serverImportPresets(parsed);
          await refreshList();
        }
      } catch(err) {
        console.warn('Import failed', err);
      }
      fileInp.value = '';
    };
    reader.readAsText(f);
  });

  (async function maybeOfferMigrate(){
    try {
      const serverNames = await serverListNames();
      const localNames = typeof listPresetNames === 'function' ? listPresetNames() : [];
      if (serverNames.length === 0 && localNames.length > 0) {
        const migBtn = document.createElement('button');
        migBtn.type = 'button';
        migBtn.className = 'pf-btn';
        migBtn.textContent = 'Migrate Local → Server';
        box.appendChild(migBtn);
        migBtn.addEventListener('click', async ()=>{
          try {
            const payload = {};
            const local = loadPresets();
            Object.keys(local || {}).forEach(n=>{
              payload[n] = { ts: local[n].ts || Date.now(), data: local[n].data || {} };
            });
            await serverImportPresets(payload);
            await refreshList();
            migBtn.classList.add('pf-success');
            setTimeout(()=>migBtn.remove(), 1200);
          } catch(err) {
            console.warn('Migration failed', err);
          }
        });
      }
    } catch(err) {}
  })();
})();

// Re-run with new boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();


