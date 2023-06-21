import animateCombineNodes from "./AnimateCombineNodes";

const combineNodes = ({
  chart,
  nodes,
  links,
  node1,
  node2,
}: CombineNodesParams) => {
  // 새 노드 생성
  const newNode: ChartNode = {
    id: node2.id,
    name: node2.name,
    x: node2.x,
    y: node2.y,
    symbolSize: node1.symbolSize + node2.symbolSize,
    category: node2.category,
  };

  // 애니메이션 시작
  animateCombineNodes(chart, nodes, links, node1, node2, newNode, 1000); // 1000ms duration

  return 1;
};

export default combineNodes;
