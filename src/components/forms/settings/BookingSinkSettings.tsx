"use client"

import { useState } from "react"
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  useTheme,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Visibility as PreviewIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
} from "@mui/icons-material"
import QRCode from "qrcode"

export default function BookingLinkSettings() {
  const theme = useTheme()
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })
  const [bookingUrl] = useState("https://booking.example.com/shop/123456")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
    setSnackbar({ open: true, message: "คัดลอกลิงก์สำเร็จ" })
  }

  const handleGenerateQR = async () => {
    try {
      const url = await QRCode.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
      })
      setQrCodeUrl(url)
      setSnackbar({ open: true, message: "สร้าง QR Code สำเร็จ" })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.download = "booking-qr-code.png"
      link.href = qrCodeUrl
      link.click()
      setSnackbar({ open: true, message: "ดาวน์โหลด QR Code สำเร็จ" })
    }
  }

  const handleShareLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`จองคิวได้ที่: ${bookingUrl}`)}`
    window.open(lineUrl, "_blank")
  }

  const handlePreview = () => {
    window.open(bookingUrl, "_blank")
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
          ลิงก์หน้าจอง
        </Box>
        <Box
          component="p"
          sx={{
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
          }}
        >
          แชร์ลิงก์หน้าจองให้กับลูกค้าของคุณ
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            ลิงก์หน้าจอง
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              value={bookingUrl}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
            <Tooltip title="คัดลอกลิงก์">
              <IconButton
                onClick={handleCopyLink}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<PreviewIcon />} onClick={handlePreview}>
              ดูตัวอย่างหน้าจอง
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareLine}
              sx={{
                color: "#06C755",
                borderColor: "#06C755",
                "&:hover": {
                  borderColor: "#06C755",
                  bgcolor: "rgba(6, 199, 85, 0.08)",
                },
              }}
            >
              แชร์ผ่าน LINE
            </Button>
          </Box>
        </CardContent>
      </Card>

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
            QR Code
          </Box>

          {!qrCodeUrl ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                bgcolor: theme.palette.grey[100],
                borderRadius: 2,
                border: `2px dashed ${theme.palette.divider}`,
              }}
            >
              <QrCodeIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.text.secondary,
                  mb: 2,
                }}
              />
              <Box sx={{ color: theme.palette.text.secondary, mb: 2 }}>คลิกปุ่มด้านล่างเพื่อสร้าง QR Code</Box>
              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerateQR}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                สร้าง QR Code
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src={qrCodeUrl}
                alt="QR Code"
                sx={{
                  maxWidth: 300,
                  width: "100%",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 2,
                  bgcolor: "white",
                  mb: 2,
                }}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadQR}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  ดาวน์โหลด QR Code
                </Button>
                <Button variant="outlined" startIcon={<QrCodeIcon />} onClick={handleGenerateQR}>
                  สร้างใหม่
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

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
