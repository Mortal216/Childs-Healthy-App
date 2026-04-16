import mysql from "mysql2/promise";
import { getMySQLConfig } from "../config.js";

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, "``")}\``;
}

export class MySQLService {
  constructor(config = getMySQLConfig()) {
    this.config = config;
  }

  async withConnection(handler) {
    const connection = await mysql.createConnection(this.config);
    try {
      return await handler(connection);
    } finally {
      await connection.end();
    }
  }

  async getTables() {
    return this.withConnection(async (connection) => {
      const [rows] = await connection.query("SHOW TABLES");
      return rows.map((row) => Object.values(row)[0]);
    });
  }

  async getTableCount(tableName) {
    return this.withConnection(async (connection) => {
      const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM ${quoteIdentifier(tableName)}`);
      return Number(rows[0]?.total || 0);
    });
  }

  async getRows(tableName, limit = null) {
    return this.withConnection(async (connection) => {
      let sql = `SELECT * FROM ${quoteIdentifier(tableName)}`;
      if (Number.isFinite(limit) && limit > 0) {
        sql += ` LIMIT ${Number(limit)}`;
      }
      const [rows] = await connection.query(sql);
      return rows;
    });
  }
}
