import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  const paramsConvert = app.middleware.paramsConvert();
  router.post('/getNode', controller.node.getNodeById);
  // router.post('/getNetworkByLimit', controller.network.getNetworkByCommunity);
  router.post(
    '/getNetworkByParams',
    paramsConvert,
    controller.network.getNetworkByParams,
  );
  router.post(
    '/getFilterNetworkByCommunities',
    controller.network.getFilterNetworkByCommunities,
  );
  router.post('/getAllCommunities', controller.network.getAllCommunities);
  router.post('/recommand', controller.node.recommand);
  router.post('/getLinksBT2Nodes', controller.link.getLinksBT2Nodes);
  router.post(
    '/getAllCommuntiesScatter',
    controller.node.getAllCommuntiesScatter,
  );
  router.post('/getCommunitiesInfo', controller.network.getCommunitiesInfo);
  router.post('/getCurrNeighbours', controller.network.getCurrNeighbours);
  router.post('/getCurrRects', controller.network.getCurrRects);
};
