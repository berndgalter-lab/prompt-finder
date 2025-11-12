<?php
/**
 * Workflow Template Part: Steps Section
 * 
 * Displays workflow steps with collapsible cards, variable injection, and copy functionality
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get steps from ACF
$steps = get_field('steps');

// If no steps, show notice
if (empty($steps) || !is_array($steps)) {
    ?>
    <section id="steps" class="pf-section pf-section--steps">
        <h2 class="pf-section-heading">Workflow Steps</h2>
        <div class="pf-steps-notice">
            <p>No steps defined for this workflow.</p>
        </div>
    </section>
    <?php
    return;
}

// Get post ID and access control info
$post_id = get_the_ID();
$total_steps = count($steps);
$visible_steps = pf_visible_steps_count($post_id, $total_steps);
$access_mode = pf_workflow_mode($post_id);
$can_view_all = pf_can_view_all($post_id);
$cta_info = pf_get_access_cta($post_id);
$workflow_vars = get_field('variables_workflow', $post_id) ?: [];
$workflow_vars_json = wp_json_encode($workflow_vars, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if (!is_string($workflow_vars_json)) {
    $workflow_vars_json = '[]';
}
$user_uid = '';
if (is_user_logged_in() && class_exists('PF_UserUidMap')) {
    $user_uid = PF_UserUidMap::userUidFromWpId(get_current_user_id());
}
?>

<div class="pf-wf-root" data-wf-root data-wf-id="<?php echo esc_attr($post_id); ?>" data-user-uid="<?php echo esc_attr($user_uid); ?>">
    <div class="pf-wf-vars" data-wf-vars="<?php echo esc_attr($workflow_vars_json); ?>"></div>

    <section id="steps" class="pf-section pf-section--steps" 
             data-mode="<?php echo esc_attr($access_mode); ?>"
             data-total-steps="<?php echo esc_attr($total_steps); ?>"
             data-visible-steps="<?php echo esc_attr($visible_steps); ?>">
    
    <!-- Section Heading -->
    <h2 class="pf-section-heading">Workflow Steps</h2>
    <p class="pf-section-subheading">Follow these steps in order. Complete each step before moving to the next.</p>
    
    <?php if ($cta_info): ?>
        <!-- Access CTA -->
        <div class="pf-access-cta">
            <p class="pf-access-cta-text"><?php echo esc_html($cta_info['text']); ?></p>
            <a href="<?php echo esc_url($cta_info['url']); ?>" class="pf-btn pf-btn--primary pf-access-cta-btn">
                <?php echo esc_html($cta_info['text']); ?>
            </a>
        </div>
    <?php endif; ?>
    
    <!-- Steps List -->
    <ol class="pf-steps-list" aria-live="polite">
        <?php $initial_active_assigned = false; ?>
        <?php foreach ($steps as $index => $step): ?>
            <?php
            // Determine if this step is visible or locked
            $step_is_visible = ($index < $visible_steps);
            $step_is_locked = !$step_is_visible;
            ?>
            <?php
            // Get step data
            $raw_step_id = isset($step['step_id']) ? trim($step['step_id']) : '';
            $step_id = !empty($raw_step_id) ? sanitize_title($raw_step_id) : '';
            $title = isset($step['title']) ? trim($step['title']) : 'Untitled Step';
            $objective = isset($step['objective']) ? trim($step['objective']) : '';
            $step_type = isset($step['step_type']) ? trim($step['step_type']) : 'prompt';
            $prompt_mode = isset($step['prompt_mode']) ? trim($step['prompt_mode']) : 'main';
            $prompt = isset($step['prompt']) ? trim($step['prompt']) : '';
            $step_body = isset($step['step_body']) ? trim($step['step_body']) : '';
            $review_hint = isset($step['review_hint']) ? trim($step['review_hint']) : '';
            $uses_global_vars = !empty($step['uses_global_vars']);
            $uses_global_numeric = isset($step['uses_global_vars']) ? (int) !!$step['uses_global_vars'] : 1;
            $consumes_previous_output = !empty($step['consumes_previous_output']);
            $paste_guidance = isset($step['paste_guidance']) ? trim($step['paste_guidance']) : '';
            $example_output = isset($step['example_output']) ? trim($step['example_output']) : '';
            $estimated_time_min = isset($step['estimated_time_min']) ? trim($step['estimated_time_min']) : '';
            $variables_step = isset($step['variables_step']) && is_array($step['variables_step']) ? $step['variables_step'] : [];
            // Fallback: support old key 'variables' for step variables
            if (empty($variables_step) && isset($step['variables']) && is_array($step['variables'])) {
                // Map old structure to new step vars
                $mapped_step_vars = [];
                foreach ($step['variables'] as $sv) {
                    $mapped_step_vars[] = [
                        'step_var_name' => isset($sv['var_name']) ? $sv['var_name'] : '',
                        'step_var_description' => isset($sv['var_description']) ? $sv['var_description'] : '',
                        'step_var_example_value' => isset($sv['example_value']) ? $sv['example_value'] : '',
                        'step_var_required' => !empty($sv['required']),
                    ];
                }
                $variables_step = $mapped_step_vars;
            }
            $step_vars_json = wp_json_encode($variables_step, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (!is_string($step_vars_json)) {
                $step_vars_json = '[]';
            }
            
            // Get step checklist if review type
            $step_checklist = [];
            if ($step_type === 'review' && isset($step['step_checklist']) && is_array($step['step_checklist'])) {
                $step_checklist = $step['step_checklist'];
            }
            
            // Step number (1-based)
            $step_number = $index + 1;
            
            // Determine type badge
            $type_badge_text = ucfirst($step_type);
            if ($step_type === 'prompt' && !empty($prompt_mode)) {
                $type_badge_text = ucfirst(str_replace('_', ' ', $prompt_mode));
            }
            $step_dom_id = 'step-' . $step_number;
            $step_heading_id = $step_dom_id . '-title';
            $step_content_id = $step_dom_id . '-content';
            $is_initial_active = !$initial_active_assigned;
            ?>
            
            <li class="pf-step <?php echo 'pf-step--' . esc_attr($step_type); ?> <?php echo $step_is_locked ? 'pf-step--locked' : ''; ?><?php echo $is_initial_active ? ' pf-step--active' : ''; ?>" 
                id="<?php echo esc_attr($step_dom_id); ?>" 
                role="region"
                aria-labelledby="<?php echo esc_attr($step_heading_id); ?>"
                data-step-index="<?php echo esc_attr($index); ?>"
                data-step-number="<?php echo esc_attr($step_number); ?>"
                data-step-type="<?php echo esc_attr($step_type); ?>"
                data-step-id="<?php echo esc_attr($step_dom_id); ?>"
                <?php if (!empty($step_id)): ?>data-original-step-id="<?php echo esc_attr($step_id); ?>"<?php endif; ?>
                data-pf-step
                data-step-vars="<?php echo esc_attr($step_vars_json); ?>"
                data-uses-global-vars="<?php echo esc_attr($uses_global_numeric); ?>"
                <?php if ($is_initial_active): ?>data-initial-active="true"<?php endif; ?>
                <?php if ($step_is_locked): ?>
                aria-disabled="true"
                <?php endif; ?>>
                
                <!-- Step Header (always visible) -->
                <div class="pf-step-header" data-action="toggle-step" role="button" tabindex="0" aria-expanded="true" aria-controls="<?php echo esc_attr($step_content_id); ?>"<?php echo $is_initial_active ? ' id="active-step"' : ''; ?>>
                    
                    <!-- Checkmark Icon (consistent with Variables Section) -->
                    <svg class="pf-step-status-icon" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2.5" 
                         stroke-linecap="round" 
                         stroke-linejoin="round" 
                         role="img"
                         aria-label="Step completion status"
                         tabindex="0">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    
                    <div class="pf-step-number" aria-hidden="true">
                        <span class="pf-step-number-value"><?php echo esc_html($step_number); ?></span>
                    </div>

                    <div class="pf-step-header-main">
                    <div class="pf-step-title-wrap">
                            <h3 class="pf-step-title" id="<?php echo esc_attr($step_heading_id); ?>"><?php echo esc_html($title); ?></h3>
                        <?php if (!empty($objective)): ?>
                            <p class="pf-step-objective-preview"><?php echo esc_html($objective); ?></p>
                        <?php endif; ?>
                    </div>
                    
                        <div class="pf-step-meta" aria-label="Step meta information">
                        <?php if ($estimated_time_min): ?>
                                <span class="pf-step-badge pf-step-badge--time" aria-label="Estimated time <?php echo esc_attr($estimated_time_min); ?> minutes">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                                <?php echo esc_html($estimated_time_min); ?> min
                            </span>
                        <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="pf-step-header-actions">
                        <button class="pf-step-toggle" aria-label="Toggle step content" type="button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    </div>
                    
                    <!-- Hidden checkbox for state management -->
                    <input type="checkbox" class="pf-step-checkbox" data-action="toggle-completion" aria-label="Mark step <?php echo esc_attr($step_number); ?> as completed" hidden>
                </div>
                
                <!-- Step Content (collapsible) -->
                <div class="pf-step-content" id="<?php echo esc_attr($step_content_id); ?>" role="group" aria-labelledby="<?php echo esc_attr($step_heading_id); ?>">
                    <?php if ($step_is_locked): ?>
                        <!-- Locked Placeholder - premium upsell -->
                        <div class="pf-step-locked">
                            <div class="pf-locked-premium">
                                <svg class="pf-locked-icon-premium" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M5 8l1 13h12l1-13" />
                                    <path d="M4 8h16l-2.5-5h-11Z" />
                                    <path d="M9 12l1 5" />
                                    <path d="M15 12l-1 5" />
                                </svg>
                                <h3 class="pf-locked-title">Premium Step</h3>
                                <p class="pf-locked-text">Upgrade to access advanced features.</p>
                                <?php
                                $unlock_url = $cta_info ? $cta_info['url'] : wp_login_url(get_permalink());
                                ?>
                                <a href="<?php echo esc_url($unlock_url); ?>" class="pf-btn-unlock">
                                    Unlock Premium
                                </a>
                            </div>
                        </div>
                    <?php else: ?>
                        <!-- Full Step Content (only rendered if visible) -->
                    <!-- Prompt Type -->
                    <?php if ($step_type === 'prompt' && !empty($prompt)): ?>
                        
                        <?php if (!empty($variables_step)): ?>
                            <div class="pf-step-section">
                                <h4 class="pf-step-section-label">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M12 20h9"/>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                    Step Inputs
                                </h4>
                                <p class="pf-step-section-desc">These values are specific to this step only.</p>
                                <div class="pf-step-variables-section pf-variables--step" data-step-vars-ui></div>
                            </div>
                        <?php endif; ?>
                        
                        <div class="pf-step-section">
                            <h4 class="pf-step-section-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                Your Prompt
                            </h4>
                        
                        <div class="pf-prompt-container">
                            <div class="pf-prompt-wrapper" data-prompt-wrapper>
                                <textarea class="pf-prompt-text pf-prompt"
                                          data-prompt-id="<?php echo esc_attr($step_dom_id); ?>"
                                          data-original-text="<?php echo esc_attr($prompt); ?>"
                                          data-prompt-template
                                          data-base="<?php echo esc_attr($prompt); ?>"
                                          aria-label="Prompt text for step <?php echo esc_attr($step_number); ?>"
                                          readonly></textarea>
                            </div>
                            <button class="pf-btn-copy-hero" data-copy-target="<?php echo esc_attr($step_dom_id); ?>" type="button" aria-label="Copy prompt for step <?php echo esc_attr($step_number); ?>">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                    </svg>
                                <span>Copy to Clipboard</span>
                                </button>
                        </div>
                        </div><!-- /.pf-step-section (Your Prompt) -->
                        
                        <?php if (!empty($paste_guidance)): ?>
                            <div class="pf-step-section">
                                <details class="pf-step-collapsible" id="paste-guidance-<?php echo esc_attr($step_dom_id); ?>">
                                    <summary class="pf-step-collapsible-summary" aria-label="Show or hide paste guidance">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="16" x2="12" y2="12"/>
                                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                                        </svg>
                                        Paste Guidance
                                    </summary>
                                    <div class="pf-step-collapsible-content" role="region" aria-labelledby="paste-guidance-<?php echo esc_attr($step_dom_id); ?>">
                                        <p><?php echo esc_html($paste_guidance); ?></p>
                                    </div>
                                </details>
                            </div>
                        <?php endif; ?>
                        
                    <?php elseif ($step_type === 'guide' && !empty($step_body)): ?>
                        <?php
                        $guide_paragraphs = array_filter(array_map('trim', preg_split("/\r?\n\s*\r?\n/", $step_body)));
                        ?>

                        <div class="pf-guide-body" data-guide-body>
                            <div class="pf-guide-body-inner">
                                <?php if (!empty($guide_paragraphs)): ?>
                                    <?php foreach ($guide_paragraphs as $paragraph): ?>
                                        <p><?php echo esc_html($paragraph); ?></p>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <p><?php echo esc_html($step_body); ?></p>
                                <?php endif; ?>
                            </div>
                            <button class="pf-guide-toggle" type="button" aria-expanded="false" hidden>
                                <span class="pf-guide-toggle__label--more">Show more</span>
                                <span class="pf-guide-toggle__label--less">Show less</span>
                            </button>
                        </div>
                        
                        <?php if (!empty($paste_guidance)): ?>
                            <div class="pf-paste-guidance">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <span><?php echo esc_html($paste_guidance); ?></span>
                            </div>
                        <?php endif; ?>
                        
                    <?php elseif ($step_type === 'review' && !empty($step_checklist)): ?>
                        
                        <div class="pf-review-checklist">
                            <h4>Review Checklist</h4>
                            <div class="pf-checklist-list">
                                <?php foreach ($step_checklist as $c): ?>
                                    <?php
                                    $check_item = isset($c['check_item']) ? trim($c['check_item']) : '';
                                    if (empty($check_item)) continue;
                                    ?>
                                    <label class="pf-checklist-item">
                                        <input type="checkbox" class="pf-checklist-checkbox">
                                        <span><?php echo esc_html($check_item); ?></span>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        
                        <?php if (!empty($review_hint)): ?>
                            <div class="pf-review-hint">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 2C5.5 2 3 4.5 3 8s2.5 6 6 6"/>
                                    <path d="M15 2c3.5 0 6 2.5 6 6s-2.5 6-6 6"/>
                                    <path d="M12 22c1 0 3-1 3-3V6c0-2-2-4-3-4"/>
                                </svg>
                                <span><?php echo esc_html($review_hint); ?></span>
                            </div>
                        <?php endif; ?>
                        
                    <?php endif; ?>
                    
                    <!-- Example Output (for all types) -->
                    <?php if (!empty($example_output)): ?>
                        <div class="pf-step-section">
                            <details class="pf-step-collapsible" id="example-output-<?php echo esc_attr($step_dom_id); ?>">
                                <summary class="pf-step-collapsible-summary" aria-label="Show or hide example output">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                    </svg>
                                    Example Output
                                </summary>
                                <div class="pf-step-collapsible-content" role="region" aria-labelledby="example-output-<?php echo esc_attr($step_dom_id); ?>">
                                    <?php echo wp_kses_post($example_output); ?>
                                </div>
                            </details>
                        </div>
                    <?php endif; ?>
                    
                    <?php endif; // End locked check ?>
                    
                </div>
                
            </li>
            <?php if ($is_initial_active) { $initial_active_assigned = true; } ?>
        <?php endforeach; ?>
    </ol>
    
</section>
</div>
