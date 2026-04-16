import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const backendEnvPath = path.resolve(projectRoot, "..", "backend", ".env");
const localEnvPath = path.resolve(projectRoot, ".env");

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

function parseDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return null;
  }

  const sanitized = databaseUrl.replace(/^mysql\+aiomysql:\/\//, "mysql://");
  const parsed = new URL(sanitized);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "")
  };
}

const dbUrlConfig = parseDatabaseUrl(process.env.DATABASE_URL);

export function getMySQLConfig() {
  return {
    host: process.env.MYSQL_HOST || dbUrlConfig?.host || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || dbUrlConfig?.port || 3306),
    user: process.env.MYSQL_USER || dbUrlConfig?.user || "root",
    password: process.env.MYSQL_PASSWORD || dbUrlConfig?.password || "",
    database: process.env.MYSQL_DATABASE || dbUrlConfig?.database || "yiya_db"
  };
}

export function getCloudBaseConfig() {
  return {
    envId: process.env.CLOUDBASE_ENV || process.env.CLOUDBASE_ENV_ID || "cloud1-1gu5xrfwd5ca8920",
    apiKey: process.env.CLOUDBASE_API_KEY || process.env.CLOUDBASE_APIKEY || "",
    secretId: process.env.CLOUDBASE_SECRET_ID || process.env.TENCENTCLOUD_SECRETID || "",
    secretKey: process.env.CLOUDBASE_SECRET_KEY || process.env.TENCENTCLOUD_SECRETKEY || "",
    sessionToken:
      process.env.CLOUDBASE_SESSION_TOKEN ||
      process.env.CLOUDBASE_SESSIONTOKEN ||
      process.env.TENCENTCLOUD_SESSIONTOKEN ||
      "",
    collectionPrefix: process.env.CLOUDBASE_COLLECTION_PREFIX || "mysql_sync"
  };
}
