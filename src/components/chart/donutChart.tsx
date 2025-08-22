import { PieChart } from '@mui/x-charts/PieChart';

type textType = {
  label: string;
  data: { label: string; value: number; color: string }[];
}

const settings = {
  margin: { right: 5 },
  width: 200,
  height: 200,
  hideLegend: true,
};

export default function DonutChart({label , data} : textType) {
  return (
    <>
    <div>
        <PieChart
        series={[{ innerRadius: 50, outerRadius: 100, data, arcLabel: 'value' }]}
        {...settings}
        />
    </div>
    </>
  );
}