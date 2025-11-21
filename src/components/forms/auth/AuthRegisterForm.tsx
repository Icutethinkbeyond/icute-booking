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
import { Field, FieldProps, Form, Formik } from "formik";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { StoreRegister } from "@/interfaces/Store";
import { useStoreContext } from "@/contexts/StoreContext";
import { Copy, KeyRound, StoreIcon } from "lucide-react";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อ"),
  username: Yup.string().required("กรุณากรอกชื่อผู้ใช้งาน"),
  address: Yup.string().required("กรุณากรอกที่อยู่"),
  phone: Yup.string()
    .required("กรุณากรอกเบอร์โทร")
    .matches(/^[0-9]{10}$/, "เบอร์โทรต้องมี 10 หลัก"),
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: Yup.string().required("กรุณากรอกรหัสผ่าน"),
  confirmPassword: Yup.string()
    .required("กรุณากรอกยืนยันรหัสผ่าน")
    .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  termsAccepted: Yup.bool().oneOf([true], "กรุณายอมรับเงื่อนไขการใช้บริการ"),
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

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisteredName(data.user.name); // บันทึกชื่อผู้ใช้ที่สมัครสำเร็จ
        setNotify({
          open: true,
          message: `สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${data.user.name}`,
          color: "success",
        });

        // **Login อัตโนมัติหลังจากสมัครสมาชิก**
        const loginRes = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (loginRes?.error) {
          setNotify({
            open: true,
            message: loginRes.error,
            color: "error",
          });
        } else {
          router.push("/protected/dashboard"); // ไปหน้า Dashboard
        }
      } else {
        // แสดงข้อความผิดพลาดจาก API
        const errorMessage =
          data.message || "เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก";
        setNotify({
          open: true,
          message: errorMessage,
          color: "error",
        });
        console.error("Error during registration:", errorMessage); // ล็อกข้อผิดพลาด
      }
    } catch (error) {
      setNotify({
        open: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        color: "error",
      });
      console.error("Server error:", error); // ล็อกข้อผิดพลาด
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
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
          resetForm,
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
                          setFieldValue(
                            "storeUsername",
                            e.target.value.toUpperCase()
                          );
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
              <Grid2 size={{ xs: 12 }}>
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
                  type="submit"
                  variant="outlined"
                  fullWidth
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
