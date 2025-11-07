<?php
/**
 * Workflow Template Part: Variable Status Bar
 *
 * Displays completion counts for profile, workflow, and step tiers.
 *
 * @package GeneratePress_Child
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="pf-variable-status" role="status" aria-live="polite">
    <div class="pf-variable-status-bar">
        <div class="pf-status-tier" data-tier="user">
            <div class="pf-status-header">
                <span class="pf-status-label">User Settings</span>
                <span class="pf-status-helper">Your saved preferences</span>
            </div>
            <span class="pf-status-count">0/0</span>
        </div>

        <div class="pf-status-tier" data-tier="workflow">
            <div class="pf-status-header">
                <span class="pf-status-label">This Workflow</span>
                <span class="pf-status-helper">Settings for all steps</span>
            </div>
            <span class="pf-status-count">0/0</span>
        </div>

        <div class="pf-status-tier" data-tier="step">
            <div class="pf-status-header">
                <span class="pf-status-label">Current Step</span>
                <span class="pf-status-helper">Inputs for active step</span>
            </div>
            <span class="pf-status-count">0/0</span>
        </div>
    </div>
</div>

