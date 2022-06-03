import { Controller } from 'egg';

export default class NodeController extends Controller {
  /**
   * 根据节点ID获取节点信息
   */
  public async getNodeById() {
    const { ctx } = this;
    const params = ctx.request.body;
    const res = await ctx.service.node.getNodeById(params);
    ctx.body = res;
    ctx.type = 'json';
  }

  /**
   * 根据节点ID获取4跳内其他社区节点
   */
  public async recommand() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    const res = await ctx.service.node.recommand(id);
    ctx.body = res;
    ctx.type = 'json';
  }

  public async getAllCommuntiesScatter() {
    const { ctx } = this;
    const res = await ctx.service.node.getAllCommuntiesScatter();
    ctx.body = res;
    ctx.type = 'json';
  }
}
