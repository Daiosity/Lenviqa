# Lenviqa Current Feature Status

This document is the current product snapshot for Lenviqa core. It is meant to answer four questions quickly:

- what Lenviqa can do today
- what changed recently
- where the core roadmap currently stands
- what should happen next before premium becomes the main story

## Product summary

Lenviqa is a WordPress plugin that connects WordPress to modern frontends.

The current product model is:

- WordPress remains the CMS and editorial backend
- the plugin owns the bridge layer
- React owns the public presentation layer

Lenviqa is currently in public beta. Its validated core is beyond prototype, but it is not yet a production-ready compatibility layer for the wider WordPress ecosystem.

## What Lenviqa core can do today

### Bridge and routing

- resolve WordPress routes through the plugin instead of guessing on the frontend
- return normalized route payloads for pages, posts, and archive-style routes
- support nested paths and hierarchical content resolution
- expose site config, menus, pages, posts, content types, generic item collections, and single content through the custom REST namespace

### Preview and editorial flow

- generate signed preview tokens for React frontends
- keep preview working across separate frontend domains
- expose preview-ready content through the preview endpoint
- add `View in React` shortcuts for logged-in admins and editors

### Public handoff

- keep WordPress rendering public routes in safe mode
- optionally redirect logged-out public traffic to the frontend
- protect `wp-admin`, login, REST, AJAX, cron, preview, and logged-in editorial browsing from unsafe redirects

### Frontend starter

- ship a generic Vite React starter in `frontend-app`
- ship a lightweight no-build smoke frontend in `frontend-lite`
- export a starter frontend from the plugin under `assets/starter`
- render common WordPress content through a generic Lenviqa starter shell
- handle loading, empty, preview, and failure states in a product-facing way

### Content rendering

- map WordPress content into React-friendly payloads
- expose featured images, excerpts, terms, dates, and route metadata
- render Gutenberg-aware block content in the frontend
- fall back to server-rendered HTML when block translation is not the right fit

### Packaging and local workflow

- build a clean plugin ZIP through the packaging script
- install the ZIP cleanly in WordPress
- run the repo against the Local WordPress site at `http://wp-to-react.local`
- run the main frontend locally at `http://localhost:5173`

## Advanced compatibility already started

These are in progress, but they are not yet part of the default starter promise.

### WooCommerce compatibility groundwork

- detect approved WooCommerce shortcodes in content
- switch shortcode-heavy Woo routes to HTML compatibility mode
- render Woo-heavy routes through a compatibility path instead of pretending they are normal starter content
- style compatibility output more cleanly in the frontend

Current limitation:

- split-domain Woo cart and checkout flows still have session/cookie limitations
- this is why WooCommerce remains an advanced compatibility path, not a core starter feature

## Current changelog snapshot

This is the practical changelog state reflected in the repo right now.

### Recent repo milestones

#### `b54cc3f` Refresh starter screenshots and tighten roadmap

- refreshed README screenshots to match the current generic starter
- tightened roadmap framing in the public docs

#### `4c899a3` Split starter from personal site and frame Woo compatibility

- restored the shipped starter to a generic Lenviqa frontend
- removed the personal-site drift from the main starter
- rebuilt `frontend-lite` into a valid smoke frontend again
- framed WooCommerce as advanced compatibility rather than a default promise

#### `2466c07` Finalize README structure and clarity

- tightened README ordering and clearer product explanation

#### `6d13160` Tighten README intro and reorder proof

- moved proof and before/after explanation higher in the README

#### `5f02d89` Refresh README screenshots

- refreshed repo proof images

#### `a66da07` Finalize public polish and demo assets

- tightened public-facing polish, assets, and GitHub presentation

#### `92bc985` Polish repo presentation and demo messaging

- improved README, demo positioning, and repo-facing copy

## Current roadmap position

Lenviqa core is currently a validation-backed beta with explicit boundaries.

The roadmap is defined in [Core roadmap](core-roadmap.md).

### What is complete in the current roadmap

- the core beta product story is clear
- the starter is generic again
- the smoke frontend is usable again
- advanced compatibility routes are now labeled more honestly in the starter
- release and smoke docs are aligned with the current product direction

### What is still ahead before production confidence

- more rendering hardening on common Gutenberg layouts
- stronger route edge-case confidence
- tighter alignment between `frontend-app`, `frontend-lite`, and `assets/starter`
- better smoke discipline and repeatability
- clearer known limitations and release confidence

## What should happen next

### Core priorities before premium

1. Gutenberg hardening
- improve common layout coverage for groups, columns, images, galleries, media-text, buttons, separators, and cover blocks

2. Starter alignment
- keep starter behavior and copy aligned across the Vite app, smoke frontend, and exported starter

3. Core smoke coverage
- tighten repeatable checks for route resolution, preview flow, archive behavior, and compatibility-heavy routes

4. Beta packaging confidence
- keep ZIP packaging, install flow, settings, and uninstall behavior reliable

### What should remain out of core for now

- deeper WooCommerce storefront/cart/checkout compatibility
- ACF mapping improvements
- Elementor compatibility
- themed starter foundations
- advanced diagnostics and setup tooling

## Premium direction

Premium should solve adoption gaps, not rescue the core.

The current premium direction is:

1. WooCommerce compatibility
2. ACF field mapping
3. Elementor compatibility
4. optional foundations such as portfolio, agency, or commerce starters
5. richer diagnostics and setup helpers

## Current status in one line

Lenviqa core is now a credible beta bridge with a generic starter and validated preview, routing, rendering, packaging, and handoff guardrails. Production claims still require broader environment and browser coverage.
