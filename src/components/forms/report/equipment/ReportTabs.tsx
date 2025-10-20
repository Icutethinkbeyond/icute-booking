import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ReportSettingForm from "../shared/ReportSettingForm";
import { ReportType } from "@/contexts/ReportContext";
import { a11yProps, CustomTabPanel } from "../shared/TabSetting";
import PageTitle from "@/components/shared/used/PageTitle";
import { PrecisionManufacturing, ReceiptLong } from "@mui/icons-material";
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
          <Tab label="รายงานสถานะเครื่องจักร" {...a11yProps(0)} />
          <Tab label="รายงานสถานะและแผนใช้งานเครื่องจักร " {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสถานะเครื่องจักร"
            icon={<PrecisionManufacturing />}
            reportType={ReportType.InventoryStatus}
          />
        </Grid2>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid2 container justifyContent="center">
          <ReportSettingForm
            title="รายงานสถานะและแผนใช้งานเครื่องจักร"
            icon={<PrecisionManufacturing />}
            reportType={ReportType.EquipmentPlan}
          />
        </Grid2>
      </CustomTabPanel>
    </Box>
  );
}
