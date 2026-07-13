=== Lenviqa ===
Contributors: daiosity
Tags: headless, react, rest-api, frontend, decoupled
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.3.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect WordPress to modern frontends.

== Description ==

Lenviqa turns a normal WordPress site into a headless-ready backend without breaking the editing experience.

This beta plugin focuses on a practical bridge:

* Keep WordPress admin, pages, posts, menus, and public post types
* Expose a cleaner REST namespace for frontend consumption
* Configure a React frontend URL from wp-admin
* Hand off public traffic safely while protecting editors and admins
* Generate signed preview links for React frontends
* Export a starter React app with route resolution and preview support

The plugin is designed to keep its core bridge small and maintainable. Advanced integrations remain outside the current beta promise.

This is a beta-stage bridge plugin. It is intentionally conservative:

* WordPress remains the editorial system
* wp-admin and editor workflows remain protected
* frontend takeover is configurable rather than forced
* the React starter is a starting point, not a WordPress theme replacement

== Features ==

* Headless mode toggle with safe fallback behavior
* Frontend app URL validation for local and deployed React apps
* Route handling mode for either safe WordPress rendering or public redirect handoff
* Custom REST endpoints for site config, menus, pages, posts, content types, single content, previews, and route resolution
* Normalized content mapping for React-friendly payloads
* Signed preview token support for cross-domain frontend previews
* Gutenberg editor guidance for preview and React route access
* "View in React" shortcuts in editor and frontend admin surfaces
* Exportable Vite + React starter app

== Installation ==

1. Upload the plugin ZIP through `Plugins > Add New > Upload Plugin`, or copy the `Lenviqa` folder into `wp-content/plugins/`.
2. Activate `Lenviqa`.
3. Go to `Settings > Lenviqa`.
4. Add your frontend app URL, for example `http://localhost:5173`.
5. Leave route handling in WordPress mode while integrating.
6. Switch to redirect mode once your React frontend is ready to own public routes.

== Development Notes ==

The main local development assumptions in this repo are:

* WordPress runs through Local
* the example local site URL is `http://wp-to-react.local`
* the React frontend commonly runs on `http://localhost:5173`
* the plugin REST namespace is `pressbridge/v1`

== Frequently Asked Questions ==

= Will this break wp-admin? =

No. The plugin is intentionally conservative. It does not redirect `wp-admin`, login, REST, AJAX, cron, or logged-in editors who still need WordPress routes.

= Does this require GraphQL? =

No. The beta uses the native WordPress REST API and a custom namespace optimized for React-friendly responses.

= Can I use this with custom post types? =

Yes. Public post types are exposed through the generic `items` and `content` routes, and archive-style route resolution is supported.

= Does preview work on a separate frontend domain? =

Signed temporary tokens provide the preview foundation. Cross-domain browser behavior still depends on correct frontend URL and environment configuration.

= Is the React starter meant to match my active WordPress theme exactly? =

No. Lenviqa translates WordPress-managed content and block structure into a React frontend. It aims for coherent layout translation, not pixel-perfect theme cloning.

= Does this support WooCommerce, ACF, or page builders? =

Not as part of the validated beta core. Theme parity, third-party block ecosystems, and interactive blocks that require WordPress frontend JavaScript are also outside the current promise.

== Changelog ==

= 0.3.0 =

* Added clear frontend configuration errors and timeouts for stalled API requests
* Added repeatable static validation for PHP syntax, release metadata, and starter parity
* Added GitHub Actions validation for the frontend build and plugin package
* Refreshed the frontend lockfile to resolve known dependency advisories
* Aligned release metadata and documented the validated beta boundary

= 0.2.0 =

* Added signed preview UX improvements and Gutenberg preview guidance
* Added View in React shortcuts
* Added archive-aware route resolution for blog and post type archives
* Added nested menu rendering support in the starter frontends
* Added release hardening assets including this readme and packaging script

= 0.1.0 =

* Initial MVP release
* Added settings page, REST bridge, route handoff, preview tokens, and starter export
