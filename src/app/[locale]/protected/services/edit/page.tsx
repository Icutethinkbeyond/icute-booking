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
import { useLocale, useTranslations } from "next-intl";
import Breadcrumb from "@/components/shared/used/BreadcrumbCustom";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import EmployeeTabs from "@/components/forms/employees/EmployeeTabs";
import ServiceTabs from "@/components/forms/services/ServiceTabs";
import NewService from "@/components/forms/services/NewService";

const Services = () => {
  const t = useTranslations("HomePage");
  const localActive = useLocale();

  const [issueDate, setIssueDate] = useState("");
  const [repairLocation, setRepairLocation] = useState<string>("");
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/dashboard` },
      { name: "บริการ", href: `/${localActive}/protected/services` },
      { name: "เพิ่มบริการ", href: `/${localActive}/protected/services/new` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <Typography variant="h1" mt={2} color="#fff">
        จัดการบริการ
      </Typography>
      <BaseCard title="">
        <NewService />
      </BaseCard>
    </PageContainer>
  );
};

export default Services;
