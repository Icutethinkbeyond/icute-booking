import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
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
import StatusStore from "@/components/shared/used/Status";
import dayjs from "dayjs";
import { Bath, MessageSquareMore, MonitorCog, Save } from "lucide-react";
import { AutoFixHigh, Category, Handyman, More } from "@mui/icons-material";
import { IconCurrencyBaht } from "@tabler/icons-react";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useStoreContext } from "@/contexts/StoreContext";
import { Store, initialStore } from "@/interfaces/Store";

interface StoreProps {
  viewOnly?: boolean;
}

const StoreForm: FC<StoreProps> = ({ viewOnly = false }) => {
  const { setStoreForm, StoreEdit, setStoreEdit, setStores, Stores } =
    useStoreContext();
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
    StoreName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"),
    aboutStore: Yup.object().shape({
      rentalPriceCurrent: Yup.number()
        .required("กรุณากรอกราคาค่าเช่า")
        .min(1, "กรุณากรอกค่าที่มากกว่า 0"),
      stockStatus: Yup.string().required("กรุณาเลือกสถานะอุปกรณ์"),
      QTY: Yup.number().required("กรุณาใส่จำนวน"),
    }),
  });

  const handleFormSubmit = (value: Store, { resetForm, validateForm }: any) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    console.log(value);
    if (StoreEdit) {
      handleUpdateStore(value);
    } else {
      handleCreateStore(value);
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateStore = async (Store: Store) => {
    setOpenBackdrop(true);
    const result = await storeService.updateStore(Store);
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

  const handleCreateStore = async (Store: Store) => {
    setOpenBackdrop(true);
    const result = await storeService.createStore(Store);
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
    // const result = await categoryStore.getSelectCategory();
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

  const getDataStore = () => {
    const StoreId = params.get("StoreId");
    axios
      .get(`/api/Store?StoreId=${StoreId}`)
      .then(({ data }) => {
        // const modifiedData: Store = {
        //   ...data,
        //   aboutStore: {
        //     ...data.aboutStore,
        //     purchaseDate: dayjs(data.aboutStore.purchaseDate),
        //   },
        // };
        // setStores(modifiedData);
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
  //     .get(`/api/Store/type?getbycharacter=true`)
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
  //     Store.aboutStore?.stockStatus ===
  //       StoreStatus.CurrentlyRenting ||
  //     Store.aboutStore?.stockStatus === StoreStatus.InActive ||
  //     Store.aboutStore?.stockStatus === StoreStatus.Damaged
  //   ) {
  //     setDisabledForm(true);
  //   }
  // }, [Store]);

  useEffect(() => {
    setIsLoading(true);

    if (pathname.includes("new")) {
      setStoreForm(initialStore);
      setStoreEdit(false);
      setDisabledForm(false);
    } else {
      setStoreEdit(true);
      getDataStore();
    }

    // getTypeData();
    handleGetSelectCategory();

    return () => {
      setStoreForm(initialStore);
      setStoreEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Formik<Store>
        initialValues={initialStore} // ใช้ state เป็น initialValues
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
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="เเจ้งเตือนเมื่อได้รับการจองใหม่ (ถ้ามี)"
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
                        label="เเจ้งเตือนลูกค้าเมื่อจองสำเร็จ (ถ้ามี)"
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
                        label="ข้อความเเจ้งเตือนลูกค้าเมื่อถูกยกเลิกการจอง (ถ้ามี)"
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
                        label="ข้อความเเจ้งเตือนลูกค้าเมื่อใกล้ถึงเวลานัด 24 ชั่วโมง (ถ้ามี)"
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
                        label="ข้อความเเจ้งเตือนลูกค้าเมื่อถูกเลื่อนการจอง (ถ้ามี)"
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

export default StoreForm;
