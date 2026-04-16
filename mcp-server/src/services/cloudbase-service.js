import tcb from "@cloudbase/node-sdk";
import { getCloudBaseConfig } from "../config.js";

function buildCollectionName(prefix, tableName) {
  return `${prefix}_${tableName}`;
}

export class CloudBaseService {
  constructor(config = getCloudBaseConfig()) {
    const hasApiKey = Boolean(config.apiKey);
    const hasSecretPair = Boolean(config.secretId && config.secretKey);

    if (!hasApiKey && !hasSecretPair) {
      throw new Error(
        "Missing CloudBase credentials. Provide CLOUDBASE_API_KEY or CLOUDBASE_SECRET_ID/CLOUDBASE_SECRET_KEY."
      );
    }

    this.config = config;
    this.app = tcb.init({
      env: config.envId,
      accessKey: hasApiKey ? config.apiKey : undefined,
      secretId: hasSecretPair ? config.secretId : undefined,
      secretKey: hasSecretPair ? config.secretKey : undefined,
      sessionToken: hasSecretPair ? config.sessionToken : undefined
    });
    this.db = this.app.database();
  }

  getCollectionName(tableName) {
    return buildCollectionName(this.config.collectionPrefix, tableName);
  }

  async ensureCollection(collectionName) {
    try {
      await this.db.createCollection(collectionName);
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (!message.includes("already exists") && !message.includes("exist")) {
        throw error;
      }
    }
  }

  normalizeDocument(tableName, row) {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        normalized[key] = value.toISOString();
      } else {
        normalized[key] = value;
      }
    }

    return {
      _id: String(row.id ?? row.task_id ?? `${tableName}-${Date.now()}`),
      _sourceTable: tableName,
      _syncedAt: new Date().toISOString(),
      ...normalized
    };
  }

  async upsertRows(tableName, rows) {
    const collectionName = this.getCollectionName(tableName);
    await this.ensureCollection(collectionName);
    const collection = this.db.collection(collectionName);

    let synced = 0;
    for (const row of rows) {
      const doc = this.normalizeDocument(tableName, row);
      await collection.doc(doc._id).set(doc);
      synced += 1;
    }

    return {
      collectionName,
      synced
    };
  }

  async updateSyncRegistry(tableName, stats) {
    const collectionName = `${this.config.collectionPrefix}_sync_registry`;
    await this.ensureCollection(collectionName);
    await this.db.collection(collectionName).doc(tableName).set({
      _id: tableName,
      tableName,
      collectionName: stats.collectionName,
      syncedCount: stats.synced,
      syncedAt: new Date().toISOString()
    });
  }

  async getSyncRegistry() {
    const collectionName = `${this.config.collectionPrefix}_sync_registry`;
    await this.ensureCollection(collectionName);
    const result = await this.db.collection(collectionName).get();
    return result.data || [];
  }

  async getCollectionSnapshot(collectionName, sampleSize = 3) {
    const collection = this.db.collection(collectionName);
    const countResult = await collection.count();
    const total = Number(countResult.total || 0);
    const sampleResult = await collection.limit(sampleSize).get();
    const sample = sampleResult.data || [];

    return {
      collectionName,
      total,
      sample
    };
  }
}
