# Lenviqa Frontend

This frontend expects the repo's Local WordPress site at `http://wp-to-react.local` unless you have renamed it.

## Quick start

1. Build the plugin ZIP with `powershell -ExecutionPolicy Bypass -File ..\scripts\build-plugin.ps1` if you have not installed Lenviqa yet.
2. Install and activate the built `build/lenviqa-{version}.zip` file in WordPress.
3. In `Settings > Lenviqa`, set the frontend URL to `http://localhost:5173` and keep route mode on WordPress rendering.
4. Install dependencies with `npm install`.
5. Confirm your local API base points to `http://wp-to-react.local/wp-json/pressbridge/v1`.
6. Start the dev server with `npm run dev`.
7. Open `http://localhost:5173`.
8. Once the app renders correctly, switch the plugin route mode to React redirect for full handoff testing.

## Notes

- API base: `http://wp-to-react.local/wp-json/pressbridge/v1`
- WordPress site: `http://wp-to-react.local`
- Frontend URL configured in WordPress: `http://localhost:5173`

## Production hosting

For static hosting, configure rewrites so every frontend route falls back to `index.html`.

## What this starter includes

- React Router route handling
- Path resolution against WordPress content
- Menu loading
- Generic public post type support through the plugin API
- Preview token support
- A small fetch layer for the plugin REST endpoints
- A generic Lenviqa starter shell rather than a site-specific theme

## Advanced compatibility

WooCommerce compatibility is being treated as an advanced layer, not the default starter promise. The starter can render compatibility-heavy HTML routes, but full commerce UX should be treated as a separate implementation concern.

## Current local setup

- WordPress plugin is active on the Local site
- The plugin REST endpoints are responding
- The site is currently in safe WordPress route mode, not full redirect mode
- You can switch to redirect mode after this frontend is running

## First-time preview check

1. Create or edit a draft page in WordPress.
2. Click `Preview`.
3. Confirm the preview URL contains `wtr_preview_token`.
4. Confirm the frontend renders a visible preview state instead of the published page.
