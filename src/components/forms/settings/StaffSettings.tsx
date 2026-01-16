"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  useTheme,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
  Grid2,
  Typography,
  FormControl,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import type { StaffSettings } from "@/types/settings";
import { useStoreContext } from "@/contexts/StoreContext";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { initialStore, Store } from "@/interfaces/Store";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";

const validationSchema = Yup.object({});

export default function StaffSettings() {
  const theme = useTheme();
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormSubmit = async (
    values: Store,
    { setSubmitting, setErrors, resetForm, validateForm }: FormikHelpers<Store> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submittings

    // 2. เรียกใช้ API
    let result;

    result = await storeService.updateStore(values);

    // // // 3. จัดการเมื่อสำเร็จ
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  const getStore = async () => {
    let result = await storeService.getStore();

    if (result.success) {
      setStoreForm(result.data);
      setIsLoading(false);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getStore();
    return () => {
      setStoreForm(initialStore);
    };
  }, []);

  if (isLoading) {
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

  return (
    <>
      <Formik<Store>
        initialValues={StoreForm} // ใช้ state เป็น initialValues
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
          submitForm,
        }) => (
          <Form>
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
                  ตั้งค่าพนักงาน
                </Box>
                <Box
                  component="p"
                  sx={{
                    fontSize: "0.875rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  กำหนดค่าเริ่มต้นสำหรับการจัดการพนักงานในระบบ
                </Box>
              </Box>

              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
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
                        การเลือกพนักงาน
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2.5,
                        }}
                      >
                        <FormControl
                          fullWidth
                          disabled={openBackdrop || isSubmitting}
                        >
                          <Field name="employeeSetting.allowCustomerSelectEmployee">
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

                                      form.setFieldValue(
                                        "employeeSetting.autoAssignEmployee",
                                        !Boolean(e.target.checked)
                                      );

                                      // console.log(e.target.checked)
                                    }}
                                    color="primary"
                                  />
                                }
                                sx={{
                                  "& .MuiFormControlLabel-label": {
                                    fontSize: "0.875rem",
                                  },
                                }}
                                label={
                                  <Typography
                                    sx={{
                                      color: theme.palette.text.secondary,
                                    }}
                                  >
                                    อนุญาตให้ลูกค้าเลือกพนักงานเอง
                                  </Typography>
                                }
                              />
                            )}
                          </Field>
                        </FormControl>
                        {/* <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowCustomerSelectStaff}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          allowCustomerSelectStaff: e.target.checked,
                        })
                      }
                    />
                  }
                  label="อนุญาตให้ลูกค้าเลือกพนักงานเอง"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                    },
                  }}
                /> */}

                        <Box
                          sx={{
                            p: 2,
                            bgcolor: theme.palette.grey[100],
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          หากปิดการตั้งค่านี้ ลูกค้าจะไม่สามารถเลือกพนักงานได้
                          และระบบจะสุ่มเลือกพนักงานให้อัตโนมัติ
                        </Box>

                        <FormControl
                          fullWidth
                          disabled={openBackdrop || isSubmitting}
                        >
                          <Field name="employeeSetting.autoAssignEmployee">
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

                                      form.setFieldValue(
                                        "employeeSetting.allowCustomerSelectEmployee",
                                        !Boolean(e.target.checked)
                                      );
                                    }}
                                    color="primary"
                                  />
                                }
                                sx={{
                                  "& .MuiFormControlLabel-label": {
                                    fontSize: "0.875rem",
                                  },
                                }}
                                label={
                                  <Typography
                                    sx={{
                                      color: theme.palette.text.secondary,
                                    }}
                                  >
                                    สุ่มเลือกพนักงานอัตโนมัติ
                                  </Typography>
                                }
                              />
                            )}
                          </Field>
                        </FormControl>

                        {/* <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoAssignStaff}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoAssignStaff: e.target.checked,
                        })
                      }
                    />
                  }
                  label="สุ่มเลือกพนักงานอัตโนมัติ"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                    },
                  }}
                /> */}

                        <Box
                          sx={{
                            p: 2,
                            bgcolor: theme.palette.grey[100],
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          ระบบจะเลือกพนักงานที่ว่างและมีคิวน้อยที่สุดให้อัตโนมัติ
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
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
                        จำกัดการจอง
                      </Box>

                      <Field name="employeeSetting.maxQueuePerEmployeePerDay">
                        {({ field }: any) => (
                          <TextField
                            {...field}
                            disabled={openBackdrop || isSubmitting}
                            name={field.name}
                            label="จำนวนคิวสูงสุดต่อพนักงานต่อวัน"
                            value={field.value ?? ""}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                endAdornment: (
                                  <InputAdornment position="start">
                                    คิว
                                  </InputAdornment>
                                ),
                              },
                            }}
                            type="number"
                            onChange={(e) => {
                              const newValue = e.target.value.replace(
                                /\D/g,
                                ""
                              ); // กรองเฉพาะตัวเลข
                              setFieldValue(field.name, newValue || ""); // ป้องกัน NaN
                            }}
                            error={
                              touched.employeeSetting
                                ?.maxQueuePerEmployeePerDay &&
                              Boolean(
                                errors.employeeSetting
                                  ?.maxQueuePerEmployeePerDay
                              )
                            }
                            helperText={
                              touched.employeeSetting
                                ?.maxQueuePerEmployeePerDay &&
                              errors.employeeSetting?.maxQueuePerEmployeePerDay
                            }
                            fullWidth
                          />
                        )}
                      </Field>

                      {/* <TextField
                label="จำนวนคิวสูงสุดต่อพนักงานต่อวัน"
                type="number"
                value={settings.maxBookingsPerStaffPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxBookingsPerStaffPerDay: Number(e.target.value),
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">คิว</InputAdornment>
                  ),
                }}
                fullWidth
                helperText="จำกัดจำนวนคิวสูงสุดที่พนักงานแต่ละคนรับได้ต่อวัน (ไม่บังคับ)"
              /> */}

                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: theme.palette.warning.light,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          color: theme.palette.text.primary,
                        }}
                      >
                        หากไม่ต้องการจำกัด ให้ใส่ค่า 0 หรือเว้นว่างไว้
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>
              </Grid2>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                    px: 4,
                  }}
                  disabled={openBackdrop || isSubmitting}
                  loading={openBackdrop || isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  บันทึกการตั้งค่า
                </LoadingButton>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
}
