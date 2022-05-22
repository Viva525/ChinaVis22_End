import { Service } from 'egg';
import { readFileSync } from 'fs';
// import { readFileSync, writeFileSync } from 'fs';
import { connectDB, edgeClean, nodeClean } from '../utils';

export default class Network extends Service {
  public async getAllCommunitiesBy() {
    try {
      const data = JSON.parse(
        readFileSync('./app/public/allCommunity.json', 'utf-8')
      );
      return data;
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
}
