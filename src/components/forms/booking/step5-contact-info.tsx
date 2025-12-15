"use client"
import { TextField, Typography, Box, useTheme } from "@mui/material"
import { Mail, Phone, User } from "lucide-react"

interface Step5Props {
  name?: string
  phone?: string
  email?: string
  onNameChange?: (value: string) => void
  onPhoneChange?: (value: string) => void
  onEmailChange?: (value: string) => void
  isLoggedIn?: boolean
}

export function Step5ContactInfo({
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  isLoggedIn = false,
}: Step5Props) {
  const theme = useTheme()

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
        Contact information
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "text.secondary",
        }}
      >
        {isLoggedIn
          ? "We've pre-filled your information. Please review and update if needed."
          : "Please provide your contact details to confirm the booking"}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <User size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              Full Name
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Enter your full name"
            value={name}
            // onChange={(e) => onNameChange(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.light,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Phone size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              Phone Number
            </Typography>
          </Box>
          <TextField
            fullWidth
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            // onChange={(e) => onPhoneChange(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.light,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Mail size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              Email Address
            </Typography>
          </Box>
          <TextField
            fullWidth
            type="email"
            placeholder="Enter your email address"
            value={email}
            // onChange={(e) => onEmailChange(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.light,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
