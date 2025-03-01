export const chartOptions = ({ type, data, series }) => {
  switch (type) {
    case "bar":
      return {
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
            type: "bar",
            smooth: true,
          },
        ],
        tooltip: {
          trigger: "axis",
        },
      };
    case "donut":
      return  {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '70%'],
            startAngle: 180,
            endAngle: 360,
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' }
            ]
          }
        ]
      };
    case "line":
      return {
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: "line",
            smooth: true,
          },
        ],
      };
    default:
      return {};
      break;
  }
};
