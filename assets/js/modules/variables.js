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
    const input = itemEl.querySelector('.pf-input, .pf-select, .pf-textarea, .pf-var-input');
    const error = itemEl.querySelector('.pf-error, .pf-var-error');
    if (!input) return;

    const isRequired = input.required || input.classList.contains('required');

    if (isRequired) {
      itemEl.classList.toggle('is-invalid', !!isInvalid);
      itemEl.classList.toggle('is-valid', !isInvalid);
      input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
    } else {
      itemEl.classList.remove('is-invalid', 'is-valid');
      input.removeAttribute('aria-invalid');
    }
  }

  function updateVarCounter(scope = document) {
    const card = scope.querySelector('.pf-variables-card, .pf-variables, .pf-card');
    if (!card) return;
    const counter = card.querySelector('.pf-variables-counter');
    const host = card.querySelector('[data-vars-host]') || card.querySelector('.pf-form') || scope.querySelector('.pf-wf-form');
    if (!counter || !host) return;

    const items = host.querySelectorAll('.pf-row, .pf-var-item');
    const total = items.length;

    let filled = 0;
    items.forEach(item => {
      const input = item.querySelector('.pf-input, .pf-select, .pf-textarea, .pf-var-input');
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

    // Main row wrapper (PF-UI Contract v1)
    const row = document.createElement('div');
    row.className = 'pf-row';
    row.dataset.key = key;

    // Label line: Label + Badge
    const labelLine = document.createElement('div');
    labelLine.className = 'pf-label-line';
    
    const lab = document.createElement('label');
    lab.className = 'pf-label';
    lab.setAttribute('for', `pf-var-input-${key}`);
    lab.textContent = label;
    
    const badge = document.createElement('span');
    badge.className = `pf-badge ${required ? 'is-required' : 'is-optional'}`;
    badge.textContent = required ? 'Required' : 'Optional';
    
    labelLine.appendChild(lab);
    labelLine.appendChild(badge);

    // Field wrapper
    const fieldWrap = document.createElement('div');
    fieldWrap.className = 'pf-field';

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
    } else if (type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 4;
    } else {
      input = document.createElement('input');
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

    const errorId = `error-${key}`;
    input.setAttribute('aria-describedby', errorId);

    fieldWrap.appendChild(input);

    // Hint
    const hintEl = document.createElement('div');
    hintEl.className = 'pf-hint';
    hintEl.textContent = hint || '';

    // Error
    const errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.className = 'pf-error';
    errorEl.setAttribute('aria-live', 'polite');
    errorEl.textContent = '';

    // Assemble row
    row.appendChild(labelLine);
    row.appendChild(fieldWrap);
    row.appendChild(hintEl);
    row.appendChild(errorEl);

    // Validation handlers
    const validateInput = () => {
      if (!required) {
        fieldWrap.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        errorEl.textContent = '';
        return;
      }
      const val = (input.value || '').trim();
      const isInvalid = !val;
      fieldWrap.classList.toggle('is-invalid', isInvalid);
      input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
      errorEl.textContent = isInvalid ? 'This field is required.' : '';
      updateVarCounter(document);
    };

    input.addEventListener('input', validateInput);
    input.addEventListener('blur', validateInput);

    // Initial validation
    setTimeout(validateInput, 0);

    return row;
  }

  function renderWorkflowVars(host, schema) {
    if (!host) return;
    if (host.querySelector('.pf-row, .pf-var-item')) return;

    // Apply PF-UI Contract classes to root
    const root = host.closest('[data-wf-form]');
    if (root && !root.classList.contains('pf-card')) {
      root.classList.add('pf-card', 'pf-stack', 'pf-grid-2', 'pf-vars--workflow');
    }

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

