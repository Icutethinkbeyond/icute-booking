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
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import ReportTabs from "@/components/forms/report/rental/ReportTabs";

const MAReportPage = () => {
  const t = useTranslations("HomePage");

  const [issueDate, setIssueDate] = useState("");
  const [repairLocation, setRepairLocation] = useState<string>("");
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "คลังอุปกรณ์", href: "/inventory" },
      { name: "รายงานอุปกรณ์" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <BaseCard title="รายงานอุปกรณ์">
        <ReportTabs />
      </BaseCard>
    </PageContainer>
  );
};

export default MAReportPage;
