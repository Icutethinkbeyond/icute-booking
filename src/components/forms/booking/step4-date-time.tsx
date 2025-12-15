"use client"
import { Typography, Box, Chip, useTheme } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar"
import { Clock } from "lucide-react"
import dayjs, { type Dayjs } from "dayjs"
import { timeSlots } from "@/utils/lib/booking-data"

interface Step4Props {
  date?: Date | null
  time?: string
  onDateChange?: (value: Date | null) => void
  onTimeChange?: (value: string) => void
}

export function Step4DateTime({ date, time, onDateChange, onTimeChange }: Step4Props) {
  const theme = useTheme()

  const handleDateChange = (newValue: Dayjs | null) => {
    // onDateChange(newValue ? newValue.toDate() : null)
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        Select date and time
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "text.secondary",
        }}
      >
        Choose your preferred appointment date and time
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 4,
        }}
      >
        {/* Calendar section */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            p: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Clock size={20} />
            Select Date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={date ? dayjs(date) : null}
              onChange={handleDateChange}
              disablePast
              sx={{
                width: "100%",
                "& .MuiPickersDay-root": {
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* Time slots section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Select Time
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              maxHeight: 384,
              overflowY: "auto",
              pr: 1,
            }}
          >
            {timeSlots.map((slot: any) => (
              <Chip
                key={slot}
                label={slot}
                // onClick={() => onTimeChange(slot)}
                sx={{
                  height: 40,
                  fontSize: "0.875rem",
                  fontWeight: time === slot ? 600 : 400,
                  bgcolor: time === slot ? theme.palette.primary.main : "background.paper",
                  color: time === slot ? theme.palette.primary.contrastText : "text.primary",
                  border: time === slot ? "none" : `1px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: theme.palette.primary.light,
                    bgcolor: time === slot ? theme.palette.primary.dark : "background.paper",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
