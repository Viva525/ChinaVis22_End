import { Service } from "egg";
import { nodeClean } from "../utils";
/**
 * 节点查询Service
 */
export default class Node extends Service {
  //根据节点ID查询节点信息
  public async getNodeById(node: string) {
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
    const sql = `match (n{id:'${node}'}) return n`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length != 0) {
        const node = res.records[0]._fields[0];
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

  //获取某社区下的所有节点信息
  public async getNodeByCommunity(communityId: number) {
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
          nodes[i] = nodeClean(nodes[i]._fields[0]);
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

  //按照某种条件查询节点信息
  public async getNodeByCondition(nodeType: string, condition: string[]){
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
    let sql = `match (n:${nodeType}) where n.`;
    for(let i =0; i < condition.length; i++){
      let con = condition[i].split(':');
      sql += `${con[0]} = '${con[1]}' `;
      if(i != condition.length - 1){
        sql += 'and n.'
      }
    }
    sql += 'return n';
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const node = nodeClean(res.records[0]._fields[0]);
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
}
