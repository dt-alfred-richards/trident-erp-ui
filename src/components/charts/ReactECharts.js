import ReactEcharts from "echarts-for-react";
import { useCallback } from "react";
import { chartOptions } from "./options";

function Chart({ data, series, type = "bar", width = 240, height = 200 }) {
  console.log({ type, options: chartOptions({ data, series, type }) });
  return (
    <ReactEcharts
      option={chartOptions({ data, series, type })}
      style={{ width, height }}
    ></ReactEcharts>
  );
}

export default Chart;
