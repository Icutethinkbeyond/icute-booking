import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import StatusService from "@/components/shared/Status";
import dayjs from "dayjs";
import { Bath, MonitorCog, Save, Store as StoreIcon, Copy } from "lucide-react";
import { useServiceContext } from "@/contexts/ServiceContext";
import {
  Service,
  Store,
  initialService,
  initialStore,
} from "@/interfaces/Store";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useSession } from "next-auth/react";
import { useStoreContext } from "@/contexts/StoreContext";
import { getBaseUrl } from "@/utils/lib/utils";

interface ServiceProps {
  viewOnly?: boolean;
}

const ServiceForm: FC<ServiceProps> = ({ viewOnly = false }) => {
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);
  const [storeURL, setStoreURL] = useState<string | null>();

  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object().shape({
    // serialNo: Yup.string().required("กรุณากรอกรหัสอุปกรณ์"),
    // ServiceName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"),
    // aboutService: Yup.object().shape({
    //   rentalPriceCurrent: Yup.number()
    //     .required("กรุณากรอกราคาค่าเช่า")
    //     .min(1, "กรุณากรอกค่าที่มากกว่า 0"),
    //   stockStatus: Yup.string().required("กรุณาเลือกสถานะอุปกรณ์"),
    //   QTY: Yup.number().required("กรุณาใส่จำนวน"),
    // }),
  });

  const handleFormSubmit = async (
    values: Store,
    { setSubmitting, setErrors, resetForm, validateForm }: FormikHelpers<Store> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submittings

    // 2. เรียกใช้ API
    let result;

    result = await storeService.updateStore(values);

    // // // 3. จัดการเมื่อสำเร็จ
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
  };

  const getStore = async () => {
    let result = await storeService.getStore();

    if (result.success) {
      setStoreForm(result.data);
      let baseURL = getBaseUrl();
      setStoreURL(`${baseURL}/protected/shop/${result.data?.storeUsername}/booking`);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getStore();
    return () => {
      setStoreForm(initialStore);
      setStoreURL(null);
    };
  }, []);

  return (
    <>
      <Formik<Store>
        initialValues={StoreForm} // ใช้ state เป็น initialValues
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
                        <StoreIcon size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        รายละเอียดร้านค้า
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Service ID */}
                <Grid2 size={{ xs: 12 }}>
                  <Field name="storeName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeName"
                        label="ชื่อร้านค้า (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.storeName ? values.storeName : ""}
                        onChange={(e) => {
                          setFieldValue("storeName", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.storeName && Boolean(errors.storeName)}
                        helperText={touched.storeName && errors.storeName}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Field name="storeUsername">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeUsername"
                        label="Id ร้านค้า (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.storeUsername ? values.storeUsername : ""}
                        onChange={(e) => {
                          setFieldValue("storeUsername", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.storeUsername && Boolean(errors.storeUsername)
                        }
                        helperText={
                          touched.storeUsername && errors.storeUsername
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Field name="lineOALink">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="lineOALink"
                        label="ลิงก์ไลน์ OA (ถ้ามี)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.lineOALink ? values.lineOALink : ""}
                        onChange={(e) => {
                          setFieldValue("lineOALink", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.lineOALink && Boolean(errors.lineOALink)}
                        helperText={touched.lineOALink && errors.lineOALink}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Service Name */}
                <Grid2 size={{ xs: 12 }}>
                  <Field name="storeURL">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeURL"
                        label="URL สำหรับจอง"
                        value={storeURL}
                        fullWidth
                        disabled={true}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      storeURL ? storeURL : ""
                                    );
                                  }}
                                  edge="end"
                                >
                                  <Copy />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
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
                {/* <ConfirmDelete
                  itemId={uniqueId()}
                  onDisable={openBackdrop || isSubmitting}
                  onDelete={() => resetForm()}
                  massage={`คุณต้องการล้างฟอร์มใช่หรือไม่?`}
                  buttonType={ButtonType.Button}
                /> */}
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ServiceForm;
