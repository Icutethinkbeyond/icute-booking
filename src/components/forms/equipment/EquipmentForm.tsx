import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Equipment, initialEquipment } from "@/interfaces/Equipment"; // ประเภทข้อมูล Equipment
import { CategorySelect, TypeSelect } from "@/interfaces/Category_Type"; // ประเภทข้อมูล Category
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import Autocomplete from "@mui/material/Autocomplete";

import { LoadingButton } from "@mui/lab";
import { useEquipmentContext } from "@/contexts/EquipmentContext"; // context สำหรับ equipment
import { useCategoryContext } from "@/contexts/CategoryContext";
import { EquipmentStatus } from "@prisma/client";
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
import StatusEquipment from "@/components/shared/used/Status";
import dayjs from "dayjs";
import { Bath, MonitorCog } from "lucide-react";
import { AutoFixHigh, Category, Handyman, More } from "@mui/icons-material";
import { IconCurrencyBaht } from "@tabler/icons-react";
import { categoryService } from "@/utils/services/api-services/CategoryApi";
import { uniqueId } from "lodash";
import { equipmentService } from "@/utils/services/api-services/EquipmentApi";

interface EquipmentProps {
  viewOnly?: boolean;
}

const EquipmentForm: FC<EquipmentProps> = ({ viewOnly = false }) => {
  const { equipment, equipmentEdit, setEquipment, setEquipmentEdit } =
    useEquipmentContext();
  const { categorySelectState, typeSelectState, setCategorySelectState } =
    useCategoryContext();
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
    equipmentName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"),
    aboutEquipment: Yup.object().shape({
      rentalPriceCurrent: Yup.number()
        .required("กรุณากรอกราคาค่าเช่า")
        .min(1, "กรุณากรอกค่าที่มากกว่า 0"),
      stockStatus: Yup.string().required("กรุณาเลือกสถานะอุปกรณ์"),
      QTY: Yup.number().required("กรุณาใส่จำนวน"),
    }),
  });

  const handleFormSubmit = (
    value: Equipment,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    console.log(value);
    if (equipmentEdit) {
      handleUpdateEquipment(value);
    } else {
      handleCreateEquipment(value);
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateEquipment = async (equipment: Equipment) => {
    setOpenBackdrop(true);
    const result = await equipmentService.updateEquipment(equipment);
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

  const handleCreateEquipment = async (equipment: Equipment) => {
    setOpenBackdrop(true);
    const result = await equipmentService.createEquipment(equipment);
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

  const getDataEquipment = () => {
    const equipmentId = params.get("equipmentId");
    axios
      .get(`/api/equipment?equipmentId=${equipmentId}`)
      .then(({ data }) => {
        const modifiedData: Equipment = {
          ...data,
          aboutEquipment: {
            ...data.aboutEquipment,
            purchaseDate: dayjs(data.aboutEquipment.purchaseDate),
          },
        };

        setEquipment(modifiedData);
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
  //     .get(`/api/equipment/type?getbycharacter=true`)
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

  useEffect(() => {
    if (
      equipment.aboutEquipment?.stockStatus ===
        EquipmentStatus.CurrentlyRenting ||
      equipment.aboutEquipment?.stockStatus === EquipmentStatus.InActive ||
      equipment.aboutEquipment?.stockStatus === EquipmentStatus.Damaged
    ) {
      setDisabledForm(true);
    }
  }, [equipment]);

  useEffect(() => {
    setIsLoading(true);

    if (pathname.includes("new")) {
      setEquipment(initialEquipment);
      setEquipmentEdit(false);
      setDisabledForm(false);
    } else {
      setEquipmentEdit(true);
      getDataEquipment();
    }

    // getTypeData();
    handleGetSelectCategory();

    return () => {
      setEquipment(initialEquipment);
      setEquipmentEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Formik<Equipment>
        initialValues={equipment} // ใช้ state เป็น initialValues
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
                        <MonitorCog size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        รายละเอียดอุปกรณ์
                      </Typography>
                    </Grid2>
                  </Grid2>
                  {equipment.aboutEquipment?.stockStatus !==
                    EquipmentStatus.InStock && (
                    <StatusEquipment
                      status={equipment.aboutEquipment?.stockStatus}
                      message='อุปกรณ์อยู่ระหว่างใช้งาน "ไม่สามารถแก้ไข" หรือ "ยกเลิกใช้งานได้"'
                    />
                  )}
                </Grid2>

                {/* Equipment ID */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="serialNo">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="serialNo"
                        label="รหัสอุปกรณ์ (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.serialNo ? values.serialNo : ""}
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
                        error={touched.serialNo && Boolean(errors.serialNo)}
                        helperText={touched.serialNo && errors.serialNo}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Equipment Name */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="equipmentName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="equipmentName"
                        label="ชื่ออุปกรณ์ (จำเป็น)"
                        value={values.equipmentName}
                        onChange={(e) => {
                          setFieldValue("equipmentName", e.target.value);
                        }}
                        placeholder="EXAMPLE: Crane Tower"
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.equipmentName && Boolean(errors.equipmentName)
                        }
                        helperText={
                          touched.equipmentName && errors.equipmentName
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="model">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="model"
                        label="Model"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.model ? values.model : ""}
                        onChange={(e) => {
                          setFieldValue(
                            "model",
                            e.target.value
                          );
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        placeholder=""
                        error={touched.model && Boolean(errors.model)}
                        helperText={touched.model && errors.model}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Rental Price */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="aboutEquipment.rentalPriceCurrent">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        name="aboutEquipment.rentalPriceCurrent"
                        // placeholder="EXAMPLE: 999999999"
                        label="ราคาเช่าปัจจุบัน/เดือน (จำเป็น)"
                        value={values.aboutEquipment?.rentalPriceCurrent ?? ""}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                            endAdornment: <IconCurrencyBaht />,
                          },
                        }}
                        type="number"
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                          setFieldValue(
                            "aboutEquipment.rentalPriceCurrent",
                            newValue || ""
                          ); // ป้องกัน NaN
                        }}
                        error={
                          touched.aboutEquipment?.rentalPriceCurrent &&
                          Boolean(errors.aboutEquipment?.rentalPriceCurrent)
                        }
                        helperText={
                          touched.aboutEquipment?.rentalPriceCurrent &&
                          errors.aboutEquipment?.rentalPriceCurrent
                        }
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="aboutEquipment.equipmentPrice">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        name="aboutEquipment.equipmentPrice"
                        label="ราคาอุปกรณ์ (ถ้ามี)"
                        // placeholder="EXAMPLE: 9999999"
                        value={values.aboutEquipment?.equipmentPrice ?? ""}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                            endAdornment: <IconCurrencyBaht />,
                          },
                        }}
                        type="number"
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                          setFieldValue(
                            "aboutEquipment.equipmentPrice",
                            newValue || ""
                          ); // ป้องกัน NaN
                        }}
                        error={
                          touched.aboutEquipment?.equipmentPrice &&
                          Boolean(errors.aboutEquipment?.equipmentPrice)
                        }
                        helperText={
                          touched.aboutEquipment?.equipmentPrice &&
                          errors.aboutEquipment?.equipmentPrice
                        }
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="aboutEquipment.QTY">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="aboutEquipment.QTY"
                        label="จำนวน (จำเป็น)"
                        value={values.aboutEquipment?.QTY ? values.aboutEquipment?.QTY : ""}
                        onChange={(e) => {
                          // setFieldValue("aboutEquipment.QTY", e.target.value);
                          const newValue = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                          setFieldValue(
                            "aboutEquipment.QTY",
                            newValue || ""
                          ); // ป้องกัน NaN
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={
                          touched.aboutEquipment?.QTY &&
                          Boolean(errors.aboutEquipment?.QTY)
                        }
                        helperText={
                          touched.aboutEquipment?.QTY &&
                          errors.aboutEquipment?.QTY
                        }
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="purchaseDate">
                    {({ field }: FieldProps) => (
                      <DatePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="วันที่ซื้ออุปกรณ์ (ถ้ามี)"
                        name="purchaseDate"
                        sx={{ minWidth: "100%" }}
                        value={
                          values.aboutEquipment?.purchaseDate !== undefined
                            ? dayjs(values.aboutEquipment.purchaseDate)
                            : null
                        }
                        onChange={(newValue) => {
                          setFieldValue(
                            "aboutEquipment.purchaseDate",
                            newValue
                          );
                        }}
                        slotProps={
                          {
                            // textField: {
                            //   helperText: "DD/MM/YYYY",
                            // },
                          }
                        }
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="registerDate">
                    {({ field }: FieldProps) => (
                      <DatePicker
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        label="วันที่ลงทะเบียน (ถ้ามี)"
                        name="registerDate"
                        sx={{ minWidth: "100%" }}
                        value={
                          values.aboutEquipment?.registerDate !== undefined
                            ? dayjs(values.aboutEquipment.registerDate)
                            : null
                        }
                        onChange={(newValue) => {
                          setFieldValue(
                            "aboutEquipment.registerDate",
                            newValue
                          );
                        }}
                        slotProps={
                          {
                            // textField: {
                            //   helperText: "DD/MM/YYYY",
                            // },
                          }
                        }
                      />
                    )}
                  </Field>
                </Grid2>

                {/* Status */}
                {/* <Grid2 size={{ xs: 6 }}>
                  <FormControl
                    fullWidth
                    error={
                      touched.aboutEquipment?.stockStatus &&
                      Boolean(errors.aboutEquipment?.stockStatus)
                    }
                    disabled={openBackdrop || isSubmitting || disabledForm}
                  >
                    <InputLabel id="stockStatus-label">สถานะอุปกรณ์</InputLabel>
                    <Field name="aboutEquipment.stockStatus">
                      {({ field }: any) => (
                        <Select
                          type="hidden"
                          {...field}
                          label="สถานะอุปกรณ์ (จำเป็น)"
                          labelId="stockStatus-label"
                          value={values.aboutEquipment.stockStatus}
                          onChange={(event) => {
                            console.log(event.target);
                            const value = event.target.value as EquipmentStatus;
                            setFieldValue("aboutEquipment.stockStatus", value);
                          }}
                          slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                              readOnly: viewOnly ? true : false,
                            },
                          }}
                        >
                          {Object.values(EquipmentStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </Field>
                    {touched.aboutEquipment?.stockStatus &&
                      errors.aboutEquipment?.stockStatus && (
                        <FormHelperText>
                          {errors.aboutEquipment?.stockStatus}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Grid2> */}
              </Grid2>

              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12 }} sx={{ mt: 5 }}>
                  <Grid2 size={{ xs: 12 }} mb={2}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <Category />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        กำหนดหมวดหมู่
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>
                {/* Category */}
                <Grid2 size={{ xs: 6 }}>
                  {/* <Field name="categoryId">
                    {({ field }: FieldProps) => (
                      <Autocomplete
                        disabled={disabledForm || isLoading}
                        id="categoryId"
                        placeholder="เลือกหมวดหมู่"
                        value={
                          values.categoryId
                            ? values.category?.categoryName
                            : null
                        }
                        options={categorySelectState}
                        getOptionLabel={(option: CategorySelect | string) =>
                          typeof option === "string"
                            ? option
                            : option.categoryName
                        }
                        loading
                        onChange={(event, value) => {
                          if (typeof value !== "string") {
                            setFieldValue(
                              "categoryId",
                              value !== null ? value.categoryId : ""
                            );
                          }
                        }}
                        readOnly={viewOnly ? true : false}
                        renderInput={(params) => (
                          <TextField
                            value={
                              values.categoryId
                                ? values.category?.categoryName
                                : null
                            }
                            label="หมวดหมู่"
                            name="categoryId"
                            {...params}
                          />
                        )}
                      />
                    )}
                  </Field> */}
                  <Field name="categoryId">
                    {({ field }: FieldProps) => (
                      <Autocomplete
                        disabled={openBackdrop || isSubmitting || disabledForm}
                        id="categoryId"
                        options={categorySelectState}
                        getOptionLabel={(option: CategorySelect) =>
                          option.categoryName
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.categoryId === value.categoryId
                        }
                        value={
                          categorySelectState.find(
                            (cat) => cat.categoryId === values.categoryId
                          ) || null
                        }
                        onChange={(event, value) => {
                          setFieldValue(
                            "categoryId",
                            value ? value.categoryId : ""
                          );
                        }}
                        readOnly={viewOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="หมวดหมู่"
                            name="categoryId"
                          />
                        )}
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
                        เพิ่มเติม
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Equipment Brand */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="brand">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="brand"
                        label="แบรนด์ (ถ้ามี)"
                        value={values.brand ? values.brand : ""}
                        onChange={(e) => {
                          setFieldValue("brand", e.target.value);
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
                  <Field name="aboutEquipment.PO">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="PO"
                        label="PO (ถ้ามี)"
                        value={values.aboutEquipment?.PO ? values.aboutEquipment?.PO : ""}
                        onChange={(e) => {
                          setFieldValue("aboutEquipment.PO", e.target.value);
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
                  <Field name="aboutEquipment.fixAssetsNumber">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="aboutEquipment.fixAssetsNumber"
                        label="fixAssetsNumber (ถ้ามี)"
                        value={values.aboutEquipment?.fixAssetsNumber ? values.aboutEquipment?.fixAssetsNumber : ""}
                        onChange={(e) => {
                          setFieldValue("aboutEquipment.fixAssetsNumber", e.target.value);
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
                  <Field name="aboutEquipment.BTLNumber">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="aboutEquipment.BTLNumber"
                        label="BTLNumber (ถ้ามี)"
                        value={values.aboutEquipment?.BTLNumber ? values.aboutEquipment?.BTLNumber : ""}
                        onChange={(e) => {
                          setFieldValue("aboutEquipment.BTLNumber", e.target.value);
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

                {/* Equipment Description */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="description">
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        name="description"
                        label="รายละเอียดอุปกรณ์ (ถ้ามี)"
                        value={values.description ? values.description : ""}
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

                {/* Type */}
                {/* <Grid2 size={{ xs: 6 }}>
                  <Field name="equipmentTypeId">
                    {({ field }: FieldProps) => (
                      <Autocomplete
                        disabled={disabledForm}
                        id="equipmentTypeId"
                        options={typeSelectState}
                        getOptionLabel={(option: TypeSelect) =>
                          option.equipmentTypeName
                        }
                        loading
                        onChange={(e, value) => {
                          setFieldValue(
                            "equipmentTypeId",
                            value !== null ? value.equipmentTypeId : ""
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            label="ประเภทอุปกรณ์"
                            name="equipmentTypeId"
                            {...params}
                          />
                        )}
                      />
                    )}
                  </Field>
                </Grid2> */}
              </Grid2>
              <Grid2
                sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}
              >
                {/* {equipmentEdit === false ? (
                    <Button
                      variant="outlined"
                      onClick={makeFakeData}
                      sx={{ mr: 1 }}
                      startIcon={<AutoFixHigh />}
                    >
                      สร้างแบบรวดเร็ว
                    </Button>
                  ) : (
                    ""
                  )} */}

                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  disabled={openBackdrop || isSubmitting || disabledForm}
                  loading={openBackdrop || isSubmitting}
                  startIcon={<Handyman />}
                >
                  {!equipmentEdit ? "เพิ่มอุปกรณ์" : "แก้ไขอุปกรณ์"}
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

export default EquipmentForm;
