import React from "react";
import { Box, TextField, Typography } from "@mui/material";

const ApprovalForm: React.FC = () => {
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  return (
    <Box sx={{ padding: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Approval Information
      </Typography>

      <TextField
        fullWidth
        label="Approver Email"
        variant="outlined"
        margin="normal"
        InputProps={{
          readOnly: true, // Make this field read-only
        }}
      />

      {/* <TextField
        fullWidth
        label="Approval Date"
        variant="outlined"
        margin="normal"
        type="date"
        defaultValue={currentDate} // Set default to current date
      /> */}

      {/* <TextField
        fullWidth
        label="Expected Completion Date"
        variant="outlined"
        margin="normal"
        type="date"
      /> */}
    </Box>
  );
};

export default ApprovalForm;
