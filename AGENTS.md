# AGENTS.md

## Project Purpose

Lenviqa is a WordPress plugin that connects WordPress to modern frontends.

This repo contains:

- the WordPress bridge plugin
- a Vite React frontend for normal local development
- a lightweight no-build React frontend for quick smoke testing
- the exported starter frontend template that ships from the plugin

The product model in this repo is:

- WordPress remains the CMS and editorial backend
- the plugin owns the bridge layer
- React owns the public presentation layer

This is not a WordPress theme replacement.

## Plugin Architecture Overview

The plugin entry point is [pressbridge.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\pressbridge.php).

The plugin is bootstrapped through [includes/Core/Plugin.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Core\Plugin.php), which wires together the settings model, REST router, preview service, admin screens, handoff manager, and helper services.

Core architectural responsibilities:

- `includes/Core`
  - plugin bootstrap, autoloading, activation/deactivation, shared path handling, settings model
- `includes/Api`
  - custom REST namespace and controllers
- `includes/Data`
  - content mapping, menu normalization, supported post type discovery
- `includes/Frontend`
  - safe public handoff logic and signed preview token service
- `includes/Admin`
  - settings UI, starter export, Gutenberg preview guidance, and React view links

Important backend classes:

- [includes/Core/Settings.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Core\Settings.php)
  - validates and stores plugin settings
- [includes/Core/Path_Helper.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Core\Path_Helper.php)
  - centralizes frontend path normalization and WordPress-to-frontend path translation
- [includes/Api/Rest_Router.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Api\Rest_Router.php)
  - registers controllers
- [includes/Api/Content_Controller.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Api\Content_Controller.php)
  - pages, posts, generic items, content by slug, archives, preview endpoint, and route resolution
- [includes/Api/Site_Controller.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Api\Site_Controller.php)
  - site boot/config endpoint
- [includes/Api/Menu_Controller.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Api\Menu_Controller.php)
  - menu endpoint
- [includes/Frontend/Handoff_Manager.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Frontend\Handoff_Manager.php)
  - public redirect handoff logic
- [includes/Frontend/Preview_Service.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Frontend\Preview_Service.php)
  - signed preview token generation and lookup
- [includes/Data/Content_Mapper.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Data\Content_Mapper.php)
  - normalizes WordPress content into React-friendly payloads

## React Frontend Overview

There are three frontend layers in this repo:

- [frontend-app](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-app)
  - proper Vite app for local development and the long-term starter structure
- [frontend-lite](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-lite)
  - lightweight no-build local frontend for quick smoke testing
- [assets/starter](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\assets\starter)
  - starter template exported by the plugin

All frontend variants are expected to:

- fetch site config from the plugin
- fetch pages and posts for route exploration and fallback navigation
- resolve routes through the plugin instead of guessing WordPress routing
- render preview mode when a `wtr_preview_token` is present
- handle API failures and empty states cleanly

Main frontend files:

- [frontend-app/src/App.jsx](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-app\src\App.jsx)
- [frontend-app/src/lib/api.js](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-app\src\lib\api.js)
- [frontend-lite/src/app.jsx](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-lite\src\app.jsx)
- [assets/starter/src/App.jsx](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\assets\starter\src\App.jsx)

## Key Directories

- [includes](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes)
  - plugin PHP classes
- [templates](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\templates)
  - admin settings page template
- [assets](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\assets)
  - editor helper JS and exported starter assets
- [frontend-app](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-app)
  - Vite React frontend
- [frontend-lite](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-lite)
  - no-build smoke-test frontend
- [docs](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\docs)
  - smoke test and release checklist docs
- [scripts](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\scripts)
  - packaging and helper scripts
- [build](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\build)
  - generated plugin ZIPs and packaging output
- [live-test-website](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\live-test-website)
  - local WordPress install used for live testing in this repo

## How To Run WordPress Locally

This repo already contains a local WordPress install in [live-test-website](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\live-test-website).

Current local testing assumptions:

- the site is managed through Local
- the current Local site URL in this repo is still `http://wp-to-react.local`
- the plugin branding is now Lenviqa, but the Local hostname has not been renamed

Practical local flow:

1. Start the site in Local.
2. Confirm `http://wp-to-react.local` loads.
3. Confirm the plugin is installed and active.
4. Open `Settings > Lenviqa`.
5. Set the frontend URL before testing preview or redirect behavior.

Do not assume WordPress is being run from a custom PHP command unless the user says so. In this repo, Local is the intended local WordPress runtime.

## How To Run The React Frontend Locally

### Proper Vite frontend

Use [frontend-app](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-app):

```powershell
cd frontend-app
npm install
npm run dev
```

Default expectation:

- the frontend runs on `http://localhost:5173`

### Lightweight smoke frontend

Use [frontend-lite](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-lite) when you only need a quick local frontend without a Node build:

```powershell
cd frontend-lite
python server.py
```

That serves:

- `http://127.0.0.1:5173`

The plugin frontend URL commonly uses:

- `http://localhost:5173`

## Preview Flow

Preview flow is handled by [includes/Frontend/Preview_Service.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Frontend\Preview_Service.php) and [includes/Api/Content_Controller.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Api\Content_Controller.php).

High-level flow:

1. An editor clicks Preview in WordPress.
2. The plugin filters the preview URL.
3. A short-lived signed preview token is generated and stored in a transient.
4. The preview link points to the configured React frontend and includes `wtr_preview_token`.
5. The React frontend sees the token and requests `/wp-json/pressbridge/v1/preview/{token}`.
6. The plugin returns preview-ready content and preview metadata.
7. The React frontend renders a visible preview state and allows returning to the published route.

Important facts:

- preview tokens expire after 15 minutes
- preview should never break the editor workflow
- preview responses are intentionally uncached
- preview links depend on a valid frontend URL

## Route Resolution At A High Level

Route resolution is handled by [includes/Api/Content_Controller.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Api\Content_Controller.php).

The frontend should not guess WordPress routing. It should call:

- `/wp-json/pressbridge/v1/resolve?path=/some-path/`

High-level behavior:

1. Normalize the incoming path.
2. Check whether it matches a known archive route such as:
   - the posts page
   - a public CPT archive
3. If not an archive, resolve it to a WordPress post/page using WordPress permalink logic.
4. Return a normalized route payload with:
   - `route_type: singular` for single content
   - `route_type: archive` for archive/listing routes

This is a core rule of the repo:

- frontend routing should defer to the plugin bridge for WordPress route truth

## Build And Package Commands

### Build the plugin ZIP

From repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-plugin.ps1
```

Expected output:

- [build/lenviqa-0.3.0.zip](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\build\lenviqa-0.3.0.zip)

### PHP syntax checks

Plugin-only lint:

```powershell
Get-ChildItem -Path 'includes','templates' -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
php -l .\pressbridge.php
php -l .\uninstall.php
```

### Frontend build

From [frontend-app](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\frontend-app):

```powershell
npm run build
```

## Coding Conventions

- Keep the plugin modular. Do not collapse logic into the bootstrap file.
- Use object-oriented PHP where it improves structure and clarity.
- Prefer small, explicit service classes over god classes.
- Reuse shared helpers instead of duplicating route and path logic.
- Use the WordPress REST API and WordPress-native APIs first.
- Sanitize settings and request input.
- Escape admin output properly.
- Use capability checks for admin actions.
- Use nonces for admin-triggered downloads and actions.
- Keep frontend copy product-facing, not internal or test-page sounding.
- Do not introduce large rewrites when a small hardening fix will do.

## Safety Rules For Redirect Logic

Redirect logic lives in [includes/Frontend/Handoff_Manager.php](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\includes\Frontend\Handoff_Manager.php).

These rules are non-negotiable:

- Never redirect `wp-admin`.
- Never redirect login routes.
- Never redirect REST API requests.
- Never redirect AJAX requests.
- Never redirect cron.
- Never redirect non-GET requests.
- Never redirect feeds, embeds, favicon, robots, or preview requests that still need WordPress.
- Never redirect logged-in editors or admins who need WordPress while working.
- Never introduce obvious redirect loops when frontend and request hosts match.

If redirect logic changes, the first question is:

- does this make editorial or admin access less safe?

If the answer might be yes, stop and reduce scope.

## What Must Never Be Broken

- `wp-admin`
- login flow
- WordPress REST API
- AJAX
- cron
- logged-in editor and admin browsing safety
- preview flow
- route resolution for published pages and posts
- plugin settings page
- plugin ZIP packaging

Also do not break:

- public safe mode where WordPress still renders pages
- logged-out redirect mode when explicitly enabled
- the exported starter frontend structure

## What Done Means

A change is not done until all of the following are true:

1. The change is scoped and beta-safe.
2. The plugin PHP files lint clean.
3. If packaging-related files changed, the plugin ZIP rebuilds successfully.
4. If frontend behavior changed, the affected frontend variant is updated consistently:
   - `frontend-app`
   - `frontend-lite` if it is the active smoke frontend
   - `assets/starter` when starter behavior or copy should match
5. Redirect safety rules are still respected.
6. Preview behavior is still intact if the change touches routing, paths, or frontend rendering.
7. Any new admin-facing behavior has proper capabilities, sanitization, escaping, and nonce handling where applicable.
8. Docs are updated if the local workflow, packaging, or expected behavior changed.

For repo work that affects beta and release quality, done should usually also include:

- a quick smoke check against the Local WordPress site
- a note about remaining risks if something could not be verified end to end
