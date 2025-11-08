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
    const error = itemEl.querySelector('.pf-var-error');
    if (!input) return;

    if (input.classList.contains('required')) {
      if (isInvalid) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        input.setAttribute('aria-invalid', 'true');
        if (error) {
          error.style.display = 'block';
          error.textContent = 'This field is required';
        }
      } else {
        input.classList.remove('invalid');
        if (input.value && input.value.trim() !== '') {
          input.classList.add('valid');
        } else {
          input.classList.remove('valid');
        }
        input.setAttribute('aria-invalid', 'false');
        if (error) {
          error.style.display = 'none';
          error.textContent = '';
        }
      }
    } else {
      input.classList.remove('invalid');
      input.classList.remove('valid');
      if (isInvalid) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
      if (error) {
        error.style.display = 'none';
        error.textContent = '';
      }
    }
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
    wrap.className = `pf-var ${required ? 'is-required' : ''}`;
    wrap.dataset.varKey = key;

    // Label Container
    const labelContainer = document.createElement('div');
    labelContainer.className = 'pf-var-label';
    
    const labelText = document.createElement('span');
    labelText.textContent = label;
    labelContainer.appendChild(labelText);

    // Badges
    const badgesContainer = document.createElement('span');
    badgesContainer.className = 'pf-var-badges';
    const badge = document.createElement('span');
    badge.className = `pf-badge ${required ? 'pf-badge--required' : 'pf-badge--optional'}`;
    badge.textContent = required ? 'Required' : 'Optional';
    badgesContainer.appendChild(badge);
    labelContainer.appendChild(badgesContainer);

    // Input Container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'pf-var-input';

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
      input.classList.add('is-empty');
    }
    input.value = defaultVal;
    if (defaultVal) input.classList.remove('is-empty');

    inputContainer.appendChild(input);

    // Hint
    let hintEl = null;
    if (hint) {
      const hintId = `pf-var-input-${key}-hint`;
      hintEl = document.createElement('small');
      hintEl.id = hintId;
      hintEl.className = 'pf-var-hint';
      hintEl.textContent = hint;
      input.setAttribute('aria-describedby', hintId);
    }

    wrap.appendChild(labelContainer);
    wrap.appendChild(inputContainer);
    if (hintEl) wrap.appendChild(hintEl);

    // Event listeners for validation
    input.addEventListener('input', () => {
      if (required) {
        input.classList.toggle('is-empty', !input.value.trim());
      }
      updateVarCounter(document);
    });
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

