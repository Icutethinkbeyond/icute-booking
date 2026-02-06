"use client";

import { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Check } from "lucide-react";
import { Step1ServiceSelection } from "@/components/forms/booking/step/Step1ServiceSelection";
import { Step5ContactInfo } from "@/components/forms/booking/step/Step5ContactInfo";
import { Step3EmployeeSelection } from "@/components/forms/booking/step/Step3EmployeeSelection";
import { Step4DateTime } from "@/components/forms/booking/step/Step4DateTime";
import { Step2ServiceType } from "@/components/forms/booking/step/Step2ServiceType";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useStoreContext } from "@/contexts/StoreContext";
import APIServices from "@/utils/services/APIServices";
import { useParams } from "next/navigation";
import { NavigationButtons } from "@/components/shared/NavigationButtons";
import { AllowSelectEmpType, initialBooking } from "@/interfaces/Booking";
import { useBookingContext } from "@/contexts/BookingContext";
import { initialStore } from "@/interfaces/Store";
import { OpenTimeRes } from "@/app/api/store/public/open-time-settings/route";
import { AppDialog } from "@/components/shared/CustomDialog";

export default function BookingPage() {
  const params = useParams<{ shop_id: string }>();

  const { StoreForm, setStoreForm } = useStoreContext();
  const { bookingForm, setBookingForm } = useBookingContext();
  const { setNotify } = useNotifyContext();

  const [activeStep, setActiveStep] = useState<number>(2);
  const [steps, setSteps] = useState<string[]>([]);
  const [allowCustomerSelectEmployee, setAllowCustomerSelectEmployee] =
    useState<boolean>(false);
  const [shopIsClosed, setShopIsClosed] = useState<OpenTimeRes>({
    isClosed: false,
    reason: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleNext = () => {
    if (
      bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff &&
      activeStep === 1
    ) {
      setActiveStep(3);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    // setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (
      bookingForm.needSelectEmployee === AllowSelectEmpType.withoutstaff &&
      activeStep === 3
    ) {
      setActiveStep(1);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setBookingForm(initialBooking);
  };

  const stepsAllowSelect = [
    "เลือกบริการ",
    "เลือกประเภทบริการ",
    "เลือกพนักงาน",
    "วันที่-เวลาเข้ารับบริการ",
    "ข้อมูลติดต่อ",
  ];

  const stepsNotAllowSelect = [
    "เลือกบริการ",
    "วันที่-เวลาเข้ารับบริการ",
    "ข้อมูลติดต่อ",
  ];

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

  const getStoreSetting = async () => {
    try {
      setLoading(true);

      const [rule_settings, open_time_settings]: any = await Promise.all([
        APIServices.get(
          `/api/store/public/rule-settings/?store_username=${params.shop_id}`,
        ),
        APIServices.get(
          `/api/store/public/open-time-settings/?store_username=${params.shop_id}`,
        ),
      ]);

      setShopIsClosed(open_time_settings);

      const employeeSetting = rule_settings.employeeSetting as any;
      const allowSelect = employeeSetting?.allowCustomerSelectEmployee ?? false;

      setAllowCustomerSelectEmployee(allowSelect);

      allowSelect
        ? setSteps(stepsAllowSelect)
        : setSteps(stepsNotAllowSelect);

      // setStoreForm(data.data);
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStoreSetting();
    return () => {
      setStoreForm(initialStore);
      setSteps([]);
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderStepContentAllowSelect = (step: number) => {
    switch (step) {
      case 0:
        return <Step1ServiceSelection />;
      case 1:
        return <Step2ServiceType />;
      case 2:
        return <Step3EmployeeSelection />;
      case 3:
        return (
          <Step4DateTime
          // date={bookingData.date}
          // time={bookingData.time}
          // onDateChange={(value) => setBookingData({ ...bookingData, date: value })}
          // onTimeChange={(value) => setBookingData({ ...bookingData, time: value })}
          />
        );
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
        );
      default:
        return null;
    }
  };

  const renderStepContentNotAllowSelect = (step: number) => {
    switch (step) {
      case 0:
        return <Step1ServiceSelection />;
      case 1:
        return <Step4DateTime />;
      case 2:
        return <Step5ContactInfo />;
      default:
        return null;
    }
  };

  return (
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
            ทำตามขั้นตอนด้านล่างเพื่อกำหนดเวลานัดหมายรับบริการ
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              // lg: "2fr 1fr",
              lg: "1fr",
            },
            gap: 4,
          }}
        >
          <Box>
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
                  {steps.length &&
                    steps.map((label, index) => (
                      <Step key={index}>
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
                    ขั้นตอนที่ {activeStep + 1} จาก {steps.length}
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
                    ยืนยันการจอง!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      mb: 3,
                    }}
                  >
                    การนัดหมายของคุณได้รับการกำหนดเวลาเรียบร้อยแล้ว
                    อีเมลยืนยันได้ถูกส่งไปยัง {bookingForm.customerEmail}.
                  </Typography>
                  <Button
                    onClick={handleReset}
                    variant="contained"
                    size="large"
                  >
                    จองนัดหมายเพิ่มเติม
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
                    {allowCustomerSelectEmployee
                      ? renderStepContentAllowSelect(activeStep)
                      : renderStepContentNotAllowSelect(activeStep)}
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

          {/* <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <BookingSummary bookingData={bookingData} />
            </Box> */}

          <AppDialog
            open={open}
            type="success"
            title="บันทึกข้อมูลสำเร็จ"
            description="ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว"
            imageSrc="/images/success.png"
            confirmText="ตกลง"
            onConfirm={() => {
              console.log("confirm");
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        </Box>
      </Container>
    </Box>
  );
}
