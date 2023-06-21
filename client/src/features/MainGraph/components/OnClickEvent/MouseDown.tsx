import { ECharts } from "echarts";
import combineNodes from "@/features/MainGraph/components/Interaction/CombineNode";
import { POST } from "@/axios/POST";
import getToken from "@/axios/getToken";

const handleNodeLongClick = (
  params: any,
  chart: ECharts,
  longPressNode: React.MutableRefObject<string | null>,
  pressTimer: React.MutableRefObject<any>
) => {
  if (!params.target) {
    return; // 빈 공간을 클릭한 경우 처리
  }

  const ecInnerKey = Object.keys(params.target).find((key) =>
    key.startsWith("__ec_inner_")
  );

  if (ecInnerKey && params.target[ecInnerKey].dataType === "node") {
    const dataIndex = params.target[ecInnerKey].dataIndex;

    pressTimer.current = setTimeout(() => {
      const nodesOption = (chart.getOption() as any).series[0].data as any[];
      const nodeId = nodesOption[dataIndex].id;
      const currentNode = nodesOption.find((node) => node.id === nodeId);

      if (longPressNode.current && longPressNode.current !== nodeId) {
        const prevNode = nodesOption.find(
          (node) => node.id === longPressNode.current
        );
        let success = 0;

        success = combineNodes({
          chart,
          nodes: nodesOption,
          links: (chart.getOption() as any).series[0].links as any[],
          node1: prevNode!,
          node2: currentNode!,
        });

        const POSTMerge = async () => {
          const token = getToken();
          const result = await POST(
            "tag/merge",
            { tagId1: currentNode.id, tagId2: prevNode.id },
            token
          );
          console.log(result);
        };

        if (success) {
          POSTMerge();
        }

        longPressNode.current = null; // 롱클릭된 노드 리셋
      } else {
        longPressNode.current = nodeId; // 롱클릭된 노드 저장

        currentNode!.itemStyle = {
          borderColor: "yellow",
          borderWidth: 5,
        };
        chart.setOption({ series: [{ data: nodesOption }] });
      }
    }, 2000); // 롱클릭의 기준: 2초
  }
};

export default handleNodeLongClick;
