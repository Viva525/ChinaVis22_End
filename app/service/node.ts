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
        const node:any[] = [];
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

  public async recommand(id: string) {
    const driver = connectDB(this);
    const sql = `match data=(n{id:"${id}"})-[*..4]-(m) where n.community<>m.community return distinct data`;
    // const sql = `match (n{id:"${id}"})-[*..4]-(m) where n.community<>m.community return distinct m.community`;
    console.log(sql);
    const session = driver.session();
    try {
      const res = await session.run(sql);
      const arr = new Set();//节点
      let arr1:number[]= []
      const step =new Set();
      let step1:number[]= []
      for (let i = 0; i < res["records"].length; ++i) {
        arr.add(res["records"][i]["_fields"]["0"]["end"]["properties"]["community"]);
        step.add(res["records"][i]["_fields"]["0"]["length"]);
        arr1.push(res["records"][i]["_fields"]["0"]["end"]["properties"]["community"]);
        step1.push(res["records"][i]["_fields"]["0"]["length"])
      }
      console.log(step);
      const nodes = JSON.parse(readFileSync('./app/public/community_node.json', 'utf-8'));

      const response: {
        id: number;
        step:number;
        wrong_sum: number;
        wrong_list: {
          type: string;
          num: number;
        }[];
      }[] = [];
      for (let c = 0; c < nodes.length; ++c) {
        if (arr.has(nodes[c].id)) {
          let wrong_sum = 0;
          let index = arr1.indexOf(nodes[c].id)
          const step2:number = step1[index]
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
          const rect = {
            id: nodes[c].id,
            step: step2,
            wrong_sum,
            wrong_list,
          };
          response.push(rect);
        }
      }
      // console.log(response);
      return response;
      // var arr: number[] = [];
      // for (let j = 0; j < res["records"].length; ++j) {
      //   console.log(res["records"][j]);
      //   // console.log(res["records"][0]["_fields"][0]["length"]);//输出节点跳数
      //   let leng = res["records"][j]["_fields"][0]["length"];
      //   console.log(leng)
      //   // console.log(res["records"][0]["_fields"][0]["segments"]);//得到跳的所有中间节点数,求平均值
      //   // console.log(res["records"][0]["_fields"][0]["segments"][0]["relationship"]["type"]);
      //   // console.log(res["records"][0]["_fields"][0]["segments"][leng - 1]["end"]["labels"][0]);
      //   //转换函数
      //   function transfer(str) {
      //     if (str == "r_cert" || str == "r_subdomain" || str == "r_request_jump" || str == "r_dns_a")
      //       return 9;
      //     else if (str == "IP" || str == "r_whois_name" || str == "r_whois_email")
      //       return 6;
      //     else if (str == "r_cert_chain" || str == "r_cname")
      //       return 3
      //     else
      //       return 1
      //   }
      //   function transfer1(str) {
      //     if ( str == "IP" || str == "Cert")
      //       return 9
      //     else if (str == "Domain")
      //       return 5
      //     else if (str == "Whois_Name" || str == "Whois_Phone" || str == "Whois_Email")
      //       return 3
      //     else
      //       return 1
      //   }
      //   let temp = 0;
      //   let Node = transfer1(res["records"][j]["_fields"][0]["segments"][leng - 1]["end"]["labels"][0]);
      //   for (let i = 0; i < leng; ++i)//求取节点关联的平均值
      //   {
      //     console.log(res["records"][j]["_fields"][0]["segments"][i]["start"]["properties"]["community"]);
      //     temp += transfer(res["records"][j]["_fields"][0]["segments"][i]["relationship"]["type"]);
      //   }
      //   temp = temp / leng;
      //   // console.log(temp);
      //   // let arr1 = [leng, temp, Node];
      //   arr.push(leng);
      //   arr.push(temp);
      //   arr.push(Node);
      // }
      // console.log(arr);
      // if (res.records.length !== 0) {
      //   const exec = require('child_process').exec;
      //   // const execSync = require('child_process').execSync;
      //   // 异步执行
      //   exec('python F:\\homework\\chinasvis22\\ChinaVis22_End\\app\\service\\AHP.py --B ' + arr.toString(), function (error: any, stdout: string, stderr: string) {
      //     if (error) {
      //       console.info('stderr : ' + stderr);
      //     }
      //     console.log('exec: ' + stdout);
      //   })
      // }
      // return 'success';

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
        for (const i of ['Domain', 'Cert', 'IP']) {
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
        res.records
          .map((d: any) => {
            return nodeClean(d._fields[0]);
          })
          .forEach((element: any) => {
            if (element.properties.porn) {
              industry.porn += 1;
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
