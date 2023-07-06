import { POST } from "@/axios/POST";
import { ECharts } from "echarts";

const handleConnect = (params: any, chart: ECharts) => {
  console.log("params:", params);
  if (!params.dataIndex) {
    console.log("empty");
    return;
  }
  const dataName = params.data.name;
  const nodesOption = (chart.getOption() as any).series[0].data as any[];

  const tagToConnect = prompt("💡 어떤 태그와 연결하고 싶으신가요?"); // Get the name of the tag to merge with
  if (tagToConnect) {
    const POSTConnection = async () => {
      const result = await POST(
        `/api/graph/connect?tag1=${dataName}&tag2=${tagToConnect}`,
        {},
        true
      );
      console.log(result);
    };

    const success = true;
    if (success) {
      POSTConnection();
      chart.setOption({ series: [{ data: nodesOption }] });
    }
  }
  if (params.event && params.event.event) {
    params.event.event.preventDefault();
  }
};

export default handleConnect;
