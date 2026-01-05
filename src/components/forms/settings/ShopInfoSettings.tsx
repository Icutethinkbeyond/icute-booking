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
  Grid,
  Avatar,
  IconButton,
} from "@mui/material"
import { Save as SaveIcon, Upload as UploadIcon, Close as CloseIcon, Store as StoreIcon } from "@mui/icons-material"
import type { ShopInfo } from "@/types/settings"

export default function ShopInfoSettings() {
  const theme = useTheme()
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    name: "",
    nameEn: "",
    phone: "",
    address: "",
    googleMapLink: "",
    logo: "",
    coverImage: "",
  })

  const handleImageUpload = (type: "logo" | "coverImage") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setShopInfo({
            ...shopInfo,
            [type]: event.target?.result as string,
          })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleRemoveImage = (type: "logo" | "coverImage") => {
    setShopInfo({ ...shopInfo, [type]: "" })
  }

  const handleSave = () => {
    setSnackbar({ open: true, message: "บันทึกข้อมูลร้านสำเร็จ" })
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
          ข้อมูลร้าน
        </Box>
        <Box
          component="p"
          sx={{
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
          }}
        >
          ข้อมูลที่ลูกค้าจะเห็นบนหน้าจอง เพื่อให้ร้านดูน่าเชื่อถือและค้นหาง่าย
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
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
                รูปภาพร้าน
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        mb: 1,
                        color: theme.palette.text.primary,
                      }}
                    >
                      โลโก้ร้าน
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {shopInfo.logo ? (
                        <Box sx={{ position: "relative" }}>
                          <Avatar
                            src={shopInfo.logo}
                            sx={{
                              width: 100,
                              height: 100,
                              border: `2px solid ${theme.palette.divider}`,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage("logo")}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: theme.palette.error.main,
                              color: "white",
                              "&:hover": {
                                bgcolor: theme.palette.error.dark,
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            bgcolor: theme.palette.grey[200],
                          }}
                        >
                          <StoreIcon sx={{ fontSize: 48, color: theme.palette.text.secondary }} />
                        </Avatar>
                      )}
                      <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => handleImageUpload("logo")}>
                        อัปโหลดโลโก้
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        mb: 1,
                        color: theme.palette.text.primary,
                      }}
                    >
                      รูปหน้าร้าน (ไม่บังคับ)
                    </Box>
                    <Box sx={{ position: "relative" }}>
                      {shopInfo.coverImage ? (
                        <Box sx={{ position: "relative" }}>
                          <Box
                            component="img"
                            src={shopInfo.coverImage}
                            alt="Cover"
                            sx={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 1,
                              border: `2px solid ${theme.palette.divider}`,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage("coverImage")}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: theme.palette.error.main,
                              color: "white",
                              "&:hover": {
                                bgcolor: theme.palette.error.dark,
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 100,
                            bgcolor: theme.palette.grey[200],
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `2px dashed ${theme.palette.divider}`,
                          }}
                        >
                          <Button
                            variant="text"
                            startIcon={<UploadIcon />}
                            onClick={() => handleImageUpload("coverImage")}
                          >
                            อัปโหลดรูปภาพ
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
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
                ข้อมูลพื้นฐาน
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="ชื่อร้าน (ภาษาไทย)"
                    value={shopInfo.name}
                    onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="ชื่อร้าน (English)"
                    value={shopInfo.nameEn}
                    onChange={(e) => setShopInfo({ ...shopInfo, nameEn: e.target.value })}
                    fullWidth
                    helperText="ไม่บังคับ"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="เบอร์โทรติดต่อ"
                    value={shopInfo.phone}
                    onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Google Maps Link"
                    value={shopInfo.googleMapLink}
                    onChange={(e) => setShopInfo({ ...shopInfo, googleMapLink: e.target.value })}
                    fullWidth
                    placeholder="https://maps.google.com/..."
                    helperText="ลิงก์ตำแหน่งร้านบน Google Maps"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="ที่อยู่ร้าน"
                    value={shopInfo.address}
                    onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
              </Grid>
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
          บันทึกข้อมูล
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
