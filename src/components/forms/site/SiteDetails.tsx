import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Autocomplete,
  Button,
  Avatar,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import { initialSite, Site, SiteSelect } from "@/interfaces/Site";
import { useSiteContext } from "@/contexts/SiteContext";
import { DocumentCategory, LocationType } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { LoadingButton } from "@mui/lab";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { MapPin, Phone, Pin } from "lucide-react";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";
import { Email, LocationCity, Person } from "@mui/icons-material";

const validationSchemaRental = Yup.object().shape({
  siteName: Yup.string().required("กรุณากรอกชื่อสถานที่"),
});

const validationSchemaMain = Yup.object().shape({
  siteName: Yup.string().required("กรุณากรอกชื่อสถานที่"),
  repairLocation: Yup.string().required("กรุณาเลือกสถานที่ซ่อม"),
});

interface BorrowingDocumentProps {
  documentCategory?: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const SiteForm: React.FC<BorrowingDocumentProps> = ({
  documentCategory = DocumentCategory.Maintenance,
  handleNext,
  handleBack,
  viewOnly = false,
}) => {
  const {
    siteSelectState,
    siteForm,
    siteEdit,
    setSiteEdit,
    setSiteForm,
    setSiteSelectState,
    makeSiteFakeData,
  } = useSiteContext();

  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const localActive = useLocale();

  const { setNotify, setOpenBackdrop, notify, openBackdrop } =
    useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [componentLoad, setComponentLoad] = useState<boolean>(
    viewOnly ? false : true
  );

  const handleFormSubmit = (value: Site, { resetForm, validateForm }: any) => {
    let documentId = params.get("documentId");
    if (!pathname.includes("site")) {
      if (!documentId) {
        return;
      }
      value = { ...value, documentId: documentId };
    }
    if (pathname.includes("site")) {
      setComponentLoad(true);
    }
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    if (siteEdit) {
      updateSite(value);
    } else {
      createSite(value);
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
    if (pathname.includes("site")) {
      setComponentLoad(false);
    }
  };

  const getSiteList = () => {
    setOpenBackdrop(true);
    axios
      .get(`/api/site?getbycharacter=true`)
      .then(({ data }) => {
        console.log(data);
        setSiteSelectState(data.data);
        setComponentLoad(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {
        setOpenBackdrop(false);
      });
  };

  const createSite = (site: Site) => {
    setOpenBackdrop(true);
    let endpoint;

    if (pathname.includes("new") && pathname.includes("site")) {
      endpoint = "/api/site?quickly=false";
    } else {
      endpoint = "/api/site";
    }

    axios
      .post(endpoint, site)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: `สร้างสถานที่ ${site.siteName} สำเร็จ`,
          color: "success",
        });
        if (pathname.includes("new") && pathname.includes("site")) {
          router.push(`/${localActive}/protected/site`);
        } else {
          handleNext && handleNext();
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: error.response.data,
            color: "error",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
        setOpenBackdrop(false);
      });
  };

  const updateSite = (site: Site) => {
    setOpenBackdrop(true);
    let endpoint;

    if (pathname.includes("site") && pathname.includes("edit")) {
      endpoint = "/api/site?quickly=false";
    } else {
      endpoint = "/api/site";
    }

    axios
      .patch(endpoint, site)
      .then(() => {
        setNotify({
          ...notify,
          open: true,
          message: `เเก้ไขสถานที่ ${site.siteName} สำเร็จ`,
          color: "success",
        });
        if (pathname.includes("site") && pathname.includes("edit")) {
          router.push(`/${localActive}/protected/site`);
        } else {
          handleNext && handleNext();
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: error.response.data,
            color: "error",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
        setOpenBackdrop(false);
      });
  };

  const getDataSite = (siteId: string | undefined | null) => {
    if (!siteId) {
      setNotify({
        ...notify,
        open: true,
        message: "โปรดดำหนด siteId",
        color: "error",
      });

      return;
    }
    setOpenBackdrop(true);
    setSiteForm(initialSite);
    axios
      .get(`/api/site?siteId=${siteId}`)
      .then(({ data }) => {
        console.log(data);
        let modified = {
          ...data,
          repairLocation: LocationType.OnSite,
        };
        setSiteForm(modified);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {
        setSiteEdit(true);
        setOpenBackdrop(false);
      });
  };

  const getDataDocument = (documentId: string | undefined | null) => {
    if (!documentId) {
      return;
    }
    setOpenBackdrop(true);
    setSiteForm(initialSite);
    axios
      .get(`/api/document?documentId=${documentId}`)
      .then(({ data }) => {
        if (data.data.site) {
          setSiteForm(data.data.site);
        } else {
          setSiteForm(initialSite);
        }
      })
      .catch((error) => {
          console.error("Fetch error:", error);
      })
      .finally(() => {
        setSiteEdit(true);
        setOpenBackdrop(false);
      });
  };

  useEffect(() => {
    // if (
    //   pathname.includes("site") && (pathname.includes("edit") || pathname.includes("new"))
    // ) {
    if (pathname.includes("site") && pathname.includes("edit")) {
      getDataSite(params.get("siteId"));
      setComponentLoad(false);
    } else {
      getSiteList();
      getDataDocument(params.get("documentId"));
    }
    return () => {
      setSiteForm(initialSite);
      setSiteEdit(false);
      setSiteSelectState([]);
    };
  }, []);

  return (
    <>
      <Formik<Site>
        initialValues={siteForm} // ใช้ state เป็น initialValues
        validationSchema={
          documentCategory === DocumentCategory.Maintenance
            ? validationSchemaMain
            : validationSchemaRental
        }
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
            <Box
              p={3}
              border={viewOnly ? "none" : "1px solid #ccc"}
              borderRadius="8px"
            >
              <Grid2 container spacing={2}>
                {/* {documentCategory === DocumentCategory.Maintenance &&
                  !pathname.includes("site") && (
                    <>
                      <Grid2 size={{ xs: 12 }} mb={2}>
                        <Grid2 container alignItems="center">
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <Factory size={20} />
                          </Avatar>
                          <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                            กำหนดสถานที่ซ่อมแซม
                          </Typography>
                        </Grid2>
                      </Grid2>
                      <Grid2 container spacing={2} mb={2} ml={1}>
                        <Field name="repairLocation">
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
                                        values.repairLocation === option
                                      }
                                      onClick={() =>
                                        setFieldValue("repairLocation", option)
                                      }
                                      elevation={0}
                                    >
                                      <Box sx={{ flex: 1 }}>
                                        <Typography
                                          variant="h6"
                                          sx={{
                                            color:
                                              values.repairLocation === option
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
                                            values.repairLocation === option
                                          }
                                          disabled={isSubmitting}
                                          onChange={() =>
                                            setFieldValue(
                                              "repairLocation",
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
                  )} */}

                {(values.repairLocation === LocationType.OnSite ||
                  !values.repairLocation ||
                  documentCategory === DocumentCategory.Rental) && (
                  <>
                    {" "}
                    <Grid2 size={{ xs: 12 }}>
                      <Grid2 container alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <MapPin size={20} />
                        </Avatar>
                        <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                          สถานที่และผู้ติดต่อ
                        </Typography>
                      </Grid2>
                    </Grid2>
                    <Grid2 container spacing={2}>
                      {pathname.includes("site") || pathname.includes("return") ? (
                        <Field name="siteName">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              name="siteName"
                              label="ชื่อสถานที่ (จำเป็น)"
                              type="text"
                              variant={viewOnly ? "standard" : "outlined"}
                              onChange={(e) => {
                                setFieldValue("siteName", e.target.value);
                              }}
                              disabled={componentLoad || isSubmitting}
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  readOnly: viewOnly ? true : false,
                                  endAdornment: <LocationCity />,
                                },
                              }}
                              fullWidth
                              value={values.siteName?.toUpperCase()}
                              error={
                                touched.siteName && Boolean(errors.siteName)
                              }
                              sx={{ textTransform: "uppercase" }}
                              helperText={touched.siteName && errors.siteName}
                            />
                          )}
                        </Field>
                      ) : (
                        <Grid2 size={{ xs: 12 }}>
                          <Field name="siteName">
                            {({ field, form }: FieldProps) => (
                              <Autocomplete
                                value={values.siteName}
                                id="siteName"
                                options={siteSelectState}
                                getOptionLabel={(option: SiteSelect | string) =>
                                  typeof option === "string"
                                    ? option
                                    : option.siteName
                                }
                                freeSolo
                                disabled={isSubmitting}
                                loading={isSearchLoading} // ใช้สถานะ loading
                                onInputChange={(event, value) => {
                                  setIsSearchLoading(true); // เริ่มการโหลด
                                  // จำลองการค้นหา เช่น API call
                                  setTimeout(() => {
                                    const hasResults = siteSelectState.some(
                                      (opt) => opt.siteName.includes(value)
                                    );
                                    if (!hasResults) {
                                      setIsSearchLoading(false); // หยุดโหลดเมื่อไม่มีผลลัพธ์
                                    }
                                  }, 500);

                                  // Handle typed value when no matching option
                                  if (
                                    value &&
                                    !siteSelectState.some(
                                      (opt) => opt.siteName === value
                                    )
                                  ) {
                                    setSiteEdit(false);
                                    setSiteForm(initialSite);
                                    // showNoti("new", value.toUpperCase());
                                    form.setFieldValue(
                                      "siteName",
                                      value.toUpperCase()
                                    );
                                  }
                                }}
                                sx={{ textTransform: "uppercase" }}
                                onChange={(event, value) => {
                                  setIsLoading(false); // หยุดโหลดเมื่อเลือกค่า
                                  // Handle selected option
                                  if (typeof value !== "string") {
                                    // showNoti(
                                    //   "change",
                                    //   value && value.siteName.toUpperCase()
                                    // );
                                    setSiteEdit(true);
                                    getDataSite(value?.siteId);
                                    form.setFieldValue(
                                      "siteName",
                                      value !== null
                                        ? value.siteName.toUpperCase()
                                        : ""
                                    );
                                  }
                                }}
                                readOnly={viewOnly ? true : false}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    disabled={
                                      viewOnly || componentLoad || isSubmitting
                                    }
                                    label="ชื่อสถานที่ (จำเป็น)"
                                    name="siteName"
                                    type="text"
                                    variant={viewOnly ? "standard" : "outlined"}
                                    value={values.siteName?.toUpperCase()}
                                    error={
                                      touched.siteName &&
                                      Boolean(errors.siteName)
                                    }
                                    sx={{ textTransform: "uppercase" }}
                                    helperText={
                                      touched.siteName && errors.siteName
                                    }
                                  />
                                )}
                              />
                            )}
                          </Field>
                        </Grid2>
                      )}

                      {/* Borrower Name */}
                      {!viewOnly && (
                        <Grid2 size={12}>
                          <Field name="siteDesc">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                name="siteDesc"
                                label="รายละเอียดสถานที่ (ถ้ามี)"
                                value={values.siteDesc}
                                type="text"
                                variant={viewOnly ? "standard" : "outlined"}
                                multiline
                                rows={3}
                                onChange={(e) => {
                                  setFieldValue("siteDesc", e.target.value);
                                }}
                                disabled={componentLoad}
                                slotProps={{
                                  inputLabel: { shrink: true },
                                  input: {
                                    readOnly: viewOnly ? true : false,
                                  },
                                }}
                                fullWidth
                              />
                            )}
                          </Field>
                        </Grid2>
                      )}

                      {/* Borrower Name */}
                      <Grid2 size={viewOnly ? 12 : 4}>
                        <Field name="contactorName">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              name="contactorName"
                              label="ชื่อผู้ติดต่อ (ถ้ามี)"
                              value={values.contactorName}
                              type="text"
                              variant={viewOnly ? "standard" : "outlined"}
                              onChange={(e) => {
                                setFieldValue("contactorName", e.target.value);
                              }}
                              disabled={componentLoad}
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  readOnly: viewOnly ? true : false,
                                  endAdornment: <Person />,
                                },
                              }}
                              fullWidth
                            />
                          )}
                        </Field>
                      </Grid2>

                      {/* Contact Information */}
                      <Grid2 size={viewOnly ? 6 : 4}>
                        <Field name="contactorEmail">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              name="contactorEmail"
                              label="อีเมลผู้ติดต่อ (ถ้ามี)"
                              value={values.contactorEmail}
                              type="email"
                              variant={viewOnly ? "standard" : "outlined"}
                              onChange={(e) => {
                                setFieldValue("contactorEmail", e.target.value);
                              }}
                              disabled={componentLoad || isSubmitting}
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  readOnly: viewOnly ? true : false,
                                  endAdornment: <Email />,
                                },
                              }}
                              fullWidth
                              error={
                                touched.contactorEmail &&
                                Boolean(errors.contactorEmail)
                              }
                              helperText={
                                touched.contactorEmail && errors.contactorEmail
                              }
                            />
                          )}
                        </Field>
                      </Grid2>

                      <Grid2 size={viewOnly ? 6 : 4}>
                        <Field name="contactorTel">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              name="contactorTel"
                              label="เบอร์โทรศัพท์ผู้ติดต่อ (ถ้ามี)"
                              variant={viewOnly ? "standard" : "outlined"}
                              value={
                                values.contactorTel ? values.contactorTel : ""
                              }
                              disabled={componentLoad || isSubmitting}
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  readOnly: viewOnly ? true : false,
                                  endAdornment: <Phone />,
                                },
                              }}
                              type="tel"
                              onChange={(e) => {
                                setFieldValue("contactorTel", e.target.value);
                              }}
                              fullWidth
                            />
                          )}
                        </Field>
                      </Grid2>
                      {!viewOnly && (
                        <Grid2
                          spacing={1}
                          container
                          size={12}
                          mt={4}
                          justifyContent="flex-end"
                          alignItems="flex-end"
                        >
                          {pathname.includes("site") ? (
                            <>
                              {/* {pathname.includes("new") && (
                                <Button
                                  variant="outlined"
                                  onClick={makeSiteFakeData}
                                  sx={{ mr: 1 }}
                                  disabled={isSubmitting}
                                >
                                  สร้างแบบรวดเร็ว
                                </Button>
                              )} */}

                              <ConfirmDelete
                                itemId={""}
                                onDisable={isSubmitting}
                                onDelete={() => resetForm()}
                                massage={`คุณต้องการล้างฟอร์มใช่หรือไม่?`}
                                buttonType={ButtonType.Button}
                              />
                            </>
                          ) : (
                            <Button
                              variant="outlined"
                              onClick={handleBack}
                              sx={{ mr: 1 }}
                              disabled={componentLoad || isSubmitting}
                            >
                              ย้อนกลับ
                            </Button>
                          )}

                          <LoadingButton
                            variant="contained"
                            type="submit"
                            color="primary"
                            sx={{ mr: 1 }}
                            loading={isLoading}
                            disabled={componentLoad || isSubmitting}
                            startIcon={<Pin size={20} />}
                          >
                            {" "}
                            กำหนดสถานที่
                          </LoadingButton>
                        </Grid2>
                      )}
                    </Grid2>
                  </>
                )}
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SiteForm;
