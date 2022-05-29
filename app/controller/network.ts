import { Controller } from 'egg';

export default class NetworkController extends Controller {
  /**
   * 初始化社区总览数据
   */
  public async getAllCommunities() {
    const { ctx } = this;
    const { nodes, links }: any =
      await ctx.service.network.getAllCommunitiesBy();
    ctx.body = {
      nodes,
      links,
    };
    ctx.type = 'json';
  }
  /**
   * 根据节点ID获取节点信息
   */
  // public async getNetworkByCommunity() {
  //   const { ctx } = this;
  //   const params = ctx.request.body;
  //   console.log(params);
  //   const node = await ctx.service.node.getNodeByCommunity(params.communityId);
  //   const link = await ctx.service.edge.getEdgeByCommunity(params.communityId);
  //   ctx.body = {
  //     nodes: node,
  //     links: link,
  //   };
  //   ctx.type = 'json';
  // }

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
  /**
   * 根据search栏的参数查询
   */
  public async getNetworkByParams() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log(params);
    switch (params.type) {
      case 'node':
        const node = await ctx.service.node.getNodeById(params.node[0]);
        ctx.body = {
          data: {
            nodes: [node],
            links: [],
          },
          type: params.type,
        };
        break;
      case 'link':
        const data = await ctx.service.edge.getEdgeByNode(
          params.node[0],
          params.node[1]
        );
        ctx.body = { data: data, type: params.type };
        break;
      case 'condition':
        const nodeCondition = await ctx.service.node.getNodeByCondition(
          params.node[0],
          params.node.slice(1)
        );
        ctx.body = {
          data: {
            nodes: [nodeCondition],
            links: [],
          },
          type: params.type,
        };
        break;
      case 'communities':
        const communities =
          await ctx.service.network.getFilterNetworkByCommunities(params.node);
        ctx.body = { data: communities, type: params.type };
        break;
    }
    ctx.type = 'json';
  }

  public async getCommunitiesInfo() {
    const { ctx } = this;
    let params = ctx.request.body;
    if (params.constructor === Object) {
      params = params.communities;
    }
    const count_res = await ctx.service.node.getCommunitiesNodeInfo(params);
    const result = await ctx.service.edge.getCommunitiesEdgeInfo(params);

    ctx.body = { count_res, result };
    ctx.type = 'json';
  }

  public async getCurrNeighbours() {
    const { ctx } = this;
    let params = ctx.request.body;
    if (params.constructor === Object) {
      params = params.communities;
    }
    const res = await ctx.service.network.getCurrNeighbours(params);
    ctx.body = res;
    ctx.type = 'json';
  }
}
