'use strict';

// mongodb配置
const mongodbHost = '127.0.0.1';
const mongodbPort = 27017;
const mongodbDatabase = 'crawler_keywords';
const mongodbUserName = '';
const mongodbPassword = '';

// redis配置 可不填
const redisPort = 6379;
const redisHost = '';
const redisPassword = '';
const redisFamily = 4;
const redisDb = 11;

module.exports = {
  mongodbDatabase,
  mongodbHost,
  mongodbPassword,
  mongodbPort,
  mongodbUserName,
  redisDb,
  redisFamily,
  redisHost,
  redisPassword,
  redisPort,
};

