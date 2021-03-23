'use strict';
const dayjs = require('dayjs');
const mongodb = require('../utils/mongodb');
const { getTaskStatus } = require('../utils/utils');
const { TaskKeywordSchema, TaskLogSchema } = require('../schema/task');
const compact = require('lodash/compact');

// 是否允许写入结果集
const writeResult = async ({ text, task, deep }) => {
  // 获得关键字model
  const keywordModel = mongodb.model(`task_keyword_${task._id}`, TaskKeywordSchema, `task_keyword_${task._id}`);
  // 获得model
  const model = mongodb.model(`task_keyword_${task._id}`, TaskKeywordSchema, `task_keyword_${task._id}`);
  const isExist = await model.findOne({ keyword: text });
  const { forceWhitelist, blacklist, whitelist } = task;
  // 如果当前爬取的是用户设置的关键字
  const isSetKeyword = compact(task.keyword.split(',')).find(item => item === text);
  // 防止重复
  if (
    (!isExist && // 不重复
      deep <= task.deep && // 低于深度
      (
    // 不强制采用白名单
        (
          !forceWhitelist && compact(blacklist.split(',')).findIndex(item => text.includes(item)) === -1 || // 关键字不包含黑名单中的字符
              (
                compact(blacklist.split(',')).findIndex(item => text.includes(item)) !== -1 && // 关键字在黑名单中 但是同时也在白名单中 则继续爬取 因白名单 > 黑名单
                compact(whitelist.split(',')).findIndex(item => text.includes(item)) !== -1
              )
        ) ||
          // 采用白名单
          (
            forceWhitelist &&
            compact(whitelist.split(',')).findIndex(item => text.includes(item)) !== -1
          )
      )) || isSetKeyword // 如果是关键字直接通过
  ) {
    // 关键字允许重头开始爬 只在入库的时候做效验
    if (isSetKeyword) {
      if (!isExist) {
        keywordModel.create({ keyword: text, taskId: task._id });
      }
    } else {
      keywordModel.create({ keyword: text, taskId: task._id });
    }
    return true;
  }
  return false;
};

// 获得当前使用的代理
const getProxy = proxy => {
  // 如果有正在使用的代理 则优先级最高
  let currentProxyIndex = proxy.findIndex(item => item.currentConnection !== 0);
  if (currentProxyIndex === -1) {
    // 没有使用的代理 则从0开始
    currentProxyIndex = 0;
  }
  // 当前连接数
  const currentConnection = proxy[currentProxyIndex].currentConnection;
  // 最大连接数
  const maxConnection = Number(proxy[currentProxyIndex].maxConnection);
  if (currentConnection !== undefined) {
    // 如果当前下一次连接数大于最大连接数
    if (currentConnection + 1 > maxConnection) {
      // 选用下一个代理
      // 重置当前代理连接数
      proxy[currentProxyIndex].currentConnection = 0;
      // 找到下一个代理
      // 如果是最后一个代理 则直接返回第1个代理 从头开始循环
      if (proxy.length - 1 === currentProxyIndex) {
        proxy[0].currentConnection = 1;
        return proxy[0];
      }
      // 不是最后一个代理 则直接获取下一个代理
      proxy[currentProxyIndex + 1].currentConnection = 1;
      return proxy[currentProxyIndex + 1];

    }
    // 在连接数之内 当前连接数 + 1
    proxy[currentProxyIndex].currentConnection += 1;
    return proxy[currentProxyIndex];

  }
  return proxy[currentProxyIndex];
};

//  写入日志
const writeLog = async ({ content, task, level = 'info' }) => {
  const model = mongodb.model(`task_log_${task._id}`, TaskLogSchema, `task_log_${task._id}`);
  model.create({
    content,
    level,
    taskId: task._id,
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  });
  const list = await model.find({})
    .lean()
    .exec();
  if (await getTaskStatus(task) === 'enabled') {
    // 日志太多按时清除
    if (list.length > 1000) {
      await model.deleteMany({});
    }
  }
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  getProxy,
  writeResult,
  writeLog,
  wait,
}
;
