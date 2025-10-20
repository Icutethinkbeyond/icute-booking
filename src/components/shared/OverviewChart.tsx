import React from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', Ample: 350, PixelAdmin: 240 },
  { month: 'Feb', Ample: 400, PixelAdmin: 250 },
  { month: 'Mar', Ample: 300, PixelAdmin: 320 },
  { month: 'Apr', Ample: 350, PixelAdmin: 210 },
  { month: 'May', Ample: 390, PixelAdmin: 240 },
  { month: 'Jun', Ample: 170, PixelAdmin: 300 },
];

const OverviewChart: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Overview</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Ample" fill="#00e5ff" />
          <Bar dataKey="PixelAdmin" fill="#ff9f87" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default OverviewChart;