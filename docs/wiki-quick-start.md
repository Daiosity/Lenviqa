# Quick Start

1. Build or install the PressBridge plugin ZIP.
2. Activate the plugin in WordPress.
3. Open `Settings > PressBridge`.
4. Set the frontend URL to `http://localhost:5173`.
5. Run the local frontend.

For the main starter:

```powershell
cd frontend-app
npm install
npm run dev
```

For the lightweight local server:

```powershell
cd frontend-lite
python server.py
```

Then verify:

- `http://wp-to-react.local/wp-json/pressbridge/v1/site`
- `http://wp-to-react.local/wp-json/pressbridge/v1/resolve?path=/`
- `http://localhost:5173/`

For local demo and screenshot content:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\refresh-demo-content.ps1
```

For core validation:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-core.ps1 -FrontendBase 'http://127.0.0.1:5173'
```

Next:

- [What Is PressBridge](wiki-what-is-pressbridge.md)
- [Supported Beta Scope](wiki-supported-beta-scope.md)
- [Limitations and Non-Goals](wiki-limitations-and-non-goals.md)
