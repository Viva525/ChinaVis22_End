import { Service } from 'egg';
import { readFileSync } from 'fs';
// import { readFileSync, writeFileSync } from 'fs';
import { connectDB, edgeClean, nodeClean } from '../utils';

export default class Network extends Service {
  public async getAllCommunitiesBy() {
    try {
      const nodes = JSON.parse(
        readFileSync('./app/public/community_node.json', 'utf-8')
      );
      const links = JSON.parse(
        readFileSync('./app/public/community_link.json', 'utf-8')
      );
      return { nodes, links };
      // const nodes = JSON.parse(
      //   readFileSync('./data/community_node2.json', 'utf-8')
      // );
      // const links = JSON.parse(
      //   readFileSync('./data/community_link.json', 'utf-8')
      // );
      // writeFileSync(
      //   './data/allCommunity.json',
      //   JSON.stringify({ nodes, links })
      // );
      // return { nodes, links };
    } catch (error) {
      console.log(error);
    }
  }

  public async getNetworkByLimit(nodeNum: number) {
    const driver = connectDB(this);
    const sql = `match (n)-[r]-(m) return n,m,r limit ${nodeNum}`;
    const session = driver.session();
    try {
      const res = await session.run(sql);
      if (res.records.length !== 0) {
        return res.records;
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
  public async getFilterNetworkByCommunities(communities: number[]) {
    const driver = connectDB(this);
    let nodeSql = `match (n) where `;
    let linkSql = `match (n)-[r]-(m) where `;
    let linkSqlWhere = `(`;
    for (let i = 0; i < communities.length; i++) {
      if (i !== communities.length - 1) {
        nodeSql += 'n.community=' + `${communities[i]}` + ' or ';
        linkSqlWhere += 'n.community=' + `${communities[i]}` + ' or ';
      } else {
        nodeSql += 'n.community=' + `${communities[i]}` + ' return n';
        linkSqlWhere += 'n.community=' + `${communities[i]}` + ')';
      }
    }
    linkSql +=
      linkSqlWhere + ' and ' + linkSqlWhere.replace(/n\./g, 'm.') + ' return r';

    const session = driver.session();
    try {
      const nodeRes = await session.run(nodeSql);
      const linkRes = await session.run(linkSql);
      const nodes = nodeRes.records;
      const links = linkRes.records;
      if (nodeRes.records.length !== 0) {
        for (let i = 0; i < nodes.length; i++) {
          nodes[i] = nodeClean(nodes[i]._fields[0]);
        }
      }
      if (linkRes.records.length !== 0) {
        for (let i = 0; i < links.length; i++) {
          links[i] = edgeClean(links[i]._fields[0]);
        }
      }

      return { nodes: nodes, links: links };
    } catch (error) {
      console.log(error);
    } finally {
      session.close();
      driver.close();
    }
  }

  public async getCurrNeighbours(communities: number[]) {
    try {
      const nodes = JSON.parse(
        readFileSync('./app/public/community_node.json', 'utf-8')
      );
      const cSet = new Set();
      for (let c = 0; c < nodes.length; c++) {
        if (communities.includes(nodes[c].id)) {
          for (let n of nodes[c].neighbour) {
            cSet.add(n);
          }
        }
      }
      const res: {
        id: number;
        wrong_sum: number;
        wrong_list: {
          type: string;
          num: number;
        }[];
      }[] = [];
      for (let c = 0; c < nodes.length; c++) {
        if (cSet.has(nodes[c].id)) {
          let wrong_sum = 0;
          let wrong_list: {
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
          let rect = {
            id: nodes[c].id,
            wrong_sum: wrong_sum,
            wrong_list: wrong_list,
          };
          res.push(rect);
        }
      }
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}
