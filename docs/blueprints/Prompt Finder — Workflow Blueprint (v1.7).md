# Prompt Finder — Workflow Blueprint (v1.7)

## Purpose
This document defines how Prompt Finder workflows are designed and generated.
It describes:
- what a workflow is,
- how each workflow is structured,
- how steps behave,
- how privacy is enforced,
- how AI should output the workflow so it can be inserted into WordPress ACF.

Use this file together with `acf-fields-reference.md` (ACF schema).


## 1. Core Concept
Prompt Finder is a workflow system that turns complex, repeatable business tasks into short, safe, guided micro-processes.

Each workflow is:
- a “mini SOP” for 1 task,
- 3–5 short steps,
- executable in under 5 minutes total,
- designed for a normal employee (not a prompt engineer),
- built to run inside ChatGPT.

The workflow tells the user exactly:
1. what to copy,
2. where to paste it,
3. what to check before sending externally.


## 2. Two-Phase Creation Model

### Phase 1 — PLAN
Before generating a workflow, the AI creates a high-level plan:
- A short summary of the purpose (≤120 words).
- A draft step sequence (3–5 steps).
- Whether long source content from the user is needed.
- Which variables the user must provide.
- Key design decisions (tone, goal, privacy points).

The PLAN ends with:
“Shall I generate the workflow now?”

No ACF fields are output in Phase 1.

### Phase 2 — BUILD
After approval, the AI generates the full workflow in the exact structure required by ACF. That includes:
- Workflow Meta
- Global Variables (`pf_variables`)
- Steps (`pf_steps`)

Every required field must be populated.
If something is unknown, use `TBD`.
The output must be copy/paste-ready for WordPress.


## 3. Workflow Structure

Each Prompt Finder workflow has 3 major parts:

### 3.1 Workflow Meta
High-level description of the workflow. This includes:
- `workflow_id` (kebab-case internal ID)
- `workflow_title` (public title)
- `tagline` (one-sentence benefit)
- `summary`
- `pain_points`
- `expected_outcome`
- `inputs_prerequisites` (what the user needs ready, including privacy warning)
- `estimated_time_min` (total time, ≤5 min)
- `time_saved_min` (optional time saved estimate)
- `difficulty_without_ai` (1–5 scale)
- `use_case` (e.g. Sales, Recruiting, Content, Ops)
- `tags` (keywords)
- `requires_source_content` (true/false)

Rules:
- All Meta fields are written in clean, friendly English.
- Never include `{{variables}}` or developer language in public text.
- If `requires_source_content = true`, the workflow MUST instruct the user to paste real text directly into ChatGPT, not into Prompt Finder.

### 3.2 Global Variables (`pf_variables`)
These are inputs the user sets (2–5 total). Each variable has:
- `var_key` (machine key, e.g. `tone`, `goal`, `target_audience`, `source_content`)
- `label`
- `placeholder`
- `hint` (with privacy guidance)
- `default_value`
- `required` (true/false)
- `injection_mode` (`direct` or `conditional`)

Rules:
- Use as few required variables as possible. `required = true` should be rare.
- Optional variables must use `injection_mode = conditional` and must include fallback logic in prompts.
- `hint` must always remind the user not to include personal names, email addresses, salaries, confidential contract terms, etc.

Special case: `source_content`
- Add only if `requires_source_content = true`.
- Purpose: represent “the long real-world text the user will paste into ChatGPT”.
- `hint` must say:
  “Paste the full email / blog post / transcript directly into ChatGPT after Step 1. Do not paste it into Prompt Finder. Remove names, emails, salary info, or confidential contract language first.”
- `source_content` is not actually stored in Prompt Finder. It is conceptually part of the workflow so the steps can reference it safely.

### 3.3 Steps (`pf_steps`)
The workflow is executed as a sequence of 3–5 steps. Each step has:
- `step_id` (step-1, step-2, …)
- `step_title` (action-style label)
- `step_objective` (what this step achieves for the user)
- `step_type` (one of: `prompt`, `guide`, `review`)
- `prompt_mode` (only if step_type = `prompt`; may be `context_stage`, `main`, `optimizer`)
- `step_prompt` (the full ChatGPT prompt to paste; only for `prompt` steps)
- `uses_global_vars` (true/false)
- `consumes_previous_output` (true only for optimizer steps)
- `estimated_time_min` (≤1 min per step)
- `paste_guidance`
- `step_body` (only for `guide` steps; bullet-style instructions)
- `sample_output`
- `step_checklist` (only for `review` steps; 4–8 binary checks)
- `review_hint` (only for `review` steps; how to fix issues)

Rules:
- Each step must be completable in under 1 minute.
- Total workflow time must be ≤5 minutes.
- The final step MUST be a `review` step with privacy checks.
- If `requires_source_content = true`, there MUST be a `guide` step early in the workflow telling the user to paste that source content into ChatGPT (and to anonymize it first).


## 4. Step Types in Detail

### 4.1 Step Type: `prompt`
A `prompt` step gives the user a full message to paste into ChatGPT.

It also has `prompt_mode`:
- `context_stage`  
  - Prepares ChatGPT.
  - Sets role, tone, constraints.
  - Explains what’s coming next.
  - If source content will be pasted later, it must tell ChatGPT: “Wait for the full text.”
  - Sample output from ChatGPT is usually: “Ready for text.”

- `main`  
  - Produces the main deliverable (email draft, LinkedIn post, summary, etc.).
  - Uses all relevant global variables and assumes ChatGPT has seen the source content if applicable.

- `optimizer`  
  - Improves the output from the previous step only.
  - Tightens tone, clarity, structure.
  - `consumes_previous_output` must be `true` here, and only here.

Rules for `prompt` steps:
- The `step_prompt` must be fully self-contained. Never “as above”.
- You may insert variables like `{{goal}}`, `{{tone}}`, etc.
- For optional variables, you MUST include fallback logic inline, for example:
  “Tone:
  - If {{tone}} is provided, match it.
  - If not, use a neutral, professional tone.”

### 4.2 Step Type: `guide`
A `guide` step tells the human what to do next. It is not a prompt for ChatGPT.

It should:
- Give 3–5 bullet actions (in `step_body`).
- Tell the user exactly where to paste which text.
- Include a privacy warning if the user is pasting real data.
- Example guidance:
  - “In the same ChatGPT conversation, paste the full incoming email now.”
  - “Remove names, email addresses, salaries, or confidential terms before you paste.”
  - “Send it to ChatGPT and wait for confirmation.”

This step is mandatory when `requires_source_content = true`, because Prompt Finder itself must not collect that content.

`paste_guidance` for a guide step should clearly say:
“Paste the full text directly in ChatGPT now. Do not paste it into Prompt Finder. Anonymize names, emails, salaries, or confidential contract terms first.”

`sample_output` for a guide step is not AI output; it’s the expected state:
“ChatGPT has confirmed it received the full email.”

### 4.3 Step Type: `review`
A `review` step is always last.
It exists to force quality + safety before the user sends/publishes the output.

It must include:
- `step_checklist`: 4–8 yes/no checks. Every item must start with a verb and be objectively testable.
  Examples:
  - “Confirm the tone supports your goal.”
  - “Remove any personal names, email addresses, salary numbers, or confidential contract terms.”
  - “Check that the next step / call to action is clear.”
- `review_hint`: coaching text on how to fix issues.
  Example:
  “If private names or pricing are still in the draft, rewrite those parts or ask ChatGPT to anonymize them before you send.”

`sample_output` for the review step is usually a short statement of readiness:
“You now have a final draft that sounds professional, supports your goal, and does not expose private information.”

Rules:
- The review step must explicitly reference privacy and redaction.
- Without a review step, the workflow is invalid.


## 5. Privacy and Sensitive Data

Prompt Finder is privacy-first. We assume GDPR-level standards globally.

Key rules:
- Prompt Finder must never store or request personal data (names, salaries, email addresses, contract text, medical info, etc.).
- `source_content` (customer email, blog post, transcript, etc.) is never pasted into Prompt Finder — it is pasted by the user directly into ChatGPT after Step 1.
- All instructions that involve pasting real-world content must include an anonymization reminder.
- The final review step must always include at least one checklist item about removing confidential or personal data.

When writing hints, guidance, and prompts:
- Always say “Remove names, email addresses, salaries, or confidential contract terms before you paste.”
- Never ask for protected data.
- Never claim legal/medical/compliance approval. The output is guidance, not legal advice.


## 6. Best Practices for Workflow Creation

### 6.1 Simplicity
- The user should feel “Do this, paste this, done.”
- No theory, no internal jargon, no dev talk.
- Each step ≤1 minute.
- Total ≤5 minutes.

### 6.2 Reuse vs. Explosion
We do not create 50 micro-workflows for tiny variations.  
We create one flexible workflow with variables.

Example:
- Good workflow: “Respond to Customer Emails Professionally”
  - Variable: `situation` (“angry”, “confused”, “positive feedback”)
  - Variable: `goal` (“calm them down”, “upsell”, “close ticket”)

- Bad approach: separate workflows for
  - “Reply to angry customer email”
  - “Reply to happy customer email”
  - “Reply to confused customer email”

Rule: prefer one reusable workflow with variables over many niche clones.

### 6.3 Fallback Logic for Optional Variables
If a variable is not required:
- Use `injection_mode = conditional`.
- Prompts must handle missing values gracefully.
- Never output broken text like “Tone: .”

Correct style:
“Tone:
- If {{tone}} is provided, match it.
- If not, use a neutral, professional tone.”

### 6.4 Review as a Product Promise
The last step (review) is part of the value.
It protects tone, clarity, and privacy.
It makes the user confident that it’s “safe to send”.
Never skip it.


## 7. Output Expectations

When the AI generates a workflow (Phase 2), it must output:
1. Workflow Meta
2. Variables table
3. Steps

All fields must follow the ACF schema in `acf-fields-reference.md`.

Public-facing text (what the user will read on the site) must:
- Be clear, calm, professional, helpful.
- Avoid developer language.
- Avoid mentioning internal mechanics (“PF variables”, “step_type”, etc.).
- Avoid unsafe promises (“legally compliant”, “guaranteed safe”).
- Avoid “As an AI…” disclaimers.

Prompts (`step_prompt`) are allowed to include `{{variable}}` placeholders plus fallback logic.

Nothing else should include raw `{{variable}}` placeholders.


## 8. Constraints Summary

- Max steps: 5
- Step duration: each ≤1 minute
- Total run time: ≤5 minutes
- Final step: must be `review`
- If `requires_source_content = true`: must include a `guide` step where user pastes source into ChatGPT (not into Prompt Finder)
- Every workflow must include at least one explicit privacy/redaction instruction
- All generated English must be plain, non-technical, and immediately usable by a normal employee


## 9. Mental Model

A Prompt Finder workflow should feel like:
- A calm coworker walking you through a stressful task.
- “Paste this, now do this, now check this, done.”
- Not training.
- Not theory.
- Not legal advice.
- Just execution within 5 minutes.

This is the brand.

# END OF FILE
