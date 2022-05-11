import { Service } from "egg";

/**
 * 节点查询Service
 */
export default class Node extends Service {
  //IP:xxxx
  public async getNode(Node: Object) {
    const neo4j = require("neo4j-driver");
    const db_config = this.config.neo4j;
    // 连接数据库
    const driver = neo4j.driver(
      db_config.url,
      neo4j.auth.basic(db_config.username, db_config.password),
      {
        maxTransactionRetryTime: 30000,
      }
    );
    const [[key, value]] = Object.entries(Node);
    const sql = `match (n:${key}{id:'${value}'}) return n`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length != 0) {
        const node = res.records[0]._fields[0].properties;
        return node;
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

  public async getNodeByCommunity(communityId: number) {
    const dataClean = (node: any) => {
      const item = node._fields[0];
      item.group = item.labels[0];
      // switch(item.group){
      //     case "IP":
      //         item.color = "#FFCC80";
      //         break;
      //     case "Domain":
      //         item.color = "#A5D6A7";
      //         break;
      //     case "Cert":
      //         item.color = "#B39DDB";
      //         break;
      // }
      item.id = item.identity;
      item.weight = item.properties.weight;
      item.properties.weight = undefined;
      item.identity = undefined;
      item.labels = undefined;
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
    const sql = `match (n{community:${communityId}}) return n`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const nodes = res.records;
        for (let i = 0; i < nodes.length; i++) {
          nodes[i] = dataClean(nodes[i]);
        }
        return nodes;
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
}
