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
  Grid2,
  InputAdornment,
  CircularProgress,
  Typography,
  FormControl,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import type { BookingRule } from "@/types/settings";
import { useStoreContext } from "@/contexts/StoreContext";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { initialStore, Store } from "@/interfaces/Store";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";

const validationSchema = Yup.object({});

export default function BookingRulesSettings() {
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
                  กฎการจอง
                </Box>
                <Box
                  component="p"
                  sx={{
                    fontSize: "0.875rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  กำหนดกฎและข้อจำกัดในการจองเพื่อควบคุมระบบให้มีระเบียบ
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
                        การจองล่วงหน้า
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2.5,
                        }}
                      >
                        <Field name="bookingRule.minAdvanceBookingHours">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              disabled={openBackdrop || isSubmitting}
                              name="bookingRule.minAdvanceBookingHours"
                              label="จองล่วงหน้าขั้นต่ำ"
                              value={
                                values.bookingRule.minAdvanceBookingHours ?? ""
                              }
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  endAdornment: (
                                    <InputAdornment position="start">
                                      ชั่วโมง
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
                                setFieldValue(
                                  "bookingRule.minAdvanceBookingHours",
                                  newValue || ""
                                ); // ป้องกัน NaN
                              }}
                              error={
                                touched.bookingRule?.minAdvanceBookingHours &&
                                Boolean(
                                  errors.bookingRule?.minAdvanceBookingHours
                                )
                              }
                              helperText={
                                touched.bookingRule?.minAdvanceBookingHours &&
                                errors.bookingRule?.minAdvanceBookingHours
                              }
                              fullWidth
                            />
                          )}
                        </Field>
                        {/* <TextField
                          label="จองล่วงหน้าขั้นต่ำ"
                          type="number"
                          value={rules.minAdvanceHours}
                          onChange={(e) =>
                            setRules({
                              ...rules,
                              minAdvanceHours: Number(e.target.value),
                            })
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                ชั่วโมง
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          helperText="ลูกค้าต้องจองล่วงหน้าอย่างน้อยกี่ชั่วโมง"
                        /> */}

                        <Field name="bookingRule.maxAdvanceBookingDays">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              disabled={openBackdrop || isSubmitting}
                              name="bookingRule.maxAdvanceBookingDays"
                              label="จองล่วงหน้าสูงสุด"
                              value={
                                values.bookingRule.maxAdvanceBookingDays ?? ""
                              }
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  endAdornment: (
                                    <InputAdornment position="start">
                                      ชั่วโมง
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
                                setFieldValue(
                                  "bookingRule.maxAdvanceBookingDays",
                                  newValue || ""
                                ); // ป้องกัน NaN
                              }}
                              error={
                                touched.bookingRule?.maxAdvanceBookingDays &&
                                Boolean(
                                  errors.bookingRule?.maxAdvanceBookingDays
                                )
                              }
                              helperText={
                                touched.bookingRule?.maxAdvanceBookingDays &&
                                errors.bookingRule?.maxAdvanceBookingDays
                              }
                              fullWidth
                            />
                          )}
                        </Field>

                        {/* <TextField
                          label="จองล่วงหน้าสูงสุด"
                          type="number"
                          value={rules.maxAdvanceDays}
                          onChange={(e) =>
                            setRules({
                              ...rules,
                              maxAdvanceDays: Number(e.target.value),
                            })
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                วัน
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          helperText="จำกัดการจองล่วงหน้าสูงสุดกี่วัน"
                        /> */}
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
                        การยกเลิกคิว
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2.5,
                        }}
                      >
                        <Field name="cancelRule.minCancelBeforeHours">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              disabled={openBackdrop || isSubmitting}
                              name="cancelRule.minCancelBeforeHours"
                              label="ยกเลิกล่วงหน้าขั้นต่ำ"
                              value={
                                values.cancelRule.minCancelBeforeHours ?? ""
                              }
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  endAdornment: (
                                    <InputAdornment position="start">
                                      ชั่วโมง
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
                                setFieldValue(
                                  "cancelRule.minCancelBeforeHours",
                                  newValue || ""
                                ); // ป้องกัน NaN
                              }}
                              error={
                                touched.cancelRule?.minCancelBeforeHours &&
                                Boolean(errors.cancelRule?.minCancelBeforeHours)
                              }
                              helperText={
                                touched.cancelRule?.minCancelBeforeHours &&
                                errors.cancelRule?.minCancelBeforeHours
                              }
                              fullWidth
                            />
                          )}
                        </Field>
                        {/* <TextField
                          label="ยกเลิกล่วงหน้าขั้นต่ำ"
                          type="number"
                          value={rules.minCancelHours}
                          onChange={(e) =>
                            setRules({
                              ...rules,
                              minCancelHours: Number(e.target.value),
                            })
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                ชั่วโมง
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          helperText="ลูกค้าต้องยกเลิกล่วงหน้าอย่างน้อยกี่ชั่วโมง"
                        /> */}

                        {/* <FormControlLabel
                          control={
                            <Switch
                              checked={rules.allowCustomerCancel}
                              onChange={(e) =>
                                setRules({
                                  ...rules,
                                  allowCustomerCancel: e.target.checked,
                                })
                              }
                            />
                          }
                          label="อนุญาตให้ลูกค้ายกเลิกคิวเอง"
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.875rem",
                            },
                          }}
                        /> */}
                        <FormControl
                          fullWidth
                          disabled={openBackdrop || isSubmitting}
                        >
                          <Field name="cancelRule.allowCustomerCancel">
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
                                    อนุญาตให้ลูกค้ายกเลิกคิวเอง
                                  </Typography>
                                }
                              />
                            )}
                          </Field>
                        </FormControl>
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

                      <Field name="bookingRule.maxQueuePerPhone">
                        {({ field }: any) => (
                          <TextField
                            {...field}
                            disabled={openBackdrop || isSubmitting}
                            name="bookingRule.maxQueuePerPhone"
                            label="จำนวนคิวสูงสุดต่อเบอร์โทร"
                            value={values.bookingRule.maxQueuePerPhone ?? ""}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                endAdornment: (
                                  <InputAdornment position="start">
                                    ชั่วโมง
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
                              setFieldValue(
                                "bookingRule.maxQueuePerPhone",
                                newValue || ""
                              ); // ป้องกัน NaN
                            }}
                            error={
                              touched.bookingRule?.maxQueuePerPhone &&
                              Boolean(errors.bookingRule?.maxQueuePerPhone)
                            }
                            helperText={
                              touched.bookingRule?.maxQueuePerPhone &&
                              errors.bookingRule?.maxQueuePerPhone
                            }
                            fullWidth
                          />
                        )}
                      </Field>

                      {/* <TextField
                        label="จำนวนคิวสูงสุดต่อเบอร์โทร"
                        type="number"
                        value={rules.maxBookingsPerPhone}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            maxBookingsPerPhone: Number(e.target.value),
                          })
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">คิว</InputAdornment>
                          ),
                        }}
                        fullWidth
                        helperText="จำกัดจำนวนคิวที่จองได้ต่อหนึ่งเบอร์โทร"
                      /> */}
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
