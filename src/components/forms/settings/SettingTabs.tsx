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

export default function ServiceTabs() {
  const [value, setValue] = React.useState(1);
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // const getStore = async () => {
  //   let result = await storeService.getStore();

  //   if (result.success) {
  //     setStoreForm(result.data);
  //   } else {
  //     setNotify({
  //       open: true,
  //       message: result.message,
  //       color: result.success ? "success" : "error",
  //     });
  //   }
  // };

  // useEffect(() => {
  //   // setIsLoading(true);
  //   getStore();
  //   return () => {
  //     setStoreForm(initialStore);
  //   };
  // }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="">
          <Tab label="ตั้งค่าข้อมูลร้าน" {...a11yProps(0)} />
          <Tab label="กำหนดเวลาเปิด-ปิดร้าน" {...a11yProps(1)} />
          <Tab label="ตั้งค่า Line Token" {...a11yProps(2)} />
          <Tab label="เปลี่ยนรหัสผ่าน" {...a11yProps(3)} />
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
