import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  Button,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import BaseCard from "../../shared/BaseCard";

const MaintenanceDocument = () => {
  // State to manage form input
  const [documentId, setDocumentId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [status, setStatus] = useState("Borrowed");

  const [repairLocation, setRepairLocation] = useState<string>("on-site");
  const [locationName, setLocationName] = useState<string>("");

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

  const currentDate = new Date().toISOString().split("T")[0];

  // Handle form submission
  const handleFormSubmit = () => {
    const formData = {
      documentId,
      issueDate,
      returnDate,
      status,
    };
    console.log("Form Data:", formData);
  };

  return (
    <BaseCard>
      <Box p={3} border="1px solid #ccc" borderRadius="8px">
        <Grid container spacing={2}>
          {/* Document ID */}
          <Grid item xs={6}>
            <TextField
              label="Document ID"
              // value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              fullWidth
              value={"MA001"}
            />
          </Grid>

          {/* Issue Date */}
          <Grid item xs={6}>
            <TextField
              label="Action Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Site ID"
              type="text"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Site Name"
              type="text"
              // value={issueDate}
              // onChange={(e) => setIssueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Repair By
            </Typography>

            <RadioGroup
              value={repairLocation}
              onChange={handleLocationChange}
              sx={{ marginBottom: 2 }}
            >
              <FormControlLabel
                value="ํyourself"
                control={<Radio />}
                label="By Yourself"
              />
              <FormControlLabel
                value="company"
                control={<Radio />}
                label="By Company"
              />
            </RadioGroup>
          </Grid>
        </Grid>
      </Box>
    </BaseCard>
  );
};

export default MaintenanceDocument;
