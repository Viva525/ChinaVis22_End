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
