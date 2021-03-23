'use strict';

const Service = require('egg').Service;
const { isEmpty, getTaskStatus } = require('../utils/utils');
const mongodb = require('../utils/mongodb');
const { startProcess } = require('./../crawler/server');
const { TaskSchema, TaskLogSchema, TaskKeywordSchema, TaskPidsSchema } = require('./../schema/task');
const { getSuccessResponse, getErrorResponse } = require('../model/response');
const string2fileStream = require('string-to-file-stream');
const isArray = require('lodash/isArray');
const uniq = require('lodash/uniq');
const flattenDeep = require('lodash/flattenDeep');

const TaskModel = mongodb.model('tasks', TaskSchema, 'tasks');

/**
 * 任务 Service
 */
class Task extends Service {

  /**
   * 查看任务列表
   */
  async viewTasks() {
    const tasks = await TaskModel.find().lean().exec();
    for (const task of tasks) {
      task.status = await getTaskStatus(task);
      // 获得关键字数量
      task.count = await mongodb.model(`task_keyword_${task._id}`, TaskKeywordSchema, `task_keyword_${task._id}`).countDocuments({}).exec();
    }
    return getSuccessResponse('', tasks);
  }

  /**
   * 删除任务
   * @param id
   */
  async delTask(id) {
    if (!mongodb.isValidObjectId(id)) {
      return getErrorResponse('任务不存在!');
    }
    const task = await TaskModel.findOne({ _id: id });
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    // 删除任务
    await TaskModel.deleteMany({ _id: id });
    // 删除mongodb里对应的爬取记录集合
    await mongodb.connection.dropCollection(`task_keyword_${id}`);
    // 删除mongodb里对应的爬取日志集合
    await mongodb.connection.dropCollection(`task_log_${id}`);
    // 清空进程
    this.clearProcess(task);
    return getSuccessResponse();
  }

  /**
   * 添加任务
   */
  async addTask(params) {
    // 表单数据校验
    if (isEmpty(
      params.keyword,
      params.type,
      params.maxRequest,
      params.deep,
      params.forceWhitelist,
      params.proxy
    )) {
      return getErrorResponse('请填写必要信息!');
    }
    // 保存到数据库
    const task = await TaskModel.create({
      ...params,
      ipProxy: params.ipProxy ? JSON.stringify(params.ipProxy) : '',
    });
    if (isEmpty(task)) {
      return getErrorResponse('保存任务失败!');
    }
    // 创建任务对应的爬取记录表
    await mongodb.connection.createCollection(`task_keyword_${task._id}`);
    // 创建任务对应的爬取日志表
    await mongodb.connection.createCollection(`task_log_${task._id}`);
    return getSuccessResponse();
  }

  /**
   * 编辑任务
   */
  async editTask(params) {
    // 表单数据校验
    if (isEmpty(
      params.id,
      params.keyword,
      params.type,
      params.maxRequest,
      params.deep,
      params.forceWhitelist,
      params.proxy
    )) {
      return getErrorResponse('请填写必要信息!');
    }
    const task = await TaskModel.findOne({ _id: params.id });
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    // 编辑任务
    await TaskModel.update({ _id: params.id }, {
      ...params,
      ipProxy: params.ipProxy ? JSON.stringify(params.ipProxy) : '',
    });
    // 清空mongodb里对应的爬取记录集合
    await mongodb.model(`task_keyword_${params.id}`, TaskKeywordSchema, `task_keyword_${params.id}`).deleteMany({});
    // 清空mongodb里对应的爬取日志集合
    await mongodb.model(`task_log_${params.id}`, TaskLogSchema, `task_log_${params.id}`).deleteMany({});
    // 清空进程
    this.clearProcess(task);
    return getSuccessResponse();
  }

  /**
   * 开启任务
   */
  async startTask(id) {
    if (!mongodb.isValidObjectId(id)) {
      return getErrorResponse('任务不存在!');
    }
    const task = await TaskModel.findOne({ _id: id }).lean().exec();
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    // 如果是一个关键词一个进程 则循环开启进程
    if (task.oneProcess) {
      task.keyword.split(',').forEach(text => {
        const taskItem = {
          ...task,
          keyword: text,
        };
        startProcess(JSON.stringify(taskItem));
      });
    } else {
      startProcess(JSON.stringify(task));
    }
    return getSuccessResponse();
  }

  /**
   * 停止任务
   * @param id
   */
  async stopTask(id) {
    if (!mongodb.isValidObjectId(id)) {
      return getErrorResponse('任务不存在!');
    }
    const task = await TaskModel.findOne({ _id: id });
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    // 清空进程
    this.clearProcess(task);
    return getSuccessResponse();
  }

  /**
   * 获取爬取记录
   * @param id
   */
  async getKeywords(id) {
    if (!mongodb.isValidObjectId(id)) {
      return getErrorResponse('任务不存在!');
    }
    const task = await TaskModel.findOne({ _id: id });
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    const list = await mongodb.model(`task_keyword_${id}`, TaskKeywordSchema, `task_keyword_${id}`).find({}).sort({ _id: -1 })
      .lean()
      .exec();
    return getSuccessResponse('', list);
  }

  /**
   * 获取日志记录
   * @param id
   */
  async getLogs(id) {
    if (!mongodb.isValidObjectId(id)) {
      return getErrorResponse('任务不存在!');
    }
    const task = await TaskModel.findOne({ _id: id });
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    const model = mongodb.model(`task_log_${id}`, TaskLogSchema, `task_log_${id}`);
    const list = await model.find({}).sort({ _id: -1 })
      .lean()
      .exec();
    return getSuccessResponse('', list);
  }

  // 导出数据
  async exportData(id) {
    if (!mongodb.isValidObjectId(id)) {
      return getErrorResponse('任务不存在!');
    }
    const task = await TaskModel.findOne({ _id: id });
    if (isEmpty(task)) {
      return getErrorResponse('任务不存在!');
    }
    const list = await mongodb.model(`task_keyword_${id}`, TaskKeywordSchema, `task_keyword_${id}`).find({}).sort({ _id: -1 })
      .lean()
      .exec();
    const keywords = list.map(item => item.keyword).join('\r');
    const data = string2fileStream(keywords);
    return data;
  }

  // 合并导出
  async mergeExport(params) {
    // 表单数据校验
    if (isEmpty(
      params.ids
    ) && isArray(params.ids)) {
      return getErrorResponse('请填写必要信息!');
    }
    let keywords = [];
    for (const id of params.ids) {
      const list = await mongodb.model(`task_keyword_${id}`, TaskKeywordSchema, `task_keyword_${id}`).find({}).sort({ _id: -1 })
        .lean()
        .exec();
      keywords = keywords.concat(list.map(item => item.keyword));
    }
    // 递归为一位数组
    keywords = flattenDeep(keywords);
    // 去重后返回
    const data = string2fileStream(uniq(keywords).join('\r'));
    return data;
  }

  // 清空进程
  async clearProcess(task) {
    const status = await getTaskStatus(task);
    // 开启才能清空进程
    if (status === 'enabled') {
    // 单进程
      if (!task.oneProcess) {
      // 清楚进程id
        TaskModel.updateMany({ _id: task._id }, { pid: '' }, () => {});
        // 关闭进程
        try {
          process.kill(task.pid);
        } catch (err) {
          console.log(`进程${task.pid}不存在!`);
        }
      } else {
      // 一个字一个进程
        const pidsModel = mongodb.model(`task_pids_${task._id}`, TaskPidsSchema, `task_pids_${task._id}`);
        const pids = await pidsModel.find({}).lean().exec();
        // 只要有一个进程开启就代表开启
        for (const pidItem of pids) {
          try {
            process.kill(pidItem.pid);
          } catch (err) {
            console.log(`进程${pidItem.pid}不存在!`);
            continue;
          }
        }
        // 关闭多进程
        await mongodb.connection.dropCollection(`task_pids_${task._id}`);
      }
    }
  }
}

module.exports = Task;
