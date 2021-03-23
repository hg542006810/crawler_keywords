'use strict';

const Controller = require('egg').Controller;

class ProxyPoolController extends Controller {

  /**
     * 保存代理
     */
  async saveProxy() {
    const { ctx } = this;
    ctx.body = await ctx.service.proxyPool.saveProxyPool(ctx.request.body);
  }

  /**
     * 查看代理
     */
  async viewProxy() {
    const { ctx } = this;
    ctx.body = await ctx.service.proxyPool.viewProxyPool();
  }
}

module.exports = ProxyPoolController;
