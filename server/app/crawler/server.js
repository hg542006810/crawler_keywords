'use strict';

const childProcess = require('child_process');
const path = require('path');

// 开启服务
const startProcess = task => {
  // 创建工作进程
  const worker = childProcess.fork(path.join(__dirname, './worker.js'));
  worker.send(task);

  worker.on('message', msg => {
    console.log('[Master] Received message from worker: ' + msg);
    worker.kill();
  });
};

module.exports = { startProcess };
