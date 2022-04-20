import { Service } from "egg";

/**
 * 节点查询Service
 */
export default class Node extends Service {

    //IP:xxxx
    public async getNode(Node: Object) {
        const neo4j = require('neo4j-driver');
        const db_config = this.config.neo4j;
        // 连接数据库
        const driver = neo4j.driver(db_config.url, neo4j.auth.basic(db_config.username, db_config.password), {
            maxTransactionRetryTime: 30000
        })
        const [[key, value]] = Object.entries(Node);
        const sql = `match (n:${key}{id:'${value}'}) return n`;
        const session = driver.session();
        try {
            const res = await session.run(sql);
            if(res.records.length != 0){
                const node = res.records[0]._fields[0].properties;
                return node;
            }else{
                return null;
            }
        } catch (error) {
            console.log(error)
        } finally {
            session.close();
            driver.close();
        }
    }
}