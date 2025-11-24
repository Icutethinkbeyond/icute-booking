"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Grid2,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Avatar,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { DatePicker, TimePicker } from "@mui/x-date-pickers"
import { LoadingButton } from "@mui/lab"
import { Formik, Form, Field, type FieldProps } from "formik"
import * as Yup from "yup"
import dayjs from "dayjs"
import { Plus, Timer, Phone, Save, RotateCcw, Smartphone } from "lucide-react"

enum CustomerType {
  WALK_IN = "WALK_IN",
  OTHER_CONTACT = "OTHER_CONTACT",
}

interface ServiceSelect {
  id: string
  name: string
}

interface EmployeeSelect {
  id: string
  name: string
}

interface Booking {
  customerType: CustomerType | ""
  serviceId: string
  bookingDate: string | null
  bookingTime: string | null
  employeeId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  emailNotification: boolean
}

const validationSchema = Yup.object({
  customerType: Yup.string().required("กรุณาเลือกช่องทางการจอง"),
  serviceId: Yup.string().required("กรุณาเลือกบริการ"),
  bookingDate: Yup.string().nullable().required("กรุณาเลือกวันที่"),
  bookingTime: Yup.string().nullable().required("กรุณาเลือกเวลา"),
  employeeId: Yup.string().required("กรุณาเลือกพนักงาน"),
  customerName: Yup.string().required("กรุณากรอกชื่อลูกค้า"),
  customerPhone: Yup.string()
    .required("กรุณากรอกเบอร์โทร")
    .matches(/^[0-9]{10}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก"),
  customerEmail: Yup.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  emailNotification: Yup.boolean(),
})

const servicesSelect: ServiceSelect[] = [
  { id: "1", name: "ตัดผม" },
  { id: "2", name: "สระผม" },
  { id: "3", name: "ย้อมสี" },
  { id: "4", name: "ดัดผม" },
  { id: "5", name: "เกล้าผม" },
]

const employeeSelect: EmployeeSelect[] = [
  { id: "1", name: "ช่างแอน" },
  { id: "2", name: "ช่างเบียร์" },
  { id: "3", name: "ช่างโอ๋" },
  { id: "4", name: "ช่างเอ" },
]

interface BookingFormProps {
  onSubmit?: (values: Booking) => void
  viewOnly?: boolean
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, viewOnly = false }) => {
  const [openBackdrop, setOpenBackdrop] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const initialBooking: Booking = {
    customerType: "",
    serviceId: "",
    bookingDate: null,
    bookingTime: null,
    employeeId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    emailNotification: false,
  }

  const handleFormSubmit = async (values: Booking, { resetForm }: { resetForm: () => void }) => {
    setOpenBackdrop(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (onSubmit) {
        onSubmit(values)
      }

      alert("จองสำเร็จ!")
      resetForm()
    } catch (error) {
      console.error("Error submitting booking:", error)
      alert("เกิดข้อผิดพลาดในการจอง")
    } finally {
      setOpenBackdrop(false)
    }
  }

  if (!isMobile) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                margin: "0 auto 20px",
              }}
            >
              <Smartphone size={40} />
            </Avatar>
            <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
              กรุณาเปิดด้วยอุปกรณ์มือถือ
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={2}>
              แบบฟอร์มจองนี้ออกแบบมาสำหรับ Smartphone และ Tablet เท่านั้น
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              กรุณาเปิดหน้านี้ด้วยอุปกรณ์มือถือหรือแท็บเล็ตของคุณ
            </Typography>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Formik<Booking>
      initialValues={initialBooking}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, errors, touched, isSubmitting, resetForm }) => (
        <Form>
          <Box p={3} border="1px solid #ccc" borderRadius="8px">
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Plus size={20} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    เพิ่มการจอง
                  </Typography>
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="customer-type-label">ช่องทางการจอง (จำเป็น)</InputLabel>
                  <Select
                    labelId="customer-type-label"
                    label="ช่องทางการจอง (จำเป็น)"
                    value={values.customerType || ""}
                    onChange={(e) => {
                      setFieldValue("customerType", e.target.value)
                    }}
                    error={touched.customerType && Boolean(errors.customerType)}
                  >
                    <MenuItem value={CustomerType.WALK_IN}>Walk In</MenuItem>
                    <MenuItem value={CustomerType.OTHER_CONTACT}>ช่องทางอื่นๆ</MenuItem>
                  </Select>
                  {touched.customerType && errors.customerType && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.customerType}
                    </Typography>
                  )}
                </FormControl>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="serviceId">
                  {({ field }: FieldProps) => (
                    <Autocomplete
                      id="serviceId"
                      options={servicesSelect}
                      getOptionLabel={(option: ServiceSelect) => option.name}
                      onChange={(event, value) => {
                        setFieldValue("serviceId", value !== null ? value.id : "")
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="เลือกบริการ (จำเป็น)"
                          name="serviceId"
                          error={touched.serviceId && Boolean(errors.serviceId)}
                          helperText={touched.serviceId && errors.serviceId}
                        />
                      )}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12 }} mt={2}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Timer size={20} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    กำหนดเวลานัด - เลือกพนักงาน
                  </Typography>
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="bookingDate">
                  {({ field, form }: FieldProps) => (
                    <DatePicker
                      label="วันที่"
                      sx={{ minWidth: "100%" }}
                      value={values.bookingDate ? dayjs(values.bookingDate) : null}
                      onChange={(newValue) => {
                        form.setFieldValue("bookingDate", newValue ? newValue.toISOString() : null)
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(touched.bookingDate && errors.bookingDate),
                          helperText: touched.bookingDate && errors.bookingDate ? String(errors.bookingDate) : "",
                        },
                      }}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="bookingTime">
                  {({ field, form }: FieldProps) => (
                    <TimePicker
                      label="เวลา"
                      sx={{ minWidth: "100%" }}
                      value={values.bookingTime ? dayjs(values.bookingTime) : null}
                      onChange={(newValue) => {
                        form.setFieldValue("bookingTime", newValue ? newValue.toISOString() : null)
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(touched.bookingTime && errors.bookingTime),
                          helperText: touched.bookingTime && errors.bookingTime ? String(errors.bookingTime) : "",
                        },
                      }}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="employeeId">
                  {({ field }: FieldProps) => (
                    <Autocomplete
                      id="employeeId"
                      options={employeeSelect}
                      getOptionLabel={(option: EmployeeSelect) => option.name}
                      onChange={(event, value) => {
                        setFieldValue("employeeId", value !== null ? value.id : "")
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="เลือกพนักงาน (จำเป็น)"
                          name="employeeId"
                          error={touched.employeeId && Boolean(errors.employeeId)}
                          helperText={touched.employeeId && errors.employeeId}
                        />
                      )}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12 }} mt={2}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Phone size={20} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    ช่องทางการติดต่อ
                  </Typography>
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="customerName">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      name="customerName"
                      label="ชื่อลูกค้า (จำเป็น)"
                      value={values.customerName || ""}
                      onChange={(e) => {
                        setFieldValue("customerName", e.target.value)
                      }}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          readOnly: viewOnly,
                        },
                      }}
                      error={touched.customerName && Boolean(errors.customerName)}
                      helperText={touched.customerName && errors.customerName}
                      fullWidth
                      disabled={openBackdrop || isSubmitting}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="customerPhone">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      name="customerPhone"
                      label="เบอร์โทร (จำเป็น)"
                      value={values.customerPhone || ""}
                      onChange={(e) => {
                        setFieldValue("customerPhone", e.target.value)
                      }}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          readOnly: viewOnly,
                        },
                      }}
                      error={touched.customerPhone && Boolean(errors.customerPhone)}
                      helperText={touched.customerPhone && errors.customerPhone}
                      fullWidth
                      disabled={openBackdrop || isSubmitting}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Field name="customerEmail">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      name="customerEmail"
                      label="Email (ถ้ามี)"
                      value={values.customerEmail || ""}
                      onChange={(e) => {
                        setFieldValue("customerEmail", e.target.value)
                      }}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          readOnly: viewOnly,
                        },
                      }}
                      error={touched.customerEmail && Boolean(errors.customerEmail)}
                      helperText={touched.customerEmail && errors.customerEmail}
                      fullWidth
                      disabled={openBackdrop || isSubmitting}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Field name="emailNotification">
                  {({ field }: FieldProps) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.emailNotification}
                          onChange={(e) => {
                            setFieldValue("emailNotification", e.target.checked)
                          }}
                          disabled={openBackdrop || isSubmitting || viewOnly}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body1" color="text.primary">
                          รับการแจ้งเตือนทางอีเมล
                        </Typography>
                      }
                    />
                  )}
                </Field>
              </Grid2>
            </Grid2>

            <Box sx={{ mt: 5, display: "flex", gap: 2 }}>
              <LoadingButton
                variant="contained"
                type="submit"
                color="primary"
                disabled={openBackdrop || isSubmitting}
                loading={openBackdrop || isSubmitting}
                startIcon={<Save />}
              >
                เพิ่มบริการ
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                color="error"
                onClick={() => resetForm()}
                disabled={openBackdrop || isSubmitting}
                startIcon={<RotateCcw />}
              >
                ล้างฟอร์ม
              </LoadingButton>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  )
}

export default BookingForm
