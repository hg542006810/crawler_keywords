import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  title: '爬取关键字',
  routes: [
    { path: '/', component: '@/pages/task' },
  ],
  devServer: {
    port: 7000
  },
  locale: {
    default: 'zh-CN'
  },
  proxy: {
    '/api/': {
      target: 'http://localhost:7001',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  }
});
