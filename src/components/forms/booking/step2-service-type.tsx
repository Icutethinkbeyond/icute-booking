"use client"

import type React from "react"
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Paper,
  useTheme,
} from "@mui/material"
import { User, Users } from "lucide-react"

interface Step2Props {
  value?: "with-staff" | "without-staff"
  onChange?: (value: "with-staff" | "without-staff") => void
}

export function Step2ServiceType({ value, onChange }: Step2Props) {
  const theme = useTheme()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // onChange(event.target.value as "with-staff" | "without-staff")
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        Select service type
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "text.secondary",
        }}
      >
        Would you like to book with a specific staff member?
      </Typography>

      <FormControl component="fieldset" sx={{ width: "100%" }}>
        <FormLabel component="legend" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
          Service Type
        </FormLabel>
        <RadioGroup value={value} onChange={handleChange} sx={{ gap: 2 }}>
          <Paper
            elevation={value === "with-staff" ? 3 : 0}
            sx={{
              p: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              border:
                value === "with-staff"
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid ${theme.palette.divider}`,
              backgroundColor: value === "with-staff" ? theme.palette.action.selected : theme.palette.background.paper,
              "&:hover": {
                borderColor: value === "with-staff" ? theme.palette.primary.main : theme.palette.primary.light,
              },
            }}
            // onClick={() => onChange("with-staff")}
          >
            <FormControlLabel
              value="with-staff"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
                  <Users size={24} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                      With staff member
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Choose your preferred staff member
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Paper>

          <Paper
            elevation={value === "without-staff" ? 3 : 0}
            sx={{
              p: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              border:
                value === "without-staff"
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid ${theme.palette.divider}`,
              backgroundColor:
                value === "without-staff" ? theme.palette.action.selected : theme.palette.background.paper,
              "&:hover": {
                borderColor: value === "without-staff" ? theme.palette.primary.main : theme.palette.primary.light,
              },
            }}
            // onClick={() => onChange("without-staff")}
          >
            <FormControlLabel
              value="without-staff"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
                  <User size={24} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Without staff preference
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Any available staff member
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Paper>
        </RadioGroup>
      </FormControl>
    </Box>
  )
}
