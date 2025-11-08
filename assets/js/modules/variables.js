/**
 * Prompt Finder — Variables v1 Renderer
 * Renders workflow-level variable inputs once, handles validation,
 * counter updates, and Save/Clear button wiring.
 */

(function(){
  'use strict';
  
  function sanitizeKey(name) {
    return (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32);
  }

  function setInvalidState(itemEl, isInvalid) {
    if (!itemEl) return;
    itemEl.classList.toggle('pf-var--invalid', !!isInvalid);
    const input = itemEl.querySelector('.pf-var-input');
    if (input) input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
  }

  function updateVarCounter(scope = document) {
    const card = scope.querySelector('.pf-variables-card');
    if (!card) return;
    const counter = card.querySelector('.pf-variables-counter');
    const host = card.querySelector('[data-vars-host]') || scope.querySelector('.pf-wf-form');
    if (!counter || !host) return;

    const items = host.querySelectorAll('.pf-var-item');
    const total = items.length;

    let filled = 0;
    items.forEach(item => {
      const input = item.querySelector('.pf-var-input');
      const required = input?.required;
      const val = (input?.value || '').trim();
      const invalid = required && !val;
      setInvalidState(item, invalid);
      if (!required || val) filled++;
    });

    counter.dataset.variablesTotal = String(total);
    counter.dataset.variablesFilled = String(filled);
    const num = counter.querySelector('.pf-counter-number');
    const tot = counter.querySelector('.pf-counter-total');
    if (num) num.textContent = String(filled);
    if (tot) tot.textContent = String(total);
  }

  function renderVarItem(item) {
    const type = (item.workflow_var_type || 'text').toLowerCase();
    const key  = sanitizeKey(item.workflow_var_key || item.workflow_var_label || 'var');
    const label = item.workflow_var_label || key;
    const placeholder = item.workflow_var_placeholder || '';
    const required = !!item.workflow_var_required;
    const hint = item.workflow_var_hint || '';
    const defaultVal = item.workflow_var_default_value || '';

    const wrap = document.createElement('div');
    wrap.className = 'pf-var-item';
    wrap.dataset.varKey = key;
  wrap.dataset.varRequired = required ? 'true' : 'false';

    const lab = document.createElement('label');
    lab.className = 'pf-var-label';
    lab.setAttribute('for', `pf-var-input-${key}`);
  lab.textContent = label;
  const reqBadge = document.createElement('span');
  reqBadge.className = required ? 'pf-label-required' : 'pf-label-optional';
  reqBadge.textContent = required ? 'Required' : 'Optional';
  lab.appendChild(document.createTextNode(' '));
  lab.appendChild(reqBadge);

    let input;
    if (type === 'select' && item.workflow_var_options_json) {
      input = document.createElement('select');
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
      }
    }
    if (!input) {
      input = document.createElement('input');
      input.type = type === 'number' ? 'number' : 'text';
    }

    input.id = `pf-var-input-${key}`;
    input.className = 'pf-var-input';
    input.dataset.varKey = key;
    if (placeholder) input.placeholder = placeholder;
        if (required) {
    input.required = true;
    input.setAttribute('aria-required', 'true');
  } else {
    input.removeAttribute('required');
    input.removeAttribute('aria-required');
    }
    input.value = defaultVal;

    let hintEl = null;
    if (hint) {
      hintEl = document.createElement('p');
      hintEl.className = 'pf-var-hint';
      hintEl.textContent = hint;
    }

    wrap.appendChild(lab);
    wrap.appendChild(input);
    if (hintEl) wrap.appendChild(hintEl);

    input.addEventListener('input', () => updateVarCounter(document));
    input.addEventListener('blur', () => updateVarCounter(document));

    return wrap;
  }

  function renderWorkflowVars(host, schema) {
    if (!host) return;
    if (host.querySelector('.pf-var-item')) return;

    const frag = document.createDocumentFragment();
    (schema || []).forEach(item => {
      frag.appendChild(renderVarItem(item));
    });
    host.appendChild(frag);
    updateVarCounter(document);
  }

  function bindVariablesActions(scope = document) {
    const card = scope.querySelector('.pf-variables-card');
    if (!card) return;
    const host = card.querySelector('[data-vars-host]');
    const btnSave = card.querySelector('[data-action="save-variables"]');
    const btnClear = card.querySelector('[data-action="clear-variables"]');

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        updateVarCounter(scope);
        const steps = document.getElementById('steps');
        if (steps) steps.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        host?.querySelectorAll('.pf-var-input').forEach(inp => inp.value = '');
        updateVarCounter(scope);
      });
    }
  }

  (function initVariablesV1(){
    const root = document.querySelector('[data-wf-root]');
    if (!root) return;

    const wfSchemaEl = root.querySelector('[data-wf-vars]');
    let wfSchema = [];
    if (wfSchemaEl) {
      try {
        wfSchema = JSON.parse(wfSchemaEl.getAttribute('data-wf-vars') || '[]');
      } catch(e) {
        wfSchema = [];
      }
    }

    const host = document.querySelector('[data-vars-host]') || root.querySelector('.pf-wf-form');
    if (!host) return;

    renderWorkflowVars(host, wfSchema);
    bindVariablesActions(document);
    updateVarCounter(document);
  })();
})();

