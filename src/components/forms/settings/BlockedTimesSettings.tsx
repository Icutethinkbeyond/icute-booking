"use client"

import { useState } from "react"
import {
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  useTheme,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Block as BlockIcon } from "@mui/icons-material"
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import type { BlockedTimeSlot } from "@/types/settings"

export default function BlockedTimesSettings() {
  const theme = useTheme()
  const [blockedTimes, setBlockedTimes] = useState<BlockedTimeSlot[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSlot, setEditingSlot] = useState<BlockedTimeSlot | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })

  const [formData, setFormData] = useState<Partial<BlockedTimeSlot>>({
    date: new Date(),
    startTime: "09:00",
    endTime: "12:00",
    reason: "",
  })

  const handleOpenDialog = (slot?: BlockedTimeSlot) => {
    if (slot) {
      setEditingSlot(slot)
      setFormData(slot)
    } else {
      setEditingSlot(null)
      setFormData({
        date: new Date(),
        startTime: "09:00",
        endTime: "12:00",
        reason: "",
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSlot(null)
  }

  const handleSave = () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.reason) {
      setSnackbar({ open: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
      return
    }

    if (editingSlot) {
      setBlockedTimes(
        blockedTimes.map((s) => (s.id === editingSlot.id ? ({ ...formData, id: s.id } as BlockedTimeSlot) : s)),
      )
      setSnackbar({ open: true, message: "แก้ไขช่วงเวลาสำเร็จ" })
    } else {
      const newSlot: BlockedTimeSlot = {
        ...formData,
        id: Date.now().toString(),
      } as BlockedTimeSlot
      setBlockedTimes([...blockedTimes, newSlot])
      setSnackbar({ open: true, message: "เพิ่มช่วงเวลาสำเร็จ" })
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    setBlockedTimes(blockedTimes.filter((s) => s.id !== id))
    setSnackbar({ open: true, message: "ลบช่วงเวลาสำเร็จ" })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Box
              component="h2"
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: theme.palette.primary.main,
                mb: 0.5,
              }}
            >
              ช่วงไม่รับจอง
            </Box>
            <Box
              component="p"
              sx={{
                fontSize: "0.875rem",
                color: theme.palette.text.secondary,
              }}
            >
              กำหนดช่วงเวลาที่ไม่รับจองชั่วคราว เช่น ช่วงประชุม หรือทำความสะอาด
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            เพิ่มช่วงเวลา
          </Button>
        </Box>

        {blockedTimes.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: theme.palette.grey[100],
              border: `2px dashed ${theme.palette.divider}`,
            }}
          >
            <BlockIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
            <Box sx={{ color: theme.palette.text.secondary }}>
              ยังไม่มีช่วงเวลาที่บล็อก คลิก &quot;เพิ่มช่วงเวลา&quot; เพื่อเริ่มต้น
            </Box>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {blockedTimes.map((slot) => (
              <Grid item xs={12} md={6} key={slot.id}>
                <Card
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: theme.palette.primary.main,
                            mb: 1,
                          }}
                        >
                          {slot.reason}
                        </Box>
                        <Box
                          sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.secondary,
                            mb: 1,
                          }}
                        >
                          {slot.date.toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Box>
                        <Chip
                          label={`${slot.startTime} - ${slot.endTime}`}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.error.light,
                            color: theme.palette.text.primary,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(slot)}
                          sx={{ color: theme.palette.secondary.main }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(slot.id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: theme.palette.grey[100] }}>
            {editingSlot ? "แก้ไขช่วงเวลา" : "เพิ่มช่วงเวลาไม่รับจอง"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <DatePicker
                label="เลือกวันที่"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TimePicker
                  label="เวลาเริ่มต้น"
                  value={formData.startTime ? new Date(`2000-01-01T${formData.startTime}`) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData({
                        ...formData,
                        startTime: newValue.toTimeString().slice(0, 5),
                      })
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
                <TimePicker
                  label="เวลาสิ้นสุด"
                  value={formData.endTime ? new Date(`2000-01-01T${formData.endTime}`) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData({
                        ...formData,
                        endTime: newValue.toTimeString().slice(0, 5),
                      })
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Box>

              <TextField
                label="เหตุผล"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="เช่น พนักงานประชุม, ทำความสะอาด, งดบริการชั่วคราว"
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog}>ยกเลิก</Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                bgcolor: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>

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
    </LocalizationProvider>
  )
}
