"use client";

import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";

import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import { KeyRound, Save } from "lucide-react";
import { useStoreContext } from "@/contexts/StoreContext";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { initialChangePassword, ChangePassword } from "@/interfaces/User";

interface StoreProps {
  viewOnly?: boolean;
}

const ChangePasswordForm: FC<StoreProps> = ({ viewOnly = false }) => {
  const { StoreEdit, setStoreEdit, setStores, Stores } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const localActive = useLocale();

  const searchParams = useSearchParams();
  const searchParamsToken = searchParams.get("token");

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("กรุณากรอกรหัสผ่านเดิม"),
    password: Yup.string().required("กรุณากรอกรหัสผ่านใหม่"),
    confirmPassword: Yup.string()
      .required("กรุณากรอกยืนยันรหัสผ่าน")
      .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  });

  const handleFormSubmit = async (
    values: ChangePassword,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<ChangePassword> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    if (!searchParamsToken) {
      setNotify({
        open: true,
        message: "ไม่พบ Token",
        color: "error",
      });
      return;
    }

    values = {
      ...values,
      token: searchParamsToken,
    };

    // 2. เรียกใช้ API
    let result;

    result = await storeService.updatePassword(values);

    // 3. จัดการเมื่อสำเร็จ
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  return (
    <>
      <Formik
        initialValues={initialChangePassword}
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
                        value={
                          values.confirmPassword ? values.confirmPassword : ""
                        }
                        onChange={(e) => {
                          setFieldValue("confirmPassword", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.confirmPassword &&
                          Boolean(errors.confirmPassword)
                        }
                        helperText={
                          touched.confirmPassword && errors.confirmPassword
                        }
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

export default ChangePasswordForm;
