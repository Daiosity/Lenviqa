# Limitations And Non-Goals

PressBridge core is intentionally narrower than a full WordPress frontend replacement promise.

Core does not currently promise:

- WooCommerce as a solved core feature
- ACF integration
- Elementor compatibility
- theme-specific CSS fidelity
- pixel-perfect Gutenberg parity with the active WordPress theme
- support for third-party/custom block ecosystems
- support for interactive blocks that depend on WordPress frontend JavaScript
- full feature parity between the main starter and the lightweight smoke frontend

Some areas are beta-safe with caveats:

- Gutenberg rendering is intended to preserve layout intent, not clone the active theme
- preview is validated strongly in the local scenario set, but browser and hosting differences still matter
- packaging/install confidence is validated by scripts, but some wp-admin and hosting behavior remains manual

These boundaries are intentional. The current goal of core is reliable bridge behavior, honest fallback behavior, and a usable starter foundation.

Related pages:

- [Supported Beta Scope](wiki-supported-beta-scope.md)
- [Validation and Scenario Guardrails](wiki-validation-and-scenario-guardrails.md)
- [What Is PressBridge](wiki-what-is-pressbridge.md)
