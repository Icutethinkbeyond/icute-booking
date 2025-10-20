import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import BaseCard from "./DashboardCard";
import { FormControl, Grid2, InputLabel, MenuItem, Select, Typography } from "@mui/material";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesOverview = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [yearSelect, setYearSelect] = useState("2024");

  const optionssalesoverview: any = {
    grid: {
      show: true,
      borderColor: "transparent",
      strokeDashArray: 2,
      padding: {
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        endingShape: "rounded",
        borderRadius: 5,
      },
    },

    colors: [primary, secondary],
    fill: {
      type: "solid",
      opacity: 1,
    },
    chart: {
      offsetX: -15,
      toolbar: {
        show: false,
      },
      foreColor: "#adb0bb",
      fontFamily: "inherit",
      sparkline: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    legend: {
      show: false,
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          cssClass: "grey--text lighten-2--text fill-color",
        },
      },
    },
    yaxis: {
      show: true,
      min: 100,
      max: 400,
      tickAmount: 3,
      labels: {
        style: {
          cssClass: "grey--text lighten-2--text fill-color",
        },
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    tooltip: {
      theme: "dark",
    },
  };
  const seriessalesoverview: any = [
    {
      name: "Ample Admin",
      data: [355, 390, 300, 350, 390, 180, 355, 390, 300, 350, 390, 180],
    }
  ];
  return (
    <BaseCard>
      <Grid2 container>
        <Grid2 container size={12}>
          <Grid2 size={9}>
            <Typography variant="h3">Rental Income 2024 Overview</Typography>
          </Grid2>
          <Grid2 size={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Year</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={yearSelect}
                label="year"
                // onChange={handleChange}
              >
                <MenuItem value={"2024"}>2024</MenuItem>
                <MenuItem value={"2023"}>2023</MenuItem>
                <MenuItem value={"2022"}>2022</MenuItem>
                <MenuItem value={"2021"}>2021</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
        </Grid2>
        <Grid2 size={12}>
          <Chart
            options={optionssalesoverview}
            series={seriessalesoverview}
            type="bar"
            // height="295px"
          />
        </Grid2>
      </Grid2>
    </BaseCard>
  );
};

export default SalesOverview;
