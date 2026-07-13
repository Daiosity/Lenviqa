# Lenviqa Starter

This starter was exported from the `__WTR_PLUGIN_NAME__` WordPress site.

## Quick start

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env`
3. Start the dev server with `npm run dev`
4. Open the app at the local Vite URL

## Notes

- API base: `__WTR_API_BASE__`
- WordPress site: `__WTR_SITE_URL__`
- Frontend URL configured in WordPress: `__WTR_FRONTEND_URL__`
- Preview endpoint prefix: `__WTR_PREVIEW_ROUTE__`

## Production hosting

For static hosting, configure rewrites so every frontend route falls back to `index.html`.

## What this starter includes

- React Router route handling
- Path resolution against WordPress content
- Menu loading
- Generic public post type support through the plugin API
- Preview token support
- A small fetch layer for the plugin REST endpoints
