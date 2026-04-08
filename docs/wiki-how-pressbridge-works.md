# How PressBridge Works

PressBridge keeps the responsibilities separate:

- WordPress owns content, menus, previews, and permalink truth
- PressBridge owns route resolution, preview handling, and bridge payloads
- React owns the public presentation layer

At a high level:

1. The frontend boots from the PressBridge site/config endpoints.
2. The frontend asks PressBridge to resolve routes instead of guessing WordPress permalink behavior.
3. PressBridge returns normalized content or archive payloads.
4. The starter renders Gutenberg-aware content with safe fallback behavior where needed.
5. Preview mode uses a signed token so draft content can be shown without changing the public route.

This model keeps WordPress editorial workflows intact while reducing custom bridge code in each project.

Next:

- [Quick Start](wiki-quick-start.md)
- [Supported Beta Scope](wiki-supported-beta-scope.md)
- [Validation and Scenario Guardrails](wiki-validation-and-scenario-guardrails.md)
