'use strict';

class AppBootHook {
  constructor(app) {
    this.app = app;
  }
  async serverDidReady() {
    // http / https server 已启动，开始接受外部请求
    // 此时可以从 app.server 拿到 server 的实例
    this.app.server.timeout = 0;
    this.app.server.keepAliveTimeout = 0;
  }
}

module.exports = AppBootHook;
