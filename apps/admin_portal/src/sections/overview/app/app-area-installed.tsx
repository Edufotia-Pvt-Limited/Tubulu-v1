/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
// @mui
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
// components
import { ResponsiveContainer, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, Bar, Rectangle } from 'recharts';
import { format } from 'date-fns';
import { Typography } from '@mui/material';
import { IGraphData } from './view/overview-app-view';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  data: IGraphData[];
}

export default function AppAreaInstalled({ title, data, ...other }: Props) {

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        sx={{
          padding: 5,
        }}
      />
      <div style={{ width: 60, display: 'flex', cursor: 'pointer', justifyContent: "space-around", alignItems: "center", padding: 2, position: 'absolute', right: 80, top: 40, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '40px' }}>
        <Box sx={{ background: '#3366FF', width: 14, height: 14, borderRadius: 50 }} />
        <Typography style={{ fontSize: 14 }}>Date</Typography>
      </div>
      <BarChart
        width={900}
        height={350}
        data={data || []}
        margin={{
          // top: 10,
          // right: 30,
          // left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => {
            try {
              return format(new Date(value), 'dd/MM/yy');
            } catch (e) {
              return value;
            }
          }}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(value) => {
            try {
              return format(new Date(value), 'dd MMM yyyy');
            } catch (e) {
              return value;
            }
          }}
        />
        <Bar dataKey="value" fill="#3366FF" activeBar={<Rectangle fill="#3366FF" stroke="blue" />} />
      </BarChart>
    </Card>
  );
}
