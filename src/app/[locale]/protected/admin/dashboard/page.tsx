"use client";

import {
  Grid,
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid2,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import BookingTable from "@/components/forms/booking/BookingTable";
import IncomeChart from "@/components/forms/dashboard/IncomeChart";
import CustomerChart from "@/components/forms/dashboard/CustomerChart";
import Appointment from "@/components/forms/dashboard/Appointment";

const Booking = () => {
  const t = useTranslations("HomePage");

  const [issueDate, setIssueDate] = useState("");
  const [repairLocation, setRepairLocation] = useState<string>("");
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

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
      <Typography variant="h1" mt={2} >
        แผงควบคุมระบบ
      </Typography>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 6 }}>
          <BaseCard title="">
            <>
              <Typography
                variant="h4"
                sx={{ marginBottom: 3, fontWeight: 700 }}
              >
                รายได้สัปดาห์นี้
              </Typography>
              <IncomeChart />
            </>
          </BaseCard>
        </Grid2>

        <Grid2 size={{ xs: 6 }}>
          <BaseCard title="">
            <>
              <Typography
                variant="h4"
                sx={{ marginBottom: 3, fontWeight: 700 }}
              >
                ลูกค้าสัปดาห์นี้
              </Typography>
              <CustomerChart />
            </>
          </BaseCard>
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <BaseCard title="">
            <Appointment />
          </BaseCard>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default Booking;
