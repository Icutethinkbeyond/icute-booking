"use client";

import { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Grid2,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
// import { useSnackbarContext } from "@/contexts/SnackbarContext";

const validationSchema = Yup.object().shape({
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
});

const ForgetPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { setSnackbar } = useSnackbarContext();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setIsSubmitting(true);
    // try {
    //   const response = await fetch("/api/forget-password", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email: values.email }),
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     setSnackbar({
    //       message: "ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณ!",
    //       notiColor: "success",
    //     });
    //   } else {
    //     setSnackbar({
    //       message: data.error || "เกิดข้อผิดพลาดในการส่งอีเมล",
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
    <Formik
      initialValues={{
        email: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }} >
              <Field name="email">
                {({ field }: any) => (
                  <TextField
                    {...field}
                    label="อีเมล"
                    type="email"
                    fullWidth
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                )}
              </Field>
            </Grid2>
            <Grid2 size={{ xs: 12 }} >
              {isSubmitting ? (
                <CircularProgress />
              ) : (
                <Button type="submit" variant="contained" fullWidth>
                  ส่งลิงก์รีเซ็ตรหัสผ่าน
                </Button>
              )}
            </Grid2>
          </Grid2>
        </Form>
      )}
    </Formik>
  );
};

export default ForgetPasswordForm;
