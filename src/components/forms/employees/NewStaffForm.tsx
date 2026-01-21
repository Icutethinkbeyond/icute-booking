"use client";

import React from "react";

import { useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid2,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Divider,
  Alert,
  Tooltip,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import WorkIcon from "@mui/icons-material/Work";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import NotesIcon from "@mui/icons-material/Notes";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import {
  StaffFormData,
  BlockedTime,
  DayOfWeek,
  StaffRole,
  STAFF_ROLES,
  DAYS_OF_WEEK,
} from "@/components/lib/staff";
import { services } from "@/utils/lib/booking-data";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import { Employee } from "@/interfaces/Store";
import { useServiceContext } from "@/contexts/ServiceContext";
import { useEmployeeContext } from "@/contexts/EmployeeContext";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { Save } from "lucide-react";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import DragDropImage from "@/components/shared/DragDropImage";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface StaffFormProps {
  initialData?: StaffFormData;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
}

const defaultFormData: StaffFormData = {
  firstName: "",
  lastName: "",
  nickname: "",
  phone: "",
  email: "",
  password: "",
  avatar: "",
  role: "staff",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  workingHours: { start: "09:00", end: "18:00" },
  serviceIds: [],
  blockedTimes: [],
  isActive: true,
  notes: "",
  hireDate: null,
};

const validationSchema = Yup.object().shape({
  // name: Yup.string().required("กรุณากรอกรหัสอุปกรณ์"),
  // durationMinutes: Yup.number().required("กรุณาใส่เวลาของคอร์ส"),
  // price: Yup.number().required("กรุณาใส่ราคาของคอร์ส"),
});

export default function StaffForm({
  initialData,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const theme = useTheme();

  const {
    setServiceForm,
    serviceForm,
    serviceEdit,
    setServiceEdit,
    setServiceList,
    serviceList,
  } = useServiceContext();
  const { employeeList, setEmployeeList, employeeForm, employeeEdit } =
    useEmployeeContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<StaffFormData>(
    initialData || defaultFormData
  );
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBlockedTimeForm, setShowBlockedTimeForm] = useState(false);
  const [newBlockedTime, setNewBlockedTime] = useState<Omit<BlockedTime, "id">>(
    {
      date: new Date(),
      startTime: "09:00",
      endTime: "18:00",
      reason: "",
      type: "leave",
    }
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkingDayToggle = (day: DayOfWeek) => {
    const newDays = formData.workingDays.includes(day)
      ? formData.workingDays.filter((d) => d !== day)
      : [...formData.workingDays, day];
    setFormData({ ...formData, workingDays: newDays });
  };

  const handleAddBlockedTime = () => {
    if (newBlockedTime.reason.trim()) {
      const blockedTime: BlockedTime = {
        ...newBlockedTime,
        id: Date.now().toString(),
      };
      setFormData({
        ...formData,
        blockedTimes: [...formData.blockedTimes, blockedTime],
      });
      setNewBlockedTime({
        date: new Date(),
        startTime: "09:00",
        endTime: "18:00",
        reason: "",
        type: "leave",
      });
      setShowBlockedTimeForm(false);
    }
  };

  const handleRemoveBlockedTime = (id: string) => {
    setFormData({
      ...formData,
      blockedTimes: formData.blockedTimes.filter((bt) => bt.id !== id),
    });
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleFormSubmit = async (
    values: Employee,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<Employee> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // // 2. เรียกใช้ API
    // let result;

    // if (!serviceEdit) {
    //   result = await serviceService.createService(values);
    // } else {
    //   result = await serviceService.updateService(values);
    // }

    // // สำเร็จจะ redirect ไปที่ table
    // if (result.success) {
    //   resetForm();

    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: result.success ? "success" : "error",
    //   });

    //   setTimeout(() => {
    //     router.push(`/${localActive}/protected/admin/services`);
    //   }, 1000);
    // } else {
    //   // // // 3. จัดการเมื่อสำเร็จ
    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: "error",
    //   });
    // }
  };

  return (
    <>
      <Formik<Employee>
        initialValues={employeeForm} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          isSubmitting,
          resetForm,
        }) => (
          <Form>
            <Box sx={{ maxWidth: 900, mx: "auto" }}>
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h1"
                  sx={{ color: theme.palette.primary.main }}
                >
                  {initialData ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
                </Typography>
                <Box>
                  <FormControl
                    fullWidth
                    disabled={openBackdrop || isSubmitting || disabledForm}
                  >
                    <Field name="active">
                      {({ field, form }: any) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(field.value)}
                              onChange={(e) => {
                                form.setFieldValue(
                                  field.name,
                                  e.target.checked
                                );
                              }}
                              color="primary"
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                color: theme.palette.text.secondary,
                              }}
                            >
                              เปิดใช้งาน
                            </Typography>
                          }
                        />
                      )}
                    </Field>
                  </FormControl>
                </Box>
              </Box>

              <Grid2 container spacing={3}>
                {/* Left Column - Photo & Basic Info */}
                <Grid2 size={{ xs: 12, md: 4 }}>
                  {/* Profile Photo */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PersonIcon /> รูปโปรไฟล์
                      </Typography>

                      <Field
                        name="imageUrl"
                        component={DragDropImage}
                        setFieldValue={setFieldValue}
                      />
                      {/* 
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-block",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          src={formData.avatar}
                          sx={{
                            width: 150,
                            height: 150,
                            border: `4px solid ${theme.palette.grey[100]}`,
                            backgroundColor: theme.palette.grey[200],
                          }}
                        >
                          <PersonIcon
                            sx={{
                              fontSize: 80,
                              color: theme.palette.grey[400],
                            }}
                          />
                        </Avatar>
                        {formData.avatar && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              setFormData({ ...formData, avatar: "" })
                            }
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              backgroundColor: theme.palette.error.main,
                              color: "white",
                              "&:hover": {
                                backgroundColor: theme.palette.error.dark,
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box> */}

                      {/* <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<AddPhotoAlternateIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        fullWidth
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: theme.palette.grey[100],
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        อัปโหลดรูป
                      </Button> */}
                    </CardContent>
                  </Card>

                  {/* Role & Permissions */}
                  <Card>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <BadgeIcon /> สิทธิ์การใช้งาน
                      </Typography>

                      <FormControl fullWidth>
                        <InputLabel>ตำแหน่ง / Role</InputLabel>
                        <Select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as StaffRole,
                            })
                          }
                          label="ตำแหน่ง / Role"
                        >
                          {STAFF_ROLES.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                              <Box>
                                <Typography variant="body1">
                                  {role.label}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {role.description}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid2>

                {/* Right Column - Details */}
                <Grid2 size={{ xs: 12, md: 8 }}>
                  {/* Basic Information */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PersonIcon /> ข้อมูลพื้นฐาน
                      </Typography>

                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="name">
                            {({ field }: FieldProps) => (
                              <TextField
                                {...field}
                                name="name"
                                // label="ชื่อ *"
                                value={values.name}
                                onChange={(e) => {
                                  setFieldValue("name", e.target.value);
                                }}
                                placeholder="ชื่อ *"
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                fullWidth
                                disabled={
                                  openBackdrop || isSubmitting || disabledForm
                                }
                              />
                            )}
                          </Field>
                          {/* <TextField
                            label="ชื่อ *"
                            fullWidth
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                          /> */}
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="surname">
                            {({ field }: FieldProps) => (
                              <TextField
                                {...field}
                                name="surname"
                                // label="นามสกุล *"
                                value={values.surname}
                                onChange={(e) => {
                                  setFieldValue("surname", e.target.value);
                                }}
                                placeholder="นามสกุล *"
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                error={
                                  touched.surname && Boolean(errors.surname)
                                }
                                helperText={touched.surname && errors.surname}
                                fullWidth
                                disabled={
                                  openBackdrop || isSubmitting || disabledForm
                                }
                              />
                            )}
                          </Field>
                          {/* <TextField
                            label="นามสกุล *"
                            fullWidth
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                          /> */}
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="nickname">
                            {({ field }: FieldProps) => (
                              <TextField
                                {...field}
                                name="nickname"
                                // label="นามสกุล"
                                value={values.nickname}
                                onChange={(e) => {
                                  setFieldValue("nickname", e.target.value);
                                }}
                                placeholder="ชื่อเล่น"
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                error={
                                  touched.nickname && Boolean(errors.nickname)
                                }
                                helperText={touched.nickname && errors.nickname}
                                fullWidth
                                disabled={
                                  openBackdrop || isSubmitting || disabledForm
                                }
                              />
                            )}
                          </Field>
                          {/* <TextField
                            label="ชื่อเล่น"
                            fullWidth
                            value={formData.nickname}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nickname: e.target.value,
                              })
                            }
                          /> */}
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="date">
                            {({ field, form }: FieldProps) => (
                              <DatePicker
                                label="วันที่เริ่มงาน"
                                sx={{ minWidth: "100%" }}
                                // ✔ เวลา (dayjs) หรือ null
                                value={
                                  values.startDate
                                    ? dayjs(values.startDate)
                                    : null
                                }
                                // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                                onChange={(newValue) => {
                                  form.setFieldValue(
                                    "date",
                                    newValue ? newValue.toISOString() : null
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: Boolean(
                                      touched.startDate && errors.startDate
                                    ),
                                    helperText:
                                      touched.startDate && errors.startDate
                                        ? String(errors.startDate)
                                        : "",
                                  },
                                }}
                              />
                            )}
                          </Field>
                          {/* <TextField
                            label="วันที่เริ่มงาน"
                            type="date"
                            fullWidth
                            value={
                              formData.hireDate
                                ? new Date(formData.hireDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                hireDate: e.target.value
                                  ? new Date(e.target.value)
                                  : null,
                              })
                            }
                            slotProps={{
                              inputLabel: { shrink: true },
                            }}
                          /> */}
                        </Grid2>
                      </Grid2>

                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PhoneIcon /> ข้อมูลติดต่อ
                      </Typography>

                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          {/* <TextField
                            label="เบอร์โทร *"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            error={!!errors.phone}
                            helperText={errors.phone}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <PhoneIcon
                                    sx={{
                                      mr: 1,
                                      color: theme.palette.grey[400],
                                    }}
                                  />
                                ),
                              },
                            }}
                          /> */}
                          <Field name="phone">
                            {({ field }: FieldProps) => (
                              <TextField
                                {...field}
                                name="phone"
                                label="เบอร์โทร *"
                                value={values.phone}
                                onChange={(e) => {
                                  setFieldValue("phone", e.target.value);
                                }}
                                // placeholder="เบอร์โทร *"
                                slotProps={{
                                  inputLabel: { shrink: true },
                                  input: {
                                    startAdornment: (
                                      <PhoneIcon
                                        sx={{
                                          mr: 1,
                                          color: theme.palette.grey[400],
                                        }}
                                      />
                                    ),
                                  },
                                }}
                                error={touched.phone && Boolean(errors.phone)}
                                helperText={touched.phone && errors.phone}
                                fullWidth
                                disabled={
                                  openBackdrop || isSubmitting || disabledForm
                                }
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="อีเมล"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            error={!!errors.email}
                            helperText={errors.email}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <EmailIcon
                                    sx={{
                                      mr: 1,
                                      color: theme.palette.grey[400],
                                    }}
                                  />
                                ),
                              },
                            }}
                          />
                        </Grid2>
                      </Grid2>

                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <LockIcon /> รหัสผ่านสำหรับเข้าสู่ระบบ
                      </Typography>

                      {initialData && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
                        </Alert>
                      )}

                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label={initialData ? "รหัสผ่านใหม่" : "รหัสผ่าน *"}
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            error={!!errors.password}
                            helperText={
                              errors.password || "อย่างน้อย 6 ตัวอักษร"
                            }
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon
                                      sx={{ color: theme.palette.grey[400] }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      edge="end"
                                      size="small"
                                    >
                                      {showPassword ? (
                                        <VisibilityOff />
                                      ) : (
                                        <Visibility />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="confirmPassword">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                label="ยืนยันรหัสผ่าน"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                error={
                                  touched.confirmPassword &&
                                  Boolean(errors.confirmPassword)
                                }
                                helperText={
                                  touched.confirmPassword &&
                                  errors.confirmPassword
                                }
                                slotProps={{
                                  inputLabel: { shrink: true },
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={handleTogglePassword}
                                        >
                                          {showPassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            )}
                          </Field>
                          {/* <TextField
                            label={
                              initialData
                                ? "ยืนยันรหัสผ่านใหม่"
                                : "ยืนยันรหัสผ่าน *"
                            }
                            type={showConfirmPassword ? "text" : "password"}
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon
                                      sx={{ color: theme.palette.grey[400] }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword
                                        )
                                      }
                                      edge="end"
                                      size="small"
                                    >
                                      {showConfirmPassword ? (
                                        <VisibilityOff />
                                      ) : (
                                        <Visibility />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          /> */}
                        </Grid2>
                      </Grid2>
                    </CardContent>
                  </Card>

                  {/* Working Schedule */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <AccessTimeIcon /> ตารางการทำงาน
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, color: theme.palette.text.secondary }}
                        >
                          วันทำงานประจำ *
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {DAYS_OF_WEEK.map((day) => (
                            <Chip
                              key={day.value}
                              label={day.label}
                              onClick={() => handleWorkingDayToggle(day.value)}
                              sx={{
                                cursor: "pointer",
                                backgroundColor: formData.workingDays.includes(
                                  day.value
                                )
                                  ? theme.palette.primary.main
                                  : theme.palette.grey[100],
                                color: formData.workingDays.includes(day.value)
                                  ? "white"
                                  : theme.palette.text.primary,
                                "&:hover": {
                                  backgroundColor:
                                    formData.workingDays.includes(day.value)
                                      ? theme.palette.primary.dark
                                      : theme.palette.grey[200],
                                },
                              }}
                            />
                          ))}
                        </Box>
                        {errors.workingDays && (
                          <FormHelperText error>
                            {errors.workingDays}
                          </FormHelperText>
                        )}
                      </Box>

                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 6 }}>
                          <TextField
                            label="เวลาเข้างาน"
                            type="time"
                            fullWidth
                            value={formData.workingHours.start}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  start: e.target.value,
                                },
                              })
                            }
                            slotProps={{
                              inputLabel: { shrink: true },
                            }}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6 }}>
                          <TextField
                            label="เวลาเลิกงาน"
                            type="time"
                            fullWidth
                            value={formData.workingHours.end}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  end: e.target.value,
                                },
                              })
                            }
                            slotProps={{
                              inputLabel: { shrink: true },
                            }}
                          />
                        </Grid2>
                      </Grid2>
                    </CardContent>
                  </Card>

                  {/* Blocked Times */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: theme.palette.primary.main,
                          }}
                        >
                          <EventBusyIcon /> ช่วงไม่ว่าง (Leave / Block Time)
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => setShowBlockedTimeForm(true)}
                          sx={{
                            color: theme.palette.primary.main,
                          }}
                        >
                          เพิ่มช่วงเวลา
                        </Button>
                      </Box>

                      {showBlockedTimeForm && (
                        <Paper
                          sx={{
                            p: 2,
                            mb: 2,
                            backgroundColor: theme.palette.grey[100],
                            borderRadius: 2,
                          }}
                        >
                          <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                              <TextField
                                label="วันที่"
                                type="date"
                                fullWidth
                                size="small"
                                value={
                                  new Date(newBlockedTime.date)
                                    .toISOString()
                                    .split("T")[0]
                                }
                                onChange={(e) =>
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    date: new Date(e.target.value),
                                  })
                                }
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 6, sm: 2 }}>
                              <TextField
                                label="เริ่ม"
                                type="time"
                                fullWidth
                                size="small"
                                value={newBlockedTime.startTime}
                                onChange={(e) =>
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    startTime: e.target.value,
                                  })
                                }
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 6, sm: 2 }}>
                              <TextField
                                label="สิ้นสุด"
                                type="time"
                                fullWidth
                                size="small"
                                value={newBlockedTime.endTime}
                                onChange={(e) =>
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    endTime: e.target.value,
                                  })
                                }
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>ประเภท</InputLabel>
                                <Select
                                  value={newBlockedTime.type}
                                  onChange={(e) =>
                                    setNewBlockedTime({
                                      ...newBlockedTime,
                                      type: e.target.value as "leave" | "block",
                                    })
                                  }
                                  label="ประเภท"
                                >
                                  <MenuItem value="leave">ลางาน</MenuItem>
                                  <MenuItem value="block">ไม่ว่าง</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                              <TextField
                                label="เหตุผล"
                                fullWidth
                                size="small"
                                value={newBlockedTime.reason}
                                onChange={(e) =>
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    reason: e.target.value,
                                  })
                                }
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Button
                                  size="small"
                                  onClick={() => setShowBlockedTimeForm(false)}
                                  sx={{ color: theme.palette.text.secondary }}
                                >
                                  ยกเลิก
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleAddBlockedTime}
                                  sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    "&:hover": {
                                      backgroundColor:
                                        theme.palette.primary.dark,
                                    },
                                  }}
                                >
                                  เพิ่ม
                                </Button>
                              </Box>
                            </Grid2>
                          </Grid2>
                        </Paper>
                      )}

                      {formData.blockedTimes.length === 0 ? (
                        <Alert
                          severity="info"
                          sx={{
                            backgroundColor: theme.palette.info.light,
                            color: theme.palette.info.dark,
                          }}
                        >
                          ยังไม่มีช่วงเวลาที่ไม่ว่าง
                        </Alert>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {formData.blockedTimes.map((bt) => (
                            <Paper
                              key={bt.id}
                              sx={{
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor:
                                  bt.type === "leave"
                                    ? theme.palette.warning.light
                                    : theme.palette.error.light,
                                borderRadius: 2,
                              }}
                            >
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={
                                      bt.type === "leave" ? "ลางาน" : "ไม่ว่าง"
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        bt.type === "leave"
                                          ? theme.palette.warning.main
                                          : theme.palette.error.main,
                                      color: "white",
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={500}>
                                    {new Date(bt.date).toLocaleDateString(
                                      "th-TH"
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {bt.startTime} - {bt.endTime}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {bt.reason}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveBlockedTime(bt.id)}
                                sx={{ color: theme.palette.error.main }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Services */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <WorkIcon /> บริการที่ทำได้
                      </Typography>

                      <FormControl fullWidth error={!!errors.serviceIds}>
                        <InputLabel>เลือกบริการ *</InputLabel>
                        <Select
                          multiple
                          value={formData.serviceIds}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              serviceIds: e.target.value as string[],
                            })
                          }
                          input={<OutlinedInput label="เลือกบริการ *" />}
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => {
                                const service = services.find(
                                  (s) => s.id === value
                                );
                                return (
                                  <Chip
                                    key={value}
                                    label={service?.name}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        theme.palette.primary.main,
                                      color: "white",
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {services.map((service) => (
                            <MenuItem key={service.id} value={service.id}>
                              <Checkbox
                                checked={formData.serviceIds.includes(
                                  service.id
                                )}
                              />
                              <ListItemText
                                primary={service.name}
                                secondary={`${
                                  service.duration
                                } นาที | ${service.price.toLocaleString()} บาท`}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.serviceIds && (
                          <FormHelperText>{errors.serviceIds}</FormHelperText>
                        )}
                      </FormControl>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <NotesIcon /> หมายเหตุ
                      </Typography>

                      <TextField
                        label="บันทึกเพิ่มเติม"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับพนักงาน เช่น ทักษะพิเศษ ข้อควรระวัง ฯลฯ"
                      />
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={onCancel}
                      sx={{
                        borderColor: theme.palette.grey[400],
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          borderColor: theme.palette.grey[500],
                          backgroundColor: theme.palette.grey[100],
                        },
                      }}
                    >
                      ยกเลิก
                    </Button>
                    {/* <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmit}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      {initialData ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
                    </Button> */}
                    <LoadingButton
                      variant="contained"
                      type="submit"
                      color="primary"
                      sx={{ mr: 1 }}
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      startIcon={<Save />}
                    >
                      {employeeEdit ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
                    </LoadingButton>
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
}
