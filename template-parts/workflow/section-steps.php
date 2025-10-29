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

$total_steps = count($steps);
?>

<section id="steps" class="pf-section pf-section--steps" data-total-steps="<?php echo esc_attr($total_steps); ?>">
    
    <!-- Section Heading -->
    <h2 class="pf-section-heading">Workflow Steps</h2>
    <p class="pf-section-subheading">Follow these steps in order. Complete each step before moving to the next.</p>
    
    <!-- Steps List -->
    <ol class="pf-steps-list">
        <?php foreach ($steps as $index => $step): ?>
            <?php
            // Get step data
            $step_id = isset($step['step_id']) && !empty($step['step_id']) 
                ? sanitize_title($step['step_id']) 
                : 'step-' . ($index + 1);
            $title = isset($step['title']) ? trim($step['title']) : 'Untitled Step';
            $objective = isset($step['objective']) ? trim($step['objective']) : '';
            $step_type = isset($step['step_type']) ? trim($step['step_type']) : 'prompt';
            $prompt_mode = isset($step['prompt_mode']) ? trim($step['prompt_mode']) : 'main';
            $prompt = isset($step['prompt']) ? trim($step['prompt']) : '';
            $step_body = isset($step['step_body']) ? trim($step['step_body']) : '';
            $review_hint = isset($step['review_hint']) ? trim($step['review_hint']) : '';
            $uses_global_vars = !empty($step['uses_global_vars']);
            $consumes_previous_output = !empty($step['consumes_previous_output']);
            $paste_guidance = isset($step['paste_guidance']) ? trim($step['paste_guidance']) : '';
            $example_output = isset($step['example_output']) ? trim($step['example_output']) : '';
            $estimated_time_min = isset($step['estimated_time_min']) ? trim($step['estimated_time_min']) : '';
            $variables_step = isset($step['variables_step']) && is_array($step['variables_step']) ? $step['variables_step'] : [];
            
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
            ?>
            
            <li class="pf-step <?php echo 'pf-step--' . esc_attr($step_type); ?>" 
                id="<?php echo esc_attr($step_id); ?>" 
                data-step-index="<?php echo esc_attr($index); ?>"
                data-step-number="<?php echo esc_attr($step_number); ?>"
                data-step-type="<?php echo esc_attr($step_type); ?>"
                data-step-id="<?php echo esc_attr($step_id); ?>">
                
                <!-- Step Header (always visible) -->
                <div class="pf-step-header" data-action="toggle-step">
                    <div class="pf-step-number"><?php echo esc_html($step_number); ?></div>
                    
                    <div class="pf-step-title-wrap">
                        <h3 class="pf-step-title"><?php echo esc_html($title); ?></h3>
                        <?php if (!empty($objective)): ?>
                            <p class="pf-step-objective-preview"><?php echo esc_html($objective); ?></p>
                        <?php endif; ?>
                    </div>
                    
                    <div class="pf-step-meta">
                        <?php if ($estimated_time_min): ?>
                            <span class="pf-step-badge pf-step-badge--time">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                                <?php echo esc_html($estimated_time_min); ?> min
                            </span>
                        <?php endif; ?>
                        
                        <span class="pf-step-badge pf-step-badge--<?php echo esc_attr($step_type); ?>">
                            <?php echo esc_html($type_badge_text); ?>
                        </span>
                        
                        <?php if ($uses_global_vars): ?>
                            <span class="pf-step-badge pf-step-badge--vars" title="Uses global variables">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6m0 6v6M23 12h-6M7 12H1"/>
                                </svg>
                            </span>
                        <?php endif; ?>
                        
                        <?php if ($consumes_previous_output): ?>
                            <span class="pf-step-badge pf-step-badge--consumes" title="Uses output from previous step">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                            </span>
                        <?php endif; ?>
                    </div>
                    
                    <button class="pf-step-toggle" aria-label="Toggle step content">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    
                    <label class="pf-step-checkbox-wrap">
                        <input type="checkbox" class="pf-step-checkbox" data-action="toggle-completion">
                        <span class="pf-checkmark">✓</span>
                    </label>
                </div>
                
                <!-- Step Content (collapsible) -->
                <div class="pf-step-content">
                    <?php if (!empty($objective)): ?>
                        <div class="pf-step-objective">
                            <strong>Goal:</strong> <?php echo esc_html($objective); ?>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Prompt Type -->
                    <?php if ($step_type === 'prompt' && !empty($prompt)): ?>
                        
                        <?php if (!empty($variables_step)): ?>
                            <div class="pf-step-variables-section">
                                <h4>Step Variables</h4>
                                <div class="pf-step-variables-list">
                                    <?php foreach ($variables_step as $v): ?>
                                        <?php
                                        $var_name = isset($v['step_var_name']) ? trim($v['step_var_name']) : '';
                                        $var_desc = isset($v['step_var_description']) ? trim($v['step_var_description']) : '';
                                        $var_example = isset($v['step_var_example_value']) ? trim($v['step_var_example_value']) : '';
                                        $var_required = !empty($v['step_var_required']);
                                        
                                        if (empty($var_name)) continue;
                                        
                                        $label = ucwords(str_replace(['_', '-'], ' ', $var_name));
                                        $label = str_replace(['{', '}'], '', $label);
                                        $placeholder = !empty($var_example) ? $var_example : (!empty($var_desc) ? $var_desc : 'Enter ' . strtolower($label));
                                        ?>
                                        <div class="pf-step-var-input-wrapper">
                                            <label class="pf-step-var-label">
                                                <?php echo esc_html($label); ?>
                                                <?php if ($var_required): ?>
                                                    <span class="pf-var-required">*</span>
                                                <?php endif; ?>
                                            </label>
                                            
                                            <?php if (!empty($var_desc)): ?>
                                                <p class="pf-step-var-hint"><?php echo esc_html($var_desc); ?></p>
                                            <?php endif; ?>
                                            
                                            <input 
                                                type="text"
                                                class="pf-step-var-input"
                                                data-var-key="<?php echo esc_attr($var_name); ?>"
                                                data-step-number="<?php echo esc_attr($step_number); ?>"
                                                placeholder="<?php echo esc_attr($placeholder); ?>"
                                                <?php if ($var_required): ?>required<?php endif; ?>
                                            />
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                        
                        <div class="pf-prompt-container">
                            <div class="pf-prompt-header">
                                <span class="pf-prompt-label">Prompt</span>
                                <button class="pf-btn pf-btn-copy" data-copy-target="<?php echo esc_attr($step_id); ?>">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                    </svg>
                                    Copy
                                </button>
                            </div>
                            <div class="pf-prompt-text" 
                                 data-prompt-id="<?php echo esc_attr($step_id); ?>"
                                 data-original-text="<?php echo esc_attr($prompt); ?>">
                                <?php echo esc_html($prompt); ?>
                            </div>
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
                        
                    <?php elseif ($step_type === 'guide' && !empty($step_body)): ?>
                        
                        <div class="pf-guide-body">
                            <?php echo wp_kses_post($step_body); ?>
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
                        <details class="pf-example-output">
                            <summary>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                                Example Output
                            </summary>
                            <div class="pf-example-content">
                                <?php echo wp_kses_post($example_output); ?>
                            </div>
                        </details>
                    <?php endif; ?>
                    
                </div>
                
            </li>
            
        <?php endforeach; ?>
    </ol>
    
</section>
