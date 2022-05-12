import { Service } from 'egg';
import type { Node } from '../types';

export default class Network extends Service {
  public async getNetworkByLimit(nodeNum: number) {
    const neo4j = require('neo4j-driver');
    const db_config = this.config.neo4j;
    // 连接数据库
    const driver = neo4j.driver(
      db_config.url,
      neo4j.auth.basic(db_config.username, db_config.password),
      {
        maxTransactionRetryTime: 30000,
      }
    );
    const sql = `match (n)-[r]-(m) return n,m,r limit ${nodeNum}`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length != 0) {
        return res.records;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }
  public async getFilterNetworkByParams(
    searchParams: string,
    filterNode: Node
  ) {}
}
