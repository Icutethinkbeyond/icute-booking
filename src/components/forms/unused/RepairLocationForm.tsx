import React, { useState } from "react";
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
} from "@mui/material";
import BaseCard from "../../shared/BaseCard";

const RepairLocationForm: React.FC = () => {
  const [repairLocation, setRepairLocation] = useState<string>("on-site");
  const [locationName, setLocationName] = useState<string>("");

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepairLocation(event.target.value);
  };

  return (
    <BaseCard>
      <Box sx={{ padding: 2, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Repair Location Information
        </Typography>

        <RadioGroup
          value={repairLocation}
          onChange={handleLocationChange}
          sx={{ marginBottom: 2 }}
        >
          <FormControlLabel
            value="on-site"
            control={<Radio />}
            label="On-Site Repair"
          />
          <FormControlLabel
            value="off-site"
            control={<Radio />}
            label="Off-Site Repair"
          />
        </RadioGroup>

        <TextField
          fullWidth
          label="Location Name"
          variant="outlined"
          margin="normal"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
      </Box>
    </BaseCard>
  );
};

export default RepairLocationForm;
