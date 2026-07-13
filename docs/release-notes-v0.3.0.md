# Lenviqa v0.3.0 Release Notes

Lenviqa connects WordPress to modern frontends while keeping WordPress responsible for content and editorial workflows. React remains responsible for public presentation.

`v0.3.0` is a reliability and release-discipline update. It does not broaden the beta scope.

## What Changed

- Frontend API requests now fail clearly when the API base is missing.
- Stalled API requests time out instead of leaving the starter in an indefinite loading state.
- The Vite app, exported starter, and lightweight smoke frontend use the same failure behavior.
- A reusable static validator checks PHP syntax, release-version consistency, package metadata, and starter parity.
- GitHub Actions now validates the frontend build and plugin ZIP on pushes and pull requests.
- The frontend lockfile was refreshed to versions with no known npm audit findings at release time.
- Plugin metadata now points to the real project and includes an Update URI.

## Validated Beta Scope

The existing guardrails continue to cover:

- common, nested, and normalized WordPress routes
- representative Gutenberg groups, columns, media-text, cover, gallery, and button layouts
- signed preview token generation, resolution, and honest invalid-token failure
- repeatable plugin packaging plus install/runtime checks

See [Beta scope](beta-scope.md) for the exact confidence boundary.

## Intentionally Out Of Scope

- universal Gutenberg or active-theme fidelity
- WooCommerce, ACF, Elementor, and third-party block compatibility
- interactive blocks that depend on WordPress frontend JavaScript
- deployment, authentication, SSR, and cache orchestration

## Known Limitations

- Cross-domain preview still depends on browser, cookie, CORS, and environment configuration.
- Local scenario validation requires the repository's Local WordPress site and frontend to be running.
- The lightweight frontend is a smoke tool, not a feature-identical replacement for the Vite starter.
- Legacy internal identifiers such as the REST namespace remain `pressbridge/v1` for compatibility.

## Who Should Try This Beta

Developers and technical teams evaluating WordPress as a CMS behind a React frontend, especially those willing to test within the documented scope and report reproducible route, preview, rendering, or installation failures.

Useful feedback includes the WordPress version, frontend URL setup, failing route or block structure, expected behavior, actual behavior, and steps to reproduce.
