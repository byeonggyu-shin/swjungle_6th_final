import { PUT } from "@/axios/PUT";
import { ECharts } from "echarts";

const handleEditTag = (params: any, chart: ECharts) => {
  console.log("params:", params);
  if (!params.dataIndex) {
    console.log("empty");
    return;
  }
  const dataIndex = params.dataIndex;
  const nodesOption = (chart.getOption() as any).series[0].data as any[];
  const nodeId = nodesOption[dataIndex].id;

  chart.setOption({ series: [{ data: nodesOption }] });

  const newTagName = prompt("💡 태그명을 어떻게 바꾸고 싶으신가요?"); // Get the name of the tag to merge with
  if (newTagName) {
    const PUTEdit = async () => {
      const result = await PUT(
        `tag/${dataIndex}`,
        {
          tagName: newTagName,
        },
        true
      );
      console.log(result);
    };

    const success = true;
    if (success) {
      PUTEdit();
    }
  }
  if (params.event && params.event.event) {
    params.event.event.preventDefault();
  }
};

export default handleEditTag;
