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
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import ShopStarted from "@/components/forms/settings/ShopStarted";

const ResetPassword = () => {
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
      { name: "ตั้งค่าร้านค้า", href: "" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="" description="">
      <BaseCard title="">
         <ShopStarted/>
      </BaseCard>
    </PageContainer>
  );
};

export default ResetPassword;