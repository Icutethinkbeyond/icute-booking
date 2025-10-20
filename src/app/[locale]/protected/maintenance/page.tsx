"use client";

import {
  Grid,
  Box,
  Grid2,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import MaintenanceTable from "@/components/forms/maintenance/tables/MaintenanceTable";

const BorrowPage = () => {
  const t = useTranslations("HomePage");

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/protected/dashboard" },
      { name: "แจ้งซ่อมอุปกรณ์", href: "/protected/maintenance" },
      { name: "รายการแจ้งซ่อมอุปกรณ์", href: "/protected/maintenance/add" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Grid2 sx={{ mt: 2 }}>
        <MaintenanceTable />
      </Grid2>
    </PageContainer>
  );
};

export default BorrowPage;
