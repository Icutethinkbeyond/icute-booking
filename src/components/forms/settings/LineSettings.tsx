import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";

import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import {  MessageSquareMore, Save } from "lucide-react";
import { More } from "@mui/icons-material";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useStoreContext } from "@/contexts/StoreContext";
import { Store, initialStore } from "@/interfaces/Store";

interface StoreProps {
  viewOnly?: boolean;
}

const StoreForm: FC<StoreProps> = ({ viewOnly = false }) => {
  const { setStoreForm, StoreForm } = useStoreContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object().shape({
    // serialNo: Yup.string().required("กรุณากรอกรหัสอุปกรณ์"),
    // StoreName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"),
    // aboutStore: Yup.object().shape({
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
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // 2. เรียกใช้ API
    let result = await storeService.updateLineSettingStore(values);

    // 3. จัดการเมื่อสำเร็จ
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
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });
    }
  };

  useEffect(() => {
    // setIsLoading(true);
    getStore();
    return () => {
      setStoreForm(initialStore);
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
                        <MessageSquareMore size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        ตั้งค่า LINE Messaging
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Store ID */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="lineChannelId">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="lineChannelId"
                        label="Channel ID  (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.lineChannelId ? values.lineChannelId : ""}
                        onChange={(e) => {
                          setFieldValue(
                            "lineChannelId",
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
                        error={
                          touched.lineChannelId && Boolean(errors.lineChannelId)
                        }
                        helperText={
                          touched.lineChannelId && errors.lineChannelId
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Store Name */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="lineChannelSecret">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="lineChannelSecret"
                        label="Channel Secret (จำเป็น)"
                        value={
                          values.lineChannelSecret
                            ? values.lineChannelSecret
                            : ""
                        }
                        onChange={(e) => {
                          setFieldValue("lineChannelSecret", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.lineChannelSecret &&
                          Boolean(errors.lineChannelSecret)
                        }
                        helperText={
                          touched.lineChannelSecret && errors.lineChannelSecret
                        }
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
                  <Field name="newBooking">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="newBooking"
                        label="เเจ้งเตือนเมื่อได้รับการจองใหม่ (ถ้ามี)"
                        value={values.newBooking ? values.newBooking : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("newBooking", e.target.value);
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
                  <Field name="successBooking">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="successBooking"
                        label="เเจ้งเตือนลูกค้าเมื่อจองสำเร็จ (ถ้ามี)"
                        value={
                          values.successBooking ? values.successBooking : ""
                        }
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("successBooking", e.target.value);
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
                  <Field name="cancelBooking">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="cancelBooking"
                        label="ข้อความเเจ้งเตือนลูกค้าเมื่อถูกยกเลิกการจอง (ถ้ามี)"
                        value={values.cancelBooking ? values.cancelBooking : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("cancelBooking", e.target.value);
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
                  <Field name="before24H">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="before24H"
                        label="ข้อความเเจ้งเตือนลูกค้าเมื่อใกล้ถึงเวลานัด 24 ชั่วโมง (ถ้ามี)"
                        value={values.before24H ? values.before24H : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("before24H", e.target.value);
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
                  <Field name="reSchedule">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="reSchedule"
                        label="ข้อความเเจ้งเตือนลูกค้าเมื่อถูกเลื่อนการจอง (ถ้ามี)"
                        value={values.reSchedule ? values.reSchedule : ""}
                        multiline
                        rows={4}
                        onChange={(e) => {
                          setFieldValue("reSchedule", e.target.value);
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

export default StoreForm;
