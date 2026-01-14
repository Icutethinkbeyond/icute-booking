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
  Grid22,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import type { BookingRule } from "@/types/settings";
import { useStoreContext } from "@/contexts/StoreContext";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { Form, Formik, FormikHelpers } from "formik";
import { initialStore, Store } from "@/interfaces/Store";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import * as Yup from "yup";

const validationSchema = Yup.object({});

export default function BookingRulesSettings() {
  const theme = useTheme();
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rules, setRules] = useState<BookingRule>({
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    minCancelHours: 24,
    allowCustomerCancel: true,
    maxBookingsPerPhone: 3,
  });

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
                <Grid2 size={{ xs: 12, md: 6}}>
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
                        <TextField
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
                        />

                        <TextField
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
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6}}>
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
                        <TextField
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
                        />

                        <FormControlLabel
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
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6}}>
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

                      <TextField
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
                      />
                    </CardContent>
                  </Card>
                </Grid2>
              </Grid2>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  // onClick={handleSave}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                    px: 4,
                  }}
                >
                  บันทึกการตั้งค่า
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
}
