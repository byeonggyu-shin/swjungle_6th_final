import '../dotenv.js';
import { db } from '../connect.js';
import { logger } from '../winston/logger.js';
import { graphCountQuery, graphDirectionQuery } from '../db/graphQueries.js';


export function cycleCount(connections, nodes) {
  let count = -1;
  const visited = new Set();
  const groups = new Map();

  for (const node of nodes) {
    if (!visited.has(node)) {
      const groupNum = count + 1;
      DFS(connections, node, visited, groupNum, groups);
      count++;
    }
  }
  // 묶음 번호 리스트 생성
  const groupList = nodes.map((node) => groups.get(node));
  return groupList;
}



export function DFS(connections, node, visited, groupNum, groups) {
  visited.add(node);
  groups.set(node, groupNum);

  const neighbors = connections.find((item) => item.node === node).neighbors;
  if (neighbors.length > 0) {
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        DFS(connections, neighbor, visited, groupNum, groups);
      }
    }
  }
}



export const getGraphData = async (userId) => {
  let connection = null;
  try {
    connection = await db.getConnection();
    logger.info(
      `/routes/graphs 폴더, get, userId : ${userId} has been logged in!`,
    );

    const [graphCountResult] = await connection.query(graphCountQuery(userId));

    /* get Max size */
    let maxSymbolSize = 0;
    for (let i = 0; i < graphCountResult.length; i++) {
      const symbolSize = graphCountResult[i].symbolSize;
      maxSymbolSize = symbolSize > maxSymbolSize ? symbolSize : maxSymbolSize;
    }
    /* 심볼사이즈 정규화 */
    for (let i = 0; i < graphCountResult.length; i++) {
      const symbolSize = graphCountResult[i].symbolSize;
      // const newSymbolSize = (symbolSize / maxSymbolSize) * 70;
      const newSymbolSize = (Math.log(symbolSize + 1) / Math.log(maxSymbolSize + 1)) * 70;
      graphCountResult[i].symbolSize = newSymbolSize;
    }

    const [graphDirectionResult] = await connection.query(
      graphDirectionQuery(userId),
    );

    let graph = {
      nodes: graphCountResult,
      links: sortDirection(graphDirectionResult),
    };

    //source와 target 중복 값 제거
    // graph.links = graph.links.filter((link) => link.source !== link.target)

    // graph.category
    const idList = graph.nodes.map((node) => node.id);
    const graphLinks = graph.links.map((link) => [link.source, link.target]);
    const connections = idList.map((node) => ({ node, neighbors: [] }));
    for (const edge of graphLinks) {
      const [a, b] = edge;
      const nodeA = connections.find((item) => item.node === a);
      const nodeB = connections.find((item) => item.node === b);
      nodeA.neighbors.push(b);
      nodeB.neighbors.push(a);
    }
    const categoryList = cycleCount(connections, idList);
    graph.nodes.forEach((node, index) => {
      node.category = categoryList[index];
    });

    // graph.cnt  
    let maxCategory = -Infinity;
    for (const node of graph.nodes) {
      if (node.category > maxCategory) {
        maxCategory = node.category;
      }
    }
    graph.cnt = maxCategory;

    return graph;
  } catch (err) {
    connection?.release();
    logger.error('/routes/graphs 폴더, get, err : ', err);
    throw new Error('Internal Server Error');
  }
};



const getCombination = (arr, result) => {
  for (let i = 0; i < arr.length; i++) {   // 각 node
    for (let j = i + 1; j < arr.length; j++) {
      result.push({ source: arr[i].toString(), target: arr[j].toString() });
    }
  }
  return result;
};

const compareObjects = (obj1, obj2) => {
  return (
    (obj1.source === obj2.target && obj1.target === obj2.source) ||
    (obj1.source === obj2.source && obj1.target === obj2.target)
  );
};


const sortDirection = (graphDirectionResult) => {
  const fileAndNode = graphDirectionResult;
  // console.log('fr: fileAndNode: ', fileAndNode);
  const output = [];

  const groupedNodes = fileAndNode.reduce((acc, { file, node }) => {
    if (!acc[file]) {
      acc[file] = [node];
    } else {
      acc[file].push(node);
    }
    return acc;
  }, {});

  for (const file in groupedNodes) {    // 한 file = '6': [50, 51, 52]
    const nodes = groupedNodes[file];   // nodes = [50, 51, 52]  
    if (nodes.length > 1) {
      getCombination(nodes, output);
    }
  }

  const uniqueList = output.filter((obj, index, self) => {
    return index === self.findIndex((o) => compareObjects(o, obj));
  });
  return uniqueList;
};