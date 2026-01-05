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
  EventBusy as EventBusyIcon,
  Block as BlockIcon,
  Rule as RuleIcon,
  Store as StoreIcon,
  Link as LinkIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

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
                icon={<EventBusyIcon />}
                label="ข้อมูลร้าน"
                {...a11yProps(0)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="กำหนดเวลาเปิด-ปิดร้าน"
                {...a11yProps(1)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="กำหนดวัดหยุดพิเศษ"
                {...a11yProps(2)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="ตั้งค่า Line Token"
                {...a11yProps(3)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="ตั้งค่าข้อความแจ้งเตือน"
                {...a11yProps(4)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="ช่วงไม่รับจอง"
                {...a11yProps(5)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="กฎการจอง"
                {...a11yProps(6)}
              />
              <Tab
                icon={<PeopleIcon />}
                label="ตั้งค่าพนักงาน"
                {...a11yProps(7)}
              />
              <Tab
                icon={<EventBusyIcon />}
                label="เปลี่ยนรหัสผ่าน"
                {...a11yProps(8)}
              />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Grid2 container justifyContent="center">
              <ShopSettings />
            </Grid2>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Grid2 container justifyContent="center">
              <TimeSettings />
            </Grid2>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Grid2 container justifyContent="center">
              <LineSettings />
            </Grid2>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Grid2 container justifyContent="center">
              <ResetPasswordForm />
            </Grid2>
          </CustomTabPanel>
        </Box>
      </BaseCard>
    </PageContainer>
  );
};

export default Services;
