import ReactEcharts from "echarts-for-react";
import { useCallback } from "react";

function Chart({ data, series, type = "bar", width = 240, height = 200 }) {
  const options = useCallback(
    ({ data, series, type }) => ({
      grid: { top: 20, right: 40, bottom: 20, left: 40 },
      xAxis: {
        type: "category",
        data,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: series,
          type: type,
          smooth: true,
        },
      ],
      tooltip: {
        trigger: "axis",
      },
    }),
    []
  );
  return (
    <ReactEcharts
      option={options({ data, series, type })}
      style={{ width, height }}
    ></ReactEcharts>
  );
}

export default Chart;
