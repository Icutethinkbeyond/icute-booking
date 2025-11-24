"use client"

import type React from "react"
import { Box, Typography, Button, Container, Paper, useTheme, useMediaQuery } from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { motion } from "framer-motion"

interface ThankYouPageProps {
  bookingDetails?: {
    date?: string
    time?: string
    service?: string
    staff?: string
  }
  lineOfficialUrl?: string
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({
  bookingDetails,
  lineOfficialUrl = "https://line.me/R/ti/p/@yourlineofficial",
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleAddLine = () => {
    window.open(lineOfficialUrl, "_blank")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Paper
            elevation={8}
            sx={{
              padding: { xs: 3, sm: 5 },
              borderRadius: 4,
              textAlign: "center",
              background: "white",
            }}
          >
            {/* Success Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{
                    fontSize: { xs: 50, sm: 60 },
                    color: "white",
                  }}
                />
              </Box>
            </motion.div>

            {/* Thank You Message */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.75rem", sm: "2.125rem" },
                  marginBottom: 2,
                }}
              >
                ขอบคุณสำหรับการจอง!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  marginBottom: 3,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.7,
                }}
              >
                เราได้รับการจองของคุณเรียบร้อยแล้ว
                <br />
                ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมายในเร็วๆ นี้
              </Typography>
            </motion.div>

            {/* Booking Details (if provided) */}
            {bookingDetails && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: 2,
                    padding: 2.5,
                    marginBottom: 3,
                    border: `1px solid ${theme.palette.grey[200]}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      marginBottom: 1.5,
                      fontSize: { xs: "0.85rem", sm: "0.875rem" },
                    }}
                  >
                    รายละเอียดการจอง
                  </Typography>

                  {bookingDetails.date && (
                    <Typography variant="body2" sx={{ marginBottom: 0.5, fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
                      <strong>วันที่:</strong> {bookingDetails.date}
                    </Typography>
                  )}
                  {bookingDetails.time && (
                    <Typography variant="body2" sx={{ marginBottom: 0.5, fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
                      <strong>เวลา:</strong> {bookingDetails.time}
                    </Typography>
                  )}
                  {bookingDetails.service && (
                    <Typography variant="body2" sx={{ marginBottom: 0.5, fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
                      <strong>บริการ:</strong> {bookingDetails.service}
                    </Typography>
                  )}
                  {bookingDetails.staff && (
                    <Typography variant="body2" sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
                      <strong>พนักงาน:</strong> {bookingDetails.staff}
                    </Typography>
                  )}
                </Box>
              </motion.div>
            )}

            {/* LINE Official Account Button */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  marginBottom: 2,
                  fontSize: { xs: "0.85rem", sm: "0.875rem" },
                }}
              >
                เพิ่ม LINE Official Account เพื่อรับการแจ้งเตือนและข้อมูลข่าวสาร
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleAddLine}
                sx={{
                  backgroundColor: "#06C755",
                  color: "white",
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  padding: { xs: "12px 24px", sm: "14px 28px" },
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(6, 199, 85, 0.3)",
                  "&:hover": {
                    backgroundColor: "#05B04D",
                    boxShadow: "0 6px 16px rgba(6, 199, 85, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  เพิ่มเพื่อน LINE Official
                </Box>
              </Button>
            </motion.div>

            {/* Additional Info */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  marginTop: 3,
                  display: "block",
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                }}
              >
                หากมีข้อสงสัย กรุณาติดต่อเราผ่านช่องทางที่สะดวก
              </Typography>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}

export default ThankYouPage
