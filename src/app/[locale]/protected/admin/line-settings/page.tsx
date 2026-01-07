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
  Tabs,
  Tab,
} from "@mui/material";
import PageContainer from "@/components/container/PageContainer";
import { useTranslations } from "next-intl";
import BaseCard from "@/components/shared/BaseCard";
import { useEffect, useState } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { a11yProps, CustomTabPanel } from "@/components/shared/TabSetting";
import ResetPasswordForm from "@/components/forms/settings/ResetPasswordForm";
import LineSettings from "@/components/forms/settings/LineSettings";
import TimeSettings from "@/components/forms/settings/TimeSettings";
import ShopSettings from "@/components/forms/settings/ShopSettings";
import React from "react";

import {
  Campaign,
  EventBusy as EventBusyIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { KeyIcon } from "lucide-react";
import LineMassageSettings from "@/components/forms/settings/LineMassageSettings";

const Services = () => {
  const [value, setValue] = React.useState(0);

  const [issueDate, setIssueDate] = useState("");
  const [repairLocation, setRepairLocation] = useState<string>("");
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

  const { setBreadcrumbs } = useBreadcrumbContext();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
      <Typography variant="h1" mt={2}>
        ตั้งค่าร้านค้า
      </Typography>
      <BaseCard title="">
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="">
              <Tab
                icon={<KeyIcon />}
                label="ตั้งค่า Line Token"
                {...a11yProps(3)}
              />
              <Tab
                icon={<Campaign />}
                label="ตั้งค่าข้อความแจ้งเตือน"
                {...a11yProps(4)}
              />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Grid2 justifyContent="center">
              <LineSettings />
            </Grid2>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <Grid2 container justifyContent="center">
              <LineMassageSettings />
            </Grid2>
          </CustomTabPanel>
        </Box>
      </BaseCard>
    </PageContainer>
  );
};

export default Services;
