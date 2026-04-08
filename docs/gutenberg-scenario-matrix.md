# Gutenberg Scenario Matrix

These Local pages form the permanent core Gutenberg rendering test set for PressBridge.

They are intentionally messy. They are not theme-fidelity tests. They exist to prove that PressBridge preserves layout intent, uses safe fallback behavior, and avoids obvious structural breakage on common Gutenberg patterns.

## Scenario 1: Nested Layout

- Page: `/pb-scenario-nested-layout/`
- Tests:
  - nested `group` inside `group`
  - `columns` inside nested groups
  - image + text + buttons inside a grouped section
- Proves:
  - structural wrapper groups do not create unnecessary extra layout shells
  - grouped columns still read like one section
  - nested button layouts remain intact inside content columns

## Scenario 2: Media and Buttons

- Page: `/pb-scenario-media-and-buttons/`
- Tests:
  - `media-text` inside a group
  - mixed button orientation and alignment
  - sparse inner block trees with meaningful saved HTML
- Proves:
  - `media-text` preserves media/content relationship even when parsed blocks are incomplete
  - button groups can fall back to recovered HTML link data without collapsing

## Scenario 3: Cover CTA

- Page: `/pb-scenario-cover-cta/`
- Tests:
  - `cover` block with inner heading, paragraph, and buttons
  - overlay + background media + CTA relationship
- Proves:
  - cover sections keep hero intent
  - inner content remains readable even when the renderer prefers recovered HTML over sparse inner block trees

## Scenario 4: Gallery Fallback

- Page: `/pb-scenario-gallery-fallback/`
- Tests:
  - gallery saved primarily as HTML
  - incomplete parsed nested image block structure
- Proves:
  - PressBridge can recover a stable gallery grid from saved HTML
  - the renderer does not need perfect parsed image blocks to avoid raw-markup failure

## Scenario 5: Mixed Layout Stack

- Page: `/pb-scenario-mixed-layout-stack/`
- Tests:
  - nested groups
  - columns
  - buttons with distributed alignment
  - media-text inside a column
- Proves:
  - mixed common core blocks can coexist on one page without structural collapse
  - layout fallback remains readable even when fidelity stays approximate

## Beta-Safe Intent

These scenarios are considered beta-safe when all of the following are true:

- each route resolves through `/wp-json/pressbridge/v1/resolve`
- each page returns non-empty block content
- gallery, media-text, cover, and button layouts preserve section intent
- no scenario falls back to obviously broken raw markup for its primary layout

## Explicitly Out Of Scope

These scenarios do not attempt to validate:

- theme-specific CSS fidelity
- interactive blocks that depend on WordPress frontend JavaScript
- third-party/custom block ecosystems
- perfect pixel parity with WordPress theme output
