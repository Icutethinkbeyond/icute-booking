import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Grid2,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  Typography,
  Avatar,
  Stack,
  Tooltip,
  Button,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";

import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Save, Store as StoreIcon, Copy, Share, QrCode } from "lucide-react";
import { Store, initialStore } from "@/interfaces/Store";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useSession } from "next-auth/react";
import { useStoreContext } from "@/contexts/StoreContext";
import { getBaseUrl } from "@/utils/lib/utils";
import DragDropImage from "@/components/shared/DragDropImage";
import { OpenInNew } from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";
import dynamic from "next/dynamic";

const MapPickerClient = dynamic(
  () => import("../../shared/maps-picker/MapPicker.client"),
  { ssr: false }
);

interface ServiceProps {
  viewOnly?: boolean;
}

const ServiceForm: FC<ServiceProps> = ({ viewOnly = false }) => {
  const theme = useTheme();
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const [openQR, setOpenQR] = useState(false);

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

  const downloadQR = () => {
    const canvas = document.getElementById("store-qr") as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "store-qrcode.png";
    a.click();
  };
  

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
      setStoreURL(
        `${baseURL}/protected/shop/${result.data?.storeUsername}/booking`
      );
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
                  <Box sx={{ mb: 3 }}>
                    <Box
                      component="h2"
                      sx={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                      }}
                    >
                      รูปร้าน
                    </Box>
                    <Box
                      component="p"
                      sx={{
                        fontSize: "0.875rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      ข้อมูลที่ลูกค้าจะเห็นบนหน้าจอง
                      เพื่อให้ร้านดูน่าเชื่อถือและค้นหาง่าย
                    </Box>
                  </Box>
                </Grid2>

                {/* <Grid2 size={{ xs: 12 }}>
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
                </Grid2> */}

                <Grid2 container size={{ xs: 6 }}>
                  <Grid2 size={{ xs: 12 }}>
                    <Box>
                      <Box
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          mb: 1,
                          color: theme.palette.text.primary,
                        }}
                      >
                        โลโก้ร้าน (ไม่บังคับ)
                      </Box>
                    </Box>
                    <Field
                      name="logoUrl"
                      component={DragDropImage}
                      setFieldValue={setFieldValue}
                    />
                  </Grid2>
                </Grid2>

                <Grid2 container size={{ xs: 6 }}>
                  <Grid2 size={{ xs: 12 }}>
                    <Box>
                      <Box
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          mb: 1,
                          color: theme.palette.text.primary,
                        }}
                      >
                        รูปหน้าร้าน (ไม่บังคับ)
                      </Box>
                    </Box>
                    <Field
                      name="coverUrl"
                      component={DragDropImage}
                      setFieldValue={setFieldValue}
                    />
                  </Grid2>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box
                      component="h2"
                      sx={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                      }}
                    >
                      ข้อมูลร้าน
                    </Box>
                    <Box
                      component="p"
                      sx={{
                        fontSize: "0.875rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      ข้อมูลที่ลูกค้าจะเห็นบนหน้าจอง
                      เพื่อให้ร้านดูน่าเชื่อถือและค้นหาง่าย
                    </Box>
                  </Box>
                </Grid2>

                {/* ชื่อร้านค้า  */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="storeName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeName"
                        label="ชื่ออังกฤษร้านค้า (จำเป็น)"
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

                {/* ชื่อร้านค้าไทย  */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="storeNameTH">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="storeNameTH"
                        label="ชื่อไทยร้านค้า (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.storeNameTH ? values.storeNameTH : ""}
                        onChange={(e) => {
                          setFieldValue("storeNameTH", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.storeNameTH && Boolean(errors.storeNameTH)
                        }
                        helperText={touched.storeNameTH && errors.storeNameTH}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
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

                <Grid2 size={{ xs: 6 }}>
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

                {/* เบอร์โทร  */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="tel">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="tel"
                        label="เบอร์โทร (ไม่บังคับ)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.tel ? values.tel : ""}
                        onChange={(e) => {
                          setFieldValue("tel", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.tel && Boolean(errors.tel)}
                        helperText={touched.tel && errors.tel}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="mapUrl">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="mapUrl"
                        label="Maps Url ที่ตั้งร้านค้า (ไม่บังคับ)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.mapUrl ? values.mapUrl : ""}
                        onChange={(e) => {
                          setFieldValue("mapUrl", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.mapUrl && Boolean(errors.mapUrl)}
                        helperText={touched.mapUrl && errors.mapUrl}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* ที่อยู่ร้านค้า */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="addressCustom">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="addressCustom"
                        label="ที่อยู่ร้านค้า (ถ้ามี)"
                        value={values.addressCustom}
                        rows={4}
                        multiline={true}
                        onChange={(e) => {
                          setFieldValue("addressCustom", e.target.value);
                        }}
                        placeholder=""
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.addressCustom && Boolean(errors.addressCustom)
                        }
                        helperText={
                          touched.addressCustom && touched.addressCustom
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* รายละเอียด */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="detail">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="detail"
                        label="รายละเอียด (ถ้ามี)"
                        value={values.detail}
                        rows={4}
                        multiline={true}
                        onChange={(e) => {
                          setFieldValue("detail", e.target.value);
                        }}
                        placeholder=""
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.detail && Boolean(errors.detail)}
                        helperText={touched.detail && errors.detail}
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
                      <>
                        <TextField
                          {...field}
                          label="URL สำหรับจอง"
                          value={storeURL}
                          fullWidth
                          disabled
                          slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Stack direction="row" spacing={0.5}>
                                    {/* คัดลอก */}
                                    <Tooltip title="คัดลอก">
                                      <IconButton
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            storeURL || ""
                                          )
                                        }
                                      >
                                        <Copy />
                                      </IconButton>
                                    </Tooltip>

                                    {/* เปิดลิงก์ */}
                                    <Tooltip title="เปิดลิงก์">
                                      <IconButton
                                        onClick={() =>
                                          storeURL &&
                                          window.open(storeURL, "_blank")
                                        }
                                      >
                                        <OpenInNew />
                                      </IconButton>
                                    </Tooltip>

                                    {/* แชร์ LINE */}
                                    <Tooltip title="แชร์ผ่าน LINE">
                                      <IconButton
                                        onClick={() =>
                                          storeURL &&
                                          window.open(
                                            `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
                                              storeURL
                                            )}`,
                                            "_blank"
                                          )
                                        }
                                      >
                                        <Share />
                                      </IconButton>
                                    </Tooltip>

                                    {/* QR Code */}
                                    <Tooltip title="QR Code">
                                      <IconButton
                                        onClick={() => setOpenQR(!openQR)}
                                      >
                                        <QrCode />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />

                        {/* QR CODE */}
                        {openQR && storeURL && (
                          <Stack spacing={1} mt={4} alignItems="center">
                            <QRCodeCanvas
                              id="store-qr"
                              value={storeURL}
                              size={160}
                            />

                            <Button onClick={downloadQR}>ดาวน์โหลด QR</Button>
                          </Stack>
                        )}
                      </>
                    )}
                  </Field>
                </Grid2>
              </Grid2>

              <Grid2
                sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}
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
              </Grid2>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ServiceForm;
