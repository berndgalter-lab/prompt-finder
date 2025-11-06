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
        <div class="pf-status-tier pf-status--profile" data-tier="profile">
            <span class="pf-status-icon" aria-hidden="true">🌍</span>
            <span class="pf-status-label">Profile</span>
            <span class="pf-status-count">0/0</span>
        </div>
        <div class="pf-status-tier pf-status--workflow" data-tier="workflow">
            <span class="pf-status-icon" aria-hidden="true">📁</span>
            <span class="pf-status-label">Workflow</span>
            <span class="pf-status-count">0/0</span>
        </div>
        <div class="pf-status-tier pf-status--step" data-tier="step">
            <span class="pf-status-icon" aria-hidden="true">✏️</span>
            <span class="pf-status-label">Current Step</span>
            <span class="pf-status-count">-</span>
        </div>
    </div>
</div>

