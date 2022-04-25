import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {
    neo4j: {
      url: 'bolt://localhost',
      username: 'neo4j',
      password: 'chinavis'
    },
    security : {
      // 关闭 csrf
      csrf: {
        enable: false,
      },
       // 跨域白名单
      domainWhiteList: [ 'http://localhost:3000' ],
    },
    cors : {
      origin: '*',
      allowMethods: 'GET, PUT, POST, DELETE, PATCH'
    }
  } as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1649923470614_1173';

  // add your egg config in here
  config.middleware = [];

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
