'use strict';

const mongodb = require('../utils/mongodb');

// 任务
const TaskSchema = mongodb.Schema({
  name: String, // 任务名称
  keyword: String, // 任务关键字
  type: Number, // 任务爬取类型
  maxRequest: Number, // 最大请求数
  deep: Number, // 爬取深度
  forceWhitelist: Boolean, // 是否强制采用白名单
  whitelist: String, // 白名单
  blacklist: String, // 黑名单
  proxyPool: Boolean, // 是否使用系统代理
  proxy: Boolean, // 是否使用代理
  oneProcess: Boolean, // 是否一个关键字一个进程
  ipProxy: String, // ip代理
  pid: String, // 进程ID
});

// 任务爬取记录
const TaskKeywordSchema = mongodb.Schema({
  keyword: { type: [ String ], index: true }, // 关键字
  taskId: String, // 任务id
});

// 任务日志
const TaskLogSchema = mongodb.Schema({
  content: String,
  level: String,
  taskId: String,
  time: String,
});


// 任务所有进程
const TaskPidsSchema = mongodb.Schema({
  pid: String,
});

module.exports = {
  TaskSchema,
  TaskKeywordSchema,
  TaskLogSchema,
  TaskPidsSchema,
};
