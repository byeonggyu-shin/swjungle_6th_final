import { DELETE } from "@/axios/DELETE";
import { ECharts } from "echarts";

const handleDeleteTag = (params: any, chart: ECharts) => {
  console.log("params:", params);
  if (!params.dataIndex) {
    console.log("empty");
    return;
  }
  const dataIndex = params.dataIndex;
  const nodesOption = (chart.getOption() as any).series[0].data as any[];

  const newTagName = prompt("💡 어떤 태그에 병합하고 싶으신가요?"); // Get the name of the tag to merge with
  if (newTagName) {
    const DELETETag = async () => {
      const result = await DELETE(`tag/${dataIndex}`, true);
      console.log(result);
    };

    const success = true;
    if (success) {
      DELETETag();
      chart.setOption({ series: [{ data: nodesOption }] });
    }
  }
  if (params.event && params.event.event) {
    params.event.event.preventDefault();
  }
};

export default handleDeleteTag;
