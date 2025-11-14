import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
import { useCategoryContext } from "@/contexts/CategoryContext";
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
import StatusService from "@/components/shared/used/Status";
import dayjs from "dayjs";
import { Bath, MessageSquareMore, MonitorCog, Save } from "lucide-react";
import { AutoFixHigh, Category, Handyman, More } from "@mui/icons-material";
import { IconCurrencyBaht } from "@tabler/icons-react";
import { serviceService } from "@/utils/services/api-services/ServiceAPI";
import { useServiceContext } from "@/contexts/ServiceContext";
import { Service, initialService } from "@/interfaces/Store";

interface ServiceProps {
  viewOnly?: boolean;
}

const ServiceForm: FC<ServiceProps> = ({ viewOnly = false }) => {
  const { setServiceForm, serviceEdit, setServiceEdit, setServices, services } =
    useServiceContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object().shape({
    serialNo: Yup.string().required("กรุณากรอกรหัสอุปกรณ์"),
    ServiceName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"),
    aboutService: Yup.object().shape({
      rentalPriceCurrent: Yup.number()
        .required("กรุณากรอกราคาค่าเช่า")
        .min(1, "กรุณากรอกค่าที่มากกว่า 0"),
      stockStatus: Yup.string().required("กรุณาเลือกสถานะอุปกรณ์"),
      QTY: Yup.number().required("กรุณาใส่จำนวน"),
    }),
  });

  const handleFormSubmit = (
    value: Service,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    console.log(value);
    if (serviceEdit) {
      handleUpdateService(value);
    } else {
      handleCreateService(value);
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateService = async (Service: Service) => {
    setOpenBackdrop(true);
    const result = await serviceService.updateService(Service);
    setOpenBackdrop(false);
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    if (result.success) {
      router.push(`/${localActive}/protected/inventory`);
    }
  };

  const handleCreateService = async (Service: Service) => {
    setOpenBackdrop(true);
    const result = await serviceService.createService(Service);
    setOpenBackdrop(false);
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    if (result.success) {
      router.push(`/${localActive}/protected/inventory`);
    }
  };

  const handleGetSelectCategory = async () => {
    // const result = await categoryService.getSelectCategory();
    // if (result.success) {
    //   setCategorySelectState(result.data);
    // } else {
    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: result.success ? "success" : "error",
    //   });
    // }
  };

  const getDataService = () => {
    const ServiceId = params.get("ServiceId");
    axios
      .get(`/api/Service?ServiceId=${ServiceId}`)
      .then(({ data }) => {
        // const modifiedData: Service = {
        //   ...data,
        //   aboutService: {
        //     ...data.aboutService,
        //     purchaseDate: dayjs(data.aboutService.purchaseDate),
        //   },
        // };

        // setServices(modifiedData);
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

  // const getTypeData = () => {
  //   axios
  //     .get(`/api/Service/type?getbycharacter=true`)
  //     .then(({ data }) => {
  //       setTypeSelectState(data.data);
  //     })
  //     .catch((error) => {
  //       if (error.name === "AbortError") {
  //         console.log("Request cancelled");
  //       } else {
  //         console.error("Fetch error:", error);
  //       }
  //     })
  //     .finally(() => {});
  // };

  // useEffect(() => {
  //   if (
  //     Service.aboutService?.stockStatus ===
  //       ServiceStatus.CurrentlyRenting ||
  //     Service.aboutService?.stockStatus === ServiceStatus.InActive ||
  //     Service.aboutService?.stockStatus === ServiceStatus.Damaged
  //   ) {
  //     setDisabledForm(true);
  //   }
  // }, [Service]);

  useEffect(() => {
    setIsLoading(true);

    if (pathname.includes("new")) {
      setServiceForm(initialService);
      setServiceEdit(false);
      setDisabledForm(false);
    } else {
      setServiceEdit(true);
      getDataService();
    }

    // getTypeData();
    handleGetSelectCategory();

    return () => {
      setServiceForm(initialService);
      setServiceEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Formik<Service>
        initialValues={initialService} // ใช้ state เป็น initialValues
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
                        <MessageSquareMore size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        ตั้งค่า LINE Massageing
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Service ID */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="serialNo">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="serialNo"
                        label="รหัสอุปกรณ์ (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        // value={values.serialNo ? values.serialNo : ""}
                        onChange={(e) => {
                          setFieldValue(
                            "serialNo",
                            e.target.value.toUpperCase()
                          );
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        // placeholder="EXAMPLE: SN-00001"
                        // error={touched.serialNo && Boolean(errors.serialNo)}
                        // helperText={touched.serialNo && errors.serialNo}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Service Name */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="ServiceName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="ServiceName"
                        label="ชื่ออุปกรณ์ (จำเป็น)"
                        // value={values.ServiceName}
                        onChange={(e) => {
                          setFieldValue("ServiceName", e.target.value);
                        }}
                        placeholder="EXAMPLE: Crane Tower"
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        // error={
                        //   touched.ServiceName && Boolean(errors.ServiceName)
                        // }
                        // helperText={
                        //   touched.ServiceName && errors.ServiceName
                        // }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                                <Grid2 size={{ xs: 6 }}>
                  <Field name="ServiceName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="ServiceName"
                        label="ชื่ออุปกรณ์ (จำเป็น)"
                        // value={values.ServiceName}
                        onChange={(e) => {
                          setFieldValue("ServiceName", e.target.value);
                        }}
                        placeholder="EXAMPLE: Crane Tower"
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        // error={
                        //   touched.ServiceName && Boolean(errors.ServiceName)
                        // }
                        // helperText={
                        //   touched.ServiceName && errors.ServiceName
                        // }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>
                
              </Grid2>

              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12 }} sx={{ mb: 2, mt: 5 }}>
                  <Grid2 size={{ xs: 12 }} mb={2}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <More fontSize="small" />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        กำหนดข้อความ
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="รายละเอียดอุปกรณ์ (ถ้ามี)"
                        // value={values.description ? values.description : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                                <Grid2 size={{ xs: 6 }}>
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="รายละเอียดอุปกรณ์ (ถ้ามี)"
                        // value={values.description ? values.description : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                                <Grid2 size={{ xs: 6 }}>
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="รายละเอียดอุปกรณ์ (ถ้ามี)"
                        // value={values.description ? values.description : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                                <Grid2 size={{ xs: 6 }}>
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="รายละเอียดอุปกรณ์ (ถ้ามี)"
                        // value={values.description ? values.description : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                                <Grid2 size={{ xs: 6 }}>
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="รายละเอียดอุปกรณ์ (ถ้ามี)"
                        // value={values.description ? values.description : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
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
