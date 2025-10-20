import * as React from "react";
import { Tabs, Box, Tab, Grid2 } from "@mui/material";
import ReportSettingForm from "../shared/ReportSettingForm";
import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../shared/TabSetting";
import { CalendarMonth, LocalOffer, PriceCheck } from "@mui/icons-material";

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
          <Tab label="รายงานสรุปมูลค่าเครื่องจักร" {...a11yProps(0)} />
          <Tab label="รายงานสรุปค่าเช่ารวม" {...a11yProps(1)} />
          <Tab label="รายงานสรุปค่าเช่าประจำเดือน" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสรุปมูลค่าเครื่องจักร"
            icon={<LocalOffer />}
            reportType={ReportType.EquipmentPrice}
          />
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสรุปค่าเช่ารวม"
            icon={<PriceCheck />}
            reportType={ReportType.RentalPrice}
          />
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสรุปค่าเช่าประจำเดือน"
            icon={<CalendarMonth />}
            reportType={ReportType.Tracker}
          />
        </Grid2>
      </CustomTabPanel>
    </Box>
  );
}
