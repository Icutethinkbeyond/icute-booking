import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid2,
} from "@mui/material";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Grid } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SalesData {
  repairStatus: string;
  total: number;
}

const salesData: SalesData[] = [
  { repairStatus: "complete", total: 4000 },
  { repairStatus: "uncomplete", total: 200 },
];

const RepairOverview: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("2024");

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value);
  };

  const totalSales = salesData.reduce((sum, data) => sum + data.total, 0);

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: salesData.map((data) => data.repairStatus.toString()),
    colors: ["#60A5FA", "#3B82F6", "#FCD34D"],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  const series = salesData.map((data) => data.total);

  return (
    <Card sx={{ height: "100%", margin: "auto", boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Total Equipment Repair
        </Typography>
        <Grid2 container>
          <Grid2 size={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Overview of Years
            </Typography>
          </Grid2>
          <Grid2 container size={6} justifyContent="flex-end" alignItems="flex-end">
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              size="small"
              sx={{
                mb: 2,
                bgcolor: "#F3F4F6",
                // "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            >
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
              <MenuItem value="2021">2021</MenuItem>
            </Select>
          </Grid2>
        </Grid2>

        <Typography variant="h4" align="center" gutterBottom>
          {totalSales.toLocaleString()}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          gutterBottom
        >
          Items
        </Typography>
        <Chart
          options={chartOptions}
          series={series}
          type="donut"
          // height={250}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {salesData.map((data, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: chartOptions.colors![index],
                  marginRight: 4,
                }}
              />
              <Typography variant="body2">{data.repairStatus}</Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairOverview;
