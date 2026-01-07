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
  EventBusy as EventBusyIcon,
  Block as BlockIcon,
  Rule as RuleIcon,
  Store as StoreIcon,
  Link as LinkIcon,
  People as PeopleIcon,
  Schedule,
} from "@mui/icons-material";
import HolidaysSettings from "@/components/forms/settings/HolidaysSettings";

const HolidaysSettingsPage = () => {
  
  const [value, setValue] = React.useState(0);

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
                icon={<Schedule />}
                label="กำหนดเวลาเปิด-ปิดร้าน"
                {...a11yProps(1)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="วันหยุดร้าน"
                {...a11yProps(0)}
              />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Grid2 container justifyContent="center">
              {/* <ShopSettings /> */}
              <TimeSettings />
            </Grid2>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Grid2 container justifyContent="center">
              <HolidaysSettings/>
            </Grid2>
          </CustomTabPanel>
        </Box>
      </BaseCard>
    </PageContainer>
  );
};

export default HolidaysSettingsPage;
