# Lenviqa Core Roadmap

This document defines what Lenviqa core needs to do well before premium compatibility layers become the focus.

## Current status

Lenviqa core is in public beta with a deliberately limited, validated scope.

What is already strong:

- route resolution works
- preview flow works
- safe public handoff logic exists
- the plugin ZIP packages cleanly
- the generic React starter is restored
- the smoke frontend is usable again
- Gutenberg-aware rendering is meaningfully better than the earliest prototype

What still prevents a production-ready claim:

- common real-world content still needs more rendering hardening
- starter, smoke frontend, and exported starter need ongoing alignment checks
- browser-level cross-domain preview behavior remains environment-dependent
- compatibility-heavy routes need clearer expectations in the UI and docs
- smoke coverage is still too manual

## Core promise

Core Lenviqa should already be useful without paid add-ons.

Core should feel reliable for:

- connecting WordPress to a React frontend
- resolving WordPress routes correctly
- keeping preview flow intact
- handing public traffic off safely when enabled
- rendering common WordPress content coherently
- giving developers a believable starter frontend

Premium should make adoption easier and broader. It should not rescue the base product.

## Beta-ready criteria

Lenviqa core is beta-ready when all of the following are true:

### 1. Bridge reliability

- published pages and posts resolve consistently
- archive routes resolve consistently
- nested paths behave predictably
- preview flow still works end to end
- redirect safety rules remain intact
- failure states stay readable and non-destructive

### 2. Starter credibility

- `frontend-app` works as the main starter
- `assets/starter` reflects starter behavior and copy
- `frontend-lite` remains a valid smoke frontend
- loading, empty, and failure states feel intentional

### 3. Rendering confidence

- common Gutenberg page structures render cleanly
- unsupported blocks fail safely
- shortcode-heavy routes are clearly treated as compatibility paths
- the frontend does not imply theme-level parity it cannot provide

### 4. Packaging and install confidence

- the plugin ZIP installs cleanly
- settings load without errors
- starter export works
- uninstall cleanup remains correct

### 5. Honest boundaries

- README and docs match current behavior
- known limitations stay explicit
- advanced compatibility work is clearly marked as advanced

## Must-fix before premium focus

These are the next core priorities.

### Phase 1: Core audit and boundaries

- keep this roadmap current
- document beta blockers clearly
- make advanced compatibility routes obvious in the starter

### Phase 2: Core hardening

- improve coverage for common Gutenberg patterns:
  - groups
  - columns
  - images
  - galleries
  - media-text
  - buttons
  - separators
  - cover blocks
- harden route-resolution edge cases
- keep preview behavior stable while renderer changes continue

### Phase 3: Starter quality

- keep `frontend-app`, `assets/starter`, and `frontend-lite` aligned
- tighten generic starter copy and sample-route presentation
- make route, preview, and failure states easier to understand

### Phase 4: Release discipline

- maintain the smoke checklist
- maintain the release checklist
- keep README screenshots and docs aligned with the shipped starter

## Should-fix soon

- lightweight automated checks where practical
- better starter diagnostics and debug guidance
- more curated Local test content for Gutenberg-heavy pages
- stronger archive and empty-state polish

## Save for premium

These are valuable, but should remain clearly outside core until the core beta bar is met.

### WooCommerce compatibility

- stronger cart, checkout, and account compatibility
- same-domain guidance and session-aware commerce flows
- better storefront wrappers for shortcode-heavy Woo routes

### ACF mapping

- richer structured field exposure
- cleaner frontend consumption for custom builds

### Elementor compatibility

- more graceful handling of Elementor-authored routes

### Foundations

- portfolio foundation
- agency foundation
- commerce foundation

### Extra tooling

- setup wizard
- compatibility inspector
- deeper route and preview diagnostics

## Current working direction

The next practical sequence is:

1. keep core expectations explicit
2. harden the main starter and renderer
3. keep docs and smoke tests aligned
4. define the beta bar clearly
5. only then expand premium compatibility layers

## Definition of success

Before premium becomes the main story, Lenviqa core should already make a developer say:

- "I can install this cleanly."
- "I can connect WordPress to React without guessing routes."
- "Preview and admin safety still make sense."
- "The starter is usable as a real base."
- "The docs are honest about what is and is not supported."
