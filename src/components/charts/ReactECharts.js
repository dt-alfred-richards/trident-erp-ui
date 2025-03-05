import ReactEcharts from "echarts-for-react";
import { useCallback } from "react";
import { chartOptions } from "./options";

function Chart({
  data,
  series,
  type = "bar",
  width = 240,
  height = 200,
  title,
}) {
  return (
    <ReactEcharts
      option={chartOptions({ data, series, type, title })}
      style={{ width, height }}
    ></ReactEcharts>
  );
}

export default Chart;
