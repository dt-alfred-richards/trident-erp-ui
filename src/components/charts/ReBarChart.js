import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Page A", uv: 4000 },
  { name: "Page B", uv: 3000 },
  { name: "Page C", uv: 2000 },
  { name: "Page D", uv: 2780 },
];

// Define styles for each bar (color, border-radius, width)
const barStyles = [
  { color: "#3A4DE9", radius: [10, 10, 0, 0], width: 30 },
  { color: "#3A4DE9", radius: [10, 10, 0, 0], width: 30 },
  { color: "#3A4DE9", radius: [10, 10, 0, 0], width: 30 },
  { color: "#3A4DE9", radius: [10, 10, 0, 0], width: 30 },
];

export default class ReBarChart extends PureComponent {
  static demoUrl = "https://codesandbox.io/p/sandbox/tiny-bar-chart-xzyy8g";

  render() {
    const { width = "100%", height = "100%" } = this.props;

    return (
      <ResponsiveContainer width={width} height={height}>
        <BarChart width={"100%"} height={"100%"} data={data} barGap={10}>
          <XAxis
            dataKey="name"
            stroke="#333"
            tick={{ fontSize: 12 }}
            padding={{ bottom: 10 }}
          />

          <Bar
            dataKey="uv"
            shape={(props) => {
              const { fill, x, y, width, height, radius } = props;
              return (
                <rect
                  x={x}
                  y={y - 10}
                  width={width}
                  height={height}
                  fill={fill}
                  rx={radius[0]} // Top-left
                  ry={radius[1]} // Top-right
                />
              );
            }}
          >
            {/* Apply different styles per bar */}
            {data.map((entry, index) => {
              const { color, radius, width } =
                barStyles[index % barStyles.length];
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  radius={radius}
                  width={width}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
