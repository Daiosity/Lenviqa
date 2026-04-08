# Supported Beta Scope

PressBridge core is currently beta-safe where the repo has repeatable validation coverage.

That validated core currently includes:

- route resolution for:
  - home route
  - standard page routes
  - nested hierarchical page routes
  - standard post routes
  - unresolved-route honesty
  - basic path normalization
- Gutenberg-aware rendering for common layout patterns:
  - nested groups
  - columns inside groups
  - media-text recovery from saved markup
  - cover sections with inner content
  - gallery fallback from saved markup
  - button-group layout intent
- preview foundations:
  - valid preview token resolution
  - honest invalid/expired preview failure
  - preview content staying separate from normal public routing
- package/install/runtime confidence:
  - repeatable ZIP packaging
  - package structure validation
  - activation defaults
  - starter export hook presence
  - deactivation/uninstall checks

This is not a promise of universal WordPress frontend parity.

Use these docs as the detailed scope boundary:

- [Validation and Scenario Guardrails](wiki-validation-and-scenario-guardrails.md)
- [Limitations and Non-Goals](wiki-limitations-and-non-goals.md)
- [Quick Start](wiki-quick-start.md)

For the higher-level product boundary, see [What Is PressBridge](wiki-what-is-pressbridge.md).
