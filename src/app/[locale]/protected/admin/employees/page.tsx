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
import EmployeeTable from "@/components/forms/employees/EmployeeTable";
import FloatingButton from "@/components/shared/used/FloatingButton";
import { useRouter } from "next/navigation";

const Employees = () => {
  const t = useTranslations("HomePage");
  const localActive = useLocale();
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "จัดการพนักงาน", href: `/${localActive}/protected/admin/employees` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <FloatingButton
        onClick={() => router.push(`/${localActive}/protected/admin/employees/new`)}
      />
      <Typography variant="h1" mt={2} >
        การจัดการพนักงาน
      </Typography>
      <BaseCard title="">
        <EmployeeTable />
      </BaseCard>
    </PageContainer>
  );
};

export default Employees;
