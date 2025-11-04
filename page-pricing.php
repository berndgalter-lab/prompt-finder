<?php
/**
 * Template Name: Pricing
 * Slug: pricing
 * Description: Conversion‑focused pricing page using the workflow visual language.
 */

if (!defined('ABSPATH')) { exit; }

get_header();

$is_logged_in = is_user_logged_in();
$current_user = $is_logged_in ? wp_get_current_user() : null;

// Prefill helpers (no secrets; passed to Lemon via data-attrs)
$prefill_email = $is_logged_in ? ($current_user->user_email ?: '') : '';
$prefill_name  = $is_logged_in ? trim(($current_user->first_name ?: '') . ' ' . ($current_user->last_name ?: '')) : '';

// Last visited workflow return URL (optional)
$return_url = isset($_COOKIE['pf_return_url']) ? esc_url_raw($_COOKIE['pf_return_url']) : home_url('/pricing');

?>
<main id="primary" class="site-main pf-pricing-page">
  <div class="pf-wrap">
    <section class="pf-section pf-hero">
      <header class="pf-pricing-hero">
        <h1>Simple plans to ship faster with AI workflows</h1>
        <p class="pf-sub">Preview the first step(s) on every workflow. Some workflows unlock fully with a free account (Sign-in), others require Pro. Pro also adds saved variables, recent runs, and team sharing.</p>
        <div class="pf-cta-row" style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <a href="#plans" class="pf-btn pf-btn--primary" data-analytics="cta-hero-pro" aria-label="Get Pro monthly">Get Pro</a>
          <a href="#pricing-grid" class="pf-btn pf-btn--ghost" data-analytics="cta-hero-see-plans">See Team &amp; Business</a>
        </div>
        <p class="pf-sub" style="margin-top:10px; font-size:.9rem;">Cancel anytime · 7-day money-back · Secure checkout via Lemon Squeezy · Taxes calculated at checkout</p>
      </header>
    </section>

    <!-- Billing Toggle -->
    <section class="pf-section" id="billing">
      <div class="pf-billing-toggle" role="tablist" aria-label="Billing interval" data-analytics="billing-toggle">
        <button class="pf-toggle-btn is-active" role="tab" aria-selected="true" tabindex="0" data-billing="monthly">Monthly</button>
        <button class="pf-toggle-btn" role="tab" aria-selected="false" tabindex="-1" data-billing="annual">Yearly <span class="pf-save">Save 2 months</span></button>
      </div>
    </section>

    <!-- Pricing Grid -->
    <section class="pf-section" id="plans">
      <h2 class="pf-pricing-head" style="text-align:center; margin-bottom: 12px;">Choose your plan</h2>
      <div class="pf-plans" aria-label="Pricing plans">
        <!-- Free -->
        <article class="pf-plan" aria-label="Free plan">
          <div class="pf-plan-body">
            <h3 class="pf-plan-title">Free</h3>
            <p class="pf-plan-desc">Explore free workflows — no account needed.</p>
            <div class="pf-price"><div class="pf-price" aria-hidden="true">$0</div></div>
            <ul class="pf-features">
              <li><span class="dot"></span>Full access to Free-gated workflows</li>
              <li><span class="dot"></span>Preview the first step(s) on Sign-in/Pro items</li>
              <li><span class="dot"></span>No saved variables</li>
            </ul>
            <div class="pf-cta-row">
              <a href="#plans" class="pf-btn pf-btn--ghost" aria-label="Use free" data-analytics="cta-free">Start free</a>
            </div>
          </div>
        </article>

        <!-- Pro -->
        <article class="pf-plan is-popular" aria-label="Pro plan">
          <div class="pf-plan-body">
            <span class="pf-badge">Most popular</span>
            <h3 class="pf-plan-title">Pro</h3>
            <p class="pf-plan-desc">Unlock Pro-gated workflows and save 15–40 min per run.</p>
            <div class="pf-price">
              <span class="pf-amount" data-monthly>$19</span>
              <span class="pf-amount" data-annual>$190</span>
              <span class="pf-per" data-per>/ month</span>
            </div>
            <ul class="pf-features">
              <li><span class="dot"></span>Unlock all Pro-gated workflows</li>
              <li><span class="dot"></span>Save variables &amp; recent runs</li>
              <li><span class="dot"></span>Version history</li>
              <li><span class="dot"></span>Copy to clipboard</li>
            </ul>
            <div class="pf-cta-row">
              <button class="pf-btn pf-btn--primary js-checkout" data-plan="pro" data-variant-month="PRO_VARIANT_ID" data-variant-annual="PRO_VARIANT_ID" data-email="<?php echo esc_attr($prefill_email); ?>" data-name="<?php echo esc_attr($prefill_name); ?>" data-return="<?php echo esc_attr($return_url); ?>" aria-label="Get Pro monthly" data-analytics="cta-pro-monthly">Get Pro</button>
              <a href="#comparison" class="pf-btn pf-btn--ghost" data-analytics="cta-compare-pro">Compare plans</a>
            </div>
            <div class="pf-per" style="font-size:.8rem; color:var(--pf-text-dim);">Taxes calculated at checkout.</div>
          </div>
        </article>

        <!-- Team -->
        <article class="pf-plan" aria-label="Team plan">
          <div class="pf-plan-body">
            <h3 class="pf-plan-title">Team</h3>
            <p class="pf-plan-desc">Share a consistent library across your team (5 seats included).</p>
            <div class="pf-price">
              <span class="pf-amount" data-monthly>$99</span>
              <span class="pf-amount" data-annual>$990</span>
              <span class="pf-per" data-per>/ month</span>
            </div>
            <ul class="pf-features">
              <li><span class="dot"></span>Everything in Pro (5 seats included)</li>
              <li><span class="dot"></span>Shared library &amp; team sharing</li>
              <li><span class="dot"></span>Roles (owner/editor)</li>
              <li><span class="dot"></span>Priority support</li>
            </ul>
            <div class="pf-cta-row">
              <button class="pf-btn pf-btn--primary js-checkout" data-plan="team" data-variant-month="TEAM_VARIANT_ID" data-variant-annual="TEAM_VARIANT_ID" data-email="<?php echo esc_attr($prefill_email); ?>" data-name="<?php echo esc_attr($prefill_name); ?>" data-return="<?php echo esc_attr($return_url); ?>" aria-label="Get Team monthly" data-analytics="cta-team-monthly">Get Team</button>
              <a href="#comparison" class="pf-btn pf-btn--ghost" data-analytics="cta-compare-team">Compare plans</a>
            </div>
            <div class="pf-per" style="font-size:.8rem; color:var(--pf-text-dim);">Taxes calculated at checkout.</div>
          </div>
        </article>

        <!-- Business -->
        <article class="pf-plan" aria-label="Business plan">
          <div class="pf-plan-body">
            <h3 class="pf-plan-title">Business</h3>
            <p class="pf-plan-desc">Scale governance and support for larger teams (20 seats).</p>
            <div class="pf-price">
              <span class="pf-amount" data-monthly>$299</span>
              <span class="pf-amount" data-annual>$2,990</span>
              <span class="pf-per" data-per>/ month</span>
            </div>
            <ul class="pf-features">
              <li><span class="dot"></span>Everything in Team (20 seats included)</li>
              <li><span class="dot"></span>SSO (coming soon)</li>
              <li><span class="dot"></span>Audit logs (coming soon)</li>
              <li><span class="dot"></span>Dedicated onboarding</li>
            </ul>
            <div class="pf-cta-row">
              <button class="pf-btn pf-btn--primary js-checkout" data-plan="business" data-variant-month="BUSINESS_VARIANT_ID" data-variant-annual="BUSINESS_VARIANT_ID" data-email="<?php echo esc_attr($prefill_email); ?>" data-name="<?php echo esc_attr($prefill_name); ?>" data-return="<?php echo esc_attr($return_url); ?>" aria-label="Get Business monthly" data-analytics="cta-business-monthly">Get Business</button>
              <a href="#comparison" class="pf-btn pf-btn--ghost" data-analytics="cta-compare-business">Compare plans</a>
            </div>
            <div class="pf-per" style="font-size:.8rem; color:var(--pf-text-dim);">Taxes calculated at checkout.</div>
          </div>
        </article>
      </div>
    </section>

    <!-- Comparison Table -->
    <section class="pf-section" id="comparison" aria-labelledby="compare-heading">
      <h2 id="compare-heading">Compare plans</h2>
      <div class="pf-card" style="padding:16px; overflow:auto;">
        <table class="pf-compare" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;">Feature</th>
              <th>Free</th>
              <th>Pro</th>
              <th>Team</th>
              <th>Business</th>
            </tr>
          </thead>
          <tbody>
            <?php
              $rows = [
                'Preview first step(s) on every workflow',
                'Unlock all steps (depends on workflow access mode)',
                'Full output (no redaction)',
                'Save variables',
                'Recent runs',
                'Version history',
                'Copy to clipboard',
                'Shared library (team)',
                'Invite team members (seats included)',
                'Roles (owner/editor)',
                'Priority support',
                'SSO (coming soon)',
                'Audit logs (coming soon)'
              ];
              // Matrix: F,P,T,B boolean
              $matrix = [
                [true,  true,  true,  true ],
                [false, true,  true,  true ],
                [false, true,  true,  true ],
                [false, true,  true,  true ],
                [false, true,  true,  true ],
                [false, true,  true,  true ],
                [false, true,  true,  true ],
                [false, false, true,  true ],
                [false, false, true,  true ],
                [false, false, true,  true ],
                [false, false, true,  true ],
                [false, false, false, true ],
                [false, false, false, true ],
              ];
              foreach ($rows as $i => $label): $vals = $matrix[$i]; ?>
              <tr>
                <td style="text-align:left; padding:8px 6px;"><?php echo esc_html($label); ?></td>
                <?php foreach ($vals as $v): ?>
                  <td style="text-align:center; padding:8px 6px;"><?php echo $v ? '✔' : '—'; ?></td>
                <?php endforeach; ?>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
        <p class="pf-sub" style="margin-top:10px; font-size:.9rem;">*SSO and audit logs are on our roadmap. Business subscribers get early access.</p>
        <p class="pf-sub" style="margin-top:6px; font-size:.85rem;">Access modes: Free (all steps open, no signup), Sign-in (login unlocks all steps), Pro (Pro membership unlocks all steps). Previews (first step[s]) are shown on every workflow.</p>
      </div>
    </section>

    <!-- Access modes explained -->
    <section class="pf-section" id="access-modes" aria-labelledby="access-modes-h2">
      <h2 id="access-modes-h2">Access modes explained</h2>
      <div class="pf-value-rows" style="display:grid; gap:14px; grid-template-columns:repeat(3,minmax(0,1fr));">
        <div class="pf-card" style="padding:14px;">
          <h3>Free</h3>
          <p class="pf-sub">Everything open, no signup. Preview limit is ignored.</p>
        </div>
        <div class="pf-card" style="padding:14px;">
          <h3>Sign-in</h3>
          <p class="pf-sub">Preview the first step(s) for everyone. Login with a free account unlocks all steps.</p>
        </div>
        <div class="pf-card" style="padding:14px;">
          <h3>Pro</h3>
          <p class="pf-sub">Preview the first step(s) for everyone. An active Pro membership unlocks all steps and features.</p>
        </div>
      </div>
      <p class="pf-sub" style="margin-top:10px; font-size:.9rem;">Default preview: first step(s). Workflow authors may set a different preview length.</p>
    </section>

    <!-- Value Section -->
    <section class="pf-section" aria-labelledby="value-h2">
      <h2 id="value-h2">Why teams choose Prompt Finder</h2>
      <div class="pf-value-rows" style="display:grid; gap:14px; grid-template-columns:repeat(3,minmax(0,1fr));">
        <div class="pf-card" style="padding:14px;">
          <h3>Save 15–40 min per run</h3>
          <p class="pf-sub">Run the first step to preview structure and quality. Unlock full output to remove redaction and save your variables.</p>
        </div>
        <div class="pf-card" style="padding:14px;">
          <h3>Repeatable quality</h3>
          <p class="pf-sub">Variables, checklists, and example inputs make your results consistent across runs.</p>
        </div>
        <div class="pf-card" style="padding:14px;">
          <h3>Scale with your team</h3>
          <p class="pf-sub">Share a library, track versions, and include the seats you need as you grow.</p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="pf-section pf-faq" aria-labelledby="faq-h2">
      <h2 id="faq-h2">FAQ</h2>
      <div>
        <?php
          $faqs = [
            ['Can I try before I pay?','Yes. You can preview the first step(s) on every workflow. Some workflows unlock fully with a free account (Sign-in), others require Pro due to cost or licensing. Pro also adds saved variables, recent runs, and team sharing.'],
            ['Can I cancel anytime?','Yes. You can cancel in a click in the Customer Portal. Your access remains until the end of the billing period.'],
            ['Do you offer a refund?','Yes—7-day money-back if you’re not happy. We prefer refunds over disputes to keep it simple for everyone.'],
            ['Do prices include taxes?','No. Prices are tax-exclusive. Applicable taxes are calculated at checkout by Lemon Squeezy (our Merchant of Record).'],
            ['What happens after I pay?','You’re unlocked immediately. Reload the workflow page to see full output and save variables.'],
            ['How many seats are in Team?','5 seats are included. You can add more seats later (we’ll prompt you if you need more).'],
            ['Do you support annual billing?','Yes—switch to Yearly to save 2 months.'],
            ['Is this for individuals or teams?','Both. Start with Pro; upgrade to Team when you want a shared library.'],
          ];
          foreach ($faqs as $i => $f): ?>
          <details data-analytics="faq-open">
            <summary><strong><?php echo esc_html($f[0]); ?></strong></summary>
            <p class="pf-sub" style="margin-top:6px;"><?php echo esc_html($f[1]); ?></p>
          </details>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="pf-section" aria-labelledby="final-cta">
      <h2 id="final-cta">Ready to unlock full workflows?</h2>
      <div class="pf-cta-row" style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="pf-btn pf-btn--primary js-checkout" data-plan="pro" data-variant-month="PRO_VARIANT_ID" data-variant-annual="PRO_VARIANT_ID" data-email="<?php echo esc_attr($prefill_email); ?>" data-name="<?php echo esc_attr($prefill_name); ?>" data-return="<?php echo esc_attr($return_url); ?>" aria-label="Get Pro monthly" data-analytics="cta-pro-footer">Get Pro</button>
        <a href="mailto:hello@promptfinder.ai" class="pf-btn pf-btn--ghost" data-analytics="cta-talk-to-us">Talk to us</a>
      </div>
    </section>
  </div>

  <!-- Inline JSON with plan config for JS -->
  <script type="application/json" id="pf-pricing-config">
  <?php echo wp_json_encode([
    'currency' => 'USD',
    'plans' => [
      'pro' => ['monthly' => 19,  'annual' => 190,  'variant_month' => 'PRO_VARIANT_ID',     'variant_annual' => 'PRO_VARIANT_ID'],
      'team' => ['monthly' => 99,  'annual' => 990,  'variant_month' => 'TEAM_VARIANT_ID',    'variant_annual' => 'TEAM_VARIANT_ID'],
      'business' => ['monthly' => 299, 'annual' => 2990, 'variant_month' => 'BUSINESS_VARIANT_ID','variant_annual' => 'BUSINESS_VARIANT_ID'],
    ],
    'user' => [
      'email' => $prefill_email,
      'name'  => $prefill_name,
      'id'    => $is_logged_in ? get_current_user_id() : 0,
    ],
    'returnUrl' => $return_url,
  ], JSON_UNESCAPED_SLASHES); ?>
  </script>

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  <?php echo wp_json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'SoftwareApplication',
    'name' => 'Prompt Finder',
    'operatingSystem' => 'Web',
    'applicationCategory' => 'BusinessApplication',
    'offers' => [
      [
        '@type' => 'Offer',
        'name' => 'Pro',
        'price' => '19',
        'priceCurrency' => 'USD',
        'availability' => 'https://schema.org/InStock',
        'isFamilyFriendly' => true
      ],
      [
        '@type' => 'Offer',
        'name' => 'Team',
        'price' => '99',
        'priceCurrency' => 'USD',
        'availability' => 'https://schema.org/InStock',
        'isFamilyFriendly' => true
      ],
      [
        '@type' => 'Offer',
        'name' => 'Business',
        'price' => '299',
        'priceCurrency' => 'USD',
        'availability' => 'https://schema.org/InStock',
        'isFamilyFriendly' => true
      ]
    ]
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>
  </script>
</main>

<?php get_footer(); ?>


