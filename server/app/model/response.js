'use strict';

class Response {

  constructor(success, message, data) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

// 获得成功的结果集
const getSuccessResponse = (message, data) => {
  return new Response(true, message || '', data || null);
};

// 获得错误的结果集
const getErrorResponse = (message, data) => {
  return new Response(false, message || '', data || null);
};

module.exports = {
  getErrorResponse,
  getSuccessResponse,
};
