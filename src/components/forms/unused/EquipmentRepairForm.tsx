import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import BaseCard from "../../shared/BaseCard";

const EquipmentRepairForm = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  // State to manage form input
  const [documentId, setDocumentId] = useState("");
  const [issueDate, setIssueDate] = useState(currentDate);
  const [returnDate, setReturnDate] = useState("");
  const [status, setStatus] = useState("Borrowed");

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
              fullWidth
              label="Equipment ID"
              variant="outlined"
              value={"E-28383"}
            />
          </Grid>

          {/* Issue Date */}
          <Grid item xs={6}>
            <TextField fullWidth label="Equipment Name" variant="outlined" />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Serial Number" variant="outlined" />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Category Name" variant="outlined" />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Functional" variant="outlined" />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              id="Issue Description"
              label="Description"
              variant="outlined"
              multiline
              rows={4} // Set number of rows for multiline input
            />
          </Grid>

          <Grid container sx={{ pl: 2 }}>
            <Grid item xs={12} sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                About Equipment (optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Description
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ mb: 3, pr: 2 }}>
              <TextField
                fullWidth
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                label="Register Date"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                label="Start on site"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sx={{ mb: 3, pr: 2 }}>
              <TextField
                fullWidth
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                label="Dismantle"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Election"
                onChange={(e) => setIssueDate(e.target.value)}
                value={issueDate}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sx={{ mb: 3, pr: 2 }}>
              <TextField fullWidth label="Last work Hrs" variant="outlined" />
            </Grid>
            <Grid item xs={6} sx={{ mb: 3 }}>
              <TextField fullWidth label="Start Work Hrs" variant="outlined" />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </BaseCard>
  );
};

export default EquipmentRepairForm;
