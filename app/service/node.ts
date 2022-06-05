import { Service } from 'egg';
import { readFileSync } from 'fs';
// import { stdout } from 'process';
import { connectDB, nodeClean } from '../utils';
/**
 * 节点查询Service
 */
export default class Node extends Service {
  // 根据节点ID查询节点信息
  public async getNodeById(node: string) {
    const driver = connectDB(this);
    const sql = `match (n{id:'${node}'}) return n`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const node = nodeClean(res.records[0]._fields[0]);
        return node;
      }
      return null;
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }

  // 获取某社区下的所有节点信息
  public async getNodeByCommunity(communityId: number) {
    const driver = connectDB(this);
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
      }
      return null;
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }

  // 按照某种条件查询节点信息
  public async getNodeByCondition(nodeType: string, condition: string[]) {
    const driver = connectDB(this);
    let sql = `match (n:${nodeType}) where n.`;
    for (let i = 0; i < condition.length; i++) {
      const con = condition[i].split(':');
      sql += `${con[0]} = '${con[1]}' `;
      if (i !== condition.length - 1) {
        sql += 'and n.';
      }
    }
    sql += 'return n';
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const node: any[] = [];
        for (const n of res.records) {
          node.push(nodeClean(n._fields[0]));
        }
        return node;
      }
      return null;
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }

  public async recommand(id: string, communities:number[]) {
    const driver = connectDB(this);
    const sql: string[] = [];
    for (let i = 1; i <= 4; i++) {
      sql.push(
        `match data=(n{id:"${id}"})-[*${i}]-(m) where n.community<>m.community return distinct m.community`,
      );
    }

    const session = driver.session();
    try {
      const resCommunity: number[][] = [];
      const resSet = new Set(communities);
      for (const s of sql) {
        const res = await session.run(s);

        if (res.records.length !== 0) {
          const list = res.records.map((item: any) => {
            return item._fields[0];
          });
          for (let li = 0; li < list.length; li++) {
            if (resSet.has(list[li])) {
              list.splice(list.indexOf(li), 1);
              li--;
            } else {
              resSet.add(list[li]);
            }
          }
          resCommunity.push(list);
        } else {
          resCommunity.push([]);
        }
      }
      console.log('查询完毕');
      const nodes = JSON.parse(
        readFileSync('./app/public/community_node.json', 'utf-8'),
      );

      const response: {
        id: number;
        step: number;
        wrong_sum: number;
        wrong_list: {
          type: string;
          num: number;
        }[];
      }[] = [];

      for (let c = 0; c < nodes.length; ++c) {
        for (let i = 0; i < 4; i++) {
          if (resCommunity[i].includes(nodes[c].id)) {
            let wrong_sum = 0;
            const wrong_list: {
              type: string;
              num: number;
            }[] = [];
            for (let w = 0; w < nodes[c].wrong_list.length; w++) {
              if (nodes[c].wrong_list[w] > 0) {
                if (w === 0) {
                  wrong_list.push({
                    type: 'porn',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 1) {
                  wrong_list.push({
                    type: 'gambling',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 2) {
                  wrong_list.push({
                    type: 'fraud',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 3) {
                  wrong_list.push({
                    type: 'drug',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 4) {
                  wrong_list.push({
                    type: 'gun',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 5) {
                  wrong_list.push({
                    type: 'hacker',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 6) {
                  wrong_list.push({
                    type: 'trading',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 7) {
                  wrong_list.push({
                    type: 'pay',
                    num: nodes[c].wrong_list[w],
                  });
                } else if (w === 8) {
                  wrong_list.push({
                    type: 'other',
                    num: nodes[c].wrong_list[w],
                  });
                }
              }
              wrong_sum += nodes[c].wrong_list[w];
            }
            response.push({
              id: nodes[c].id,
              step: i + 1,
              wrong_sum,
              wrong_list,
            });
          }
        }
      }
      return response;
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }

  public async getAllCommuntiesScatter() {
    try {
      const data = JSON.parse(
        readFileSync('./app/public/scatter.json', 'utf-8'),
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  public async getCommunitiesNodeInfo(communities: number[]) {
    const driver = connectDB(this);
    const session = driver.session();
    const industrySQL: string[] = [];
    try {
      const count_res: any[] = [];
      const industry_res: any[] = [];
      for (const c of communities) {
        const li: number[] = [];
        for (const i of [ 'Domain', 'Cert', 'IP' ]) {
          const sql = `match (n:${i}{community:${c}}) return count(n) as c_n`;
          const res = await session.run(sql);
          li.push(res.records[0]._fields[0]);
        }
        count_res.push(li);
        industrySQL.push(`match (n:Domain{community:${c}}) return n`);
      }
      for (const i of industrySQL) {
        const res = await session.run(i);
        const industry = {
          porn: 0,
          gambling: 0,
          fraud: 0,
          drug: 0,
          gun: 0,
          hacker: 0,
          trading: 0,
          pay: 0,
          other: 0,
        };
        res.records.forEach((element: any) => {
          if (element._fields[0].properties.porn === 'True') {
            industry.porn += 1;
          } else if (element._fields[0].properties.gambling === 'True') {
            industry.gambling += 1;
          } else if (element._fields[0].properties.fraud === 'True') {
            industry.fraud += 1;
          } else if (element._fields[0].properties.drug === 'True') {
            industry.drug += 1;
          } else if (element._fields[0].properties.gun === 'True') {
            industry.gun += 1;
          } else if (element._fields[0].properties.hacker === 'True') {
            industry.hacker += 1;
          } else if (element._fields[0].properties.trading === 'True') {
            industry.trading += 1;
          } else if (element._fields[0].properties.pay === 'True') {
            industry.pay += 1;
          } else if (element._fields[0].properties.other === 'True') {
            industry.other += 1;
          }
        });
        industry_res.push(industry);
      }
      return { count_res, industry_res };
    } catch (error) {
      console.log(error);
    }
  }
}
