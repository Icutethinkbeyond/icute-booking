import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
  Button,
  InputAdornment,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";
import { useNotifyContext } from "@/contexts/NotifyContext";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import { Bath, MonitorCog, Plus, Save } from "lucide-react";
import { serviceService } from "@/utils/services/api-services/ServiceAPI";
import { useServiceContext } from "@/contexts/ServiceContext";
import { Service, initialService } from "@/interfaces/Store";
import { useSession } from "next-auth/react";

interface ServiceProps {
  viewOnly?: boolean;
}

const ServiceForm: FC<ServiceProps> = ({ viewOnly = false }) => {
  const {
    setServiceForm,
    serviceForm,
    serviceEdit,
    setServiceEdit,
    setServices,
    services,
  } = useServiceContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("กรุณากรอกรหัสอุปกรณ์"),
    durationMinutes: Yup.number().required("กรุณาใส่เวลาของคอร์ส"),
    price: Yup.number().required("กรุณาใส่ราคาของคอร์ส"),
  });

  const handleFormSubmit = async (
    values: Service,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<Service> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // 2. เรียกใช้ API
    let result;

    if (!serviceEdit) {
      result = await serviceService.createService(values);
    } else {
      result = await serviceService.updateService(values);
    }

    // สำเร็จจะ redirect ไปที่ table
    if (result.success) {
      resetForm();

      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });

      setTimeout(() => {
        router.push(`/${localActive}/protected/services`);
      }, 1000);
    } else {
      // // // 3. จัดการเมื่อสำเร็จ
      setNotify({
        open: true,
        message: result.message,
        color: "error",
      });
    }
  };

  const getService = async () => {
    const serviceId = params.get("serviceId");

    if (serviceId) {
      let result = await serviceService.getService(serviceId);

      if (result.success) {
        setServiceForm(result.data);
      } else {
        setNotify({
          open: true,
          message: result.message,
          color: result.success ? "success" : "error",
        });
      }
    } else {
      setNotify({
        open: true,
        message: "ไม่พบ Id",
        color: "error",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);

    if (pathname.includes("new")) {
      setServiceForm(initialService);
      setServiceEdit(false);
      setDisabledForm(false);
    } else {
      getService();
      setServiceEdit(true);
    }

    return () => {
      setServiceForm(initialService);
      setServiceEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Formik<Service>
        initialValues={serviceForm} // ใช้ state เป็น initialValues
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
                        <Plus size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        {serviceEdit ? "แก้ไขบริการ" : "เพิ่มบริการ"}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Service Name */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="name">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="name"
                        label="ชื่อบริการ (จำเป็น)"
                        value={values.name}
                        onChange={(e) => {
                          setFieldValue("name", e.target.value);
                        }}
                        placeholder=""
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="durationMinutes">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="durationMinutes"
                        label="เวลา (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={
                          values.durationMinutes ? values.durationMinutes : ""
                        }
                        onChange={(e) => {
                          setFieldValue("durationMinutes", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                            endAdornment: (
                              <InputAdornment position="start">
                                นาที
                              </InputAdornment>
                            ),
                          },
                        }}
                        placeholder=""
                        error={
                          touched.durationMinutes &&
                          Boolean(errors.durationMinutes)
                        }
                        helperText={
                          touched.durationMinutes && errors.durationMinutes
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Rental Price */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="price">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        name="price"
                        label="ราคา/คอร์ส (จำเป็น)"
                        value={values.price ?? ""}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                            endAdornment: (
                              <InputAdornment position="start">
                                บาท
                              </InputAdornment>
                            ),
                          },
                        }}
                        type="number"
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                          setFieldValue("price", newValue || ""); // ป้องกัน NaN
                        }}
                        error={touched.price && Boolean(errors.price)}
                        helperText={touched.price && errors.price}
                        fullWidth
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
                  {serviceEdit ? "แก้ไขบริการ" : "เพิ่มบริการ"}
                </LoadingButton>
                <ConfirmDelete
                  itemId={uniqueId()}
                  onDisable={openBackdrop || isSubmitting}
                  onDelete={() => resetForm()}
                  massage={`คุณต้องการล้างฟอร์มใช่หรือไม่?`}
                  buttonType={ButtonType.Button}
                />
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ServiceForm;
