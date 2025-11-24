"use client"

import type React from "react"
import { Box, Button, Container, Typography, Card, CardContent, useTheme, Stack } from "@mui/material"
import { motion } from "framer-motion"

// LINE logo SVG icon
const LineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.477 2 2 5.642 2 10.182c0 4.042 3.581 7.422 8.432 8.042.329.071.776.216.889.497.102.254.066.653.033.91l-.142.852c-.043.254-.199.994.872.542.866-.366 4.679-2.755 6.385-4.717 1.176-1.277 1.731-2.575 1.731-4.126C22 5.642 17.523 2 12 2z"
      fill="currentColor"
    />
    <path
      d="M9.467 12.533H7.733a.267.267 0 01-.266-.267V9.733c0-.147.12-.266.266-.266.147 0 .267.119.267.266v2.267h1.467c.147 0 .266.12.266.267a.267.267 0 01-.266.266zm1.066-.267V9.733a.267.267 0 01.534 0v2.533a.267.267 0 01-.534 0zm3.734 0c0 .147-.12.267-.267.267a.267.267 0 01-.267-.267v-2.533c0-.147.12-.266.267-.266.146 0 .267.119.267.266v2.533zm2.133.267h-1.733a.267.267 0 01-.267-.267V9.733c0-.147.12-.266.267-.266.147 0 .267.119.267.266v2.267h1.466c.147 0 .267.12.267.267a.267.267 0 01-.267.266z"
      fill="#fff"
    />
  </svg>
)

const LineLogin: React.FC = () => {
  const theme = useTheme()

  const handleLineLogin = () => {
    // Implement LINE login logic here
    console.log("LINE login initiated")
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%" }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `2px solid ${theme.palette.grey[200]}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              p: 4,
              textAlign: "center",
            }}
          >
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 800,
                  }}
                >
                  SL Book
                </Typography>
              </Box>
            </motion.div>

            {/* <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 1,
              }}
            >
              ICUTESOURCE
            </Typography> */}
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
              }}
            >
              ยินดีต้อนรับ
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: theme.palette.text.primary,
                  }}
                >
                  เข้าสู่ระบบ
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  เข้าสู่ระบบด้วยบัญชี LINE ของคุณ
                </Typography>
              </Box>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLineLogin}
                  sx={{
                    bgcolor: "#06C755",
                    color: "white",
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    "&:hover": {
                      bgcolor: "#05B04D",
                    },
                    boxShadow: "0 4px 12px rgba(6, 199, 85, 0.3)",
                  }}
                  startIcon={<LineIcon />}
                >
                  เข้าสู่ระบบด้วย LINE
                </Button>
              </motion.div>

              <Box sx={{ textAlign: "center", pt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "block",
                    mb: 1,
                  }}
                >
                  การเข้าสู่ระบบแสดงว่าคุณยอมรับ
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  เงื่อนไขการใช้งาน
                </Typography>
                {" และ "}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  นโยบายความเป็นส่วนตัว
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            © 2025 ICUTESOURCE. All rights reserved.
          </Typography>
        </Box>
      </motion.div>
    </Container>
  )
}

export default LineLogin
