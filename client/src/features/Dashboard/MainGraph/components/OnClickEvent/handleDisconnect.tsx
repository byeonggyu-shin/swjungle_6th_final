import { DELETE } from "@/axios/DELETE";
import { ECharts } from "echarts";

const handleDisconnection = (params: any, chart: ECharts) => {
  console.log("params:", params);
  if (!params.dataIndex) {
    console.log("empty");
    return;
  }
  const dataName = params.data.name;
  const nodesOption = (chart.getOption() as any).series[0].data as any[];

  const tagToConnect = prompt("💡 어떤 태그와의 연결을 끊고 싶으신가요?"); // Get the name of the tag to merge with
  if (tagToConnect) {
    const DELETEConnection = async () => {
      const result = await DELETE(
        `/api/graph/disconnect?tag1=${dataName}&tag2=${tagToConnect}`,
        true
      );
      console.log(result);
    };

    const success = true;
    if (success) {
      DELETEConnection();
      chart.setOption({ series: [{ data: nodesOption }] });
    }
  }
  if (params.event && params.event.event) {
    params.event.event.preventDefault();
  }
};

export default handleDisconnection;
