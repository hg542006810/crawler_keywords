'use strict';

const Redis = require('ioredis');
const { redisPort, redisPassword, redisHost, redisFamily, redisDb } = require('../../config/db');

// 连接redis
const redis = new Redis({
  port: redisPort,
  host: redisHost,
  password: redisPassword,
  family: redisFamily,
  db: redisDb,
});

// 获得任务对应的redis key
const getTaskKey = id => {
  return `TASK:${id}`;
};

module.exports = {
  redis,
  getTaskKey,
};
