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
import NewEmployee from "@/components/forms/employees/NewEmployee";

const NewEmployeePage = () => {
  const t = useTranslations("HomePage");
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/${localActive}/protected/admin/dashboard` },
      { name: "จัดการพนักงาน", href: `/${localActive}/protected/admin/employees` },
      { name: "เพิ่มพนักงาน", href: `/${localActive}/protected/admin/employees/new` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <Typography variant="h1" mt={2} >
        การจัดการพนักงาน
      </Typography>
      <BaseCard title="">
        <NewEmployee/>
      </BaseCard>
    </PageContainer>
  );
};

export default NewEmployeePage;

