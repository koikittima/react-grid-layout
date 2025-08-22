import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

export default function GraphStack({
  data,
  height = 200,
  upLabel = "Up",
  downLabel = "Down",
  suspendLabel = "Suspend",
  unit = "เรื่อง",
  label
}) {
  const years = React.useMemo(() => Object.keys(data), [data]);
  const upData = React.useMemo(() => years.map((y) => data[y].Up), [years, data]);
  const dowData = React.useMemo(() => years.map((y) => data[y].Down), [years, data]);
  const suspendData = React.useMemo(() => years.map((y) => data[y].Suspend), [years, data]);

  return (
    <>  
    <BarChart
      height={height}
      layout="horizontal" //แนวนอน
      yAxis={[{ scaleType: "band", data: years }]}
      xAxis={[{ label: `จำนวน${unit}` }]}
      series={[
        { label: upLabel, data: upData, stack: "total" , color:"#228E0C"},
        { label: downLabel, data: dowData, stack: "total" , color:"#FFBB28"},
        { label: suspendLabel, data: suspendData, stack: "total" , color:"#FF8042"},
      ]}
    />
    </>
  );
}
