"use client";

import { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid2,
  Avatar,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { StoreRegister } from "@/interfaces/Store";
import { useStoreContext } from "@/contexts/StoreContext";
import { Copy, KeyRound, StoreIcon } from "lucide-react";
import { authService } from "@/utils/services/api-services/AuthAPI";

const validationSchema = Yup.object().shape({
  // username: Yup.string().required("กรุณากรอกชื่อผู้ใช้งาน"),
  // storeName: Yup.string().required("กรุณากรอกชื่อร้านค้า"),
  // storeUsername: Yup.string().required("กรุณากรอก User Name ร้านค้า"),
  // email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  // password: Yup.string().required("กรุณากรอกรหัสผ่าน"),
  // confirmPassword: Yup.string()
  //   .required("กรุณากรอกยืนยันรหัสผ่าน")
  //   .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  // termsAccepted: Yup.bool().oneOf([true], "กรุณายอมรับเงื่อนไขการใช้บริการ"),
});

const AuthRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);
  const [registeredName, setRegisteredName] = useState(""); // เก็บชื่อผู้ใช้ที่สมัครสำเร็จ
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const { storeRegister } = useStoreContext();

  const router = useRouter();
  const localActive = useLocale();

  const handleTogglePassword = () => setShowPassword(!showPassword);

  // const handleSubmit = async (values: any, { setSubmitting }: any) => {

  // };

  const handleSubmit = async (
    values: StoreRegister,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<StoreRegister> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    // ล้างสถานะข้อความก่อนเริ่ม
    // setGlobalError(null);
    // setSuccessMessage(null);
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // 1. ตรวจสอบเงื่อนไขพื้นฐาน (Formik validation ควรทำใน yupSchema แต่ทำซ้ำเพื่อความชัวร์ได้)
    if (values.password !== values.confirmPassword) {
      // หากรหัสผ่านไม่ตรงกัน ให้ใช้ setErrors เพื่อแสดงผลในช่องฟอร์ม
      setErrors({ confirmPassword: "รหัสผ่านยืนยันไม่ตรงกับรหัสผ่าน" });
      return;
    }

    // 2. เรียกใช้ API
    const result = await authService.registerStore(values);
    
    if(result.success){
      resetForm()
    }

    // // 3. จัดการเมื่อสำเร็จ
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  return (
    <div>
      {/* แสดงข้อความยินดีต้อนรับเมื่อสมัครสำเร็จ */}
      {registeredName && (
        <Typography variant="h5" color="primary" gutterBottom>
          ยินดีต้อนรับ, {registeredName}!
        </Typography>
      )}

      <Formik<StoreRegister>
        initialValues={storeRegister} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          isSubmitting,
          // resetForm,
        }) => (
          <Form>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Grid2 size={{ xs: 12 }} mb={1} mt={1}>
                  <Grid2 container alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <KeyRound size={20} />
                    </Avatar>
                    <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                      สำหรับเข้าสู่ระบบ
                    </Typography>
                  </Grid2>
                </Grid2>
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <Field name="email">
                  {({ field }: any) => (
                    <TextField
                      {...field}
                      label="อีเมล"
                      type="email"
                      fullWidth
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  )}
                </Field>
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <Field name="password">
                  {({ field }: any) => (
                    <TextField
                      {...field}
                      label="รหัสผ่าน"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleTogglePassword}>
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
              <Grid2 size={{ xs: 6 }}>
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
                        touched.confirmPassword && errors.confirmPassword
                      }
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleTogglePassword}>
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

              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12 }}>
                  <Grid2 size={{ xs: 12 }} mb={1} mt={1}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <StoreIcon size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        สร้างร้านค้าของคุณ
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Store */}
                <Grid2 size={{ xs: 12 }}>
                  <Field name="storeName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeName"
                        label="ชื่อร้านค้า (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.storeName ? values.storeName : ""}
                        onChange={(e) => {
                          setFieldValue(
                            "storeName",
                            e.target.value.toUpperCase()
                          );
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        error={touched.storeName && Boolean(errors.storeName)}
                        helperText={touched.storeName && errors.storeName}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Field name="storeUsername">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeUsername"
                        label="ID ร้านค้า (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.storeUsername ? values.storeUsername : ""}
                        onChange={(e) => {
                          setFieldValue("storeUsername", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        error={
                          touched.storeUsername && Boolean(errors.storeUsername)
                        }
                        helperText={
                          touched.storeUsername && errors.storeUsername
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="termsAccepted"
                      checked={values.termsAccepted}
                      onChange={(e) =>
                        setFieldValue("termsAccepted", e.target.checked)
                      }
                    />
                  }
                  label="ฉันยอมรับเงื่อนไขการใช้บริการ"
                />
                {errors.termsAccepted && (
                  <Typography color="error">{errors.termsAccepted}</Typography>
                )}
              </Grid2>
              <Grid2 container size={{ xs: 12 }} justifyContent={"center"}>
                {isSubmitting ? (
                  <CircularProgress />
                ) : (
                  <Button type="submit" variant="contained" fullWidth>
                    สมัครสมาชิก
                  </Button>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <Button
                  // type="submit"
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  onClick={() => router.push(`/${localActive}/auth/sign-in`)}
                >
                  คุณมีบัญชีอยู่เเล้ว?
                </Button>
              </Grid2>
            </Grid2>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AuthRegisterForm;
