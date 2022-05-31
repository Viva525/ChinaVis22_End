/* eslint-disable @typescript-eslint/no-var-requires */
import { Service } from 'egg';
import { connectDB, edgeClean, nodeClean } from '../utils';
export default class EdgeService extends Service {
  // 查询相连节点的信息
  public async getEdgeByNode(sourceNode: string, targetNode: string) {
    const driver = connectDB(this);
    const sql = `match data=(n{id:'${sourceNode}'})-[r]-(m{id:'${targetNode}'}) return data`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        const data = res.records[0]._fields[0];
        const nodes = [ nodeClean(data.start), nodeClean(data.end) ];
        const links = edgeClean(data.segments[0].relationship);
        return {
          nodes,
          links: [ links ],
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
      for (const c of communities) {
        const children: {
          name: string;
          children: { name: string; popularity: number; weight: number }[];
        }[] = [
          {
            name: 'Domain',
            children: [
              {
                name: 'Domain',
                popularity: 500,
                weight: 0,
              },
              {
                name: 'Cert',
                popularity: 500,
                weight: 0,
              },
              {
                name: 'IP',
                popularity: 500,
                weight: 0,
              },
            ],
          },
          {
            name: 'Cert',
            children: [
              {
                name: 'Domain',
                popularity: 500,
                weight: 0,
              },
              {
                name: 'Cert',
                popularity: 500,
                weight: 0,
              },
              {
                name: 'IP',
                popularity: 500,
                weight: 0,
              },
            ],
          },
          {
            name: 'IP',
            children: [
              {
                name: 'Domain',
                popularity: 500,
                weight: 0,
              },
              {
                name: 'Cert',
                popularity: 500,
                weight: 0,
              },
              {
                name: 'IP',
                popularity: 500,
                weight: 0,
              },
            ],
          },
        ];
        for (const r of rel) {
          const sql = `match (n{community:${c}})-[r:${r}]->(m{community:${c}}) return count(r) as c`;
          const res = await session.run(sql);
          if (r === 'r_cert') {
            children[0].children[1].weight += res.records[0]._fields[0];
          } else if (r === 'r_cname') {
            children[0].children[0].weight += res.records[0]._fields[0];
          } else if (r === 'r_dns_a') {
            children[0].children[2].weight += res.records[0]._fields[0];
          } else if (r === 'r_subdomain') {
            children[0].children[0].weight += res.records[0]._fields[0];
          } else if (r === 'r_cert_chain') {
            children[1].children[1].weight += res.records[0]._fields[0];
          } else if (r === 'r_request_jump') {
            children[0].children[0].weight += res.records[0]._fields[0];
          }
        }
        result.push({ name: c, children });
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
