'use strict';

const mongodb = require('../utils/mongodb');
const last = require('lodash/last');
const { TaskPidsSchema } = require('../schema/task');
const { ProxyPoolSchema } = require('../schema/proxyPool');
const { TaskSchema } = require('./../schema/task');
const userAgents = require('./userAgents');
// const RequestDecorator = require('./RequestDecorator');
const { writeResult, getProxy, writeLog } = require('./utils');

const isEmpty = require('lodash/isEmpty');
const cheerio = require('cheerio');
const superagent = require('superagent');
const Throttle = require('superagent-throttle');
require('superagent-proxy')(superagent);

/* const axios = require('axios');
axios.defaults.withCredentials = true; */

// 获得请求
const getRequest = async ({ url, params, type, task }) => {
  const userAgent = userAgents[parseInt(String(Math.random() * userAgents.length))];
  let currentProxy = '';
  let proxy = {
    ip: '',
    port: 0,
    maxConnection: 0,
    password: '',
    username: '',
  };
  if (task.proxy || task.proxyPool) {
    if (task.ipProxy.length === 0) {
      writeLog({ content: '开启了代理但是未设置代理数据，请设置!', task, level: 'error' });
      return '';
    }
    proxy = getProxy(task.ipProxy);
    currentProxy = isEmpty(proxy.username)
      ? `http://${proxy.ip}:${proxy.port}`
      : `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    writeLog({ content: `使用代理：${currentProxy}，当前使用次数：${proxy.currentConnection}`, task, level: 'info' });
  }
  let host = '';
  switch (type) {
    case 'baidu':
      host = 'www.baidu.com';
      break;
    case 'sogou':
      host = 'www.sogou.com';
      break;
    default:
      host = '';
      break;
  }
  // 请求限制配置
  const throttle = new Throttle({
    active: true,
    rate: task.maxRequest,
    ratePer: 1000,
    concurrent: task.maxRequest,
  });
  return superagent.get(url)
    .use(throttle.plugin())
    .proxy(task.proxy || task.proxyPool ? currentProxy : null)
    .query(params)
    .set('User-Agent', userAgent)
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*!/!*;q=0.8,application/signed-exchange;v=b3;q=0.9')
    .set('Accept-Language', 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3')
    .set('Connection', 'keep-alive')
    .set('Host', host);
};


// 抓取百度关键词
const fetchBaiduKeywords = ({ text, deep = 0, task, url }) => {
  url = url || `http://m.baidu.com/s?word=${text}`;
  if (deep > task.deep) {
    console.log('爬取停止，爬取到最大深度了！');
    return;
  }

  const query = new URLSearchParams(url.substring(url.indexOf('?')), url.length);
  const params = {};
  for (const key of query.keys()) {
    params[key] = query.get(key);
  }
  writeLog({ content: `当前爬取的关键字：${text}，URL：${url}`, task, level: 'info' });
  writeResult({ text, deep, task }).then(result => {
    if (result) {
      // 爬取百度搜索
      getRequest({
        url: 'http://m.baidu.com/s',
        params,
        type: 'baidu',
        task,
      })
        .then(async result => {
          // 获得返回的数据
          const html = result.text;
          if (isEmpty(html)) {
            return;
          }
          if (
            html.indexOf('网络不给力，请稍后重试') !== -1 ||
                        html.indexOf('百度安全验证') !== -1
          ) {
            writeLog({ content: `请求被搜索引擎拦截：${url}`, task, level: 'error' });
            fetchBaiduKeywords({ text, deep, task, url });
            return;
          }
          writeLog({ content: `关键字：${text}爬取成功`, task, level: 'info' });
          const $ = cheerio.load(html, { decodeEntities: false });
          // 关键字
          const keywords = [];
          // 获得相关搜索
          $('.rw-list-container .rw-list-new').each(function() {
            const text = $(this).find('> a > span').text();
            if (!isEmpty(text)) {
              keywords.push({
                text,
                deep: deep++,
                task,
                url: $(this).find('> a').attr('href'),
              });
            }
          });
          // 获得其他人还在搜
          $('.c-gap-inner-top-small').each(function() {
            const text = $(this).find('> a > span').text();
            if (!isEmpty(text)) {
              keywords.push({
                text,
                deep: deep++,
                task,
                url: $(this).find('> a').attr('href'),
              });
            }
          });
          for (const keyword of keywords) {
            fetchBaiduKeywords(keyword);
          }
        })
        .catch(async err => {
          writeLog({ content: `发生了错误：${err}，状态码：${err.status}, url：${url}`, task, level: 'error' });
          // 重试
          fetchBaiduKeywords({ text, deep, task, url });
        });
    } else {
      writeLog({ content: `已不能再爬取 url：${url}?word=${text}`, task, level: 'info' });
    }
  });
};

// 抓取搜狗关键词
const fetchSoGouKeywords = ({ text, deep = 0, task, url }) => {
  url = url || `https://www.sogou.com/web?word=${text}`;
  if (deep > task.deep) {
    console.log('爬取停止，爬取到最大深度了！');
    return;
  }
  const query = new URLSearchParams(url.substring(url.indexOf('?')), url.length);
  const params = {};
  for (const key of query.keys()) {
    params[key] = query.get(key);
  }
  writeLog({ content: `当前爬取的关键字：${text}，URL：${url}`, task, level: 'info' });
  writeResult({ text, deep, task }).then(result => {
    if (result) {
      getRequest({
        url: 'https://www.sogou.com/web',
        params,
        type: 'sogou',
        task,
      })
        .then(async result => {
          // 获得返回的数据
          const html = result.text;
          if (isEmpty(html)) {
            return;
          }
          if (
            html.indexOf('用户您好，我们的系统检测到您网络中存在异常访问请求。') !== -1 ||
                        html.indexOf('verify_page') !== -1
          ) {
            writeLog({ content: `请求被搜索引擎拦截：${url}`, task, level: 'error' });
            fetchSoGouKeywords({ text, deep, task, url });
            return;
          }
          writeLog({ content: `关键字：${text}爬取成功`, task, level: 'info' });
          const $ = cheerio.load(html, { decodeEntities: false });
          const keywords = [];
          // 爬取相关搜索
          $('#hint_container td').each(function() {
            const text = $(this).find('> p > a').text();
            if (!isEmpty(text)) {
              keywords.push({
                text,
                deep: deep++,
                task,
                url: `https://www.sogou.com/web${$(this).attr('href')}`,
              });
            }
          });
          // 爬取其他人搜索
          $('.hint-mid > a').each(function() {
            const text = $(this).text();
            if (!isEmpty(text)) {
              keywords.push({
                text,
                deep: deep++,
                task,
                url: `https://www.sogou.com/web${$(this).attr('href')}`,
              });
            }
          });
          for (const keyword of keywords) {
            fetchSoGouKeywords(keyword);
          }
        })
        .catch(async err => {
          writeLog({ content: `发生了错误：${err}，状态码：${err.status}, url：${url}`, task, level: 'error' });
          // 重试
          fetchSoGouKeywords({ text, deep, task, url });
        });
    } else {
      writeLog({ content: `已不能再爬取 url：${url}?word=${text}`, task, level: 'info' });
    }
  });
};

// 爬虫主方法
const main = async task => {
  // 处理代理数据
  let ips = [];
  // 单独代理
  if (task.proxy) {
    ips = task.ipProxy ? JSON.parse(String(task.ipProxy)) : [];
  }
  // 系统代理
  if (task.proxyPool) {
    const ProxyPoolModel = mongodb.model('proxy_pool', ProxyPoolSchema, 'proxy_pool');
    ips = await ProxyPoolModel.find().lean().exec();
  }
  const proxy = [];
  ips.forEach(item => {
    if (item.ip.split('-').length === 1) {
      proxy.push({
        ...item,
        currentConnection: 0,
      });
      return;
    }
    const ip = item.ip.split('-')[0];
    const count = item.ip.split('-')[1];
    for (let i = last(ip.split('.')); i <= count; i++) {
      proxy.push({
        ...item,
        ip: `${ip.split('.')[0]}.${ip.split('.')[1]}.${ip.split('.')[2]}.${i}`,
        currentConnection: 0,
      });
    }
  });
  task.ipProxy = proxy;
  if (task.type === 0) {
    task.keyword.split(',').forEach(text => {
      fetchBaiduKeywords({ text, task });
    });
  }
  if (task.type === 1) {
    task.keyword.split(',').forEach(text => {
      fetchSoGouKeywords({ text, task });
    });
  }
};


process.on('message', task => {
  task = JSON.parse(task);
  console.log(`爬取任务：${task._id}进程开启，进程号为：${process.pid}`);

  const TaskModel = mongodb.model('tasks', TaskSchema, 'tasks');

  // 设置任务的进程id
  // 如果是一个关键字一个进程
  if (task.oneProcess) {
    TaskModel.updateMany({ _id: task._id }, { pid: '' }, () => {});
    const pidsModel = mongodb.model(`task_pids_${task._id}`, TaskPidsSchema, `task_pids_${task._id}`);
    pidsModel.create({ pid: process.pid });
  } else {
    TaskModel.updateMany({ _id: task._id }, { pid: process.pid }, () => {});
    task.pid = process.pid;
  }
  main(task);
});
