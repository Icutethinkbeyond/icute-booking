import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface MonthlyFixCardProps {
  sales: number;
}

const MonthlyFixCard: React.FC<MonthlyFixCardProps> = ({ sales }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2">Monthly Sales</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="h4">{sales.toLocaleString()}</Typography>
        <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 40 }} />
      </Box>
      {/* Add a small chart here if needed */}
    </Paper>
  );
};

export default MonthlyFixCard;