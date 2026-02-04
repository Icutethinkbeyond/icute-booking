"use client"

import { useState } from "react"
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Container,
  Paper,
  Typography,
  ThemeProvider,
  createTheme,
  useTheme,
  LinearProgress,
} from "@mui/material"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"
import { Step1ServiceSelection } from "@/components/forms/booking/step/Step1ServiceSelection"
import { Step5ContactInfo } from "@/components/forms/booking/step/Step5ContactInfo"
import { Step3StaffSelection } from "@/components/forms/booking/step/Step3StaffSelection"
import { Step4DateTime } from "@/components/forms/booking/step/Step4DateTime"
import { Step2ServiceType } from "@/components/forms/booking/step/Step2ServiceType"

const steps = ["เลือกบริการ", "ประเภทบริการ", "เลือกพนักงาน", "วันที่-เวลานัด", "Contact Info"]

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#262626",
    },
    secondary: {
      main: "#f5f5f5",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#0a0a0a",
      secondary: "#737373",
    },
  },
  typography: {
    fontFamily: "var(--font-sans)",
  },
})

function NavigationButtons({
  activeStep,
  stepsLength,
  onBack,
  onNext,
  isValid,
}: {
  activeStep: number
  stepsLength: number
  onBack: () => void
  onNext: () => void
  isValid?: boolean
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: { xs: 3, md: 4 },
        pt: { xs: 2, md: 3 },
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 1.5,
      }}
    >
      <Button
        disabled={activeStep === 0}
        onClick={onBack}
        variant="outlined"
        size="medium"
        startIcon={<ArrowLeft size={16} />}
        sx={{
          fontSize: { xs: "0.875rem", md: "1rem" },
          px: { xs: 2, md: 2.75 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        Back
      </Button>
      <Button
        onClick={onNext}
        // disabled={!isValid}
        variant="contained"
        size="medium"
        endIcon={<ArrowRight size={16} />}
        sx={{
          fontSize: { xs: "0.875rem", md: "1rem" },
          px: { xs: 2.5, md: 2.75 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        {activeStep === stepsLength - 1 ? (
          <>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Confirm Booking
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Confirm
            </Box>
          </>
        ) : (
          "Next"
        )}
      </Button>
    </Box>
  )
}

export default function BookingPage() {
  const [activeStep, setActiveStep] = useState(0)
  // const [lineUser, setLineUser] = useState<LineUser | null>(null)
  // const [bookingData, setBookingData] = useState<BookingData>({
  //   service: "",
  //   serviceType: "with-staff",
  //   staff: "",
  //   date: null,
  //   time: "",
  //   name: "",
  //   phone: "",
  //   email: "",
  // })

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    // setLineUser(null)
    // setBookingData({
    //   service: "",
    //   serviceType: "with-staff",
    //   staff: "",
    //   date: null,
    //   time: "",
    //   name: "",
    //   phone: "",
    //   email: "",
    // })
  }

  // const handleLineLogin = () => {
  //   const mockUser: LineUser = {
  //     userId: "U1234567890abcdef",
  //     displayName: "สมชาย ใจดี",
  //     pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
  //     email: "somchai@example.com",
  //   }
  //   setLineUser(mockUser)
  //   setBookingData({
  //     ...bookingData,
  //     name: mockUser.displayName,
  //     email: mockUser.email || "",
  //   })
  // }

  // const handleLineLogout = () => {
  //   setLineUser(null)
  //   setBookingData({
  //     ...bookingData,
  //     name: "",
  //     email: "",
  //   })
  // }

  // const isStepValid = () => {
  //   switch (activeStep) {
  //     case 0:
  //       return bookingData.service !== ""
  //     case 1:
  //       return true
  //     case 2:
  //       return bookingData.serviceType === "without-staff" || bookingData.staff !== ""
  //     case 3:
  //       return bookingData.date !== null && bookingData.time !== ""
  //     case 4:
  //       return bookingData.name !== "" && bookingData.phone !== "" && bookingData.email !== ""
  //     default:
  //       return false
  //   }
  // }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Step1ServiceSelection
            // value={bookingData.service}
            // onChange={(value) => setBookingData({ ...bookingData, service: value })}
          />
        )
      case 1:
        return (
          <Step2ServiceType
            // value={bookingData.serviceType}
            // onChange={(value) => setBookingData({ ...bookingData, serviceType: value })}
          />
        )
      case 2:
        return (
          <Step3StaffSelection
            // value={bookingData.staff}
            // onChange={(value) => setBookingData({ ...bookingData, staff: value })}
            // serviceType={bookingData.serviceType}
          />
        )
      case 3:
        return (
          <Step4DateTime
            // date={bookingData.date}
            // time={bookingData.time}
            // onDateChange={(value) => setBookingData({ ...bookingData, date: value })}
            // onTimeChange={(value) => setBookingData({ ...bookingData, time: value })}
          />
        )
      case 4:
        return (
          <Step5ContactInfo
            // name={bookingData.name}
            // phone={bookingData.phone}
            // email={bookingData.email}
            // onNameChange={(value) => setBookingData({ ...bookingData, name: value })}
            // onPhoneChange={(value) => setBookingData({ ...bookingData, phone: value })}
            // onEmailChange={(value) => setBookingData({ ...bookingData, email: value })}
            // isLoggedIn={lineUser !== null}
          />
        )
      default:
        return null
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: { xs: 2, md: 4, lg: 6 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 3, md: 4 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              จองบริการ
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Complete the steps below to schedule your service
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              gap: 4,
            }}
          >
            <Box>
              {/* <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <LineLoginButton user={lineUser} onLogin={handleLineLogin} onLogout={handleLineLogout} />
              </Box> */}

              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, md: 3, lg: 4 },
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel
                          sx={{
                            "& .MuiStepLabel-label": {
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            },
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      Step {activeStep + 1} of {steps.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      {steps[activeStep]}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={((activeStep + 1) / steps.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 1,
                        bgcolor: "primary.main",
                      },
                    }}
                  />
                </Box>

                {activeStep === steps.length ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 6,
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        mb: 2,
                      }}
                    >
                      <Check size={32} color="white" />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      Booking Confirmed!
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                      }}
                    >
                      Your appointment has been successfully scheduled. A confirmation email has been sent to{" "}
                      {/* {bookingData.email}. */}
                    </Typography>
                    <Button onClick={handleReset} variant="contained" size="large">
                      Book Another Appointment
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        minHeight: { xs: 350, md: 400 },
                        py: { xs: 2, md: 3 },
                      }}
                    >
                      {renderStepContent(activeStep)}
                    </Box>

                    <NavigationButtons
                      activeStep={activeStep}
                      stepsLength={steps.length}
                      onBack={handleBack}
                      onNext={handleNext}
                      // isValid={isStepValid()}
                    />
                  </>
                )}
              </Paper>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              {/* <BookingSummary bookingData={bookingData} /> */}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
