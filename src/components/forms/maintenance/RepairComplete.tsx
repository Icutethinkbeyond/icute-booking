import React, { useEffect, useState } from "react";
import {
  Chip,
  ChipProps,
  Typography,
  Box,
  Container,
  Button,
  Grid2,
  TextField,
  Avatar,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { DocumentCategory } from "@prisma/client";
import { LoadingButton } from "@mui/lab";
import { Field, FieldProps, Form, Formik } from "formik";
import { initialMaintenance, Maintenance } from "@/interfaces/Maintenance";
import * as Yup from "yup";
import axios from "axios";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import dayjs from "dayjs";
import { Task } from "@mui/icons-material";
import { useDocumentContext } from "@/contexts/DocumentContext";

interface ComponentProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const RepairComplete: React.FC<ComponentProps> = ({
  documentCategory,
  handleNext,
  handleBack,
  viewOnly,
}) => {
  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

  const { setMaintenanceForm, maintenanceForm } = useMaintenanceContext();

  const { setNotify, notify } = useNotifyContext()
  const [loading, setLoading] = useState<boolean>(false);
  const { setDocumentForm } = useDocumentContext();

  // const validationSchema = Yup.object().shape({
  //   repairingStart: Yup.date().required("โปรดกำหนดวันที่เริ่มซ่อม"),
  // });

  const handleFormSubmit = (
    value: Maintenance,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setLoading(true);
    handleUpdateRepairDate(params.get("maintenanceId"), value);
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateRepairDate = async (
    maintenanceId: string | undefined | null,
    form: Maintenance
  ) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `/api/maintenance?update-repaircomplete-status=true`,
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

        handleRedirect();
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
      .get(`/api/document?documentId=${documentId}`)
      .then(({ data }) => {
        // console.log(data)
        setMaintenanceForm({
          ...maintenanceForm,
          maintenanceId: data.data.maintenance?.maintenanceId,
          documentDetials: data.data.documentDetials,
          repairingStart: data.data.maintenance?.repairingStart,
          repairingEnd: data.data.maintenance?.repairingEnd,
          TOFstart: data.data.maintenance?.TOFstart,
          TOFend: data.data.maintenance?.TOFend,
        });
        // setLoading(false);
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

  const handleRedirect = () => {
    router.push(`/${localActive}/protected/maintenance`);
  };

  useEffect(() => {
    if (params.get("documentId")) {
      getDataDocument(params.get("documentId"));
    }

    return () => {
      setMaintenanceForm(initialMaintenance);
    };
  }, []);

  return (
    <>
      <Formik<Maintenance>
        initialValues={maintenanceForm} // ใช้ state เป็น initialValues
        // validationSchema={validationSchema}
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
              {/* <Grid2 container justifyContent="center">
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
              </Grid2> */}
              <Grid2 size={{ xs: 12 }}>
                <Grid2 size={{ xs: 12 }} mb={2}>
                  <Grid2 container alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <Task />
                    </Avatar>
                    <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                      บันทึกเพิ่มเติม
                    </Typography>
                  </Grid2>
                </Grid2>
              </Grid2>
              <Grid2 container justifyContent="center" spacing={3} mt={4}>
                <Grid2 size={{ xs: 12 }} mb={2}>
                  <Field name="documentDetials">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        name="documentDetials"
                        label="รายละเอียดเอกสาร (ถ้ามี)"
                        disabled={loading || isSubmitting}
                        value={
                          values.documentDetials
                            ? values.documentDetials
                            : viewOnly
                            ? "ไม่พบรายละเอียดเอกสาร..."
                            : ""
                        }
                        type="text"
                        multiline
                        rows={3}
                        onChange={(e) => {
                          setFieldValue("documentDetials", e.target.value);
                        }}
                        variant={viewOnly ? "standard" : "outlined"}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="repairingStart">
                    {({ field }: FieldProps) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled={isSubmitting || loading}
                          label="วันที่เริ่มเข้าซ่อม (ถ้ามี)"
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
                <Grid2 size={6}>
                  <Field name="repairingEnd">
                    {({ field }: FieldProps) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled={isSubmitting || loading}
                          label="วันที่ซ่อมแซมเสร็จสิ้น (ถ้ามี)"
                          name="repairingEnd"
                          sx={{ minWidth: "100%" }}
                          value={
                            values.repairingEnd !== undefined
                              ? dayjs(values.repairingEnd)
                              : null
                          }
                          onChange={(newValue) => {
                            setFieldValue("repairingEnd", newValue);
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
                <Grid2 size={6}>
                  <Field name="TOFstart">
                    {({ field }: FieldProps) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled={isSubmitting || loading}
                          label="วันที่อุปกรณ์หยุดทำงาน (ถ้ามี)"
                          name="TOFstart"
                          sx={{ minWidth: "100%" }}
                          value={
                            values.TOFstart !== undefined
                              ? dayjs(values.TOFstart)
                              : null
                          }
                          onChange={(newValue) => {
                            setFieldValue("TOFstart", newValue);
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
                <Grid2 size={6}>
                  <Field name="TOFend">
                    {({ field }: FieldProps) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled={isSubmitting || loading}
                          label="วันที่อุปกรณ์กลับมาทำงาน (ถ้ามี)"
                          name="TOFend"
                          sx={{ minWidth: "100%" }}
                          value={
                            values.TOFend !== undefined
                              ? dayjs(values.TOFend)
                              : null
                          }
                          onChange={(newValue) => {
                            setFieldValue("TOFend", newValue);
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
                    loading={loading}
                    startIcon={<Task />}
                  >
                    อัพเดตข้อมูล & ปิดเอกสาร
                  </LoadingButton>
                </Grid2>
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default RepairComplete;
