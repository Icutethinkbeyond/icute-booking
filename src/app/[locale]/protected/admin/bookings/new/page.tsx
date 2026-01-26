"use client";

import { useState, useMemo, FC } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  TextField,
  Alert,
  useTheme,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  BookingFormData,
  defaultBookingFormData,
  generateTimeSlots,
  mockServices,
  mockStaff,
} from "@/components/lib/admin-booking";
import { ChannelSelector } from "@/components/forms/admin-new-booking/ChannelSelector";
import { BookingSummary } from "@/components/forms/admin-new-booking/BookingSummary";
import { CustomerInfoForm } from "@/components/forms/admin-new-booking/CustomerInfoForm";
import { ServiceSelector } from "@/components/forms/admin-new-booking/ServiceSelector";
import { StaffSelector } from "@/components/forms/admin-new-booking/StaffSelector";
import { DateTimePicker } from "@mui/lab";

// interface BookingFormProps {
//   onSubmit?: (data: BookingFormData) => void;
//   onCancel?: () => void;
// }

const STEPS = [
  "ช่องทางและบริการ",
  "วันเวลาและพนักงาน",
  "ข้อมูลลูกค้า",
  "ยืนยันการจอง",
];

const BookingForm = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>(
    defaultBookingFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.channel) {
          newErrors.channel = "กรุณาเลือกช่องทางการจอง";
        }
        if (!formData.serviceId) {
          newErrors.serviceId = "กรุณาเลือกบริการ";
        }
        break;
      case 1:
        if (!formData.date) {
          newErrors.date = "กรุณาเลือกวันที่";
        }
        if (!formData.time) {
          newErrors.time = "กรุณาเลือกเวลา";
        }
        if (!formData.staffId) {
          newErrors.staffId = "กรุณาเลือกพนักงาน";
        }
        break;
      case 2:
        if (!formData.customerName.trim()) {
          newErrors.customerName = "กรุณากรอกชื่อลูกค้า";
        }
        if (!formData.customerPhone.trim()) {
          newErrors.customerPhone = "กรุณากรอกเบอร์โทรศัพท์";
        } else if (
          !/^0[0-9]{8,9}$/.test(formData.customerPhone.replace(/-/g, ""))
        ) {
          newErrors.customerPhone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
        }
        if (
          formData.customerEmail &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)
        ) {
          newErrors.customerEmail = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      // onSubmit?.(formData);
      setSubmitSuccess(true);
    }
  };

  const onCancel = () => {
    
  }
  

  const handleReset = () => {
    setFormData(defaultBookingFormData);
    setActiveStep(0);
    setErrors({});
    setSubmitSuccess(false);
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (submitSuccess) {
    return (
      <Card>
        <CardContent sx={{ py: 6, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: theme.palette.success.main + "15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <EventNoteIcon
              sx={{ fontSize: 40, color: theme.palette.success.main }}
            />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            บันทึกการจองสำเร็จ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            การจองของคุณได้รับการบันทึกเรียบร้อยแล้ว
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="outlined" onClick={handleReset}>
              สร้างการจองใหม่
            </Button>
            <Button variant="contained" onClick={onCancel}>
              กลับหน้าหลัก
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          เพิ่มการจองใหม่
        </Typography>
        <Typography variant="body1" color="text.secondary">
          กรอกข้อมูลการจองบริการสำหรับลูกค้า
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid2 container spacing={3}>
        {/* Main Form */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Step 0: Channel & Service */}
              {activeStep === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <ChannelSelector
                    value={formData.channel}
                    onChange={(channel) => updateFormData("channel", channel)}
                    error={errors.channel}
                  />
                  <Divider />
                  <ServiceSelector
                    services={mockServices}
                    value={formData.serviceId}
                    onChange={(serviceId) => {
                      updateFormData("serviceId", serviceId);
                      // Reset staff when service changes
                      updateFormData("staffId", "");
                    }}
                    error={errors.serviceId}
                  />
                </Box>
              )}

              {/* Step 1: Date, Time & Staff */}
              {activeStep === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <DateTimePicker
                    selectedDate={formData.date}
                    selectedTime={formData.time}
                    onDateChange={(date: any) => updateFormData("date", date)}
                    onTimeChange={(time: any) => updateFormData("time", time)}
                    timeSlots={timeSlots}
                    dateError={errors.date}
                    timeError={errors.time}
                  />
                  <Divider />
                  <StaffSelector
                    staffList={mockStaff}
                    value={formData.staffId}
                    onChange={(staffId) => updateFormData("staffId", staffId)}
                    selectedServiceId={formData.serviceId}
                    error={errors.staffId}
                  />
                </Box>
              )}

              {/* Step 2: Customer Info */}
              {activeStep === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <CustomerInfoForm
                    customerName={formData.customerName}
                    customerPhone={formData.customerPhone}
                    customerEmail={formData.customerEmail}
                    onChange={(field, value) => updateFormData(field, value)}
                    errors={{
                      customerName: errors.customerName,
                      customerPhone: errors.customerPhone,
                      customerEmail: errors.customerEmail,
                    }}
                  />
                  <Divider />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1.5, fontWeight: 600 }}
                    >
                      หมายเหตุ (ถ้ามี)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="เช่น แพ้น้ำหอม, ต้องการห้อง VIP, ฯลฯ"
                      value={formData.notes || ""}
                      onChange={(e) => updateFormData("notes", e.target.value)}
                    />
                  </Box>
                </Box>
              )}

              {/* Step 3: Summary */}
              {activeStep === 3 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    กรุณาตรวจสอบข้อมูลการจองให้ถูกต้องก่อนกดยืนยัน
                  </Alert>
                  <BookingSummary
                    formData={formData}
                    services={mockServices}
                    staffList={mockStaff}
                  />
                  {formData.notes && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: theme.palette.grey[50],
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        หมายเหตุ:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 4,
                  pt: 3,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={activeStep === 0 ? onCancel : handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  {activeStep === 0 ? "ยกเลิก" : "ย้อนกลับ"}
                </Button>
                {activeStep < STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                  >
                    ถัดไป
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    startIcon={<SaveIcon />}
                  >
                    ยืนยันการจอง
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Sidebar Summary */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: "sticky", top: 24 }}>
            <BookingSummary
              formData={formData}
              services={mockServices}
              staffList={mockStaff}
            />
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default BookingForm;
