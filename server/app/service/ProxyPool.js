'use strict';

const Service = require('egg').Service;
const mongodb = require('../utils/mongodb');
const { ProxyPoolSchema } = require('./../schema/proxyPool');
const { getErrorResponse, getSuccessResponse } = require('../model/response');
const { isEmpty } = require('../utils/utils');

const ProxyPoolModel = mongodb.model('proxy_pool', ProxyPoolSchema, 'proxy_pool');

/**
 * 代理池 Service
 */
class ProxyPool extends Service {

  /**
     * 查看代理池
     */
  async viewProxyPool() {
    const proxyPool = await ProxyPoolModel.find().lean().exec();
    return getSuccessResponse('', proxyPool);
  }


  /**
     * 保存代理池
     */
  async saveProxyPool({ ipProxy }) {
    if (isEmpty(ipProxy)) {
      return getErrorResponse('请填写必要信息!');
    }
    // 先清空
    await ProxyPoolModel.deleteMany({});
    await ProxyPoolModel.create(ipProxy);
    return getSuccessResponse();
  }
}

module.exports = ProxyPool;
