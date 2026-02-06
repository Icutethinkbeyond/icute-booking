"use client";

import {
  Grid2,
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import IncomeChart from "@/components/forms/dashboard/IncomeChart";
import Appointment from "@/components/forms/dashboard/Appointment";
import StaffAvailabilityList from "@/components/forms/dashboard/StaffAvailability";
import RevenueChart from "@/components/forms/dashboard/RevenueChart";
import UpcomingAppointments from "@/components/forms/dashboard/UpcomingAppointments";
import TodayAppointments from "@/components/forms/dashboard/TodayAppointments";
import StatsCards from "@/components/forms/dashboard/StatsCards";
import { mockCustomerData, mockDashboardStats, mockRevenueData, mockStaffAvailability } from "@/components/lib/dashboard-data";
import { mockAppointments } from "@/components/lib/calendar-data";
import CustomerChart from "@/components/forms/dashboard/CustomerChart";

const Booking = () => {
  const theme = useTheme()
  const t = useTranslations("HomePage");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "ผู้ดูแลระบบ", href: "/" },
      { name: "แผงควบคุม", href: "#" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">

      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            // ml: { xs: 0, md: "280px" },
            minHeight: "100vh",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              แผงควบคุม
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              ยินดีต้อนรับกลับมา! นี่คือภาพรวมของวันนี้
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ mb: 4 }}>
            <StatsCards stats={mockDashboardStats} />
          </Box>

          {/* Main Section */}
          <Grid2 container spacing={3} sx={{ mb: 4 }}>
            {/* Today's Appointments */}
            <Grid2 size={{ xs: 12, lg: 4 }} >
              <TodayAppointments appointments={mockAppointments} />
            </Grid2>

            {/* Upcoming Appointments */}
            <Grid2 size={{ xs: 12, lg: 4 }}>
              <UpcomingAppointments appointments={mockAppointments} />
            </Grid2>

            {/* Staff Availability */}
            <Grid2 size={{ xs: 12, lg: 4 }}>
              <StaffAvailabilityList staffList={mockStaffAvailability} />
            </Grid2>
          </Grid2>

          {/* Charts Section */}
          <Grid2 container spacing={3}>
            {/* Revenue Chart */}
            <Grid2 size={{ xs: 12, lg: 6 }}>
              <RevenueChart data={mockRevenueData} />
            </Grid2>

            {/* Customer Chart */}
            <Grid2 size={{ xs: 12, lg: 6 }}>
              <CustomerChart data={mockCustomerData} />
            </Grid2>
          </Grid2>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Booking;
