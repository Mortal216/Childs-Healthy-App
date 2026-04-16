# CloudBase Integration

## What is already wired

- Mini program startup now reads `utils/runtime-config.js` and initializes `wx.cloud` from a single runtime config.
- Mini program API requests now use the same runtime config instead of hard-coded `localhost` URLs.
- `backend/` now has a CloudRun-ready `Dockerfile`.
- `mcp-server/` now has example environment variables plus a `.dockerignore`.
- `config/mcporter.json` now registers the official CloudBase MCP server for project-level usage.

## Files you need to edit before cloud release

1. `utils/runtime-config.js`
   Set the `trial` and `release` `apiBaseUrl` to your deployed CloudRun backend domain.
   If you use the mini program’s optional MCP HTTP features, set `mcpServerUrl` in `trial` and `release` to your deployed MCP CloudRun domain as well (replace the same style of placeholder host).

2. `mcp-server/.env.example`
   Copy it to `.env` when you want to run the MCP service locally, then fill CloudBase credentials.

3. `backend/.env.example`
   Copy it to `.env` for local FastAPI debugging if needed.

## Suggested CloudBase deployment flow

1. Login to CloudBase MCP
   Use CloudBase MCP `auth(action=\"start_auth\", authMode=\"device\")`, then complete device-code login.

2. Bind the target environment
   After login, bind `cloud1-1gu5xrfwd5ca8920` or your actual production env by calling `auth(action=\"set_env\", envId=\"...\")`.

3. Deploy the backend service
   Deploy `backend/` as a CloudBase CloudRun container service.
   Recommended service name: `yiya-backend`

4. Deploy the MCP service
   Deploy `mcp-server/` as another CloudBase CloudRun container service.
   Recommended service name: `yiya-cloud-mcp-server`

5. Update mini program runtime config
   Put the deployed backend domain into `utils/runtime-config.js` under `trial` and `release` (`apiBaseUrl`), and the MCP service URL if applicable (`mcpServerUrl`).

6. Preview in WeChat DevTools
   `develop` keeps using local `http://localhost:8000/api/v1`
   `trial` and `release` should use the CloudRun domain

## Notes

- The mini program already uses CloudBase AI through `wx.cloud.extend.AI`, so the main missing piece was the business API base URL and cloud deployment shape.
- The current backend still uses MySQL as the source of truth.
- The `mcp-server` is designed for MySQL-to-CloudBase sync and cloud-side data analysis; it is separate from the mini program business API.
