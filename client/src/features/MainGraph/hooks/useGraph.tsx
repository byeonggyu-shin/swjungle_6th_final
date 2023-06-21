import React, { useState, useEffect } from "react";
import { Main_graph_Api } from "@/axios/dashBoardApi";
import { Main_graph_Api_DTO } from "@/types/dashborad.types";

function useGraph() {
  const [data, setData] = useState<Main_graph_Api_DTO | undefined>(undefined);

  useEffect(() => {
    const getGraphData = async () => {
      const graphData = await Main_graph_Api();
      setData(graphData);
    };
    getGraphData();
  }, []);

  return data;
}

export default useGraph;
