# Repo Screenshot Plan

This plan defines the screenshot set for the README and repo-facing materials.

The goal is to make PressBridge understandable through real results:

- WordPress rendering
- React rendering
- preview working
- routing working
- common Gutenberg layouts staying structurally stable

Use the seeded demo routes for screenshots and keep the guardrail scenarios for validation. The demo routes are cleaner and more presentation-friendly, while the scenario routes stay intentionally test-oriented.

## Before You Capture

1. Start the Local site at `http://wp-to-react.local`
2. Start the local frontend at `http://localhost:5173`
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\refresh-demo-content.ps1
```

This seeds the screenshot-ready demo content and writes the exact local URL map to:

- [build/demo-content-map.json](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\build\demo-content-map.json)

Current seeded routes:

- frontend layout demo:
  - `http://localhost:5173/pb-demo-layout/`
- frontend preview demo:
  - `http://localhost:5173/pb-demo-preview/?wtr_preview=1&wtr_preview_token=pbdemopreviewtoken001`
- frontend nested route demo:
  - `http://localhost:5173/pb-demo-guides/getting-started/`
- frontend simple page demo:
  - `http://localhost:5173/pb-demo-simple-page/`
- frontend simple post demo:
  - `http://localhost:5173/pressbridge-demo-post/`

Current Local editor URLs:

- layout editor:
  - `http://wp-to-react.local/wp-admin/post.php?post=25&action=edit`
- preview editor:
  - `http://wp-to-react.local/wp-admin/post.php?post=26&action=edit`
- nested child editor:
  - `http://wp-to-react.local/wp-admin/post.php?post=27&action=edit`
- simple page editor:
  - `http://wp-to-react.local/wp-admin/post.php?post=28&action=edit`
- simple post editor:
  - `http://wp-to-react.local/wp-admin/post.php?post=29&action=edit`

If those IDs ever change, use the regenerated values in [build/demo-content-map.json](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\build\demo-content-map.json).

Recommended capture order:

1. starter running example
2. WordPress to React comparison
3. Gutenberg layout example
4. preview flow example
5. nested route example
6. simple page or post baseline

That order keeps the capture session fast while separating the calm comparison shot from the heavier Gutenberg layout shot.

## Screenshot 1: WordPress To React Rendering Comparison

- WordPress URL:
  - `http://wp-to-react.local/pb-demo-simple-page/`
- Frontend URL:
  - `http://localhost:5173/pb-demo-simple-page/`
- What to show in frame:
  - the WordPress-rendered page on one side
  - the React frontend route on the other
  - the same simple heading and body copy on both sides
  - enough shell on the React side to show this is a starter frontend, not a raw page dump
- Crop out:
  - browser bookmarks
  - unrelated desktop UI
- Expected good result:
  - it is obvious that both sides are the same page content
  - the React side looks like a cleaner frontend presentation, not a different CMS
  - the screenshot reads quickly without heavy layout noise
- Final caption:
  - `Same content. Two frontends.`
- Why it helps:
  - this is the fastest explanation of the bridge model without depending on the editor UI in frame

## Screenshot 2: Preview Flow Example

- WordPress URL:
  - `http://wp-to-react.local/wp-admin/post.php?post=26&action=edit`
- Frontend URL:
  - `http://localhost:5173/pb-demo-preview/?wtr_preview=1&wtr_preview_token=pbdemopreviewtoken001`
- What to show in frame:
  - the frontend preview route with preview-only copy visible
  - enough shell UI to show this is the React frontend
  - if capturing a side-by-side, show the editor on the left and preview route on the right
- Crop out:
  - query-string clutter if possible after the route is still recognizable
  - unrelated browser chrome
- Expected good result:
  - the preview page clearly differs from the published page
  - the screenshot communicates that preview is flowing through the frontend, not only wp-admin
- Final caption:
  - `Preview content through the frontend without breaking editorial flow.`
- Why it helps:
  - preview is one of the hardest parts of a WordPress-to-React bridge

## Screenshot 3: Nested Hierarchical Route Example

- WordPress URL:
  - `http://wp-to-react.local/wp-admin/post.php?post=27&action=edit`
- Frontend URL:
  - `http://localhost:5173/pb-demo-guides/getting-started/`
- What to show in frame:
  - the browser path
  - the page title `Getting Started with PressBridge`
  - the body copy beneath it without a duplicated in-content H1
  - enough surrounding shell to show the route is resolved normally by the starter
- Crop out:
  - unrelated browser tabs
  - excess whitespace below the main content
- Expected good result:
  - the nested route looks normal and intentional
  - it is clear that the frontend is not guessing flat routes
- Final caption:
  - `Resolve nested WordPress routes without guessing in the frontend.`
- Why it helps:
  - route truth is one of the main product reasons to exist

## Screenshot 4: Gutenberg Layout Example

- WordPress URL:
  - `http://wp-to-react.local/wp-admin/post.php?post=25&action=edit`
- Frontend URL:
  - `http://localhost:5173/pb-demo-layout/`
- What to show in frame:
  - cover section
  - grouped layout section below it
  - media-text and buttons visible in the same shot if possible
- Crop out:
  - the very top of the browser if it wastes vertical space
  - unrelated content below the main layout
- Expected good result:
  - the page reads as a coherent modern layout
  - grouped content, media-text, and buttons keep their structural relationship
- Final caption:
  - `Common Gutenberg layouts render with stable structure and safe fallback behavior.`
- Why it helps:
  - it demonstrates the actual core rendering claim without implying theme parity

## Screenshot 5: Starter Running Example

- WordPress URL:
  - not needed for this shot
- Frontend URL:
  - `http://localhost:5173/`
- What to show in frame:
  - the generic PressBridge starter home
  - header, main hero, and at least one supporting section
- Crop out:
  - debug tooling
  - desktop clutter
- Expected good result:
  - it is obvious the repo ships a usable starter, not only backend/plugin code
- Final caption:
  - `A starter frontend is included so you are not beginning from a blank bridge.`
- Why it helps:
  - it shows real starting value for developers evaluating the repo

## Screenshot 6: Simple Post Baseline

- WordPress URL:
  - post:
    - `http://wp-to-react.local/wp-admin/post.php?post=29&action=edit`
- Frontend URL:
  - post:
    - `http://localhost:5173/pressbridge-demo-post/`
- What to show in frame:
  - the simple post route with a heading and short body copy
  - enough shell to make it obvious this is a normal content route, not a special demo page
- Crop out:
  - unnecessary empty space
- Expected good result:
  - the route looks calm and baseline-correct
  - this gives the README a simple post example alongside the heavier layout and route shots
- Final caption:
  - `Normal WordPress pages and posts still resolve cleanly through the bridge.`
- Why it helps:
  - it keeps the product from looking like it only works on heavy demo layouts

## Recommended README Order

1. WordPress to React rendering comparison
2. starter running example
3. Gutenberg layout example
4. preview flow example
5. nested hierarchical route example
6. simple page or post baseline

That order explains:

- what the product is
- what ships
- what content it handles
- that preview works
- that routing works
- that simple baseline content is still clean

## Capture Guidance

- Prefer real Local routes and seeded demo content over fabricated placeholders
- Capture at a consistent desktop width
- Wait for the route to fully render before capturing
- Avoid screenshots that imply theme parity, WooCommerce support, or unsupported compatibility
- Keep captions product-facing and technically honest
- Use [build/demo-content-map.json](C:\Users\Christo\Documents\WordPress Plugin Development\WP to React\build\demo-content-map.json) as the source of truth for IDs and routes if anything changes between sessions
