import * as React from "react";
import { Tabs, Box, Tab, Grid2 } from "@mui/material";
// import ReportSettingForm from "../shared/ReportSettingForm";
// import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../../shared/TabSetting";
import { CalendarMonth, LocalOffer, PriceCheck } from "@mui/icons-material";
import NewEmployee from "./NewEmployee_old";
import EmployeeTable from "./EmployeeTable";

export default function EmployeeTabs() {
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
          <Tab label="พนักงานทั้งหมด" {...a11yProps(0)} />
          <Tab label="เพิ่มพนักงานใหม่" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Grid2 container justifyContent="center">
          <EmployeeTable/>
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid2 container justifyContent="center">
          <NewEmployee/>
        </Grid2>
      </CustomTabPanel>
    </Box>
  );
}
