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
import ServiceTable from "@/components/forms/services/ServiceTable";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { useRouter } from "next/navigation";

const Services = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "บริการ", href: `/${localActive}/protected/admin/services` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/admin/services/new`)}
      />
      <Typography variant="h1" mt={2} >
        จัดการบริการ
      </Typography>
      <BaseCard title="">
        <ServiceTable />
      </BaseCard>
    </PageContainer>
  );
};

export default Services;
