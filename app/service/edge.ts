/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from "egg";

export default class EdgeService extends Service {
  public async getEdgeByCommunity(communityId: number) {
    const dataClean = (edge) => {
      const item = edge._fields[0];
      item.value = item.properties.weight;
      item.source = item.start;
      item.target = item.end;
      item.properties = undefined;
      item.start = undefined;
      item.end = undefined;
      return item;
    };

    const neo4j = require("neo4j-driver");
    const db_config = this.config.neo4j;
    // 连接数据库
    const driver = neo4j.driver(
      db_config.url,
      neo4j.auth.basic(db_config.username, db_config.password),
      {
        maxTransactionRetryTime: 30000,
        disableLosslessIntegers: true,
      }
    );
    const sql = `match (n)-[r]-(m) where n.community=${communityId} and m.community=${communityId} return r`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const edges = res.records;
        for (let i = 0; i < edges.length; i++) {
          edges[i] = dataClean(edges[i]);
        }
        return edges;
      }
      return null;
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }
}
