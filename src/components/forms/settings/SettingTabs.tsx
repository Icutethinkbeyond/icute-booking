import * as React from "react";
import { Tabs, Box, Tab, Grid2 } from "@mui/material";
// import ReportSettingForm from "../shared/ReportSettingForm";
// import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../../shared/TabSetting";
import { CalendarMonth, LocalOffer, PriceCheck } from "@mui/icons-material";
import NewService from "./ShopSettings";
import ShopSettings from "./ShopSettings";
import TimeSettings from "./TimeSettings";
import LineSettings from "./LineSettings";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ServiceTabs() {
  const [value, setValue] = React.useState(2);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label=""
        >
          <Tab label="ตั้งค่าข้อมูลร้าน" {...a11yProps(0)} />
          <Tab label="กำหนดเวลาเปิด-ปิดร้าน" {...a11yProps(1)} />
          <Tab label="ตั้งค่า Line Token" {...a11yProps(2)} />
          <Tab label="เปลี่ยนรหัสผ่าน" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Grid2 container justifyContent="center">
          <ShopSettings/>
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid2 container justifyContent="center">
          <TimeSettings/>
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Grid2 container justifyContent="center">
          <LineSettings/>
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Grid2 container justifyContent="center">
          <ResetPasswordForm />
        </Grid2>
      </CustomTabPanel>
    </Box>
  );
}
