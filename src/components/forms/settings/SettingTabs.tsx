import * as React from "react";
import { Tabs, Box, Tab, Grid2 } from "@mui/material";
// import ReportSettingForm from "../shared/ReportSettingForm";
// import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../../shared/TabSetting";
import ShopSettings from "./ShopSettings";
import TimeSettings from "./TimeSettings";
import LineSettings from "./LineSettings";
import ResetPasswordForm from "./ResetPasswordForm";
import { useEffect } from "react";
import { useStoreContext } from "@/contexts/StoreContext";
import { initialStore } from "@/interfaces/Store";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { storeService } from "@/utils/services/api-services/StoreAPI";

import {
  EventBusy as EventBusyIcon,
  Block as BlockIcon,
  Rule as RuleIcon,
  Store as StoreIcon,
  Link as LinkIcon,
  People as PeopleIcon,
} from "@mui/icons-material"

export default function ServiceTabs() {
  const [value, setValue] = React.useState(0);
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="">
          <Tab icon={<EventBusyIcon />} label="ข้อมูลร้าน"  {...a11yProps(0)} />
          <Tab icon={<EventBusyIcon />} label="กำหนดเวลาเปิด-ปิดร้าน" {...a11yProps(1)} />
          <Tab icon={<EventBusyIcon />} label="กำหนดวัดหยุดพิเศษ" {...a11yProps(2)} />
          <Tab icon={<EventBusyIcon />} label="ตั้งค่า Line Token" {...a11yProps(3)} />
          <Tab icon={<EventBusyIcon />} label="ตั้งค่าข้อความแจ้งเตือน" {...a11yProps(4)} />
          <Tab icon={<EventBusyIcon />} label="ช่วงไม่รับจอง" {...a11yProps(5)} />
          <Tab icon={<EventBusyIcon />} label="กฎการจอง" {...a11yProps(6)} />
          <Tab icon={<PeopleIcon />} label="ตั้งค่าพนักงาน" {...a11yProps(7)} />
          <Tab icon={<EventBusyIcon />} label="เปลี่ยนรหัสผ่าน" {...a11yProps(8)} />
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
  );
}
