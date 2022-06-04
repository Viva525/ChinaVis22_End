import { Controller } from 'egg';

export default class LinkController extends Controller {
  /**
   * 获取两节点间所有路径
   */
  public async getLinksBT2Nodes() {
    const { ctx } = this;
    const params = ctx.request.body;
    const result: any = await ctx.service.link.getLinksBT2Nodes(
      params.node1,
      params.node2,
    );
    ctx.body = result;
    ctx.type = 'json';
  }
}
