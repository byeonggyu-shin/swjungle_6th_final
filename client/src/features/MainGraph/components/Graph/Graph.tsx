import React, { useEffect, useRef, useState, useCallback } from "react";
// recoil
import { useRecoilState } from "recoil";
import { DashBoardCardAtom, NodeNameAtom } from "@/recoil/atoms/MainGraphAtom";
// library
import * as echarts from "echarts";
// type
import { Main_graph_Api_DTO } from "@/types/dashborad.types";

import handleNodeLongClick from "@/features/MainGraph/components/OnClickEvent/MouseDown";
import handleNodeUnclick from "@/features/MainGraph/components/OnClickEvent/MouseUp";

type MainGraphProps = {
  data: Main_graph_Api_DTO;
};

function Graph({ data: graph }: MainGraphProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [lastClickedNode, setLastClickedNode] = useState<string>("");
  const [openCard, setOpenCard] = useRecoilState(DashBoardCardAtom);
  const [nodeName, setNodeName] = useRecoilState(NodeNameAtom);
  const pressTimer = useRef<any>(null);
  const longPressNode = useRef<string | null>(null);

  //  카테고리 빈 객체 생성
  const setCategories = (cnt: number) => {
    const categories = [];
    for (let i = 0; i < cnt; i++) {
      const obj = {};
      categories.push(obj);
    }
    return categories;
  };

  const [options, setOptions] = useState<any>({
    tooltip: {},
    animationDuration: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        type: "graph",
        layout: "force",
        data: graph?.nodes,
        links: graph?.links,
        categories: setCategories(graph?.cnt),
        roam: false,
        label: {
          show: true, // 노드 이름 항상 표시
          position: "inside", // 레이블을 위로 정렬
          fontSize: 12,
          formatter: "{b}",
        },
        lineStyle: {
          width: 2, // edge의 두께
          color: "source",
          curveness: 0.1, // edge의 곡률, 0은 직선
        },
        emphasis: {
          focus: "adjacency",
          lineStyle: {
            width: 5,
          },
        },
        force: {
          repulsion: 100, // 노드 간 반발력 조정
          gravity: 0.1, // 중력
          edgeLength: [100, 500], // 노드 간 거리
          initLayout: "none",
        },
      },
    ],
  });

  const handleNodeClick = useCallback(
    (nodeName: string) => {
      // 이전에 클릭된 노드인지 확인
      const isLastClickedNode = lastClickedNode === nodeName;
      setLastClickedNode(nodeName);
      // 클릭된 노드 상태 업데이트
      if (isLastClickedNode) {
        setOpenCard(!openCard);
      } else {
        setOpenCard(true);
        setNodeName(nodeName);
      }
    },
    [lastClickedNode, openCard]
  );

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      graph.nodes.forEach((node: any) => {
        node.label = {
          show: node.symbolSize >= 15,
        };
      });

      chart.setOption(options);

      // 마우스 오래 클릭시 태그 병합
      const handleMouseDown = (params: any) => {
        chart.getZr().off("mouseup", handleNodeUnclick(pressTimer));
        handleNodeLongClick(params, chart, longPressNode, pressTimer);
        chart.getZr().on("mouseup", handleNodeUnclick(pressTimer));
      };

      chart.getZr().on("mousedown", handleMouseDown);
      chart.getZr().on("mouseup", handleNodeUnclick(pressTimer));

      const clickHandler = function (params: any) {
        if (params.dataType === "node" && !pressTimer.current) {
          handleNodeClick(params.name as string);
        }
      };

      chart.on("click", clickHandler);
      // Cleanup function
      return () => {
        chart.off("click", clickHandler);
        chart.getZr().off("mousedown", handleMouseDown);
      };
    }
  }, [options, handleNodeClick]);

  // Add a new useEffect for resizing
  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.getInstanceByDom(chartRef.current);
      if (chart) {
        chart.resize();
      }
    }
  }, [nodeName, openCard]);

  return (
    <div
      className={openCard ? "w-2/3 h-screen flex" : "w-full h-screen flex"}
      ref={chartRef}
    ></div>
  );
}

export default Graph;
