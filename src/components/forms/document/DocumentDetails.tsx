import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
  Radio,
} from "@mui/material";
import { Document, initialDocument } from "@/interfaces/Document"; // จำเป็นต้องเพิ่มประเภทข้อมูลให้ตรง
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import { useDocumentContext } from "@/contexts/DocumentContext"; // context สำหรับ document
import {
  DocumentCategory,
  DocumentStatus,
  DocumentStep,
  LocationType,
  MaintenanceType,
} from "@prisma/client";
import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

import { ClipboardPlus, Factory, FileText } from "lucide-react";
import { DeliveryCard } from "@/components/shared/used/DeliveryCard";
import { CreditScore } from "@mui/icons-material";
import dayjs from "dayjs";
import { documentService } from "@/utils/services/api-services/DocumentApi";
import { checkDocumentType, checkStep } from "@/utils/utils";

interface DocumentFormProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  setActiveStep?: (value: number) => void;
  viewOnly?: boolean;
}

const DocumentForm: FC<DocumentFormProps> = ({
  documentCategory,
  handleNext,
  setActiveStep,
  viewOnly = false,
}) => {
  const {
    documentForm,
    documentSelectState,
    documentEdit,
    setDocumentForm,
    setDocumentEdit,
    setDocumentSelectState,
    handleBack,
    setHandleBack,
    setDocumentId,
  } = useDocumentContext();
  const { setNotify, setOpenBackdrop, notify, openBackdrop } =
    useNotifyContext();

  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const localActive = useLocale();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [componentLoad, setComponentLoad] = useState<boolean>(
    viewOnly ? false : true
  );

  const validationSchema = Yup.object().shape({
    // documentIdNo: Yup.string()
    //   .matches(
    //     /^[a-zA-Z0-9_-]*$/,
    //     "กรุณากรอกเฉพาะตัวเลข, ตัวอักษรภาษาอังกฤษ, _ และ - เท่านั้น"
    //   )
    //   .required("กรุณากรอกข้อมูล"), // กำหนดให้ต้องกรอกข้อมูล
  });

  const handleAddParameters = (params: Record<string, string>) => {
    // console.log(params)
    const newParams = new URLSearchParams(window.location.search);

    // เพิ่มหรืออัปเดตพารามิเตอร์ทั้งหมด
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    router.push(newUrl); // อัปเดต URL โดยไม่ต้องรีเฟรช
  };

  // const handleClearParameters = () => {
  //   const newUrl = window.location.pathname; // เก็บเฉพาะ path โดยไม่รวม query
  //   router.push(newUrl); // อัปเดต URL โดยไม่มีพารามิเตอร์
  // };

  const handleFormSubmit = (
    value: Document,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    if (documentEdit) {
      handleUpdateDocument(value, resetForm);
    } else {
      handleCreateDocument(value, resetForm);
    }
  };

  const handleCreateDocument = async (document: Document, resetForm: any) => {
    setOpenBackdrop(true);

    // console.log(document)

    const result: any = await documentService.createDocument(document);
    setOpenBackdrop(false);

    if (result.success) {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });

      // console.log(result.data.documentIdNo)

      setDocumentId(result.data.documentIdNo);

      handleAddParameters({
        documentId: result.data.documentId,
        documentIdNo: result.data.documentIdNo,
        maintenanceId: result.data.maintenanceId
          ? result.data.maintenanceId
          : "",
        repairLocation: result.data.maintenance?.repairLocation,
      });

      resetForm();
      setDocumentForm(initialDocument);

      console.log("test");

      // if (documentCategory === DocumentCategory.Maintenance) {
      //   document.maintenance.repairLocation === LocationType.OnPlant
      //     ? setActiveStep && setActiveStep(2)
      //     : handleNext && handleNext();
      // } else {
      //   handleNext && handleNext();
      // }

      handleNext && handleNext();

    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
      setTimeout(() => {
        handleRedirect();
      }, 1000);
    }
  };

  const handleUpdateDocument = async (document: Document, resetForm: any) => {
    setOpenBackdrop(true);

    const result: any = await documentService.updateDocument(document);
    setOpenBackdrop(false);

    if (result.success) {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });

      handleAddParameters({
        documentId: result.data.documentId,
        documentIdNo: result.data.documentIdNo,
        maintenanceId: result.data.maintenance?.maintenanceId,
        repairLocation: result.data.maintenance?.repairLocation,
      });

      resetForm();
      setDocumentForm(initialDocument);

      // if (documentCategory === DocumentCategory.Maintenance) {
      //   document.maintenance.repairLocation === LocationType.OnPlant
      //     ? setActiveStep && setActiveStep(2)
      //     : handleNext && handleNext();
      // } else {
      //   handleNext && handleNext();
      // }

      handleNext && handleNext();
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  const handleGetDocument = async (documentId: string) => {
    setOpenBackdrop(true);

    const result: any = await documentService.getDocument(documentId);

    // console.log(result);

    setOpenBackdrop(viewOnly);

    if (result.success) {
      let _documentIdNo = `${result.data.docType}-${result.data.docYear}-${result.data.docMonth}-${result.data.documentIdNo}`;
      // console.log()
      setDocumentId(_documentIdNo);
      if (
        result.data.documentStatus === DocumentStatus.Close ||
        result.data.documentStatus === DocumentStatus.Cancel
        // ||
        // result.data.documentStep === DocumentStep.Approve
      ) {
        if (viewOnly === false) {
          if (result.data.documentStep === DocumentStep.Approve) {
            handleRedirect();
          }
        }
      } else {
        console.log(result.data);
        setDocumentForm(result.data);

        // console.log(result.data);

        // handleAddParameters({
        //   documentId: result.data.documentId,
        //   documentIdNo: result.data.documentIdNo,
        // });

        handleAddParameters({
          documentId: result.data.documentId,
          documentIdNo: result.data.documentIdNo,
          maintenanceId: result.data.maintenance?.maintenanceId,
          repairLocation: result.data.maintenance?.repairLocation,
        });

        if (!handleBack) {
          if (setActiveStep) {
            // console.log("asdasdas");
            checkStep(
              result.data.documentStep,
              setActiveStep,
              documentCategory
            );
          }
        }
      }
      setDocumentEdit(true);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
      handleRedirect();
    }
  };

  // const getDocumentList = () => {
  //   axios
  //     .get(
  //       `/api/document?getbycharacter=true&documentCategory=${documentCategory}`
  //     )
  //     .then(({ data }) => {
  //       // console.log(data)
  //       setDocumentSelectState(data.data);
  //       // if (pathname.includes("edit")) {
  //       if (!params.get("documentId")) {
  //         setComponentLoad(false);
  //       }
  //       // }
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

  const handleRedirect = () => {
    if (documentCategory === DocumentCategory.Rental) {
      router.push(`/${localActive}/protected/rental`);
    } else {
      router.push(`/${localActive}/protected/maintenance`);
    }
  };

  useEffect(() => {
    let rentalId = params.get("rentalId");
    let documentId = params.get("documentId");

    if (pathname.includes("new")) {
      setDocumentForm(initialDocument);
      setDocumentEdit(false);
      setComponentLoad(false);
    } else if (documentId) {
      setDocumentEdit(true);
      // handleGetDocument(documentId);
    }

    if (documentId || pathname.includes("new")) {
      if (documentId) handleGetDocument(documentId);
    }

    setDocumentForm({
      ...documentForm,
      documentStatus: DocumentStatus.Draft,
      documentType:
        documentCategory === DocumentCategory.Maintenance
          ? DocumentCategory.Maintenance
          : DocumentCategory.Rental,
    });

    return () => {
      setDocumentForm(initialDocument);
      setDocumentSelectState([]);
      setDocumentEdit(false);
      setHandleBack(false);
    };
  }, []);

  return (
    <>
      <Formik<Document>
        initialValues={documentForm} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({ errors, touched, setFieldValue, values, isSubmitting }) => (
          <Form>
            <Grid2 container spacing={3}>
              <Grid2 size={12}>
                <Box
                  p={3}
                  border={viewOnly ? "none" : "1px solid #ccc"}
                  borderRadius="8px"
                >
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }} mb={2}>
                      <Grid2 container alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <FileText size={20} />
                        </Avatar>
                        <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                          เอกสาร
                        </Typography>
                      </Grid2>
                    </Grid2>
                    {/* Document ID */}
                    {/* <Grid2 size={{ xs: 12 }}>
                      <Field name="documentIdNo">
                        {({ field }: any) => (
                          <TextField
                            {...field}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                readOnly: viewOnly ? true : false,
                              },
                            }}
                            name="documentIdNo"
                            label="เลขที่เอกสาร (จำเป็น)"
                            disabled={
                              openBackdrop ||
                              pathname.includes("edit") ||
                              isSubmitting
                            }
                            value={
                              values.documentIdNo ? values.documentIdNo : ""
                            }
                            type="text"
                            onChange={(e) => {
                              setFieldValue(
                                "documentIdNo",
                                e.target.value.toUpperCase()
                              );
                            }}
                            variant={viewOnly ? "standard" : "outlined"}
                            fullWidth
                            error={
                              touched.documentIdNo &&
                              Boolean(errors.documentIdNo)
                            }
                            sx={{ textTransform: "uppercase" }}
                            helperText={
                              touched.documentIdNo && errors.documentIdNo
                            }
                          />
                        )}
                      </Field>
                    </Grid2> */}
                    {/* {!viewOnly && (
                        <Typography variant="body2" color="text.secondary">
                          เลขที่เอกสารสามารถใช้เลขเดียวกันได้
                          แต่หากไม่มีเลขที่เอกสารในระบบจะเป็นการเพิ่มเอกสารใหม่
                        </Typography>
                      )} */}

                    {/* Document Details */}
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
                            disabled={openBackdrop || isSubmitting}
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

                    {/* Start Maintenance Form */}

                    {documentCategory === DocumentCategory.Maintenance && (
                      <>
                        <Grid2 size={{ xs: 6 }} mb={2}>
                          <Field name="maintenance.natureOfBreakdown">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                name="maintenance.natureOfBreakdown"
                                label="อาการเสีย (ถ้ามี)"
                                disabled={openBackdrop || isSubmitting}
                                value={
                                  values.maintenance?.natureOfBreakdown
                                    ? values.maintenance?.natureOfBreakdown
                                    : ""
                                }
                                type="text"
                                multiline
                                rows={3}
                                onChange={(e) => {
                                  setFieldValue(
                                    "maintenance.natureOfBreakdown",
                                    e.target.value
                                  );
                                }}
                                variant={viewOnly ? "standard" : "outlined"}
                                fullWidth
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 6 }} mb={2}>
                          <Field name="maintenance.causes">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                name="maintenance.causes"
                                label="สาเหตุ (ถ้ามี)"
                                disabled={openBackdrop || isSubmitting}
                                value={
                                  values.maintenance?.causes
                                    ? values.maintenance?.causes
                                    : ""
                                }
                                type="text"
                                multiline
                                rows={3}
                                onChange={(e) => {
                                  setFieldValue(
                                    "maintenance.causes",
                                    e.target.value
                                  );
                                }}
                                variant={viewOnly ? "standard" : "outlined"}
                                fullWidth
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 6 }}>
                          <Field name="maintenance.TOFstart">
                            {({ field }: FieldProps) => (
                              <DatePicker
                                label="วันที่อุปกรณ์หยุดทำงาน (ถ้ามี)"
                                name="maintenance.TOFstart"
                                sx={{ minWidth: "100%" }}
                                value={
                                  values.maintenance?.TOFstart !== undefined
                                    ? dayjs(values.maintenance.TOFstart)
                                    : null
                                }
                                disabled={openBackdrop || isSubmitting}
                                onChange={(newValue) => {
                                  setFieldValue(
                                    "maintenance.TOFstart",
                                    newValue
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    helperText: "DD/MM/YYYY",
                                  },
                                }}
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 6 }}>
                          <Field name="maintenance.repairingStart">
                            {({ field }: FieldProps) => (
                              <DatePicker
                                label="วันที่จะเริ่มซ่อมแซม (ถ้ามี)"
                                name="maintenance.repairingStart"
                                sx={{ minWidth: "100%" }}
                                value={
                                  values.maintenance?.repairingStart !==
                                  undefined
                                    ? dayjs(values.maintenance.repairingStart)
                                    : null
                                }
                                disabled={openBackdrop || isSubmitting}
                                onChange={(newValue) => {
                                  setFieldValue(
                                    "maintenance.repairingStart",
                                    newValue
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    helperText: "DD/MM/YYYY",
                                  },
                                }}
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={12} mt={5}>
                          <Grid2 size={{ xs: 12 }} mb={5}>
                            <Grid2 container alignItems="center">
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                <CreditScore />
                              </Avatar>
                              <Typography
                                variant="h4"
                                gutterBottom
                                ml={2}
                                mt={0.5}
                              >
                                กำหนดรูปแบบการเรียกเก็บเงิน
                              </Typography>
                            </Grid2>
                          </Grid2>
                          <Grid2 size={12} spacing={2} container mb={2} ml={1}>
                            <Field name="maintenance.maintenanceType">
                              {({ field }: FieldProps) => (
                                <>
                                  {Object.keys(MaintenanceType).map(
                                    (option, index) => (
                                      <Grid2
                                        container
                                        mb={2}
                                        flexDirection={"column"}
                                        key={index}
                                      >
                                        <DeliveryCard
                                          key={option}
                                          isSelected={
                                            values.maintenance
                                              ?.maintenanceType === option
                                          }
                                          onClick={() =>
                                            setFieldValue(
                                              "maintenance.maintenanceType",
                                              option
                                            )
                                          }
                                          elevation={0}
                                        >
                                          <Box sx={{ flex: 1 }}>
                                            {/* <Typography
                                              variant="h6"
                                              sx={{
                                                color:
                                                  values.maintenance
                                                    ?.maintenanceType === option
                                                    ? "#fff"
                                                    : "text.primary",
                                                mb: 0.5,
                                              }}
                                            >
                                              {option}
                                            </Typography> */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color:
                                                  values.maintenance
                                                    ?.maintenanceType === option
                                                    ? "#ffffff"
                                                    : "text.secondary",
                                              }}
                                            >
                                              {checkDocumentType(
                                                option as MaintenanceType
                                              )}
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
                                                values.maintenance
                                                  ?.maintenanceType === option
                                              }
                                              onChange={() =>
                                                setFieldValue(
                                                  "maintenance.maintenanceType",
                                                  option
                                                )
                                              }
                                              disabled={
                                                componentLoad || isSubmitting
                                              }
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
                                    )
                                  )}
                                </>
                              )}
                            </Field>
                          </Grid2>
                        </Grid2>
                        <Grid2 size={6}>
                          <>
                            <Grid2 size={{ xs: 12 }} mb={5}>
                              <Grid2 container alignItems="center">
                                <Avatar sx={{ bgcolor: "primary.main" }}>
                                  <Factory size={20} />
                                </Avatar>
                                <Typography
                                  variant="h4"
                                  gutterBottom
                                  ml={2}
                                  mt={0.5}
                                >
                                  กำหนดสถานที่ซ่อมแซม
                                </Typography>
                              </Grid2>
                            </Grid2>
                            <Grid2 container spacing={2} mb={2} ml={1}>
                              <Field name="maintenance.repairLocation">
                                {({ field }: FieldProps) => (
                                  <>
                                    {Object.keys(LocationType).map(
                                      (option, index) => (
                                        <Grid2
                                          container
                                          mb={2}
                                          flexDirection={"column"}
                                          key={index}
                                        >
                                          <DeliveryCard
                                            key={option}
                                            isSelected={
                                              values.maintenance
                                                ?.repairLocation === option
                                            }
                                            onClick={() =>
                                              setFieldValue(
                                                "maintenance.repairLocation",
                                                option
                                              )
                                            }
                                            elevation={0}
                                          >
                                            <Box sx={{ flex: 1 }}>
                                              <Typography
                                                variant="h6"
                                                sx={{
                                                  color:
                                                    values.maintenance
                                                      ?.repairLocation ===
                                                    option
                                                      ? "#fff"
                                                      : "text.primary",
                                                  mb: 0.5,
                                                }}
                                              >
                                                {option}
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
                                                  values.maintenance
                                                    ?.repairLocation === option
                                                }
                                                disabled={
                                                  isSubmitting || componentLoad
                                                }
                                                onChange={() =>
                                                  setFieldValue(
                                                    "maintenance.repairLocation",
                                                    option
                                                  )
                                                }
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
                                      )
                                    )}
                                  </>
                                )}
                              </Field>
                            </Grid2>
                          </>
                        </Grid2>
                      </>
                    )}

                    {/* End Maintenance Form */}
                  </Grid2>
                  {!viewOnly && (
                    <Grid2
                      spacing={1}
                      container
                      size={12}
                      mt={5}
                      justifyContent="flex-end"
                      alignItems="flex-end"
                    >
                      <LoadingButton
                        variant="contained"
                        type="submit"
                        color="primary"
                        sx={{ mr: 1 }}
                        loading={openBackdrop}
                        disabled={isSubmitting}
                        startIcon={<ClipboardPlus size={20} />}
                      >
                        {!documentEdit ? "สร้างเอกสาร" : "แก้ไขเอกสาร"}
                      </LoadingButton>
                    </Grid2>
                  )}
                </Box>
              </Grid2>
            </Grid2>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default DocumentForm;
