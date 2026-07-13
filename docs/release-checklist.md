# Lenviqa Release Checklist

Use this checklist before shipping a plugin ZIP to anyone else.

## Packaging

1. Run `powershell -ExecutionPolicy Bypass -File .\scripts\validate-static.ps1`.
2. Run `powershell -ExecutionPolicy Bypass -File .\scripts\validate-package.ps1`.
3. Confirm the versioned `build/lenviqa-<version>.zip` exists.
4. Confirm the ZIP contains only:
   - `pressbridge.php`
   - `readme.txt`
   - `uninstall.php`
   - `assets`
   - `includes`
   - `templates`
5. Confirm the repo-level `README.md` still matches the validated beta behavior and local dev flow.
6. Confirm no local-only directories were packaged, including:
   - `frontend-app`
   - `frontend-lite`
   - `live-test-website`
   - `docs`
   - `scripts`

## Install test

1. Install from the ZIP on a clean WordPress site.
2. Activate the plugin.
3. Confirm `Settings > Lenviqa` loads without PHP notices or missing assets.
4. Confirm the plugin list shows `Lenviqa` and the tagline `Connect WordPress to modern frontends.`

## Runtime test

1. Save a valid frontend URL.
2. Verify `site`, `menus`, `pages`, `posts`, `content-types`, and `resolve` endpoints.
3. Verify preview links open on the React frontend.
4. Verify `View in React` appears for logged-in admins on frontend routes.
5. Verify logged-out visitors redirect only when redirect mode is enabled.
6. Verify unresolved frontend routes show a clean empty state rather than a fatal or broken shell.
7. Verify API failure states explain how to reconnect WordPress and the frontend.
8. Verify singular Gutenberg-authored pages still render cleanly after any renderer changes.
9. Verify the shipped starter still reads as a generic Lenviqa starter rather than a project-specific implementation.

## Cleanup test

1. Deactivate and uninstall the plugin.
2. Confirm the `wtr_settings` option is removed.

## Beta review gate

Before calling the build "beta-ready", confirm:

1. The plugin still behaves conservatively:
   - `wp-admin` untouched
   - login untouched
   - REST untouched
   - AJAX untouched
   - cron untouched
   - logged-in editors stay safe
2. Preview flow still works from the editor to the frontend.
3. The frontend starter and smoke frontend are still behaviorally aligned with the plugin.
4. Known limitations in `README.md` are still honest.
5. Any WooCommerce compatibility work is still framed as an advanced compatibility layer, not a default starter guarantee.
6. `docs/core-roadmap.md` still reflects the current beta-ready priorities and premium boundaries.
