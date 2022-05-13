/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from "egg";
import { edgeClean, nodeClean } from "../utils";
export default class EdgeService extends Service {
  //查询相连节点的信息
  public async getEdgeByNode(sourceNode: string, targetNode: string){
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
    const sql = `match data=(n{id:'${sourceNode}'})-[r]-(m{id:'${targetNode}'}) return data`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const data = res.records[0]._fields[0];
        const nodes = [nodeClean(data.start), nodeClean(data.end)];
        const links = edgeClean(data.segments[0].relationship);
        return {
          nodes: nodes,
          links: [links]
        };
      }
      return null;
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }
  
  //查询某社区下的所有的边信息
  public async getEdgeByCommunity(communityId: number) {
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
          edges[i] = edgeClean(edges[i]._fields[0]);
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
