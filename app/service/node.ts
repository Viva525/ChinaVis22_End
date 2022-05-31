import { Service } from 'egg';
import { readFileSync } from 'fs';
import { stdout } from 'process';
import { connectDB, nodeClean } from '../utils';
/**
 * 节点查询Service
 */
export default class Node extends Service {
  //根据节点ID查询节点信息
  public async getNodeById(node: string) {
    const driver = connectDB(this);
    const sql = `match (n{id:'${node}'}) return n`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length != 0) {
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

  //获取某社区下的所有节点信息
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
  public async getNodeByCondition(nodeType: string, condition: string[]) {
    const driver = connectDB(this);
    let sql = `match (n:${nodeType}) where n.`;
    for (let i = 0; i < condition.length; i++) {
      let con = condition[i].split(':');
      sql += `${con[0]} = '${con[1]}' `;
      if (i != condition.length - 1) {
        sql += 'and n.';
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

  public async recommand(id: string) {
    const driver = connectDB(this);
    let sql = `match(n{id:"${id}"})-[*..4]-(m) where n.community<>m.community return m`;
    console.log(sql);
    // let sql =  `match (n:${nodeType}) where n.`;
    // for(let i=0;i<condition.length;i++){
    //   let con = condition[i].split(":");
    //   sql +=  `${con[0]} = '${con[1]}'`;
    //   if(i != condition.length - 1){
    //     sql += 'and n.';
    //   }
    // }
    const session = driver.session();
    try {
      // let response: any = [];
      const res = await session.run(sql);
      // response.push(res);
      if (res.records.length !== 0) {
        console.log(res);
        const child_process = require('child_process');
        var workerProcess = child_process.exec(
          'AHP.py' + res,
          function (error, stdout, stderr) {
            if (error) {
              console.log(error.stack);
              console.log('Error code: ' + error.code);
              console.log('Signal recevied: ' + error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
          }
        );
        workerProcess.on('exit', function (code) {
          console.log('子进程已退出，退出码' + code);
        });
        return stdout;
      } else {
        return "success";
      }
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
        readFileSync('./app/public/scatter.json', 'utf-8')
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  public async getCommunitiesNodeInfo(communities: number[]) {
    const driver = connectDB(this);
    const session = driver.session();
    let industrySQL: string[] = [];
    try {
      const count_res: any[] = [];
      const industry_res: any[] = [];
      for (let c of communities) {
        let li: number[] = [];
        for (let i of ['Domain', 'Cert', 'IP']) {
          const sql = `match (n:${i}{community:${c}}) return count(n) as c_n`;
          const res = await session.run(sql);
          li.push(res.records[0]._fields[0]);
        }
        count_res.push(li);
        industrySQL.push(`match (n:Domain{community:${c}}) return n`);
      }
      for (let i of industrySQL) {
        const res = await session.run(i);
        let industry = {
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
