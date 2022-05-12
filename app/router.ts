import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  const paramsConvert = app.middleware.paramsConvert();
  router.post('/getNode', controller.node.getNodeById);
  router.post('/getNetworkByLimit', controller.network.getNetworkByCommunity);
  router.post('/getNetworkByParams', paramsConvert, controller.network.getNetworkByParams);
};
