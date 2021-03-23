// 非空校验
'use strict';
const pidusage = require('pidusage');
const { TaskPidsSchema } = require('./../schema/task');
const mongodb = require('../utils/mongodb');

const isEmpty = (...args) => {
  let flag = false;
  for (const str of args) {
    if (str === undefined || str === null || str === '') {
      flag = true;
      break;
    }
  }
  return flag;
};

// 获得任务状态
const getTaskStatus = async task => {
  let status = 'disabled';
  if (!task.oneProcess) {
    // 不是一个字一个进程
    if (!isEmpty(task.pid)) {
      // 没有进程 代表没开启
      // 获得进程状态
      try {
        await pidusage(task.pid);
        status = 'enabled';
      } catch (err) {
        console.log(`进程${task.pid}不存在!`);
      }
    }
  } else {
    // 一个字一个进程
    const pidsModel = mongodb.model(`task_pids_${task._id}`, TaskPidsSchema, `task_pids_${task._id}`);
    const pids = await pidsModel.find({}).lean().exec();
    // 只要有一个进程开启就代表开启
    for (const pidItem of pids) {
      try {
        await pidusage(pidItem.pid);
        status = 'enabled';
        break;
      } catch (err) {
        console.log(`进程${pidItem.pid}不存在!`);
        continue;
      }
    }
  }
  return status;
};

module.exports = {
  isEmpty,
  getTaskStatus,
};
