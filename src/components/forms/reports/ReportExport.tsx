import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Autocomplete,
  Radio,
  Avatar,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { LoadingButton } from "@mui/lab";
import axios from "axios";
import { DeliveryCard } from "@/components/shared/DeliveryCard";
import {
  Category,
  DocumentScanner,
  Download as DownloadIcon,
  ReceiptLong,
  Report,
} from "@mui/icons-material";
import { ButtonType } from "@/interfaces/ShredType";
import ConfirmDelete from "@/components/shared/ConfirmDelete";
import { useReportContext } from "@/contexts/ReportContext";
import PageTitle from "@/components/shared/PageTitle";
import { initialReport, ReportSetting } from "@/interfaces/Report";
import { uniqueId } from "lodash";
import { FilePenLine } from "lucide-react";
// import { ServiceSelect } from "@/interfaces/Store";
import { useStoreContext } from "@/contexts/StoreContext";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface Props {
  // reportType: ReportType;
  // icon: JSX.Element | null;
  // title: string;
  // desc?: string | null;
}

const ReportExport: React.FC<Props> = (
  {
    // reportType,
    // title,
    // icon,
    // desc,
  }
) => {
  // const { reportForm, setReportForm } = useReportContext();
  const { servicesSelect } = useStoreContext();
  const { reportForm } = useReportContext();
  const { setNotify, notify, setOpenBackdrop } = useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    // exportAll: Yup.boolean()
    //   .default(true)
    //   .required("กรุณาเลือกรูปเเบบการออกรายงาน"),
    // categoryId: Yup.string().when("exportAll", {
    //   is: false, // ถ้า equipmentOwner เป็น Plant → Validate equipmentId
    //   then: (schema) => schema.required("กรุณาเลือกหมวดหมู่"),
    //   otherwise: (schema) => schema.notRequired(), // ถ้าไม่ใช่ ไม่ต้อง validate
    // }),
  });

  const handleGetSelectCategory = async () => {
    // const result = await categoryService.getSelectCategory();
    // if (result.success) {
    //   // setCategorySelectState(result.data);
    // } else {
    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: result.success ? "success" : "error",
    //   });
    // }
  };

  const handleGetSelectSite = async () => {
    // const result = await siteService.getSelectSite();
    // if (result.success) {
    //   setSiteSelectState(result.data);
    // } else {
    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: result.success ? "success" : "error",
    //   });
    // }
  };

  const handleGetSelectEngineer = async () => {
    // const result = await engineerService.getSelectEngineer();
    // if (result.success) {
    //   setRepairmanStateSelect(result.data);
    // } else {
    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: result.success ? "success" : "error",
    //   });
    // }
  };

  const handleGetEquipmentReadyForRepair = async () => {
    // const result = await equipmentService.getEquipmentReadyForFixList();
    // if (result.success) {
    //   setEquipmentSelectState(result.data);
    // } else {
    //   setNotify({
    //     open: true,
    //     message: result.message,
    //     color: result.success ? "success" : "error",
    //   });
    // }
  };

  const handleFormSubmit = (
    // value: ReportExport,
    value: any,
    { resetForm, validateForm }: any
  ) => {
    // validateForm(); // บังคับ validate หลังจากรีเซ็ต
    // if (value.reportType === ReportType.InventoryStatus) {
    //   exportEquipmentReport(value);
    // } else if(value.reportType === ReportType.MaintenanceStatus){
    //   exportMaintenanceReport(value)
    // }
    // resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  // const exportEquipmentReport = async (exports: ReportExport) => {
  //   setIsLoading(true);
  //   setOpenBackdrop(true);

  //   let filename = "";

  //   if (!exports.filename) {
  //     if (exports.reportType === ReportType.InventoryStatus) {
  //       filename = `${ReportType.InventoryStatus.toString()}.xlsx`;
  //     }
  //   } else {
  //     filename = exports.filename;
  //   }

  //   if (exports.reportType === ReportType.InventoryStatus) {
  //     exports.filename
  //       ? (filename = exports.filename)
  //       : (filename = `${ReportType.InventoryStatus.toString()}.xlsx`);
  //   }

  //   try {
  //     const response = await axios.post(
  //       `/api/reports/equipment`,
  //       { exports, filename },
  //       {
  //         responseType: "blob",
  //       }
  //     );

  //     const blob = new Blob([response.data], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     handleDownload(blob, filename);
  //   } catch (error) {
  //     console.error("ไม่สามารถดาวน์โหลดไฟล์ได้", error);
  //     setNotify({
  //       ...notify,
  //       open: true,
  //       message: "ไม่สามารถดาวน์โหลดไฟล์ ${filename} ได้",
  //       color: "error",
  //     });
  //   }
  //   setIsLoading(false);
  //   setOpenBackdrop(false);
  // };

  const handleDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    // setReportForm({
    //   ...reportForm,
    //   reportType,
    // });

    return () => {
      setIsLoading(false);
      // setReportForm(initialReport);
    };
  }, []);

  return (
    <>
      <Formik<ReportSetting>
        initialValues={reportForm} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({
          errors,
          touched,
          setFieldValue,
          values,
          resetForm,
          isSubmitting,
        }) => (
          <Form>
            <Grid2 container justifyContent="center" mt={4}>
              <Typography variant="h2" gutterBottom ml={2} mt={0.5}>
                ออกรายงาน
              </Typography>
            </Grid2>

            <Grid2 container justifyContent="center" mb={5} mt={1}>
              <Typography variant="body2">
                กำหนดรายละเอียดเพื่อดูรายงาน
              </Typography>
            </Grid2>

            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              <Grid2 size={{ xs: 12 }} mb={3}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Category />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    เลือกบริการ
                  </Typography>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2} mb={5}>
                <Grid2 size={{ xs: 12 }}>
                  <Field name="id">
                    {({ field }: FieldProps) => (
                      <Autocomplete
                        id="id"
                        options={servicesSelect}
                        // getOptionLabel={(option: ServiceSelect) => option.name}
                        loading
                        onInputChange={(event, value) => {
                          // Handle typed value when no matching option
                          if (
                            value &&
                            !servicesSelect.some((opt) => opt.id === value)
                          ) {
                            setFieldValue("id", value);
                          }
                        }}
                        onChange={(event, value) => {
                          setFieldValue("id", value !== null ? value.id : "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="ชื่อบริการ (จำเป็น)"
                            name="id"
                            error={
                              touched.serviceId && Boolean(errors.serviceId)
                            }
                            helperText={touched.serviceId && errors.serviceId}
                          />
                        )}
                      />
                    )}
                  </Field>
                </Grid2>
              </Grid2>

              <PageTitle title="กำหนดรูปแบบ" icon={<DocumentScanner />} />
              <Grid2 container spacing={2} mt={4} mb={4}>
                <Field name="exportAll">
                  {({ field }: FieldProps) => (
                    <>
                      <Grid2 container spacing={2} mb={2} flexDirection={"row"}>
                        <DeliveryCard
                          isSelected={values.exportAll === true}
                          onClick={() => setFieldValue("exportAll", true)}
                          elevation={0}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color:
                                  values.exportAll === true
                                    ? "#fff"
                                    : "text.primary",
                                mb: 0.5,
                              }}
                            >
                              ออกรายงานทั้งหมด
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Radio
                              checked={values.exportAll === true}
                              disabled={isSubmitting || isLoading}
                              onChange={() => setFieldValue("exportAll", true)}
                              value={true}
                              name="delivery-method"
                              sx={{
                                "&.Mui-checked": {
                                  color: "#fff",
                                },
                              }}
                            />
                          </Box>
                        </DeliveryCard>
                        <DeliveryCard
                          isSelected={values.exportAll === false}
                          onClick={() => {
                            setFieldValue("exportAll", false);
                            // handleGetSelectCategory();
                          }}
                          elevation={0}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color:
                                  values.exportAll === false
                                    ? "#fff"
                                    : "text.primary",
                                mb: 0.5,
                              }}
                            >
                              กำหนดระยะเวลา
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Radio
                              checked={values.exportAll === false}
                              disabled={isSubmitting || isLoading}
                              onChange={() => {
                                setFieldValue("exportAll", false);
                                // handleGetSelectCategory();
                              }}
                              value={false}
                              name="delivery-method"
                              sx={{
                                "&.Mui-checked": {
                                  color: "#fff",
                                },
                              }}
                            />
                          </Box>
                        </DeliveryCard>
                      </Grid2>
                    </>
                  )}
                </Field>
              </Grid2>

              <Grid2 size={{ xs: 12 }} mb={3}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <FilePenLine />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    กำหนดชื่อไฟล์
                  </Typography>
                </Grid2>
              </Grid2>

              {values.exportAll === false && (
                <>
                  <Grid2 container size={{ xs: 12 }} mb={4} spacing={2}>
                    <Grid2 size={{ xs: 6 }}>
                      <Field name="dateStart">
                        {({ field, form }: FieldProps) => (
                          <DatePicker
                            // disabled={openBackdrop || isSubmitting || disabledForm}
                            label="วันที่เริ่ม"
                            sx={{ minWidth: "100%" }}
                            // ✔ เวลา (dayjs) หรือ null
                            value={
                              values.dateStart ? dayjs(values.dateStart) : null
                            }
                            // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                            onChange={(newValue) => {
                              form.setFieldValue(
                                "dateStart",
                                newValue ? newValue.toISOString() : null
                              );
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: Boolean(
                                  touched.dateStart && errors.dateStart
                                ),
                                helperText:
                                  touched.dateStart && errors.dateStart
                                    ? String(errors.dateStart)
                                    : "",
                              },
                            }}
                          />
                        )}
                      </Field>
                    </Grid2>

                    <Grid2 size={{ xs: 6 }}>
                      <Field name="dateEnd">
                        {({ field, form }: FieldProps) => (
                          <DatePicker
                            // disabled={openBackdrop || isSubmitting || disabledForm}
                            label="วันที่หยุด"
                            sx={{ minWidth: "100%" }}
                            // ✔ เวลา (dayjs) หรือ null
                            value={
                              values.dateEnd ? dayjs(values.dateEnd) : null
                            }
                            // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                            onChange={(newValue) => {
                              form.setFieldValue(
                                "dateEnd",
                                newValue ? newValue.toISOString() : null
                              );
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: Boolean(
                                  touched.dateEnd && errors.dateEnd
                                ),
                                helperText:
                                  touched.dateEnd && errors.dateEnd
                                    ? String(errors.dateEnd)
                                    : "",
                              },
                            }}
                          />
                        )}
                      </Field>
                    </Grid2>
                  </Grid2>
                </>
              )}

              <Grid2 size={{ xs: 12 }} mt={4} mb={4}>
                <Field name="filename">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      name="filename"
                      label="ชื่อไฟล์ (ถ้ามี)"
                      value={values.filename ? values.filename : ""}
                      onChange={(e) => {
                        setFieldValue("filename", e.target.value);
                      }}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      fullWidth
                      disabled={isLoading || isSubmitting}
                    />
                  )}
                </Field>
              </Grid2>

              <Grid2
                spacing={1}
                mt={5}
                container
                size={12}
                justifyContent="flex-start"
                alignItems="flex-end"
              >
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  loading={isLoading}
                  startIcon={<DownloadIcon />}
                >
                  ดาวน์โหลด
                </LoadingButton>
                <ConfirmDelete
                  itemId={""}
                  onDisable={isLoading || isSubmitting}
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

export default ReportExport;
