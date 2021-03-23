'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/task', controller.task.viewTasks);
  router.delete('/task/:id', controller.task.delTask);
  router.put('/task', controller.task.editTask);
  router.post('/task', controller.task.addTask);

  router.post('/task/start/:id', controller.task.startTask);
  router.post('/task/stop/:id', controller.task.stopTask);
  router.post('/task/export/:id', controller.task.exportData);
  router.post('/task/mergeExport', controller.task.mergeExport);

  router.get('/task/keywords/:id', controller.task.getKeywords);
  router.get('/task/logs/:id', controller.task.getLogs);

  router.get('/proxyPool', controller.proxyPool.viewProxy);
  router.post('/proxyPool', controller.proxyPool.saveProxy);
};
