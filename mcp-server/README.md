# Yiya Cloud MCP Server

This MCP server does three things:

1. Connects to the local MySQL database.
2. Syncs local table data into CloudBase document collections.
3. Produces cloud snapshots and automatic analysis output.

## Tools

- `sync_local_mysql_to_cloudbase`
- `get_cloud_database_snapshot`
- `analyze_cloud_database`
- `sync_and_analyze_cloud_database`

## Environment Variables

MySQL:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

If `MYSQL_*` is not provided, the server tries to parse `DATABASE_URL` from `backend/.env`.

CloudBase:

- `CLOUDBASE_ENV`
- `CLOUDBASE_COLLECTION_PREFIX`

Authentication, choose one:

- `CLOUDBASE_API_KEY`
- `CLOUDBASE_SECRET_ID` and `CLOUDBASE_SECRET_KEY`
- `CLOUDBASE_SECRET_ID`, `CLOUDBASE_SECRET_KEY`, and `CLOUDBASE_SESSION_TOKEN` for temporary credentials from CloudBase MCP `auth(action="get_temp_credentials")`

## Local Run

```bash
cd mcp-server
npm install
npm start
```

## Local Smoke Test

```bash
npm run smoke
```

## CloudBase Hosting

This directory includes:

- `Dockerfile`
- `mcp-meta.json`

So it can be hosted as a generic Stdio MCP server in CloudBase.
