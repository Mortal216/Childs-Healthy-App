import { getCloudBaseConfig, getMySQLConfig } from "./config.js";
import { MySQLService } from "./services/mysql-service.js";
import { CloudSyncService } from "./services/cloud-sync-service.js";

async function main() {
  const mysqlConfig = getMySQLConfig();
  const cloudConfig = getCloudBaseConfig();

  const mysqlService = new MySQLService(mysqlConfig);
  const tables = await mysqlService.getTables();
  const previewTables = tables.slice(0, 8);

  const localPreview = [];
  for (const tableName of previewTables) {
    const count = await mysqlService.getTableCount(tableName);
    localPreview.push({ tableName, count });
  }

  const hasApiKey = Boolean(cloudConfig.apiKey);
  const hasSecretPair = Boolean(cloudConfig.secretId && cloudConfig.secretKey);

  const result = {
    mysql: {
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      database: mysqlConfig.database,
      totalTables: tables.length,
      previewTables: localPreview
    },
    cloudbase: {
      envId: cloudConfig.envId,
      hasApiKey,
      hasSecretPair
    }
  };

  if (hasApiKey || hasSecretPair) {
    const syncService = new CloudSyncService();
    result.cloudbase.liveAnalysis = await syncService.syncAndAnalyze({
      limitPerTable: 3,
      sampleSize: 3
    });
  } else {
    result.cloudbase.message =
      "Missing real CloudBase credentials. Skipped cloud sync and analysis. Provide CLOUDBASE_API_KEY or CLOUDBASE_SECRET_ID/CLOUDBASE_SECRET_KEY.";
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
