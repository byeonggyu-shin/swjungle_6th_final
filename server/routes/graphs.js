import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';
import { graphCountQuery, graphDirectionQuery } from '../db/graphQueries.js';
// import Redis from 'ioredis';
// const redis = new Redis();

function cycleCount(connections, nodes) {
  let count = 0;
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

function DFS(connections, node, visited, groupNum, groups) {
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

const router = express.Router();


router.get('/', async (req, res) => {
  /* 로그인 유저*/
  const { user } = res.locals;
  const userId = user.user_id;
  /* 다른 유저 */
  const otherUserId = req.query.userId;
  console.log(otherUserId);

  try {
    /* 다른 유저 그래프 조회 */
    if (otherUserId) {
      const graphData = await getGraphData(otherUserId);
      return res.send(graphData);
    }
    /* 기본 내 그래프 조회 */
    const graphData = await getGraphData(userId);
    res.send(graphData);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error'); // Send error response
  }
});


const getGraphData = async (userId) => {

  let connection = null;
  try {
    connection = await db.getConnection();
    console.log(`userId : ${userId} has been logged in!`);

    const [ graphCountResult ] = await connection.query(graphCountQuery(userId));
    const [ graphDirectionResult ] = await connection.query(graphDirectionQuery(userId));
    
    let graph = {
      nodes: graphCountResult,
      links: sortDirection(graphDirectionResult),
    };
    //source와 target 중복 값 제거
    graph.links = graph.links.filter(link => link.source !== link.target);
    
    // graph.category
    const idList = graph.nodes.map(node => node.id);
    const graphLinks = graph.links.map(link => [link.source,link.target]);
    const connections = idList.map(node => ({ node, neighbors: [] }));
    for (const edge of graphLinks) {
      const [a, b] = edge;
      const nodeA = connections.find(item => item.node === a);
      const nodeB = connections.find(item => item.node === b);
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

    // redis.set(`graphUser:${userId}`, JSON.stringify(graph), 'EX', 3600);

    return graph;  
  } catch (err) {
    connection?.release();
    console.log(err);
    throw new Error('Internal Server Error');
  }
};


const sortDirection = (graphDirectionResult) => {
  const fileAndNode = graphDirectionResult;
  const output = [];
  const groupedNodes = fileAndNode.reduce((acc, { file, node }) => {
    if (!acc[file]) {
      acc[file] = [node];
    } else {
      acc[file].push(node);
    }
    return acc;
  }, {});

  for (const file in groupedNodes) {
    const nodes = groupedNodes[file];
    if (nodes.length > 1) {
      output.push({ source: nodes[0].toString(), target: nodes[1].toString() });
    }
  }

  const compareObjects = (obj1, obj2) => {
    return (
      (obj1.source === obj2.target && obj1.target === obj2.source) ||
      (obj1.source === obj2.source && obj1.target === obj2.target)
    );
  };
  
  const uniqueList = output.filter((obj, index, self) => {
    return index === self.findIndex((o) => compareObjects(o, obj));
  });
  
  return uniqueList;
};


export default router;