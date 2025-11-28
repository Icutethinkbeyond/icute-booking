
"use client";

import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
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
import StatusStore from "@/components/shared/used/Status";
import dayjs from "dayjs";
import {
  Bath,
  KeyRound,
  MessageSquareMore,
  MonitorCog,
  Save,
} from "lucide-react";
import { AutoFixHigh, Category, Handyman, More } from "@mui/icons-material";
import { IconCurrencyBaht } from "@tabler/icons-react";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useStoreContext } from "@/contexts/StoreContext";
import { Store, initialStore } from "@/interfaces/Store";

interface StoreProps {
  viewOnly?: boolean;
}

const ResetPasswordForm: FC<StoreProps> = ({ viewOnly = false }) => {
  const { StoreEdit, setStoreEdit, setStores, Stores } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("กรุณากรอกรหัสผ่านเดิม"),
    password: Yup.string().required("กรุณากรอกรหัสผ่านใหม่"),
    confirmPassword: Yup.string()
      .required("กรุณากรอกยืนยันรหัสผ่าน")
      .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  });

  const handleFormSubmit = async (values: any, { setSubmitting }: any) => {
    // setIsSubmitting(true);
    // try {
    //   const response = await fetch("/api/reset-password", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ token, newPassword: values.newPassword }),
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     setSnackbar({
    //       message: "เปลี่ยนรหัสผ่านสำเร็จ!",
    //       notiColor: "success",
    //     });
    //   } else {
    //     setSnackbar({
    //       message: data.message || "เกิดข้อผิดพลาด",
    //       notiColor: "error",
    //     });
    //   }
    // } catch (error) {
    //   setSnackbar({
    //     message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    //     notiColor: "error",
    //   });
    // } finally {
    //   setIsSubmitting(false);
    //   setSubmitting(false);
    // }
  };

  return (
    <>
      <Formik
        initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
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
                        <KeyRound size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        เปลี่ยนรหัสผ่าน
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Store ID */}
                <Grid2 size={{ xs: 12 }}>
                  <Field name="oldPassword">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="oldPassword"
                        label="รหัสผ่านเก่า (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.oldPassword ? values.oldPassword : ""}
                        onChange={(e) => {
                          setFieldValue("oldPassword", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.oldPassword && Boolean(errors.oldPassword)
                        }
                        helperText={touched.oldPassword && errors.oldPassword}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Field name="newPassword">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="newPassword"
                        label="รหัสผ่านใหม่ (จำเป็น)"
                        value={values.newPassword ? values.newPassword : ""}
                        onChange={(e) => {
                          setFieldValue("newPassword", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.newPassword && Boolean(errors.newPassword)
                        }
                        helperText={touched.newPassword && errors.newPassword}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={{ xs: 6 }}></Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Field name="confirmPassword">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="confirmPassword"
                        label="ยืนยันรหัสผ่าน (จำเป็น)"
                        value={values.confirmPassword ? values.confirmPassword : ""}
                        onChange={(e) => {
                          setFieldValue("confirmPassword", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 6 }}></Grid2>

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

export default ResetPasswordForm;
