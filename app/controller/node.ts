import { Controller } from 'egg';

export default class NodeController extends Controller {

  /**
   * 根据节点ID获取节点信息
   */
  public async getNodeById() {
    const { ctx } = this;
    const params = ctx.request.body;
    const res = await ctx.service.node.getNode(params);
    ctx.body = res;
    ctx.type = 'json';
  }

  
}
