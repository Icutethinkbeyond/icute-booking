import * as React from "react";
import { Tabs, Box, Tab, Grid2 } from "@mui/material";
// import ReportSettingForm from "../shared/ReportSettingForm";
// import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../../shared/TabSetting";
import { CalendarMonth, LocalOffer, PriceCheck } from "@mui/icons-material";
import NewService from "./NewService";
import ServiceTable from "./ServiceTable";

export default function ServiceTabs() {
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
          aria-label=""
        >
          <Tab label="บริการทั้งหมด" {...a11yProps(0)} />
          <Tab label="เพิ่มบริการใหม่" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Grid2 container justifyContent="center">
          <ServiceTable />
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid2 container justifyContent="center">
          <NewService/>
        </Grid2>
      </CustomTabPanel>
    </Box>
  );
}
