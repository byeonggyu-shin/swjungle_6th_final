import { POST } from "@/axios/POST";
import combineNodes from "../Interaction/CombineNode";
import { ECharts } from "echarts";

const handleMerge = async (
  params: any,
  chart: ECharts,
  pressedNode: React.MutableRefObject<string | null>
) => {
  console.log("params:", params);
  if (!params.dataIndex) {
    console.log("empty");
    return;
  }
  const dataIndex = params.dataIndex;
  const nodesOption = (chart.getOption() as any).series[0].data as any[];
  const nodeId = nodesOption[dataIndex].id;
  const currentNode = nodesOption.find((node) => node.id === nodeId);

  pressedNode.current = nodeId;

  const tagToMerge = prompt("💡 어떤 태그에 병합하고 싶으신가요?"); // Get the name of the tag to merge with
  if (tagToMerge) {
    const tagNode = nodesOption.find((node) => node.name === tagToMerge);
    if (tagNode) {
      const success = combineNodes({
        chart,
        nodes: nodesOption,
        links: (chart.getOption() as any).series[0].links as any[],
        node1: currentNode!,
        node2: tagNode,
      });

      const POSTMerge = async () => {
        const result = await POST(
          "tag/merge",
          { tagId1: tagNode.id, tagId2: currentNode.id },
          true
        );
        console.log(result);
      };

      if (success) {
        POSTMerge();
        chart.setOption({ series: [{ data: nodesOption }] });
      }
    } else {
      alert(`The tag '${tagToMerge}' does not exist.`);
    }
  }
  if (params.event && params.event.event) {
    params.event.event.preventDefault();
  }
};

export default handleMerge;
