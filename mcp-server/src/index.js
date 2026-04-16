import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CloudSyncService } from "./services/cloud-sync-service.js";

function createService() {
  return new CloudSyncService();
}

function textResult(payload) {
  return {
    structuredContent: payload,
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

const server = new McpServer({
  name: "yiya-cloud-sync",
  version: "1.0.0"
});

server.registerTool(
  "sync_local_mysql_to_cloudbase",
  {
    description: "将本地 MySQL 数据同步到 CloudBase 文档数据库。",
    inputSchema: {
      tables: z.array(z.string()).optional().describe("需要同步的表名列表；不传则同步全部表"),
      limitPerTable: z.number().int().positive().optional().describe("每张表同步的最大行数，调试时可限制")
    }
  },
  async ({ tables, limitPerTable }) => {
    const service = createService();
    const result = await service.syncTables({ tables, limitPerTable });
    return textResult(result);
  }
);

server.registerTool(
  "get_cloud_database_snapshot",
  {
    description: "读取当前 CloudBase 云端数据库快照，输出集合数量、文档数和样本数据。",
    inputSchema: {
      collections: z.array(z.string()).optional().describe("指定要查看的云端集合；不传则读取最近同步过的集合"),
      sampleSize: z.number().int().min(1).max(20).optional().describe("每个集合返回的样本条数，默认 3")
    }
  },
  async ({ collections, sampleSize }) => {
    const service = createService();
    const result = await service.getSnapshot({ collections, sampleSize });
    return textResult(result);
  }
);

server.registerTool(
  "analyze_cloud_database",
  {
    description: "自动分析当前 CloudBase 云端数据库，输出集合统计、测评分布和关键结论。",
    inputSchema: {
      collections: z.array(z.string()).optional().describe("指定要分析的云端集合；不传则分析最近同步过的集合"),
      sampleSize: z.number().int().min(1).max(50).optional().describe("每个集合用于分析的样本条数，默认 3")
    }
  },
  async ({ collections, sampleSize }) => {
    const service = createService();
    const result = await service.analyze({ collections, sampleSize });
    return textResult(result);
  }
);

server.registerTool(
  "sync_and_analyze_cloud_database",
  {
    description: "先把本地 MySQL 同步到 CloudBase，再立即输出云端快照和分析结果。",
    inputSchema: {
      tables: z.array(z.string()).optional().describe("指定要同步的本地表"),
      limitPerTable: z.number().int().positive().optional().describe("每张表同步的最大行数"),
      sampleSize: z.number().int().min(1).max(50).optional().describe("分析时每个集合返回的样本条数")
    }
  },
  async ({ tables, limitPerTable, sampleSize }) => {
    const service = createService();
    const result = await service.syncAndAnalyze({ tables, limitPerTable, sampleSize });
    return textResult(result);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
