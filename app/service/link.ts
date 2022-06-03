import { Service } from 'egg';
import { connectDB, edgeClean, nodeClean } from '../utils';

export default class Network extends Service {
  public async getLinksBT2Nodes(node1: string, node2: string) {
    const driver = connectDB(this);
    const session = driver.session();
    const keyNodeSQL1 = `match (n{id:"${node1}"}) with n, size((n)--()) as s return n, s`;
    const keyNodeSQL2 = `match (n{id:"${node2}"}) with n, size((n)--()) as s return n, s`;
    let keyIPSQL1;
    let keyIPSQL2;
    let linkSQL;
    let flag = true;
    const result: { nodes: any[]; links: any[] }[] = [];
    const isNodeKey = (res: any) => {
      let degree = res.records[0]._fields[1];
      if (res.records[0]._fields[0].properties.hasOwnProperty('asn')) {
        degree -= 1;
      }
      if (res.records[0]._fields[0].properties.hasOwnProperty('ipc')) {
        degree -= 1;
      }
      if (degree > 2) {
        return true;
      }
      return false;
    };

    try {
      const res1 = await session.run(keyNodeSQL1);
      const res2 = await session.run(keyNodeSQL2);

      if (node1.startsWith('IP')) {
        keyIPSQL1 = `match (n:Domain)-->(m:IP) with n,m where m.id="${node1}" match (n)-->(x:IP) where x.id<>"${node1}" return n`;
        const resIP1 = await session.run(keyIPSQL1);
        if (
          !isNodeKey(res1) ||
          (resIP1.records.length !== 0 && resIP1.records[0]._fields.length)
        ) {
          flag = false;
        }
      }
      if (node2.startsWith('IP')) {
        keyIPSQL2 = `match (n:Domain)-->(m:IP) with n,m where m.id="${node2}" match (n)-->(x:IP) where x.id<>"${node2}" return n`;
        const resIP2 = await session.run(keyIPSQL2);
        if (
          !isNodeKey(res2) ||
          (resIP2.records.length !== 0 && resIP2.records[0]._fields.length)
        ) {
          flag = false;
        }
      }

      if (flag) {
        linkSQL = `match p=(n{id:"${node1}"})-[*..2]-(m{id:"${node2}"}) return p`;
        const link1 = await session.run(linkSQL);
        linkSQL = `match p=(n{id:"${node1}"})-[*3]-(m{id:"${node2}"}) return p limit 30`;
        const link2 = await session.run(linkSQL);
        linkSQL = `match p=(n{id:"${node1}"})-[*4]-(m{id:"${node2}"}) return p limit 30`;
        const link3 = await session.run(linkSQL);
        for (const item of [ ...link1.records, ...link2.records, ...link3.records ]) {
          const resItem: { nodes: any[]; links: any[] } = {
            nodes: [],
            links: [],
          };
          // 判断是否需要clean， push start节点
          if (item._fields[0].segments[0].start.identity !== undefined) {
            resItem.nodes.push(nodeClean(item._fields[0].segments[0].start));
          } else {
            resItem.nodes.push(item._fields[0].segments[0].start);
          }
          // 对links遍历， 判断正向还是反向， 加入link数组
          for (let i = 0; i < item._fields[0].segments.length; i++) {
            if (item._fields[0].segments[i].end.identity !== undefined) {
              if (
                item._fields[0].segments[i].end.identity !==
                item._fields[0].segments[i].relationship.end
              ) {
                resItem.links.push({
                  ...edgeClean(item._fields[0].segments[i].relationship),
                  direction: 1,
                });
              } else {
                resItem.links.push({
                  ...edgeClean(item._fields[0].segments[i].relationship),
                  direction: 0,
                });
              }
              resItem.nodes.push(nodeClean(item._fields[0].segments[i].end));
            } else {
              if (
                item._fields[0].segments[i].end.id !==
                item._fields[0].segments[i].relationship.end
              ) {
                resItem.links.push({
                  ...edgeClean(item._fields[0].segments[i].relationship),
                  direction: 1,
                });
              } else {
                resItem.links.push({
                  ...edgeClean(item._fields[0].segments[i].relationship),
                  direction: 0,
                });
              }
              resItem.nodes.push(item._fields[0].segments[i].end);
            }
          }
          result.push(resItem);
        }
      }

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
