/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from 'egg';
import { connectDB, edgeClean, nodeClean } from '../utils';
export default class EdgeService extends Service {
  // 查询相连节点的信息
  public async getEdgeByNode(sourceNode: string, targetNode: string) {
    const driver = connectDB(this);
    const sql = `match r=shortestpath((n{id:'${sourceNode}'})-[*]-(m{id:'${targetNode}'})) return r`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const data = res.records[0]._fields[0];
        const nodes: any[] = [nodeClean(data.start)];
        const links: any[] = [];
        for (const seg of data.segments) {
          nodes.push(nodeClean(seg.end));
          links.push(edgeClean(seg.relationship));
        }
        return {
          nodes,
          links,
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

  // 查询某社区下的所有的边信息
  public async getEdgeByCommunity(communityId: number) {
    const driver = connectDB(this);
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

  public async getCommunitiesEdgeInfo(communities: number[]) {
    const driver = connectDB(this);

    const rel = [
      'r_cert',
      'r_cname',
      'r_dns_a',
      'r_subdomain',
      'r_cert_chain',
      'r_request_jump',
    ];
    const session = driver.session();
    const result: any[] = [];
    try {
      const count_res: any[] = [];
      for (const c of communities) {
        const li: number[] = [];
        for (const i of ['Domain', 'Cert', 'IP']) {
          const sql = `match (n:${i}{community:${c}}) return count(n) as c_n`;
          const res = await session.run(sql);
          li.push(res.records[0]._fields[0]);
        }
        count_res.push(li);

        const children: {
          name: string;
          value: number;
          children: { name: string; value: number }[];
        }[] = [
            {
              name: 'Domain',
              value: count_res[0][0],
              children: [
                {
                  name: 'Domain',
                  value: 0,
                },
                {
                  name: 'Cert',
                  value: 0,
                },
                {
                  name: 'IP',
                  value: 0,
                },
              ],
            },
            {
              name: 'Cert',
              value: count_res[0][1],
              children: [
                {
                  name: 'Cert',
                  value: 0,
                },
              ],
            },
            {
              name: 'IP',
              value: count_res[0][2],
              children: [],
            },
          ];
        for (const r of rel) {
          const sql = `match (n{community:${c}})-[r:${r}]->(m{community:${c}}) return count(r) as c`;
          const res = await session.run(sql);
          if (r === 'r_cert') {
            children[0].children[1].value += res.records[0]._fields[0];
          } else if (r === 'r_cname') {
            children[0].children[0].value += res.records[0]._fields[0];
          } else if (r === 'r_dns_a') {
            children[0].children[2].value += res.records[0]._fields[0];
          } else if (r === 'r_subdomain') {
            children[0].children[0].value += res.records[0]._fields[0];
          } else if (r === 'r_cert_chain') {
            children[1].children[0].value += res.records[0]._fields[0];
          } else if (r === 'r_request_jump') {
            children[0].children[0].value += res.records[0]._fields[0];
          }
        }

        const childD: any[] = []
        const childC: any[] = []
        const childrenEnd: any[] = []
        childD.push(children[0].children.filter((item: any) => {
          return item.value > 0
        }))
        childC.push(children[1].children.filter((item: any) => {
          return item.value > 0
        }))
        children[0].children = childD
        children[1].children = childC

        childrenEnd.push(children.filter((item: any) => {
          return item.value > 0
        }))

        result.push({ name: c, childrenEnd });
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
