"use client";

import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";
import { useNotifyContext } from "@/contexts/NotifyContext";
import axios from "axios";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import dayjs from "dayjs";
import { Save, Timer } from "lucide-react";
import {
  DefaultOperatingHour,
  Store,
  initialOperatingHour,
  initialStore,
} from "@/interfaces/Store";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useStoreContext } from "@/contexts/StoreContext";
import { TimePicker } from "@mui/x-date-pickers";
// import { Select } from "formik-mui";

interface ServiceProps {
  viewOnly?: boolean;
}

const ServiceForm: FC<ServiceProps> = ({ viewOnly = false }) => {
  const { setStoreForm, setStoreTime, storeTime } =
    useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object({
    // MON_isOpen: Yup.boolean().required(),
    // MON_openTime: Yup.string()
    //   .nullable()
    //   .when("MON_isOpen", {
    //     is: true,
    //     then: (schema) => schema.required("กรุณากรอกเวลาเปิด"),
    //     otherwise: (schema) => schema.nullable(),
    //   }),

    // MON_closeTime: Yup.string()
    //   .nullable()
    //   .when("MON_isOpen", {
    //     is: true,
    //     then: (schema) =>
    //       schema
    //         .required("กรุณากรอกเวลาปิด")
    //         .test(
    //           "is-after-open",
    //           "เวลาปิดต้องมากกว่าเวลาเปิด",
    //           function (closeTime) {
    //             const { MON_openTime, MON_isOpen } = this.parent;

    //             // ถ้าไม่เปิดร้าน ไม่ validate
    //             if (!MON_isOpen) return true;

    //             if (!closeTime || !MON_openTime) return false;

    //             return new Date(closeTime) > new Date(MON_openTime);
    //           }
    //         ),
    //     otherwise: (schema) => schema.nullable(),
    //   }),
  });

  const handleFormSubmit = async (
    values: DefaultOperatingHour,
    { setSubmitting, setErrors, resetForm, validateForm }: FormikHelpers<DefaultOperatingHour> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {

    console.log(values)
    
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submittings

    const result = await storeService.updateTimeSettingStore(values);

    // // // // // 3. จัดการเมื่อสำเร็จ
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  const getTimeSetting = async () => {
    let result = await storeService.getTimeSetting();

    if (result.success) {
      setStoreTime(result.data);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  useEffect(() => {
    // setIsLoading(true);
    getTimeSetting();
    return () => {
      setStoreTime(initialOperatingHour);
    };
  }, []);

  return (
    <>
      <Formik<DefaultOperatingHour>
        initialValues={storeTime} // ใช้ state เป็น initialValues
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
            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12 }}>
                  <Grid2 size={{ xs: 12 }} mb={2}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <Timer size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        เวลาเปิด-ปิดร้าน
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>MON</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.MON_isOpen && values.MON_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("MON_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="MON_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.MON_openTime
                            ? dayjs(values.MON_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "MON_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.MON_openTime && errors.MON_openTime
                            ),
                            helperText:
                              touched.MON_openTime && errors.MON_openTime
                                ? String(errors.MON_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="MON_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.MON_closeTime
                            ? dayjs(values.MON_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "MON_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.MON_closeTime && errors.MON_closeTime
                            ),
                            helperText:
                              touched.MON_closeTime && errors.MON_closeTime
                                ? String(errors.MON_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>TUE</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.TUE_isOpen && values.TUE_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("TUE_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="TUE_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.TUE_openTime
                            ? dayjs(values.TUE_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "TUE_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.TUE_openTime && errors.TUE_openTime
                            ),
                            helperText:
                              touched.TUE_openTime && errors.TUE_openTime
                                ? String(errors.TUE_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="TUE_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.TUE_closeTime
                            ? dayjs(values.TUE_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "TUE_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.TUE_closeTime && errors.TUE_closeTime
                            ),
                            helperText:
                              touched.TUE_closeTime && errors.TUE_closeTime
                                ? String(errors.TUE_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>WED</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.WED_isOpen && values.WED_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("WED_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="WED_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.WED_openTime
                            ? dayjs(values.WED_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "WED_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.WED_openTime && errors.WED_openTime
                            ),
                            helperText:
                              touched.WED_openTime && errors.WED_openTime
                                ? String(errors.WED_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="WED_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.WED_closeTime
                            ? dayjs(values.WED_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "WED_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.WED_closeTime && errors.WED_closeTime
                            ),
                            helperText:
                              touched.WED_closeTime && errors.WED_closeTime
                                ? String(errors.WED_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>THU</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.THU_isOpen && values.THU_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("THU_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="THU_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.THU_openTime
                            ? dayjs(values.THU_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "THU_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.THU_openTime && errors.THU_openTime
                            ),
                            helperText:
                              touched.THU_openTime && errors.THU_openTime
                                ? String(errors.THU_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="THU_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.THU_closeTime
                            ? dayjs(values.THU_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "THU_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.THU_closeTime && errors.THU_closeTime
                            ),
                            helperText:
                              touched.THU_closeTime && errors.THU_closeTime
                                ? String(errors.THU_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>FRI</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.FRI_isOpen && values.FRI_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("FRI_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="FRI_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.FRI_openTime
                            ? dayjs(values.FRI_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "FRI_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.FRI_openTime && errors.FRI_openTime
                            ),
                            helperText:
                              touched.FRI_openTime && errors.FRI_openTime
                                ? String(errors.FRI_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="FRI_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.FRI_closeTime
                            ? dayjs(values.FRI_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "FRI_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.FRI_closeTime && errors.FRI_closeTime
                            ),
                            helperText:
                              touched.FRI_closeTime && errors.FRI_closeTime
                                ? String(errors.FRI_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                 <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>SAT</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.SAT_isOpen && values.SAT_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("SAT_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="SAT_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.SAT_openTime
                            ? dayjs(values.SAT_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "SAT_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.SAT_openTime && errors.SAT_openTime
                            ),
                            helperText:
                              touched.SAT_openTime && errors.SAT_openTime
                                ? String(errors.SAT_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="SAT_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.SAT_closeTime
                            ? dayjs(values.SAT_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "SAT_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.SAT_closeTime && errors.SAT_closeTime
                            ),
                            helperText:
                              touched.SAT_closeTime && errors.SAT_closeTime
                                ? String(errors.SAT_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 container flexDirection={"row"} size={{ xs: 3 }} justifyContent={"center"} alignItems={"center"}>
                  <Typography>SUN</Typography>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="open-status-label">
                      สถานะ (จำเป็น)
                    </InputLabel>
                    <Select
                      labelId="open-status-label"
                      label="สถานะ (จำเป็น)"
                      value={values.SUN_isOpen && values.SUN_isOpen.toString()}
                      onChange={(e) => {
                        setFieldValue("SUN_isOpen", e.target.value);
                      }}
                    >
                      <MenuItem value="true">เปิด</MenuItem>
                      <MenuItem value="false">ปิด</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="SUN_openTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาเปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.SUN_openTime
                            ? dayjs(values.SUN_openTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "SUN_openTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.SUN_openTime && errors.SUN_openTime
                            ),
                            helperText:
                              touched.SUN_openTime && errors.SUN_openTime
                                ? String(errors.SUN_openTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 3 }}>
                  <Field name="SUN_closeTime">
                    {({ field, form }: FieldProps) => (
                      <TimePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="เวลาปิด"
                        sx={{ minWidth: "100%" }}
                        // ✔ เวลา (dayjs) หรือ null
                        value={
                          values.SUN_closeTime
                            ? dayjs(values.SUN_closeTime)
                            : null
                        }
                        // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                        onChange={(newValue) => {
                          form.setFieldValue(
                            "SUN_closeTime",
                            newValue ? newValue.toISOString() : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.SUN_closeTime && errors.SUN_closeTime
                            ),
                            helperText:
                              touched.SUN_closeTime && errors.SUN_closeTime
                                ? String(errors.SUN_closeTime)
                                : "",
                          },
                        }}
                      />
                    )}
                  </Field>
                </Grid2>
              </Grid2>

              <Grid2
                sx={{ mt: 5, display: "flex", justifyContent: "flex-start" }}
              >
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  disabled={openBackdrop || isSubmitting || disabledForm}
                  loading={openBackdrop || isSubmitting}
                  startIcon={<Save />}
                >
                  บันทึก
                </LoadingButton>
                {/* <ConfirmDelete
                  itemId={uniqueId()}
                  onDisable={openBackdrop || isSubmitting}
                  onDelete={() => resetForm()}
                  massage={`คุณต้องการล้างฟอร์มใช่หรือไม่?`}
                  buttonType={ButtonType.Button}
                /> */}
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ServiceForm;
