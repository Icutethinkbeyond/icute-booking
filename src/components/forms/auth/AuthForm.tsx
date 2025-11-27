import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Typography,
  Button,
  Grid2,
  InputAdornment,
  IconButton,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { initialLogin, Login } from "@/interfaces/User";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useLocale } from "next-intl";

const validationSchema = Yup.object().shape({
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: Yup.string().required("กรุณากรอกรหัสผ่าน"),
});

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[] | string;
  subtext?: JSX.Element | JSX.Element[];
  successPath?: string;
}

const AuthForm: React.FC<loginType> = ({
  title,
  subtitle,
  subtext,
}) => {

  const localActive = useLocale();
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credentail, setCredentail] = useState<Login>(initialLogin);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const onLoginPress = (value: Login, { resetForm, validateForm }: any) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    onLogin(value);
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const router = useRouter();

  const [disableLogin, setDisableLogin] = useState<boolean>(false);
  const { setNotify, notify } = useNotifyContext()

  const onLogin = async (credential: Login) => {
    setDisableLogin(true);
    const { email, password } = credential;

    if (email && password) {
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
        callbackUrl: "/",
      });

      console.log(result)

      if (result?.error) {
        setNotify({
          ...notify,
          open: true,
          color: 'error',
          message: result.error
        })
        setDisableLogin(false);
      } else if (result?.url) {
        setDisableLogin(true);
        setTimeout(() => {
          if (result.url) {
            router.push(result.url);
          } else if (result.error) {
            setNotify({
              ...notify,
              open: true,
              color: 'error',
              message: result.error
            })
          }
        }, 1000);
      }
    }
  };

  useEffect(() => {
    return () => {
      setDisableLogin(false);
    };
  }, []);

  useEffect(() => {
    return () => {
      setCredentail(initialLogin);
    };
  }, []);

  return (
    <>
      {title ? (
        <Grid2 container justifyContent={"center"}>
          <Typography fontWeight="700" variant="h2" mb={3}>
            {title}
          </Typography>
        </Grid2>
      ) : null}

      {subtext}

      <Formik
        initialValues={credentail} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={onLoginPress}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form>
            <Grid2 container spacing={2} sx={{ mb: 1 }}>
              <Grid2 size={{ xs: 12 }}>
                <Field name="email">
                  {({ field }: any) => (
                    <TextField
                      {...field}
                      name="email"
                      label="อีเมลผู้ใช้งาน"
                      value={values.email ? values.email : ""}
                      onChange={(e) => {
                        setFieldValue("email", e.target.value);
                      }}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      fullWidth
                    />
                  )}
                </Field>
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <Field name="password">
                  {({ field }: any) => (
                    <TextField
                      {...field}
                      type={showPassword ? "text" : "password"}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                                }
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
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
                      name="password"
                      label="รหัสผ่าน"
                      value={values.password ? values.password : ""}
                      onChange={(e) => {
                        setFieldValue("password", e.target.value);
                      }}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      fullWidth
                    />
                  )}
                </Field>
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={disableLogin}
                  loading={disableLogin}
                >
                  เข้าสู่ระบบ
                </LoadingButton>
              </Grid2>
              <Grid2 container justifyContent={"flex-end"} size={{ xs: 12 }}>
                <Button variant="text" onClick={() => router.push(`/${localActive}/auth/forgot-password`)}>ลืมรหัสผ่าน</Button>
                <Button variant="text" onClick={() => router.push(`/${localActive}/auth/sign-up`)}>สมัครสมาชิก</Button>
              </Grid2>
            </Grid2>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AuthForm;
