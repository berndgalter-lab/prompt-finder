# Prompt Finder — ACF Field Reference (Creator View, v1.7)

Purpose:  
This document describes the core ACF fields needed to create a new Prompt Finder workflow.  
It covers:
1. Workflow Meta (top-level)
2. Global Variables (`pf_variables`)
3. Steps (`pf_steps`)

Only fields relevant for creating workflows are included.  
Publishing/governance fields (status, version, etc.) are intentionally omitted.


---

## 1. Workflow Meta (top-level fields)

These fields describe the workflow itself and are shown in the frontend.

| Field Name               | Type        | What goes here                                                                                                  | Example                                                                                                                |
|--------------------------|-------------|------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `workflow_id`            | text        | Unique technical ID in kebab-case. Lowercase. Must start with a letter. Max ~48 chars.                          | `customer-email-reply`                                                                                                 |
| `workflow_title`         | text        | Clear title the user will understand.                                                                           | `Respond to Customer Emails Professionally`                                                                            |
| `tagline`                | text        | One-sentence value promise / benefit.                                                                           | `Turn any incoming customer email into a calm, confident reply in minutes.`                                           |
| `summary`                | textarea    | 1–2 sentence description of what this workflow helps you do.                                                    | `This workflow helps you draft respectful replies to customers using ChatGPT, fast and with consistent tone.`         |
| `pain_points`            | textarea    | Short paragraph or bullets describing current pain / why this is hard today.                                   | `It takes too long to rewrite tough emails. Tone can sound defensive. It's easy to overshare details.`                |
| `expected_outcome`       | textarea    | What the user will walk away with at the end.                                                                   | `A ready-to-send reply written in a calm, confident tone.`                                                             |
| `inputs_prerequisites`   | textarea    | What the user needs ready before starting, including privacy guidance.                                         | `Have the full email thread ready. You will paste it directly into ChatGPT in Step 2. Remove names or private details.` |
| `estimated_time_min`     | number      | Total time to run this workflow (minutes). Must be ≤ 5.                                                         | `4`                                                                                                                    |
| `time_saved_min`         | number      | Approximate time this workflow saves vs doing it manually.                                                      | `15`                                                                                                                   |
| `difficulty_without_ai`  | number 1–5  | How hard this task is without AI.                                                                               | `4`                                                                                                                    |
| `use_case`               | select      | Business category / area.                                                                                       | `Sales`, `Recruiting`, `Content`, `Ops`                                                                                |
| `tags`                   | text        | Comma-separated keywords. Optional.                                                                             | `customer service, escalation, reply tone`                                                                            |
| `requires_source_content`| true/false  | Does the workflow rely on a long real-world text (email, blog post, transcript)?                                | `true`                                                                                                                 |

Rules:
- If `requires_source_content = true`, the workflow MUST include a Guide step that tells the user to paste that text into ChatGPT (not into Prompt Finder), and MUST show a `source_content` variable in the Variables table.
- All public-facing text here (title, tagline, summary, pain_points, expected_outcome, inputs_prerequisites) must be clean human English. No `{{variables}}`, no system talk.


---

## 2. Global Variables (`pf_variables` repeater)

These are inputs the user provides once. They are then injected into the prompts.

Each row in `pf_variables` defines ONE variable and has these subfields:

| Subfield             | Type        | What goes here                                                                                                                            | Example                                                                                                              |
|----------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `var_key`            | text        | Machine name in snake_case or kebab-case. Must be unique.                                                                                 | `tone`, `goal`, `target_audience`                                                                                     |
| `label`              | text        | Friendly label shown to the user.                                                                                                         | `Tone`                                                                                                               |
| `placeholder`        | text        | Example value to help the user understand what to enter.                                                                                  | `polite, confident, calm`                                                                                            |
| `hint`               | textarea    | Short instruction for what to enter AND a privacy warning.                                                                                | `Describe how you want the message to sound (e.g. "calm but confident"). Do not include names, emails, or salaries.` |
| `default_value`      | text        | Optional default. Leave empty if not needed.                                                                                              | `neutral, professional`                                                                                              |
| `required`           | true/false  | Only set to true if the workflow CANNOT run without this value. Otherwise false.                                                          | `goal` → `true`, `tone` → `false`                                                                                    |
| `injection_mode`     | select      | How this variable is used in prompts: `direct` or `conditional`.                                                                          | `conditional`                                                                                                        |
| `prefer_profile_value`| true/false | Can this be auto-filled from a stable profile value (e.g. company name)? For MVP you can usually leave this as `false`.                   | `false`                                                                                                              |

Special variable: `source_content`
- You ONLY include this variable if `requires_source_content = true`.
- `var_key`: `source_content`
- `label`: `Source Content`
- `required`: `true`
- `hint`:  
  `Paste the full email / blog post / transcript directly into ChatGPT after Step 1. Do not paste it into Prompt Finder. Remove names, emails, salary info, or confidential contract language first.`

Important rules:
- Keep total number of global variables small (2–5 max).
- `required = true` is the exception, not the default.
- If `required = false`, then `injection_mode` should be `conditional`.
  - In prompts you must write fallback logic like:  
    `Tone: If {{tone}} is provided, match it. If not, use a neutral, professional tone.`  
  - Never leave holes like `Tone: {{tone}}.`


---

## 3. Steps (`pf_steps` repeater)

The workflow usually has 3–5 steps.  
Allowed step types: `prompt`, `guide`, `review`.

For each step you fill these subfields:

| Subfield                    | Type        | What goes here                                                                                                              | Example                                                                                                       |
|----------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `step_id`                  | text        | Sequential ID.                                                                                                              | `step-1`, `step-2`, ...                                                                                       |
| `step_title`               | text        | Action-style title the user will see.                                                                                       | `Prepare ChatGPT`                                                                                             |
| `step_objective`           | textarea    | What this step achieves, in plain English.                                                                                  | `Set up ChatGPT with your goal and tone so it understands the situation.`                                     |
| `step_type`                | select      | `prompt` (user pastes prompt into ChatGPT), `guide` (user takes a manual action), or `review` (final quality check).        | `prompt`                                                                                                      |
| `prompt_mode`              | select      | Only for `prompt` steps. One of: `context_stage`, `main`, `optimizer`.                                                      | `context_stage`                                                                                               |
| `step_prompt`              | textarea    | Only for `prompt` steps. The full text the user pastes into ChatGPT. May include PF variables like `{{goal}}`.              | `You are a professional assistant... Goal: {{goal}} ...`                                                      |
| `uses_global_vars`         | true/false  | Does this step rely on pf_variables?                                                                                        | `true`                                                                                                        |
| `consumes_previous_output` | true/false  | Only `true` for an `optimizer` step. Means: "Improve the output from the immediately previous step."                        | `true` (for optimizer). Otherwise `false`.                                                                    |
| `estimated_time_min`       | number      | How long this step takes for the human (minutes). Each step must be ≤ 1. Total workflow ≤ 5.                               | `1`                                                                                                           |
| `paste_guidance`           | textarea    | Clear instruction to the user for this step: where to paste, what to send, what NOT to paste into Prompt Finder.            | `Copy the full prompt above into ChatGPT and send it. Do not paste the customer email yet.`                   |
| `step_body`                | textarea    | Only for `guide` steps. Bulleted instructions (max 5 bullets). Include privacy warning before pasting real content.        | `- Paste the full email into ChatGPT now.\n- Remove names, emails, salaries, confidential terms first.`       |
| `sample_output`            | textarea    | Short realistic example of what ChatGPT should return after this step.                                                     | `Ready for text.` or `Hi Sarah, thanks for reaching out...`                                                   |
| `step_checklist`           | repeater    | Only for `review` step. 4–8 binary yes/no checks. One MUST be privacy/compliance (“No personal data remains”).             | `Confirm the tone is respectful and confident.`                                                               |
| `review_hint`              | textarea    | Only for `review` step. Coaching on how to fix problems before sending / publishing.                                       | `If the draft includes private names or pricing, rewrite those parts or ask ChatGPT to anonymize them.`       |

Required flow rules:
- If `requires_source_content = true`:
  - Step 1 should be a `prompt` with `prompt_mode = context_stage` telling ChatGPT to wait for the source.
  - Step 2 should be a `guide` step telling the user to paste the source content directly into ChatGPT (and to anonymize it first).
- There must always be a final `review` step with:
  - `step_checklist` that includes a privacy item like  
    `Remove any personal names, email addresses, salaries, or confidential contract terms.`
  - `review_hint` that tells how to fix issues.

Other rules:
- Each step ≤ 1 minute.
- Total workflow ≤ 5 minutes.
- `optimizer` step is optional.
- `consumes_previous_output = true` is ONLY allowed on an `optimizer` step.

---

## 4. Safety & Style (for all fields you write)

- Public-facing fields (`summary`, `pain_points`, `expected_outcome`, `inputs_prerequisites`, `step_objective`, `paste_guidance`, `step_body`, `review_hint`, `sample_output`) must read like natural, helpful English. No technical talk.
- Do NOT include `{{variables}}` in public-facing text. Variables with `{{ }}` only belong inside `step_prompt`.
- Always include privacy guidance anywhere the user is pasting real text:
  - “Remove names, emails, salaries, or confidential contract language before you paste.”
- Never tell the user to paste real customer/internal content into Prompt Finder. That goes into ChatGPT only.


---
# END OF FILE
