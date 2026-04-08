# Validation And Scenario Guardrails

PressBridge core beta confidence comes from repeatable scenario coverage, not broad unsupported claims.

The current guardrails cover:

- route scenarios
  - home route
  - standard page routes
  - nested hierarchical routes
  - standard post routes
  - unresolved routes
  - basic path normalization
- Gutenberg scenarios
  - nested groups
  - columns inside groups
  - media-text
  - cover sections
  - gallery fallback
  - button group layout intent
- preview scenarios
  - valid preview token resolution
  - invalid or expired token failure
  - preview content staying separate from the normal public route
- packaging/install/runtime checks
  - ZIP structure
  - activation defaults
  - starter export hook presence
  - deactivation and uninstall cleanup checks

Local validation commands:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-core.ps1 -FrontendBase 'http://127.0.0.1:5173'
powershell -ExecutionPolicy Bypass -File .\scripts\validate-package.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\validate-install-runtime.ps1
```

This proves the current beta-safe core boundary. It does not prove theme parity, universal Gutenberg fidelity, or broad third-party compatibility.

Related pages:

- [Supported Beta Scope](wiki-supported-beta-scope.md)
- [Limitations and Non-Goals](wiki-limitations-and-non-goals.md)
- [How PressBridge Works](wiki-how-pressbridge-works.md)
