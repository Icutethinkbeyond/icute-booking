import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Input,
  TextField,
  Grid,
  Grid2,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { DocumentCategory } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Field, FieldProps, Form, Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import dayjs, { Dayjs } from "dayjs";
import * as Yup from "yup";
import axios from "axios";
import { Handyman } from "@mui/icons-material";

interface ComponentProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

interface FormProps {
  repairingStart?: Dayjs | null;
  maintenanceId: string | null;
}

const StartRepairForm: React.FC<ComponentProps> = ({
  documentCategory,
  handleNext,
  handleBack,
  viewOnly,
}) => {
  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

  const { setNotify, notify } = useNotifyContext()

  const [loading, setLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<FormProps>({
    maintenanceId: "",
    repairingStart: null,
  });

  const validationSchema = Yup.object().shape({
    repairingStart: Yup.date().required("โปรดกำหนดวันที่เริ่มซ่อม"),
  });

  const handleFormSubmit = (
    value: FormProps,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setLoading(true);
    handleUpdateRepairDate(params.get("maintenanceId"), value);
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateRepairDate = async (
    maintenanceId: string | undefined | null,
    form: FormProps
  ) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `/api/maintenance?update-repairstared-status=true`,
        form
      );

      if (response.statusText === "OK") {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        setLoading(false);

        handleNext && handleNext();
      }
    } catch (error: any) {
      // console.error("Fetch error:", error);
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

    }
  };

  const getDataDocument = (documentId: string | undefined | null) => {
    if (!documentId) {
      return;
    }

    axios
      .get(`/api/maintenance?documentId=${documentId}`)
      .then(({ data }) => {
        console.log(data);

        setLoading(false);
        setFormState({
          ...formState,
          maintenanceId: data.maintenanceId,
          repairingStart: data.repairingStart
            ? dayjs(data.repairingStart)
            : null,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (params.get("documentId")) {
      getDataDocument(params.get("documentId"));
    }

    return () => {};
  }, []);

  return (
    <>
      <Formik<FormProps>
        initialValues={formState} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          handleBlur,
          resetForm,
          isSubmitting,
        }) => (
          <Form>
            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              <Grid2 container justifyContent="center">
                <CircularProgress size={60} sx={{ mb: 4 }} />
              </Grid2>
              <Grid2 container justifyContent="center">
                <Typography variant="h4" component="h1" gutterBottom>
                  กำหนดการวันที่เริ่มการซ่อมแซม
                </Typography>
              </Grid2>
              <Grid2 container justifyContent="center">
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  กำลังรอกำหนดวันเริ่มงานซ่อม
                </Typography>
              </Grid2>
              <Grid2 container justifyContent="center" spacing={3} mt={4}>
                <Grid2 size={6}>
                  <Field name="repairingStart">
                    {({ field }: FieldProps) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled={isSubmitting || loading}
                          label="วันที่เริ่มซ่อม (ถ้ามี)"
                          name="repairingStart"
                          sx={{ minWidth: "100%" }}
                          value={
                            values.repairingStart !== undefined
                              ? dayjs(values.repairingStart)
                              : null
                          }
                          onChange={(newValue) => {
                            setFieldValue("repairingStart", newValue);
                          }}
                          slotProps={{
                            textField: {
                              helperText: "DD/MM/YYYY",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  </Field>
                </Grid2>
              </Grid2>
              <Grid2
                sx={{
                  mt: 5,
                  justifyContent: "center",
                }}
              >
                <Grid2 container justifyContent="center">
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    color="primary"
                    sx={{ mr: 1 }}
                    disabled={isSubmitting || loading}
                    loading={isSubmitting}
                    startIcon={<Handyman />}
                  >
                    เริ่มการซ่อมแซม
                  </LoadingButton>
                </Grid2>
                <Grid2 container justifyContent="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    คลิกปุ่ม "เริ่มการซ่อมแซม" เพื่อเริ่มการซ่อมแซม
                  </Typography>
                </Grid2>
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default StartRepairForm;
