import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ReportSettingForm from "../shared/ReportSettingForm";
import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../shared/TabSetting";
import {
  CalendarMonth,
  Engineering,
  Handyman,
  PrecisionManufacturing,
} from "@mui/icons-material";
import { Grid2 } from "@mui/material";

export default function EquiptmentReportTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="รายงานการเเจ้งซ่อม" {...a11yProps(0)} />
          <Tab label="รายงานสรุปค่าซ่อมรายเดือน" {...a11yProps(2)} />
          <Tab label="รายงานสรุปการมอบหมายงาน" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานการเเจ้งซ่อม"
            icon={<PrecisionManufacturing />}
            reportType={ReportType.MaintenanceStatus}
          />
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสรุปค่าซ่อมรายเดือน"
            icon={<CalendarMonth />}
            reportType={ReportType.MaintenanceCost}
          />
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสรุปการมอบหมายงาน"
            icon={<Engineering />}
            reportType={ReportType.WorkLoad}
            desc="รายงานสรุปงานของผู้ซ่อมเเซมที่ยังซ่อมไม่เสร็จ หรือกำลังซ่อม"
          />
        </Grid2>
      </CustomTabPanel>
    </Box>
  );
}
