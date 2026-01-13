"use client"

import { useState } from "react"
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  useTheme,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
} from "@mui/material"
import { Save as SaveIcon } from "@mui/icons-material"
import type { StaffSettings } from "@/types/settings"

export default function StaffSettings() {
  const theme = useTheme()
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })
  const [settings, setSettings] = useState<StaffSettings>({
    allowCustomerSelectStaff: true,
    autoAssignStaff: false,
    maxBookingsPerStaffPerDay: 10,
  })

  const handleSave = () => {
    setSnackbar({ open: true, message: "บันทึกการตั้งค่าพนักงานสำเร็จ" })
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box
          component="h2"
          sx={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: theme.palette.primary.main,
            mb: 0.5,
          }}
        >
          ตั้งค่าพนักงาน
        </Box>
        <Box
          component="p"
          sx={{
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
          }}
        >
          กำหนดค่าเริ่มต้นสำหรับการจัดการพนักงานในระบบ
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              >
                การเลือกพนักงาน
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowCustomerSelectStaff}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          allowCustomerSelectStaff: e.target.checked,
                        })
                      }
                    />
                  }
                  label="อนุญาตให้ลูกค้าเลือกพนักงานเอง"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                    },
                  }}
                />

                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.grey[100],
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  หากปิดการตั้งค่านี้ ลูกค้าจะไม่สามารถเลือกพนักงานได้ และระบบจะสุ่มเลือกพนักงานให้อัตโนมัติ
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoAssignStaff}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoAssignStaff: e.target.checked,
                        })
                      }
                    />
                  }
                  label="สุ่มเลือกพนักงานอัตโนมัติ"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                    },
                  }}
                />

                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.grey[100],
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  ระบบจะเลือกพนักงานที่ว่างและมีคิวน้อยที่สุดให้อัตโนมัติ
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              >
                จำกัดการจอง
              </Box>

              <TextField
                label="จำนวนคิวสูงสุดต่อพนักงานต่อวัน"
                type="number"
                value={settings.maxBookingsPerStaffPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxBookingsPerStaffPerDay: Number(e.target.value),
                  })
                }
                InputProps={{
                  endAdornment: <InputAdornment position="end">คิว</InputAdornment>,
                }}
                fullWidth
                helperText="จำกัดจำนวนคิวสูงสุดที่พนักงานแต่ละคนรับได้ต่อวัน (ไม่บังคับ)"
              />

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: theme.palette.warning.light,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                }}
              >
                หากไม่ต้องการจำกัด ให้ใส่ค่า 0 หรือเว้นว่างไว้
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
            px: 4,
          }}
        >
          บันทึกการตั้งค่า
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
