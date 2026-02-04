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
import { useBookingContext } from "@/contexts/BookingContext"
import { AllowSelectEmpType } from "@/interfaces/Booking"

interface Step2Props {
  // value?: "with-staff" | "without-staff"
  // onChange?: (value: AllowSelectEmpType) => void
}

export function Step2ServiceType({ 
  // value, onChange
 }: Step2Props) {

  const theme = useTheme()
  const { setBookingForm, bookingForm } = useBookingContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    setBookingForm((prevState) => ({
      ...prevState,
        needSelectEmployee: event.target.value as unknown as AllowSelectEmpType
    }));
    console.log(bookingForm)
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
        เลือกประเภทบริการ
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "text.secondary",
        }}
      >
        คุณต้องการจองกับพนักงานคนใดคนหนึ่งโดยเฉพาะหรือไม่?
      </Typography>

      <FormControl component="fieldset" sx={{ width: "100%" }}>
        {/* <FormLabel component="legend" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
          ประเภทบริการ
        </FormLabel> */}
        <RadioGroup value={AllowSelectEmpType} onChange={handleChange} sx={{ gap: 2 }}>
          <Paper
            elevation={bookingForm.needSelectEmployee === AllowSelectEmpType.withstaff ? 3 : 0}
            sx={{
              p: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              border:
                bookingForm.needSelectEmployee === AllowSelectEmpType.withstaff
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid ${theme.palette.divider}`,
              backgroundColor: bookingForm.needSelectEmployee === AllowSelectEmpType.withstaff ? theme.palette.action.selected : theme.palette.background.paper,
              "&:hover": {
                borderColor: bookingForm.needSelectEmployee === AllowSelectEmpType.withstaff ? theme.palette.primary.main : theme.palette.primary.light,
              },
            }}
            // onClick={() => handleChange(AllowSelectEmpType.withstaff)}
          >
            <FormControlLabel
              value={AllowSelectEmpType.withstaff}
              control={<Radio />}
              checked={bookingForm.needSelectEmployee === AllowSelectEmpType.withstaff}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
                  <Users size={24} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                      เลือกพนักงานเอง
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      เลือกพนักงานที่คุณต้องการ
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Paper>

          <Paper
            elevation={bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff ? 3 : 0}
            sx={{
              p: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              border:
                bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid ${theme.palette.divider}`,
              backgroundColor:
                bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff ? theme.palette.action.selected : theme.palette.background.paper,
              "&:hover": {
                borderColor: bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff ? theme.palette.primary.main : theme.palette.primary.light,
              },
            }}
            // onClick={() => handleChange("without-staff")}
          >
            <FormControlLabel
              value={AllowSelectEmpType.withoutstaff}
              checked={bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff}
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
                  <User size={24} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                      ให้ระบบเลือกพนักงาน
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      โดยระบบจะเลือกพนักงานที่ว่างตรงกับเวลาที่คุณเลือก
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
