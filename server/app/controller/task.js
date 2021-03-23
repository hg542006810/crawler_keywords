'use strict';

const Controller = require('egg').Controller;

class TaskController extends Controller {

  /**
     * 查看所有任务
     */
  async viewTasks() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.viewTasks();
  }

  /**
     * 删除任务
     */
  async delTask() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.delTask(ctx.params.id);
  }

  /**
     * 添加任务
     */
  async addTask() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.addTask(ctx.request.body);
  }

  /**
     * 编辑任务
     */
  async editTask() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.editTask(ctx.request.body);
  }

  /**
     * 开启任务
     */
  async startTask() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.startTask(ctx.params.id);
  }

  /**
     * 停止任务
     */
  async stopTask() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.stopTask(ctx.params.id);
  }

  /**
     * 获取爬取记录
     */
  async getKeywords() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.getKeywords(ctx.params.id);
  }

  /**
     * 获得爬取日志
     */
  async getLogs() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.getLogs(ctx.params.id);
  }

  /**
   * 导出数据
   */
  async exportData() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.exportData(ctx.params.id);
  }

  /**
   * 合并导出
   */
  async mergeExport() {
    const { ctx } = this;
    ctx.body = await ctx.service.task.mergeExport(ctx.request.body);
  }
}

module.exports = TaskController;
