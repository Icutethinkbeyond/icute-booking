"use client";

import { useState } from "react";
import {
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StaffForm from "@/components/forms/employees/NewEmployee";
import { StaffFormData } from "@/components/lib/staff";

export default function EditEmployeePage() {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = (data: StaffFormData) => {
    console.log("Staff data:", data);
    setSnackbar({
      open: true,
      message: "เพิ่มพนักงานเรียบร้อยแล้ว",
      severity: "success",
    });
    // In real app, redirect to staff list after success
  };

  const handleCancel = () => {
    // In real app, navigate back to staff list
    window.history.back();
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          // ml: { xs: 0, md: "280px" },
        }}
      >

        {/* Staff Form */}
        <StaffForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </Box>

    </Box>
  );
}
