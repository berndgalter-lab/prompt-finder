# Variables v1 — Prompt Finder

> Single source of truth for variable handling across the app.

## Step 0 — Principles (one-time)
- **Priority:** Step > Workflow > Global (Profile) > Default (ACF) > Fallback (in prompt)
- **Syntax:** `{key}` / `{key|fallback}` (no transforms for now)
- **Naming:** `snake_case`, ASCII, ≤ 32 chars
- **Reserved prefixes:** `sys_`, `run_` (future-safe: `org_`, `proj_`, `client_`, `secret_`, `asset_`)
- **Reserved keys v1:** `sys_today`, `sys_now`, `sys_user_timezone`, `run_previous_output`

**Done when:** This file is present and `.cursorrules` reflects the same rules.

## Layers
- **Step variables**: only for a single step (local tunables).
- **Workflow variables**: apply to the whole workflow.
- **Global variables** (profile): user-level defaults, used only if the workflow allows it.
- **Defaults (ACF)**: per-field fallback in the editor.
- **Fallback (prompt)**: `{key|text}` inside the prompt itself.

## ACF schema (names are normative)

### Workflow repeater: `variables_workflow`
- `workflow_var_key` — technical key, used in prompts as `{key}`.
- `workflow_var_label` — UI label.
- `workflow_var_placeholder` — input placeholder.
- `workflow_var_required` — required flag.
- `workflow_var_default_value` — default if nothing else resolves.
- `workflow_var_type` — input type (`text`, `textarea`, `number`, `email`, `url`, `select`, `boolean`).
- `workflow_var_options_json` — options for select (JSON array/map).
- `workflow_var_profile_key` — optional alias to global profile key.
- `workflow_var_prefer_system` — prefer system values (e.g., `sys_today`).
- `workflow_var_hint` — longer help text.
- `workflow_var_injection_mode` — `conditional` (default) or `direct`.

### Step repeater: `variables_step`
- `step_var_name` — technical key (recommend same key as global if applicable).
- `step_var_label` — UI label.
- `step_var_placeholder` — input placeholder.
- `step_var_description` — help/tooltip text.
- `step_var_default` — step-level default (fallback to `step_var_example_value` if empty).
- `step_var_example_value` — example value for quick fill.
- `step_var_required` — required flag.
- `step_var_type` — input type (`text`, `textarea`, `number`, `email`, `url`, `select`, `boolean`).
- `step_var_options_json` — options for select (JSON array/map).
- `step_var_hint` — longer help text.
- `step_var_profile_key` — optional alias to global profile key.
- `step_var_prefer_system` — prefer system values for this step.

### Workflow toggle
- `use_profile_defaults` — when enabled, same-name keys (or `*_profile_key` alias) will prefill from Global variables.

## Resolution (pseudocode)
```text
value(key):
  if step_input[key] exists → return it
  if step.prefer_system(key) and sys[key] exists → return sys[key]
  if workflow_input[key] exists → return it
  if global_allowed and (profile_alias[key] or profile[key]) exists → return it
  if step.default[key] → return it
  if workflow.default[key] → return it
  else → unresolved (“{key}”)
```

## Authoring guidelines
- Prefer same key names across layers (e.g., company_name everywhere).
- Use `*_profile_key` only for alias cases (different names).
- Use `*_prefer_system` only for truly systemic values (e.g., date/time).
- Keep select options strictly JSON (array or map).

## Examples
Prompt: Write a short email for {company_name|your company}.

Typical global fields: company_name, audience, tone_of_voice, language_code, formality.

## Acceptance checks
- Unresolved placeholders remain visible.
- Changing any input re-renders prompts live.
- No direct usermeta reads; repository interface only.

## Constraints
- Do not change existing filenames or headings.
- Preserve exact lists and wording.
- If files already exist, overwrite their content with the above.
- After writing, show a diff summary of modifications.

