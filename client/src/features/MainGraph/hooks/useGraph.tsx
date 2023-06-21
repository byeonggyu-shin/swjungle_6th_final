// import React, { useState, useEffect } from "react";
// import { Main_graph_Api } from "@/axios/dashBoardApi";
// import { Main_graph_Api_DTO } from "@/types/dashborad.types";

// function useGraph(userid?: string) {
//   const [data, setData] = useState<Main_graph_Api_DTO | undefined>(undefined);

//   useEffect(() => {
//     const getGraphData = async (userid?: string) => {
//       const graphData = await Main_graph_Api(userid);

//       setData(graphData);
//     };
//     console.log("훅", userid);
//     getGraphData(userid);
//   }, []);

//   return data;
// }

// export default useGraph;

import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Main_graph_Api } from "@/axios/dashBoardApi";
import { Main_graph_Api_DTO } from "@/types/dashborad.types";

function useGraph() {
  const [data, setData] = useState<Main_graph_Api_DTO | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return; // if query values are not ready, return

    const getGraphData = async () => {
      const graphData = await Main_graph_Api(router.query.userid);
      setData(graphData);
    };
    getGraphData();
  }, [router.isReady, router.query.userid]); // add dependencies

  return data;
}

export default useGraph;
