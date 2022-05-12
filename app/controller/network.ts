import { Controller } from 'egg';

export default class NetworkController extends Controller {
  /**
   * 根据节点ID获取节点信息
   */
  public async getNetworkByCommunity() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log(params);
    const Node = await ctx.service.node.getNodeByCommunity(params.communityId);
    const Link = await ctx.service.edge.getEdgeByCommunity(params.communityId);
    ctx.body = {
      nodes: Node,
      links: Link,
    };
    ctx.type = 'json';
  }

  /**
   * 根据search栏的参数和filter栏的参数获取graph
   */
  public async getFilterNetworkByParams() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log(params);
    const network = await ctx.service.network.getFilterNetworkByParams(
      params.searchParams,
      params.filterNode
    );
    ctx.body = {
      network,
    };
    ctx.type = 'json';
  }
}
