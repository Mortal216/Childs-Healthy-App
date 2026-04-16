import { CloudBaseService } from "./cloudbase-service.js";
import { MySQLService } from "./mysql-service.js";

function safeAverage(values) {
  if (!values.length) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function buildScaleDistribution(records) {
  return records.reduce((result, item) => {
    const key = item.scale_id || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function buildLevelDistribution(records) {
  return records.reduce((result, item) => {
    const key = item.level || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function buildTaskStatusDistribution(records) {
  return records.reduce((result, item) => {
    const key = item.status || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function sortByDateDesc(records, key) {
  return [...records].sort((a, b) => {
    const aTime = new Date(a?.[key] || 0).getTime();
    const bTime = new Date(b?.[key] || 0).getTime();
    return bTime - aTime;
  });
}

export class CloudSyncService {
  constructor() {
    this.mysql = new MySQLService();
    this.cloudbase = new CloudBaseService();
  }

  async syncTables(options = {}) {
    const limitPerTable = options.limitPerTable ?? null;
    const requestedTables = options.tables?.length ? options.tables : await this.mysql.getTables();
    const syncResults = [];

    for (const tableName of requestedTables) {
      const rows = await this.mysql.getRows(tableName, limitPerTable);
      const result = await this.cloudbase.upsertRows(tableName, rows);
      await this.cloudbase.updateSyncRegistry(tableName, result);
      syncResults.push({
        tableName,
        ...result
      });
    }

    return {
      envId: this.cloudbase.config.envId,
      syncedTables: syncResults,
      totalTables: syncResults.length,
      totalRows: syncResults.reduce((sum, item) => sum + item.synced, 0),
      syncedAt: new Date().toISOString()
    };
  }

  async getSnapshot(options = {}) {
    const registry = await this.cloudbase.getSyncRegistry();
    const targetCollections = options.collections?.length
      ? options.collections
      : registry.map((item) => item.collectionName);

    const snapshots = [];
    for (const collectionName of targetCollections) {
      snapshots.push(await this.cloudbase.getCollectionSnapshot(collectionName, options.sampleSize || 3));
    }

    return {
      envId: this.cloudbase.config.envId,
      collectionPrefix: this.cloudbase.config.collectionPrefix,
      syncedCollections: registry,
      collections: snapshots,
      totalCollections: snapshots.length,
      totalDocuments: snapshots.reduce((sum, item) => sum + item.total, 0),
      generatedAt: new Date().toISOString()
    };
  }

  buildAnalysis(snapshot) {
    const byCollection = Object.fromEntries(snapshot.collections.map((item) => [item.collectionName, item]));
    const assessments = byCollection[`${snapshot.collectionPrefix}_assessments`]?.sample || [];
    const assessmentCollection = byCollection[`${snapshot.collectionPrefix}_assessments`];
    const userCollection = byCollection[`${snapshot.collectionPrefix}_users`];
    const babyCollection = byCollection[`${snapshot.collectionPrefix}_babies`];
    const taskCollection = byCollection[`${snapshot.collectionPrefix}_user_tasks`];
    const scaleCollection = byCollection[`${snapshot.collectionPrefix}_scales`];
    const questionCollection = byCollection[`${snapshot.collectionPrefix}_questions`];

    const insights = [];
    insights.push(`当前云端已同步 ${snapshot.totalCollections} 个集合，共 ${snapshot.totalDocuments} 条文档。`);

    if (userCollection && babyCollection) {
      insights.push(`用户集合 ${userCollection.total} 条，宝宝集合 ${babyCollection.total} 条。`);
    }

    if (scaleCollection && questionCollection) {
      insights.push(`量表集合 ${scaleCollection.total} 条，题目集合 ${questionCollection.total} 条，可支持问卷与测评读取。`);
    }

    if (assessmentCollection) {
      insights.push(`测评结果集合 ${assessmentCollection.total} 条，适合继续做趋势、分布和最近测评分析。`);
    }

    const analysis = {
      summary: {
        totalCollections: snapshot.totalCollections,
        totalDocuments: snapshot.totalDocuments,
        generatedAt: snapshot.generatedAt
      },
      collectionTotals: Object.fromEntries(snapshot.collections.map((item) => [item.collectionName, item.total])),
      insights
    };

    if (assessmentCollection) {
      const assessmentRecords = assessmentCollection.sample;
      analysis.assessment = {
        sampledCount: assessmentRecords.length,
        averageScore: safeAverage(assessmentRecords.map((item) => Number(item.total_score || 0))),
        scaleDistribution: buildScaleDistribution(assessmentRecords),
        levelDistribution: buildLevelDistribution(assessmentRecords),
        latestRecords: sortByDateDesc(assessmentRecords, "created_at").slice(0, 5)
      };
    }

    if (taskCollection) {
      analysis.userTasks = {
        sampledCount: taskCollection.sample.length,
        statusDistribution: buildTaskStatusDistribution(taskCollection.sample)
      };
    }

    return analysis;
  }

  async analyze(options = {}) {
    const snapshot = await this.getSnapshot(options);
    return {
      snapshot,
      analysis: this.buildAnalysis(snapshot)
    };
  }

  async syncAndAnalyze(options = {}) {
    const syncResult = await this.syncTables(options);
    const analysisResult = await this.analyze(options);
    return {
      syncResult,
      ...analysisResult
    };
  }
}
