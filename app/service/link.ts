import { Service } from 'egg';
import { connectDB, edgeClean, nodeClean } from '../utils';

export default class Network extends Service {
  public async getLinksBT2Nodes(node1: string, node2: string) {
    const driver = connectDB(this);
    const session = driver.session();
    let keyNodeSQL1 = `match (n{id:"${node1}"}) with n, size((n)--()) as s return n, s`;
    let keyNodeSQL2 = `match (n{id:"${node2}"}) with n, size((n)--()) as s return n, s`;
    let keyIPSQL1;
    let keyIPSQL2;
    let linkSQL;
    let flag = true;
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
        if (!isNodeKey(res1) || resIP1.records[0]._fields.length) {
          flag = false;
        }
        console.log(isNodeKey(res1), resIP1.records[0]._fields.length);
      }
      if (node2.startsWith('IP')) {
        keyIPSQL2 = `match (n:Domain)-->(m:IP) with n,m where m.id="${node2}" match (n)-->(x:IP) where x.id<>"${node2}" return n`;
        const resIP2 = await session.run(keyIPSQL2);
        if (!isNodeKey(res2) || resIP2.records[0]._fields.length) {
          flag = false;
        }
        console.log(isNodeKey(res2), resIP2.records[0]._fields.length);
      }
      let result: { nodes: any; links: any }[] = [
        { nodes: [], links: [] },
        { nodes: [], links: [] },
        { nodes: [], links: [] },
        { nodes: [], links: [] },
      ];
      if (flag) {
        linkSQL = `match p=(n{id:"${node1}"})-[*..4]-(m{id:"${node2}"}) return p`;
        const link = await session.run(linkSQL);
        for (let item of link.records) {
          if (item._fields[0].segments[0].start.identity !== undefined) {
            result[item._fields[0].length - 1].nodes.push(
              nodeClean(item._fields[0].segments[0].start)
            );
          }
          for (let seg of item._fields[0].segments) {
            if (seg.end.identity !== undefined) {
              result[item._fields[0].length - 1].nodes.push(nodeClean(seg.end));
            }
            result[item._fields[0].length - 1].links.push(
              edgeClean(seg.relationship)
            );
          }
        }
      }

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
