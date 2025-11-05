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

  /**
   * Resolve a single key with full priority & flags.
   * ctx = { stepMap, workflowMap, allowProfile }
   * Returns { value, resolved, injMode }
   */
  function resolveKey(rawKey, ctx){
    const k = keyNorm(rawKey);
    const { stepMap, workflowMap, allowProfile } = ctx;
    const sDef = stepMap[k];
    const wDef = workflowMap[k];

    // 0) user-typed value (live form store)
    if (Object.prototype.hasOwnProperty.call(PF_FORM_STORE, k) && PF_FORM_STORE[k] !== '') {
      return { value: String(PF_FORM_STORE[k]), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
    }

    // Prefer system?
    const preferSystem = !!(sDef?.preferSystem || wDef?.preferSystem);
    if (preferSystem) {
      // System keys usually start with sys_; but allow explicit profileKey usage for system-like aliases
      const sysKey = k.startsWith('sys_') ? k : (sDef?.profileKey || wDef?.profileKey || '');
      if (sysKey && PF_USER_VARS[sysKey] != null) {
        return { value: String(PF_USER_VARS[sysKey]), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
      }
      if (k.startsWith('sys_') && PF_USER_VARS[k] != null) {
        return { value: String(PF_USER_VARS[k]), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
      }
    }

    // 1) Workflow-level prefilled value? (Optional: you can prefill PF_FORM_STORE from server)
    // Skipped here; we rely on defaults below if not typed.

    // 2) Global/Profile layer (only if allowed for this step)
    if (allowProfile) {
      const alias = sDef?.profileKey || wDef?.profileKey || '';
      const fromProfile = alias ? PF_USER_VARS[alias] : PF_USER_VARS[k];
      if (fromProfile != null && fromProfile !== '') {
        return { value: String(fromProfile), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
      }
    }

    // 3) Defaults (step first, then workflow)
    if (sDef?.defaultValue) {
      return { value: String(sDef.defaultValue), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
    }
    if (wDef?.defaultValue) {
      return { value: String(wDef.defaultValue), resolved: true, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
    }

    // 4) Unresolved -> keep placeholder; injMode carried for caller
    return { value: `{${k}}`, resolved: false, injMode: (sDef?.injectionMode || wDef?.injectionMode || 'conditional') };
  }

  function renderPrompt(template, ctx){
    return String(template || '').replace(/\{([^}]+)\}/g, (_m, token) => {
      const [rawKey, fallback] = String(token).split('|');
      const r = resolveKey(rawKey, ctx);
      if (!r.resolved) {
        // unresolved: depend on injection mode
        if ((r.injMode || 'conditional') === 'direct') {
          return (fallback !== undefined) ? fallback : '';
        }
        return (fallback !== undefined) ? fallback : `{${rawKey}}`;
      }
      return r.value;
    });
  }

  // Render all prompts within a step section
  function renderStep(sectionEl, ctx){
    sectionEl.querySelectorAll('[data-prompt-template]').forEach(area=>{
      const base = area.getAttribute('data-base') || area.value || '';
      const out  = renderPrompt(base, ctx);
      if (area.tagName === 'TEXTAREA' || area.tagName === 'INPUT') {
        area.value = out;
      } else {
        area.textContent = out;
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


/**
 * Render a single control for a variable.
 * - container: element to append into
 * - level: 'workflow' | 'step'
 * - key: normalized key
 * - def: map entry (from buildWorkflowMap/buildStepMap)
 * - ctx: { stepMap, workflowMap, allowProfile }
 * - onChange: callback to call after store update (re-renderer)
 */
function renderVarControl(container, level, key, def, ctx, onChange){
  const wrap = document.createElement('div');
  wrap.className = `pf-var pf-var-${level} pf-var-${def.type || 'text'}`;

  const label = document.createElement('label');
  label.className = 'pf-var-label';
  label.htmlFor = `${level}-${key}`;
  label.textContent = def.label || key;

  if (def.required) {
    const star = document.createElement('span');
    star.className = 'pf-var-required';
    star.textContent = ' *';
    label.appendChild(star);
  }

  let ctrl;
  const id = `${level}-${key}`;
  const initResolved = resolveKey(key, ctx);
  const initialValue = initResolved.resolved ? initResolved.value : '';

  const placeholder = def.placeholder || '';

  switch ((def.type || 'text').toLowerCase()) {
    case 'textarea': {
      ctrl = document.createElement('textarea');
      ctrl.rows = 3;
      ctrl.value = initialValue;
      if (placeholder) ctrl.setAttribute('placeholder', placeholder);
      break;
    }
    case 'number': {
      ctrl = document.createElement('input');
      ctrl.type = 'number';
      if (initialValue !== '') ctrl.value = initialValue;
      if (placeholder) ctrl.setAttribute('placeholder', placeholder);
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
      // empty option (let placeholder remain until user chooses)
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = placeholder || '— select —';
      ctrl.appendChild(emptyOpt);
      (def.options || []).forEach(o=>{
        const opt = document.createElement('option');
        opt.value = String(o.value);
        opt.textContent = String(o.label ?? o.value);
        ctrl.appendChild(opt);
      });
      if (initialValue !== '') ctrl.value = initialValue;
      break;
    }
    case 'boolean': {
      ctrl = document.createElement('input');
      ctrl.type = 'checkbox';
      ctrl.checked = coerceBool(initialValue);
      break;
    }
    default: { // text
      ctrl = document.createElement('input');
      ctrl.type = 'text';
      if (initialValue !== '') ctrl.value = initialValue;
      if (placeholder) ctrl.setAttribute('placeholder', placeholder);
    }
  }

  ctrl.id = id;
  ctrl.setAttribute('data-var-name', key);

  if (def.required && ctrl.tagName !== 'INPUT' || (ctrl.tagName === 'INPUT' && ctrl.type !== 'checkbox')) {
    ctrl.required = true;
  }

  const hint = document.createElement('div');
  hint.className = 'pf-var-hint';
  if (def.description) {
    hint.textContent = def.description;
  } else if (def.hint) {
    hint.textContent = def.hint;
  }

  // Bind changes to store + re-render
  ctrl.addEventListener('input', ()=>{
    const k = key;
    if (ctrl.type === 'checkbox') {
      PF_FORM_STORE[k] = ctrl.checked ? '1' : '';
    } else {
      PF_FORM_STORE[k] = ctrl.value;
    }
    if (typeof onChange === 'function') onChange();
  });
  ctrl.addEventListener('change', ()=>{
    const k = key;
    if (ctrl.type === 'checkbox') {
      PF_FORM_STORE[k] = ctrl.checked ? '1' : '';
    } else {
      PF_FORM_STORE[k] = ctrl.value;
    }
    if (typeof onChange === 'function') onChange();
  });

  wrap.appendChild(label);
  wrap.appendChild(ctrl);
  if ((def.description && def.description.trim()) || (def.hint && def.hint.trim())) {
    wrap.appendChild(hint);
  }
  container.appendChild(wrap);
}


/**
 * Render the workflow-level form (affects all steps).
 * Expects a container with [data-wf-form].
 */
function renderWorkflowForm(containerEl, workflowMap, ctx, rerenderAllSteps){
  if (!containerEl) return;
  containerEl.innerHTML = '';
  Object.keys(workflowMap).forEach(k=>{
    renderVarControl(containerEl, 'workflow', k, workflowMap[k], ctx, rerenderAllSteps);
  });
}


/**
 * Render step-level variable controls inside a step section.
 * Expects a child container [data-step-vars-ui].
 */
function renderStepForm(sectionEl, stepMap, ctx){
  const target = sectionEl.querySelector('[data-step-vars-ui]');
  if (!target) return;
  target.innerHTML = '';
  Object.keys(stepMap).forEach(k=>{
    renderVarControl(target, 'step', k, stepMap[k], ctx, ()=>renderStep(sectionEl, ctx));
  });
}


// === integrate into boot() (replace the end of boot with this) ==============

const _orig_boot = boot;

boot = function(){
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
      const allowProfile = (section.getAttribute('data-uses-global-vars') === '1' || section.getAttribute('data-uses-global-vars') === 'true');
      const stepMap = buildStepMap(stepRows);
      const ctx = { stepMap, workflowMap, allowProfile };
      renderStep(section, ctx);
    });
  };
  renderWorkflowForm(wfForm, workflowMap, { stepMap: {}, workflowMap, allowProfile: true }, rerenderAll);

  // Boot each step: render controls + initial render
  document.querySelectorAll('[data-pf-step]').forEach(section=>{
    const stepVarsJson = section.getAttribute('data-step-vars') || '[]';
    let stepRows = [];
    try { stepRows = JSON.parse(stepVarsJson); } catch(e){ stepRows = []; }
    const allowProfile = (section.getAttribute('data-uses-global-vars') === '1' || section.getAttribute('data-uses-global-vars') === 'true');
    const stepMap = buildStepMap(stepRows);
    const ctx = { stepMap, workflowMap, allowProfile };

    renderStepForm(section, stepMap, ctx);
    bindStep(section, ctx); // keeps manual binds for any pre-existing inputs
    renderStep(section, ctx);
  });
};


// Re-run with new boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// expose for debugging
window.PF_RenderAll = boot;
window.PF_FORM_STORE = PF_FORM_STORE;

})();


