"use client";

import React, { useEffect } from "react";

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
  Stack,
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
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import {
  StaffFormData
} from "@/components/lib/staff";
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
} from "formik";
import {
  DAY_LABEL,
  Employee,
  EmployeeLeave,
  EmployeeWorkingDay,
  EmployeeWorkingTime,
  initialEmployee,
  initialService,
  LEAVE_TYPE_MAP,
  LEAVE_TYPE_OPTIONS,
} from "@/interfaces/Store";
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
import { serviceService } from "@/utils/services/api-services/ServiceAPI";
import { LeaveType } from "@prisma/client";
import { isOverlapping } from "@/utils/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { employeeService } from "@/utils/services/api-services/EmployeeAPI";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface StaffFormProps {
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object().shape({});

export default function StaffForm({
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const theme = useTheme();

  const {
    setServiceForm,
    serviceEdit,
    setServiceEdit,
    setServiceList,
    serviceList,
  } = useServiceContext();
  const {
    employeeList,
    setEmployeeList,
    employeeForm,
    employeeEdit,
    setEmployeeEdit,
    setEmployeeForm,
  } = useEmployeeContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBlockedTimeForm, setShowBlockedTimeForm] = useState(false);
  const [newBlockedTime, setNewBlockedTime] = useState<
    Omit<EmployeeLeave, "id" | "employeeId">
  >({
    startDate: "",
    endDate: "",
    note: "",
    leaveType: LeaveType.VACATION,
  });

  const toggleWorking = (
    dayIndex: number,
    setValue: any,
    values: EmployeeWorkingDay[],
  ) => {
    const days = values.map((d: EmployeeWorkingDay, i: number) =>
      i === dayIndex
        ? {
            ...d,
            isWorking: !d.isWorking,
            timeSlots: !d.isWorking
              ? [{ startTime: "09:00", endTime: "18:00" }]
              : [],
          }
        : d,
    );
    setValue("workingDays", days);
  };

  const removeTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    setValue: any,
    values: EmployeeWorkingDay[],
  ) => {
    const days = values.map((d: EmployeeWorkingDay, i: number) =>
      i === dayIndex
        ? {
            ...d,
            timeSlots: d.timeSlots.filter((_, j) => j !== slotIndex),
          }
        : d,
    );
    setValue("workingDays", days);
  };

  const updateTime = (
    dayIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string,
    setValue: any,
    values: EmployeeWorkingDay[],
  ) => {
    const days = values.map((d: EmployeeWorkingDay, i: number) =>
      i === dayIndex
        ? {
            ...d,
            timeSlots: d.timeSlots.map(
              (slot: EmployeeWorkingTime, j: number) =>
                j === slotIndex ? { ...slot, [field]: value } : slot,
            ),
          }
        : d,
    );
    setValue("workingDays", days);
  };

  const addTimeSlot = (
    dayIndex: number,
    setValue: any,
    values: EmployeeWorkingDay[],
  ) => {
    const days = values.map((d: EmployeeWorkingDay, i: number) =>
      i === dayIndex
        ? {
            ...d,
            timeSlots: [
              ...d.timeSlots,
              { startTime: "09:00", endTime: "18:00" },
            ],
          }
        : d,
    );

    setValue("workingDays", days);
  };

  const handleAddBlockedTime = () => {
    if (newBlockedTime.note?.trim()) {
      const blockedTime: EmployeeLeave = {
        ...newBlockedTime,
        id: uuidv4(),
      };
      setEmployeeForm({
        ...employeeForm,
        leaves: [...employeeForm.leaves, blockedTime],
      });
      setNewBlockedTime({
        startDate: "",
        endDate: "",
        note: "",
        leaveType: LeaveType.VACATION,
      });
      setShowBlockedTimeForm(false);
    }
  };

  const handleRemoveBlockedTime = (id: string) => {
    // setFormData({
    //   ...formData,
    //   blockedTimes: formData.blockedTimes.filter((bt) => bt.id !== id),
    // });

    setEmployeeForm({
      ...employeeForm,
      leaves: employeeForm.leaves.filter((bt) => bt.id !== id),
    });
  };

  const handleFormSubmit = async (
    values: Employee,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<Employee>, // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // console.log(values);

    // // 2. เรียกใช้ API
    let result;

    if (!employeeEdit) {
      result = await employeeService.createEmployee(values);
    } else {
      result = await employeeService.updateEmployee(values);
    }

    // สำเร็จจะ redirect ไปที่ table
    if (result.success) {
      resetForm();

      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });

      setTimeout(() => {
        router.push(`/${localActive}/protected/admin/employees`);
      }, 1000);
    } else {
      // // // 3. จัดการเมื่อสำเร็จ
      setNotify({
        open: true,
        message: result.message,
        color: "error",
      });
    }
  };

  const getServiceList = async () => {
    setIsLoading(true);

    try {
      let result = await serviceService.getServiceList();

      setServiceList(result?.data);
    } catch (error: any) {
      setNotify({
        open: true,
        message: error.code,
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

    const getEmployee = async () => {
      setIsLoading(true);
  
      const employeeId = params.get("employeeId");
  
      try {
        if (employeeId) {
          let result = await employeeService.getEmployee(employeeId);

          console.log(result)
          getServiceList();
  
          if (result.success) {
            setEmployeeForm(result.data);
          } else {
            setNotify({
              open: true,
              message: result.message,
              color: result.success ? "success" : "error",
            });
          }
        } else {
          setNotify({
            open: true,
            message: "ไม่พบ Id",
            color: "error",
          });
        }
      } catch (error: any) {
        setNotify({
          open: true,
          message: error.code,
          color: "error",
        });
      } finally {
        setIsLoading(false);
      }
  
      setIsLoading(false);
    };

  useEffect(() => {
    // getEmployeeList();

    if (pathname.includes("new")) {
      getServiceList();
      setEmployeeForm(initialEmployee);
      setEmployeeEdit(false);
      setDisabledForm(false);
    } else {
      getEmployee();
      setEmployeeEdit(true);
    }

    return () => {
      setEmployeeForm(initialEmployee);
      setEmployeeEdit(false);
      setDisabledForm(false);
    };
  }, []);

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
                  {employeeEdit ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
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
                                  e.target.checked,
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

                      {/* <FormControl fullWidth>
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
                      </FormControl> */}
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
                                    newValue ? newValue.toISOString() : null,
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: Boolean(
                                      touched.startDate && errors.startDate,
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
                          <Field name="email">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                label="อีเมล"
                                type="email"
                                fullWidth
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
                                  inputLabel: { shrink: true },
                                }}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                              />
                            )}
                          </Field>
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

                      {employeeEdit && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
                        </Alert>
                      )}

                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="password">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                label="รหัสผ่าน"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                error={
                                  touched.password && Boolean(errors.password)
                                }
                                helperText={touched.password && errors.password}
                                slotProps={{
                                  inputLabel: { shrink: true },
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <LockIcon
                                          sx={{
                                            color: theme.palette.grey[400],
                                          }}
                                        />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={() =>
                                            setShowPassword(!showPassword)
                                          }
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
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="confirmPassword">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                label="ยืนยันรหัสผ่าน"
                                type={showConfirmPassword ? "text" : "password"}
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
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <LockIcon
                                          sx={{
                                            color: theme.palette.grey[400],
                                          }}
                                        />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={() =>
                                            setShowConfirmPassword(
                                              !showConfirmPassword,
                                            )
                                          }
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
                              />
                            )}
                          </Field>
                        </Grid2>
                      </Grid2>
                    </CardContent>
                  </Card>

                  {/* Working Brake */}
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

                      <Stack spacing={2}>
                        {values.workingDays.map((day, dayIndex) => (
                          <Card key={day.dayOfWeek}>
                            <CardContent>
                              {/* Header */}
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="h6">
                                  {DAY_LABEL[day.dayOfWeek]}
                                </Typography>
                                <Switch
                                  checked={day.isWorking}
                                  onChange={() =>
                                    toggleWorking(
                                      dayIndex,
                                      setFieldValue,
                                      values.workingDays,
                                    )
                                  }
                                />
                              </Box>

                              {/* Time Slots */}
                              {day.isWorking && (
                                <Stack spacing={1} mt={2}>
                                  {day.timeSlots.map(
                                    (slot: any, slotIndex: number) => {
                                      const invalid =
                                        slot.startTime >= slot.endTime ||
                                        isOverlapping(day.timeSlots, slotIndex);

                                      return (
                                        <Box
                                          key={slotIndex}
                                          display="flex"
                                          alignItems="center"
                                          justifyItems="center"
                                          alignContent="center"
                                          gap={1}
                                        >
                                          <TextField
                                            type="time"
                                            size="small"
                                            value={slot.startTime}
                                            onChange={(e) => {
                                              updateTime(
                                                dayIndex,
                                                slotIndex,
                                                "startTime",
                                                e.target.value,
                                                setFieldValue,
                                                values.workingDays,
                                              );
                                            }}
                                            error={invalid}
                                            helperText={
                                              invalid && "พบช่วงเวลาทับกัน"
                                            }
                                          />

                                          <Typography>-</Typography>

                                          <TextField
                                            type="time"
                                            size="small"
                                            value={slot.endTime}
                                            onChange={(e) =>
                                              updateTime(
                                                dayIndex,
                                                slotIndex,
                                                "endTime",
                                                e.target.value,
                                                setFieldValue,
                                                values.workingDays,
                                              )
                                            }
                                            error={invalid}
                                            helperText={
                                              invalid && "พบช่วงเวลาทับกัน"
                                            }
                                          />

                                          <IconButton
                                            color="error"
                                            onClick={() =>
                                              removeTimeSlot(
                                                dayIndex,
                                                slotIndex,
                                                setFieldValue,
                                                values.workingDays,
                                              )
                                            }
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Box>
                                      );
                                    },
                                  )}

                                  <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() =>
                                      addTimeSlot(
                                        dayIndex,
                                        setFieldValue,
                                        values.workingDays,
                                      )
                                    }
                                  >
                                    เพิ่มช่วงเวลา
                                  </Button>
                                </Stack>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
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
                              <DatePicker
                                label="เริ่มวันที่"
                                sx={{ minWidth: "100%" }}
                                // ✔ เวลา (dayjs) หรือ null
                                value={
                                  newBlockedTime.startDate
                                    ? dayjs(newBlockedTime.startDate)
                                    : null
                                }
                                // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                                onChange={(newValue) => {
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    startDate: newValue
                                      ? newValue.toISOString()
                                      : null,
                                  });
                                }}
                                // slotProps={{
                                //   textField: {
                                //     fullWidth: true,
                                //     error: Boolean(touched.date && errors.date),
                                //     helperText:
                                //       touched.date && errors.date
                                //         ? String(errors.date)
                                //         : "",
                                //   },
                                // }}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                              <DatePicker
                                label="สิ้นสุดวันที่"
                                sx={{ minWidth: "100%" }}
                                // ✔ เวลา (dayjs) หรือ null
                                value={
                                  newBlockedTime.endDate
                                    ? dayjs(newBlockedTime.endDate)
                                    : null
                                }
                                // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                                onChange={(newValue) => {
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    endDate: newValue
                                      ? newValue.toISOString()
                                      : null,
                                  });
                                }}
                                // slotProps={{
                                //   textField: {
                                //     fullWidth: true,
                                //     error: Boolean(touched.date && errors.date),
                                //     helperText:
                                //       touched.date && errors.date
                                //         ? String(errors.date)
                                //         : "",
                                //   },
                                // }}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                              <FormControl fullWidth>
                                <InputLabel id="open-status-label">
                                  ประเภท
                                </InputLabel>
                                <Select
                                  labelId="open-status-label"
                                  label="ประเภท (จำเป็น)"
                                  value={newBlockedTime.leaveType}
                                  onChange={(e) => {
                                    setNewBlockedTime({
                                      ...newBlockedTime,
                                      leaveType: e.target.value as LeaveType,
                                    });
                                  }}
                                >
                                  {LEAVE_TYPE_OPTIONS.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                              <TextField
                                label="เหตุผล"
                                fullWidth
                                size="small"
                                value={newBlockedTime.note}
                                onChange={(e) =>
                                  setNewBlockedTime({
                                    ...newBlockedTime,
                                    note: e.target.value,
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

                      {employeeForm.leaves.length === 0 ? (
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
                          {employeeForm.leaves.map((bt) => (
                            <Paper
                              key={bt.id}
                              sx={{
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor:
                                  bt.leaveType === LeaveType.VACATION
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
                                      LEAVE_TYPE_MAP[bt.leaveType]
                                      // bt.leaveType === LeaveType. ? "ป่วย" : "ไม่ว่าง"
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        bt.leaveType === LeaveType.SICK
                                          ? theme.palette.warning.main
                                          : theme.palette.error.main,
                                      color: "white",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {`วันที่${dayjs(bt.startDate).format(
                                      "DD MMMM YYYY",
                                    )}-วันที่${dayjs(bt.endDate).format(
                                      "DD MMMM YYYY",
                                    )}`}{" "}
                                    `
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, ml: 0.5 }}
                                >
                                  {bt.note}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  bt.id && handleRemoveBlockedTime(bt.id)
                                }
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
                      <FormControl fullWidth>
                        <InputLabel id="select-employee-label">
                          เลือกได้หลายรายการ
                        </InputLabel>

                        <Field name="serviceIds">
                          {({ field }: FieldProps) => (
                            <Select
                              {...field}
                              fullWidth
                              labelId="select-serviceIds-label"
                              id="select-serviceIds-label"
                              multiple
                              value={values.serviceIds}
                              onChange={(e) => {
                                let value = e.target.value;
                                setFieldValue(
                                  "serviceIds",
                                  // On autofill we get a stringified value.
                                  typeof value === "string"
                                    ? value.split(",")
                                    : value,
                                );
                              }}
                              input={
                                <OutlinedInput
                                  id="select-serviceIds-label"
                                  label="เลือกได้หลายรายการ"
                                />
                              }
                              renderValue={(selected) => (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {selected.map((value) => {
                                    const service = serviceList.find(
                                      (serv) => serv.id === value,
                                    );

                                    return (
                                      // <Chip
                                      //   key={value}
                                      //   label={employee ? employee.name : value}
                                      // />
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
                              MenuProps={MenuProps}
                            >
                              {serviceList &&
                                serviceList.map(
                                  ({ name, id, durationMinutes, price }) => (
                                    // <MenuItem
                                    //   key={id}
                                    //   value={id}
                                    //   style={getStyles(
                                    //     id,
                                    //     values.employeeIds,
                                    //     theme
                                    //   )}
                                    // >
                                    //   {name}
                                    // </MenuItem>
                                    <MenuItem key={id} value={id}>
                                      <Checkbox
                                        checked={values.serviceIds.includes(id)}
                                      />
                                      <ListItemText
                                        primary={name}
                                        secondary={`${durationMinutes} นาที | ${price.toLocaleString()} บาท`}
                                      />
                                    </MenuItem>
                                  ),
                                )}
                            </Select>
                          )}
                        </Field>
                      </FormControl>

                      {/* <FormControl fullWidth error={!!errors.serviceIds}>
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
                      </FormControl> */}
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

                      <Field name="note">
                        {({ field }: FieldProps) => (
                          <TextField
                            {...field}
                            name="note"
                            label="บันทึกเพิ่มเติม (ถ้ามี)"
                            placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับพนักงาน เช่น ทักษะพิเศษ ข้อควรระวัง ฯลฯ"
                            value={values.note}
                            rows={3}
                            multiline={true}
                            onChange={(e) => {
                              setFieldValue("note", e.target.value);
                            }}
                            slotProps={{
                              inputLabel: { shrink: true },
                            }}
                            error={touched.note && Boolean(errors.note)}
                            helperText={touched.note && errors.note}
                            fullWidth
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                          />
                        )}
                      </Field>
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
