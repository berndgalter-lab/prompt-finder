<?php
/**
 * Workflow Template Part: Variable Status Bar
 *
 * Simplified single-tier display showing total input completion.
 *
 * @package GeneratePress_Child
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="pf-variable-status" role="status" aria-live="polite">
    <div class="pf-variable-status-inner">
        <header class="pf-status-head">
            <span class="pf-status-kicker">Workflow setup</span>
            <h3 class="pf-status-title">Inputs completion</h3>
            <p class="pf-status-sub">How many required and optional inputs are already filled.</p>
        </header>
        <div class="pf-variable-status-bar">
            <div class="pf-status-simple">
                <svg class="pf-status-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="pf-status-text">
                    <span class="pf-status-count" data-filled="0" data-total="0">0 of 0</span>
                    <span class="pf-status-label">inputs filled</span>
                </span>
                <button type="button" class="pf-status-info" aria-label="Show details" title="What counts as an input?">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                </button>
            </div>
            <div class="pf-status-tooltip" hidden>
                <p class="pf-status-tooltip-text">This shows all required and optional inputs you can fill in this workflow, including settings that apply to all steps and inputs for individual steps.</p>
            </div>
        </div>
    </div>
</div>

