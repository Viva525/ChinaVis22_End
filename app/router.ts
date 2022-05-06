import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.post('/getNode', controller.node.getNodeById);
  router.post('/getNetworkByLimit', controller.network.getNetworkByCommunity);
};
