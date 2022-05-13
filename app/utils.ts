//Edeg Clean
export const edgeClean = (edge: any) => {
  edge.source = edge.start;
  edge.target = edge.end;
  edge.weight = edge.properties.weight;
  edge.start = undefined;
  edge.end = undefined;
  edge.properties = undefined;
  return edge;
};

//Node Clean
export const nodeClean = (node: any) => {
  node.id = node.identity;
  node.group = node.labels[0];
  node.weight = node.properties.weight;
  node.properties.weight = undefined;
  node.identity = undefined;
  node.labels = undefined;
  return node;
};

// connect db
export const connectDB = (_this: any) => {
  const neo4j = require('neo4j-driver');
  const db_config = _this.config.neo4j;
  // 连接数据库
  const driver = neo4j.driver(
    db_config.url,
    neo4j.auth.basic(db_config.username, db_config.password),
    {
      maxTransactionRetryTime: 30000,
      disableLosslessIntegers: true,
    }
  );
  return driver;
};
