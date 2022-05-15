import { Controller } from 'egg';

export default class NetworkController extends Controller {
  /**
   * 根据节点ID获取节点信息
   */
  public async getNetworkByCommunity() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log(params);
    const node = await ctx.service.node.getNodeByCommunity(params.communityId);
    const link = await ctx.service.edge.getEdgeByCommunity(params.communityId);
    ctx.body = {
      nodes: node,
      links: link,
    };
    ctx.type = 'json';
  }

  /**
   * 根据search栏的参数和filter栏的参数获取graph
   */
  public async getFilterNetworkByCommunities() {
    const { ctx } = this;
    const params = ctx.request.body;
    const { nodes, links }: any =
      await ctx.service.network.getFilterNetworkByCommunities(
        params.communities
      );
    ctx.body = {
      nodes,
      links,
    };
    ctx.type = 'json';
  }

  public async getNetworkByParams() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log(params);
    switch (params.type) {
      case 'node':
        const node = await ctx.service.node.getNodeById(params.node[0]);
        ctx.body = {
          nodes: [node],
          links: [],
        };
        break;
      case 'link':
        const data = await ctx.service.edge.getEdgeByNode(
          params.node[0],
          params.node[1]
        );
        ctx.body = data;
        break;
      case 'condition':
        const nodeCondition = await ctx.service.node.getNodeByCondition(
          params.node[0],
          params.node.slice(1)
        );
        ctx.body = {
          nodes: [nodeCondition],
          links: [],
        };
        break;
      case 'communities':
        const communities = await ctx.service.network.getFilterNetworkByCommunities(params.node);
        ctx.body = communities;
        break;
    }
    ctx.type = 'json';
  }
}
