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
import { DocumentCategory } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { LoadingButton } from "@mui/lab";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { MapPin, Pin } from "lucide-react";
import { Replay } from "@mui/icons-material";
import { useDocumentContext } from "@/contexts/DocumentContext";

const validationSchema = Yup.object().shape({
  siteId: Yup.string().required("กรุณาเลือกสถานที่"),
});

interface SiteSelectProps {
  documentCategory?: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const SiteSelectComponent: React.FC<SiteSelectProps> = ({
  documentCategory = DocumentCategory.Maintenance,
  handleNext,
  handleBack,
  viewOnly = false,
}) => {
  const {
    siteSelectState,
    siteForm,
    setSiteEdit,
    setSiteForm,
    setSiteSelectState,
  } = useSiteContext();
    const {
      setHandleBack,
      documentId
    } = useDocumentContext();

  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const localActive = useLocale();

  const { setNotify, setOpenBackdrop, notify, openBackdrop } =
    useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    selectSite(value);
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

  const selectSite = (site: Site) => {
    setOpenBackdrop(true);

    axios
      .patch("/api/site/update-document", site)
      .then(({ data }) => {
        handleNext && handleNext();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setNotify({
          ...notify,
          open: true,
          message: error.response.data,
          color: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
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

  const onHandleBack = () => {
    handleBack && handleBack()
    setHandleBack(true)
  }


  useEffect(() => {
    getSiteList();
    getDataDocument(params.get("documentId"));
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
            <Box
              p={3}
              border={viewOnly ? "none" : "1px solid #ccc"}
              borderRadius="8px"
            >
              <Grid2 container spacing={2}>
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
                <Grid2 size={12} container spacing={2}>
                  <Grid2 container size={{ xs: 12 }}>
                    <Field name="siteId">
                      {({ field, form }: FieldProps) => (
                        <Autocomplete
                          fullWidth
                          disabled={openBackdrop || isSubmitting}
                          id="categoryId"
                          options={siteSelectState}
                          getOptionLabel={(option: SiteSelect) =>
                            option.siteName
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.siteId === value.siteId
                          }
                          value={
                            siteSelectState.find(
                              (cat) => cat.siteId === values.siteId
                            ) || null
                          }
                          onChange={(event, value) => {
                            setFieldValue("siteId", value ? value.siteId : "");
                          }}
                          readOnly={viewOnly}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="ชื่อสถานที่ (จำเป็น)"
                              name="siteId"
                            />
                          )}
                        />
                      )}
                      {/* //   <Autocomplete
                      //     fullWidth
                      //     id="siteId"
                      //     options={siteSelectState}
                      //     getOptionLabel={(option: SiteSelect) => option.siteName }
                      //     isOptionEqualToValue={(option, value) =>
                      //       option.siteId === value.siteId
                      //     }
                      //     value={
                      //       siteSelectState.find(
                      //         (cat) => cat.siteId === values.siteId
                      //       ) || null
                      //     }
                      //     freeSolo
                      //     disabled={isSubmitting}
                      //     loading={isSearchLoading} // ใช้สถานะ loading
                      //     // onInputChange={(event, value) => {
                      //     //   setIsSearchLoading(true); // เริ่มการโหลด
                      //     //   // จำลองการค้นหา เช่น API call
                      //     //   setTimeout(() => {
                      //     //     const hasResults = siteSelectState.some((opt) =>
                      //     //       opt.siteName.includes(value)
                      //     //     );
                      //     //     if (!hasResults) {
                      //     //       setIsSearchLoading(false); // หยุดโหลดเมื่อไม่มีผลลัพธ์
                      //     //     }
                      //     //   }, 500);

                      //     //  }}
                      //     onChange={(event, value) => {
                      //       setIsLoading(false); // หยุดโหลดเมื่อเลือกค่า
                      //       setFieldValue(
                      //         "siteId",
                      //         value. ? value. : ""
                      //       );
                      //     }}
                      //     renderInput={(params) => (
                      //       <TextField
                      //         {...params}
                      //         label="ชื่อสถานที่ (จำเป็น)"
                      //         name="siteId"
                      //         error={
                      //           touched.siteId && Boolean(errors.siteId)
                      //         }
                      //         helperText={touched.siteId && errors.siteId}
                      //       />
                      //     )}
                      //   />
                      // )} */}
                    </Field>
                  </Grid2>

                  <Grid2
                    spacing={1}
                    container
                    size={12}
                    mt={4}
                    justifyContent="flex-end"
                    alignItems="flex-end"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => onHandleBack()}
                      sx={{ mr: 1 }}
                      disabled={componentLoad || isSubmitting}
                    >
                      ย้อนกลับ
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => getSiteList()}
                      sx={{ mr: 1 }}
                      disabled={componentLoad || isSubmitting}
                      startIcon={<Replay />}
                    >
                      ดึงรายการอีกครั้ง
                    </Button>
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
                </Grid2>
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SiteSelectComponent;
