'use strict';

const mongodb = require('../utils/mongodb');

// 代理池
const ProxyPoolSchema = mongodb.Schema({
  username: String,
  password: String,
  ip: String,
  port: Number,
  maxConnection: Number,
});

module.exports = {
  ProxyPoolSchema,
};

