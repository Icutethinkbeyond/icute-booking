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
import { DeliveryCard } from "@/components/shared/used/DeliveryCard";
import {
  Category,
  DocumentScanner,
  ReceiptLong,
  Report,
} from "@mui/icons-material";
import { ButtonType } from "@/interfaces/ShredType";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { useEquipmentContext } from "@/contexts/EquipmentContext";
import { useCategoryContext } from "@/contexts/CategoryContext";
import { CategorySelect } from "@/interfaces/Category_Type";
import {
  initialReport,
  ReportExport,
  ReportType,
  SelectType,
  useReportContext,
} from "@/contexts/ReportContext";
import PageTitle from "@/components/shared/used/PageTitle";
import { Factory, Info, SquareMousePointer } from "lucide-react";
import { useSiteContext } from "@/contexts/SiteContext";
import { SiteSelect } from "@/interfaces/Site";
import { EquipmentSelect } from "@/interfaces/Equipment";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import { EngineerSelect } from "@/interfaces/User";
import { categoryService } from "@/utils/services/api-services/CategoryApi";
import { siteService } from "@/utils/services/api-services/SiteApi";
import { showNameSelctReportSetting } from "@/utils/utils";
import { engineerService } from "@/utils/services/api-services/EngineerApi";
import { uniqueId } from "lodash";
import { equipmentService } from "@/utils/services/api-services/EquipmentApi";

interface Props {
  reportType: ReportType;
  icon: JSX.Element | null;
  title: string;
  desc?: string | null;
}

const ReportSettingForm: React.FC<Props> = ({
  reportType,
  title,
  icon,
  desc,
}) => {
  const { reportForm, setReportForm } = useReportContext();
  const { equipmentSelectState, setEquipmentSelectState } =
    useEquipmentContext();
  const { setRepairmanStateSelect, repairmanStateSelect } =
    useMaintenanceContext();
  const { categorySelectState, setCategorySelectState } = useCategoryContext();
  const { siteSelectState, setSiteSelectState } = useSiteContext();
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
    const result = await categoryService.getSelectCategory();
    if (result.success) {
      setCategorySelectState(result.data);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  const handleGetSelectSite = async () => {
    const result = await siteService.getSelectSite();
    if (result.success) {
      setSiteSelectState(result.data);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  const handleGetSelectEngineer = async () => {
    const result = await engineerService.getSelectEngineer();
    if (result.success) {
      setRepairmanStateSelect(result.data);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  const handleGetEquipmentReadyForRepair = async () => {
    const result = await equipmentService.getEquipmentReadyForFixList();
    if (result.success) {
      setEquipmentSelectState(result.data);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  const handleFormSubmit = (
    value: ReportExport,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    if (value.reportType === ReportType.InventoryStatus) {
      exportEquipmentReport(value);
    } else if(value.reportType === ReportType.MaintenanceStatus){
      exportMaintenanceReport(value)
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const exportEquipmentReport = async (exports: ReportExport) => {
    setIsLoading(true);
    setOpenBackdrop(true);

    let filename = "";

    if (!exports.filename) {
      if (exports.reportType === ReportType.InventoryStatus) {
        filename = `${ReportType.InventoryStatus.toString()}.xlsx`;
      }
    } else {
      filename = exports.filename;
    }

    if (exports.reportType === ReportType.InventoryStatus) {
      exports.filename
        ? (filename = exports.filename)
        : (filename = `${ReportType.InventoryStatus.toString()}.xlsx`);
    }

    try {
      const response = await axios.post(
        `/api/reports/equipment`,
        { exports, filename },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      handleDownload(blob, filename);
    } catch (error) {
      console.error("ไม่สามารถดาวน์โหลดไฟล์ได้", error);
      setNotify({
        ...notify,
        open: true,
        message: "ไม่สามารถดาวน์โหลดไฟล์ ${filename} ได้",
        color: "error",
      });
    }
    setIsLoading(false);
    setOpenBackdrop(false);
  };

  const exportMaintenanceReport = async (exports: ReportExport) => {
    setIsLoading(true);
    setOpenBackdrop(true);

    let filename = "";

    if (!exports.filename) {
      if (exports.reportType === ReportType.MaintenanceStatus) {
        filename = `${ReportType.MaintenanceStatus.toString()}.xlsx`;
      }
    } else {
      filename = exports.filename;
    }

    if (exports.reportType === ReportType.MaintenanceStatus) {
      exports.filename
        ? (filename = exports.filename)
        : (filename = `${ReportType.MaintenanceStatus.toString()}.xlsx`);
    }

    try {
      const response = await axios.post(
        `/api/reports/maintenance`,
        { exports, filename },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      handleDownload(blob, filename);
    } catch (error) {
      console.error("ไม่สามารถดาวน์โหลดไฟล์ได้", error);
      setNotify({
        ...notify,
        open: true,
        message: "ไม่สามารถดาวน์โหลดไฟล์ ${filename} ได้",
        color: "error",
      });
    }
    setIsLoading(false);
    setOpenBackdrop(false);
  };

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
    setReportForm({
      ...reportForm,
      reportType,
    });

    return () => {
      setIsLoading(false);
      setReportForm(initialReport);
    };
  }, []);

  const checkReportType = [
    "InventoryStatus",
    "MaintenanceStatus",
    "MaintenanceLog",
    "MaintenanceCost",
    "Tracker",
    "EquipmentPrice",
    "RentalPrice",
  ];

  const hideEquipment = [
    "InventoryStatus",
    "MaintenanceCost",
    "EquipmentPrice",
    "RentalPrice",
    "Tracker",
  ];

  return (
    <>
      <Formik<ReportExport>
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
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {icon ? icon : <Info />}
              </Avatar>
              <Typography variant="h2" gutterBottom ml={2} mt={0.5}>
                {title}
              </Typography>
            </Grid2>

            <Grid2 container justifyContent="center" mb={5} mt={2}>
              <Typography variant="body2">{desc}</Typography>
            </Grid2>

            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              {/* ============ Start Select reportType ============ */}
              {checkReportType.includes(values.reportType.toString()) && (
                <>
                  <PageTitle title="กำหนดประเภท" icon={<ReceiptLong />} />
                  <Grid2 container spacing={2} mt={4} mb={4}>
                    <Field name="reportSettings.selectType">
                      {({ field }: FieldProps) => (
                        <>
                          {Object.keys(SelectType).map((option, index) => (
                            <Box key={uniqueId()}>
                              {!(
                                hideEquipment.includes(
                                  values.reportType.toString()
                                ) && option === SelectType.EquipmentName
                              ) && (
                                <>
                                  <Grid2
                                    container
                                    mb={2}
                                    flexDirection={"column"}
                                    key={index}
                                  >
                                    <DeliveryCard
                                      key={option}
                                      isSelected={
                                        values.reportSettings.selectType.toString() ===
                                        option
                                      }
                                      onClick={() => {
                                        setFieldValue(
                                          "reportSettings.selectType",
                                          option
                                        );
                                        if (
                                          option === SelectType.EquipmentName
                                        ) {
                                          handleGetEquipmentReadyForRepair();
                                        }
                                      }}
                                      elevation={0}
                                    >
                                      <Box sx={{ flex: 1 }}>
                                        <Typography
                                          variant="h6"
                                          sx={{
                                            color:
                                              values.reportSettings.selectType.toString() ===
                                              option
                                                ? "#fff"
                                                : "text.primary",
                                            mb: 0.5,
                                          }}
                                        >
                                          {showNameSelctReportSetting(
                                            option.toString()
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color:
                                              values.reportSettings.selectType.toString() ===
                                              option
                                                ? "#ffffff"
                                                : "text.secondary",
                                          }}
                                        >
                                          {values.reportType.toString() ===
                                            "MaintenanceStatus" &&
                                            option ===
                                              SelectType.EquipmentName &&
                                            "สถานะประวัติการซ่อม"}
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
                                          checked={
                                            values.reportSettings.selectType.toString() ===
                                            option
                                          }
                                          onChange={() => {
                                            setFieldValue(
                                              "reportSettings.selectType",
                                              option
                                            );
                                            if (
                                              option ===
                                              SelectType.EquipmentName
                                            ) {
                                              handleGetEquipmentReadyForRepair();
                                            }
                                          }}
                                          disabled={isLoading || isSubmitting}
                                          value={option}
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
                            </Box>
                          ))}
                        </>
                      )}
                    </Field>
                  </Grid2>
                </>
              )}
              {/* ============ End Select reportType ============ */}

              {/* ============ Start Select Category ============ */}
              {((values.reportSettings.selectType === SelectType.Category &&
                checkReportType.includes(values.reportType.toString())) ||
                values.reportType.toString() === ReportType.EquipmentPlan) && (
                <>
                  <PageTitle title="กำหนดรูปแบบ" icon={<DocumentScanner />} />
                  <Grid2 container spacing={2} mt={4} mb={4}>
                    <Field name="reportSettings.categoryAll">
                      {({ field }: FieldProps) => (
                        <>
                          <Grid2
                            container
                            spacing={2}
                            mb={2}
                            flexDirection={"row"}
                          >
                            <DeliveryCard
                              isSelected={
                                values.reportSettings.categoryAll === true
                              }
                              onClick={() =>
                                setFieldValue(
                                  "reportSettings.categoryAll",
                                  true
                                )
                              }
                              elevation={0}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color:
                                      values.reportSettings.categoryAll === true
                                        ? "#fff"
                                        : "text.primary",
                                    mb: 0.5,
                                  }}
                                >
                                  ออกรายงานทุกหมวดหมู่
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
                                  checked={
                                    values.reportSettings.categoryAll === true
                                  }
                                  disabled={isSubmitting || isLoading}
                                  onChange={() =>
                                    setFieldValue(
                                      "reportSettings.categoryAll",
                                      true
                                    )
                                  }
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
                              isSelected={
                                values.reportSettings.categoryAll === false
                              }
                              onClick={() => {
                                setFieldValue(
                                  "reportSettings.categoryAll",
                                  false
                                );
                                handleGetSelectCategory();
                              }}
                              elevation={0}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color:
                                      values.reportSettings.categoryAll ===
                                      false
                                        ? "#fff"
                                        : "text.primary",
                                    mb: 0.5,
                                  }}
                                >
                                  ออกรายงานหมวดหมู่ ที่กำหนด
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
                                  checked={
                                    values.reportSettings.categoryAll === false
                                  }
                                  disabled={isSubmitting || isLoading}
                                  onChange={() => {
                                    setFieldValue(
                                      "reportSettings.categoryAll",
                                      false
                                    );
                                    handleGetSelectCategory();
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
                  {values.reportSettings.categoryAll === false && (
                    <>
                      <Grid2 size={{ xs: 12 }} mb={5}>
                        <Grid2 container alignItems="center">
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <Category />
                          </Avatar>
                          <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                            เลือกหมวดหมู่
                          </Typography>
                        </Grid2>
                      </Grid2>
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12 }}>
                          <Field name="reportSettings.categoryId">
                            {({ field }: FieldProps) => (
                              <Autocomplete
                                id="reportSettings.categoryId"
                                options={categorySelectState}
                                getOptionLabel={(option: CategorySelect) =>
                                  option.categoryName
                                }
                                loading
                                // onInputChange={(event, value) => {
                                //   // Handle typed value when no matching option
                                //   // if (
                                //   //   value &&
                                //   //   !categorySelectState.some(
                                //   //     (opt) => opt.categoryId === value
                                //   //   )
                                //   // ) {
                                //   //   setFieldValue("reportSettings.categoryId", value);
                                //   // }
                                // }}
                                onChange={(event, value) => {
                                  setFieldValue(
                                    "reportSettings.categoryId",
                                    value !== null ? value.categoryId : ""
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="ชื่อหมวดหมู่ (จำเป็น)"
                                    name="reportSettings.categoryId"
                                    error={
                                      touched.reportSettings?.categoryId &&
                                      Boolean(errors.reportSettings?.categoryId)
                                    }
                                    helperText={
                                      touched.reportSettings?.categoryId &&
                                      errors.reportSettings?.categoryId
                                    }
                                  />
                                )}
                              />
                            )}
                          </Field>
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                </>
              )}
              {/* ============ End Select Category ============ */}

              {/* ============ Start Select WorkLoad ============ */}
              {values.reportType === ReportType.WorkLoad && (
                <>
                  <PageTitle title="กำหนดรูปแบบ" icon={<DocumentScanner />} />
                  <Grid2 container spacing={2} mb={2} ml={1}>
                    <Field name="reportSettings.engineerAll">
                      {({ field }: FieldProps) => (
                        <>
                          <Grid2
                            container
                            spacing={2}
                            mb={2}
                            flexDirection={"row"}
                          >
                            <DeliveryCard
                              isSelected={
                                values.reportSettings.engineerAll === true
                              }
                              onClick={() => {
                                setFieldValue(
                                  "reportSettings.engineerAll",
                                  true
                                );
                                handleGetSelectEngineer();
                              }}
                              elevation={0}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color:
                                      values.reportSettings.engineerAll === true
                                        ? "#fff"
                                        : "text.primary",
                                    mb: 0.5,
                                  }}
                                >
                                  ออกรายงานผู้ซ่อมแซมทั้งหมด
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
                                  checked={
                                    values.reportSettings.engineerAll === true
                                  }
                                  disabled={isSubmitting || isLoading}
                                  onChange={() =>
                                    setFieldValue(
                                      "reportSettings.engineerAll",
                                      true
                                    )
                                  }
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
                              isSelected={
                                values.reportSettings.engineerAll === false
                              }
                              onClick={() => {
                                setFieldValue(
                                  "reportSettings.engineerAll",
                                  false
                                );
                                handleGetSelectEngineer();
                              }}
                              elevation={0}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color:
                                      values.reportSettings.engineerAll ===
                                      false
                                        ? "#fff"
                                        : "text.primary",
                                    mb: 0.5,
                                  }}
                                >
                                  ออกรายงานผู้ซ่อมแซม ที่กำหนด
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
                                  checked={
                                    values.reportSettings.engineerAll === false
                                  }
                                  disabled={isSubmitting || isLoading}
                                  onChange={() => {
                                    setFieldValue(
                                      "reportSettings.engineerAll",
                                      false
                                    );
                                    handleGetSelectEngineer();
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
                  {values.reportSettings.engineerAll === false && (
                    <>
                      <PageTitle title="เลือกผู้ซ่อมแซม" icon={<Factory />} />
                      <Grid2 container spacing={2} mb={5}>
                        <Grid2 size={{ xs: 12 }}>
                          <Field name="reportSettings.engineerId">
                            {({ field }: FieldProps) => (
                              <Autocomplete
                                id="reportSettings.engineerId"
                                options={repairmanStateSelect}
                                getOptionLabel={(option: EngineerSelect) =>
                                  option.name
                                }
                                loading
                                onInputChange={(event, value) => {
                                  // Handle typed value when no matching option
                                  if (
                                    value &&
                                    !repairmanStateSelect.some(
                                      (opt) => opt.userId === value
                                    )
                                  ) {
                                    setFieldValue(
                                      "reportSettings.engineerId",
                                      value
                                    );
                                  }
                                }}
                                onChange={(event, value) => {
                                  setFieldValue(
                                    "reportSettings.engineerId",
                                    value !== null ? value.userId : ""
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="ชื่อผู้ซ่อมแซม (จำเป็น)"
                                    name="reportSettings.engineerId"
                                    error={
                                      touched.reportSettings?.engineerId &&
                                      Boolean(errors.reportSettings?.engineerId)
                                    }
                                    helperText={
                                      touched.reportSettings?.engineerId &&
                                      errors.reportSettings?.engineerId
                                    }
                                  />
                                )}
                              />
                            )}
                          </Field>
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                </>
              )}
              {/* ============ End Select WorkLoad ============ */}

              {/* ============ Start Select Location ============ */}
              {values.reportSettings.selectType === SelectType.Location &&
                checkReportType.includes(values.reportType.toString()) && (
                  <>
                    <PageTitle title="กำหนดรูปแบบ" icon={<DocumentScanner />} />
                    <Grid2 container spacing={2} mb={2} ml={1}>
                      <Field name="reportSettings.locationAll">
                        {({ field }: FieldProps) => (
                          <>
                            <Grid2
                              container
                              spacing={2}
                              mb={2}
                              flexDirection={"row"}
                            >
                              <DeliveryCard
                                isSelected={
                                  values.reportSettings.locationAll === true
                                }
                                onClick={() =>
                                  setFieldValue(
                                    "reportSettings.locationAll",
                                    true
                                  )
                                }
                                elevation={0}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color:
                                        values.reportSettings.locationAll ===
                                        true
                                          ? "#fff"
                                          : "text.primary",
                                      mb: 0.5,
                                    }}
                                  >
                                    ออกรายงานทุกสถานที่
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
                                    checked={
                                      values.reportSettings.locationAll === true
                                    }
                                    disabled={isSubmitting || isLoading}
                                    onChange={() =>
                                      setFieldValue(
                                        "reportSettings.locationAll",
                                        true
                                      )
                                    }
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
                                isSelected={
                                  values.reportSettings.locationAll === false
                                }
                                onClick={() => {
                                  setFieldValue(
                                    "reportSettings.locationAll",
                                    false
                                  );
                                  handleGetSelectSite();
                                }}
                                elevation={0}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color:
                                        values.reportSettings.locationAll ===
                                        false
                                          ? "#fff"
                                          : "text.primary",
                                      mb: 0.5,
                                    }}
                                  >
                                    ออกรายงานสถานที่ ที่กำหนด
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
                                    checked={
                                      values.reportSettings.locationAll ===
                                      false
                                    }
                                    disabled={isSubmitting || isLoading}
                                    onChange={() => {
                                      setFieldValue(
                                        "reportSettings.locationAll",
                                        false
                                      );
                                      handleGetSelectSite();
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
                    {values.reportSettings.locationAll === false && (
                      <>
                        <PageTitle title="เลือกสถานที่" icon={<Factory />} />
                        <Grid2 container spacing={2}>
                          <Grid2 size={{ xs: 12 }}>
                            <Field name="reportSettings.locationId">
                              {({ field }: FieldProps) => (
                                <Autocomplete
                                  id="reportSettings.locationId"
                                  options={siteSelectState}
                                  getOptionLabel={(option: SiteSelect) =>
                                    option.siteName
                                  }
                                  loading
                                  onInputChange={(event, value) => {
                                    // Handle typed value when no matching option
                                    if (
                                      value &&
                                      !siteSelectState.some(
                                        (opt) => opt.siteId === value
                                      )
                                    ) {
                                      setFieldValue(
                                        "reportSettings.locationId",
                                        value
                                      );
                                    }
                                  }}
                                  onChange={(event, value) => {
                                    setFieldValue(
                                      "reportSettings.locationId",
                                      value !== null ? value.siteId : ""
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="ชื่อสถานที่ (จำเป็น)"
                                      name="reportSettings.locationId"
                                      error={
                                        touched.reportSettings?.locationId &&
                                        Boolean(
                                          errors.reportSettings?.locationId
                                        )
                                      }
                                      helperText={
                                        touched.reportSettings?.locationId &&
                                        errors.reportSettings?.locationId
                                      }
                                    />
                                  )}
                                />
                              )}
                            </Field>
                          </Grid2>
                        </Grid2>
                      </>
                    )}
                  </>
                )}
              {/* ============ End Select Location ============ */}

              {/* ============ Start Select Equpment ============ */}
              {values.reportSettings.selectType === SelectType.EquipmentName &&
                checkReportType.includes(values.reportType.toString()) && (
                  <>
                    {values.reportSettings.equipmentNameAll === false && (
                      <>
                        <PageTitle
                          title="เลือกอุปกรณ์"
                          icon={<SquareMousePointer />}
                        />
                        <Grid2 container spacing={2} mt={4} mb={4}>
                          <Grid2 size={{ xs: 12 }}>
                            <Field name="reportSettings.equipmentId">
                              {({ field }: FieldProps) => (
                                <Autocomplete
                                  id="reportSettings.equipmentId"
                                  options={equipmentSelectState}
                                  getOptionLabel={(option: EquipmentSelect) =>
                                    `${option.equipmentName} - (${option.serialNo})`
                                  }
                                  loading
                                  value={
                                    equipmentSelectState.find(
                                      (option) =>
                                        option.equipmentId ===
                                        values.reportSettings.equipmentId
                                    ) || null
                                  }
                                  fullWidth
                                  onChange={(event, value) => {
                                    setFieldValue(
                                      "reportSettings.equipmentId",
                                      value !== null ? value.equipmentId : ""
                                    );
                                    // setFieldValue(
                                    //   "equipmentName",
                                    //   value !== null ? value.equipmentName : ""
                                    // );
                                    // getEquipment(
                                    //   value !== null ? value.equipmentId : ""
                                    // );
                                  }}
                                  disabled={isSubmitting || isLoading}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="อุปกรณ์ (จำเป็น)"
                                      name="reportSettings.equipmentId"
                                      error={
                                        touched.reportSettings?.equipmentId &&
                                        Boolean(
                                          errors.reportSettings?.equipmentId
                                        )
                                      }
                                      disabled={isSubmitting || isLoading}
                                      helperText={
                                        touched.reportSettings?.equipmentId &&
                                        errors.reportSettings?.equipmentId
                                      }
                                    />
                                  )}
                                />
                              )}
                            </Field>
                          </Grid2>
                        </Grid2>
                      </>
                    )}
                  </>
                )}
              {/* ============ End Select Equpment ============ */}

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
                mt={2}
                container
                size={12}
                justifyContent="flex-end"
                alignItems="flex-end"
              >
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  loading={isLoading}
                  startIcon={icon}
                >
                  ดาวน์โหลด {title}
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

export default ReportSettingForm;
