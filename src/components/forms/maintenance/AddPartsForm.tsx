import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Autocomplete,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Field, FieldProps, Form, Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { LoadingButton } from "@mui/lab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { DocumentCategory, PartStatus } from "@prisma/client";
import {
  Cog,
  CogIcon,
  PlusCircle,
  SquareMousePointer,
} from "lucide-react";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import ListPartTable from "./tables/ListPartTable";
import {
  BrokenItemsSelect,
  initialPart,
  Part,
} from "@/interfaces/Maintenance";
import { uniqueId } from "lodash";

interface AddPartsProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const AddPartsForm: React.FC<AddPartsProps> = ({
  viewOnly = false,
  handleBack,
  handleNext,
  documentCategory,
}) => {
  const {
    setBrokenItemsSelect,
    brokenItemsSelect,
    partsState,
    partForm,
    brokenItemsState,
    setPartForm,
    setBrokenItemsState,
    makePartFakeData,
    addPartToBrokenItem,
  } = useMaintenanceContext();

  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

  const [disableRenting, setDisableRenting] = useState(true);
    const { setNotify, setOpenBackdrop, notify, openBackdrop } =
    useNotifyContext();
  const [loading, setLoading] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    brokenItemsId: Yup.string().required("โปรดเลือกอุปกรณ์"),
    partName: Yup.string().required("โปรดกำหนดชื่ออะไหล่"),
    partPrice: Yup.number().required("กรุณากรอกราคาอะไหล่").min(0),
    quantity: Yup.number().required("กรุณากรอกจำนวนอะไหล่").min(1),
  });

  const handleFormSubmit = (value: Part, { resetForm, validateForm }: any) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    // console.log(value);
    value = {
      ...value,
      partIdTemp: uniqueId(),
    };
    addPartToBrokenItem(value.brokenItemsId, value);
    setPartForm(initialPart);
    resetForm(); // รีเซ็ตค่าฟอร์ม
    setPartForm(initialPart)
  };


  const updatePart = () => {
    setLoading(true);
    setOpenBackdrop(true)
    axios
      .post("/api/maintenance/part", brokenItemsState)
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        

        handleNext && handleNext();
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          setLoading(false);
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
            color: "error",
          });
        }
      })
      .finally(() => {
        setOpenBackdrop(false)
      });
  };

  useEffect(() => {
    // let maintenanceId = params.get("maintenanceId");
    // getBrokenItems(maintenanceId);
    return () => {
      setBrokenItemsSelect([]);
    };
  }, []);

  return (
    <>
      <Formik<Part>
        initialValues={partForm} // ใช้ state เป็น initialValues
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({ errors, touched, setFieldValue, values, isSubmitting }) => (
          <Form>
            <Box p={3} border="1px solid #ccc" borderRadius="8px">
              <Grid2 size={{ xs: 12 }} mb={2}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <SquareMousePointer size={20} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    เลือกอุปกรณ์จากคลัง
                  </Typography>
                </Grid2>
              </Grid2>
              <Grid2 size={12} container mb={4}>
                <Field name="brokenItemsId">
                  {({ field }: FieldProps) => (
                    <Autocomplete
                      id="brokenItemsId"
                      options={brokenItemsSelect}
                      getOptionLabel={(option: BrokenItemsSelect) =>
                        option.brokenItemName
                      }
                      loading
                      value={
                        brokenItemsSelect.find(
                          (option) =>
                            option.brokenItemId === values.brokenItemsId
                        ) || null
                      }
                      fullWidth
                      onChange={(event, value) => {
                        setFieldValue(
                          "brokenItemsId",
                          value !== null ? value.brokenItemId : ""
                        );
                      }}
                      disabled={isSubmitting || loading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="อุปกรณ์ที่เสียหาย (จำเป็น)"
                          name="brokenItemsId"
                          error={
                            touched.brokenItemsId &&
                            Boolean(errors.brokenItemsId)
                          }
                          disabled={isSubmitting || loading}
                          helperText={
                            touched.brokenItemsId && errors.brokenItemsId
                          }
                        />
                      )}
                    />
                  )}
                </Field>
              </Grid2>
              <Grid2 size={{ xs: 12 }} mb={2}>
                <Grid2 container alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Cog size={20} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    กำหนดอะไหล่สำหรับการซ่อม
                  </Typography>
                </Grid2>
              </Grid2>
              <Grid2 size={6} container spacing={3} mt={5}>
                <Grid2 size={6}>
                  <Field name="partName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="partName"
                        error={touched.partName && Boolean(errors.partName)}
                        disabled={isSubmitting || loading}
                        helperText={touched.partName && errors.partName}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="ชื่ออะไหล่ (จำเป็น)"
                        value={values.partName ? values.partName : ""}
                        onChange={(e) => {
                          setFieldValue("partName", e.target.value);
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="quantity">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="quantity"
                        type="number"
                        error={touched.quantity && Boolean(errors.quantity)}
                        disabled={isSubmitting || loading}
                        helperText={touched.quantity && errors.quantity}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                          setFieldValue("quantity", parseFloat(newValue) || ""); // ป้องกัน NaN
                        }}
                        label="จำนวน (จำเป็น)"
                        value={values.quantity ? values.quantity : ""}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="partPrice">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="partPrice"
                        error={touched.partPrice && Boolean(errors.partPrice)}
                        disabled={isSubmitting || loading}
                        defaultValue={0}
                        helperText={touched.partPrice && errors.partPrice}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        type="number"
                        label="ราคา (จำเป็น)"
                        value={values.partPrice ? values.partPrice : ""}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
                          setFieldValue("partPrice", newValue || 0); // ป้องกัน NaN
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={{ xs: 6 }}>
                  {/* Select สำหรับ stockStatus */}
                  <FormControl
                    fullWidth
                    error={touched.partStatus && Boolean(errors.partStatus)}
                    // style={{ marginBottom: "20px" }}
                    // disabled={disabledForm}
                  >
                    <InputLabel id="partStatus-label">สถานะอะไหล่</InputLabel>
                    <Field name="partStatus">
                      {({ field }: any) => (
                        <Select
                          {...field}
                          label="สถานะอะไหล่ (จำเป็น)"
                          labelId="partStatus-label"
                          value={values.partStatus}
                          slotProps={{
                            inputLabel: { shrink: true },
                            input: {
                              readOnly: viewOnly ? true : false,
                            },
                          }}
                          onChange={(event) => {
                            // console.log(event.target);
                            const value = event.target.value as PartStatus;
                            setFieldValue("partStatus", value);
                          }}
                        >
                          {Object.values(PartStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </Field>
                    {touched.partStatus && errors.partStatus && (
                      <FormHelperText>{errors.partStatus}</FormHelperText>
                    )}
                  </FormControl>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="partSerialNo">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="partSerialNo"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="Serial Number (ถ้ามี)"
                        value={values.partSerialNo ? values.partSerialNo : ""}
                        onChange={(e) => {
                          setFieldValue("partSerialNo", e.target.value);
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="unitName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="unitName"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="หน่วยเรียก (ถ้ามี)"
                        value={values.unitName ? values.unitName : ""}
                        onChange={(e) => {
                          setFieldValue("unitName", e.target.value);
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="brand">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="brand"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="แบรนด์ (ถ้ามี)"
                        value={values.brand ? values.brand : ""}
                        onChange={(e) => {
                          setFieldValue("brand", e.target.value);
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="partDesc">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="partDesc"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="รายละเอียด (ถ้ามี)"
                        value={values.partDesc ? values.partDesc : ""}
                        onChange={(e) => {
                          setFieldValue("partDesc", e.target.value);
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
              </Grid2>
              <Grid2
                spacing={1}
                container
                size={12}
                justifyContent="flex-end"
                alignItems="flex-end"
                mt={4}
              >
                {/* <Button
                  variant="outlined"
                  onClick={makePartFakeData}
                  sx={{ mr: 1 }}
                >
                  สร้างแบบรวดเร็ว
                </Button> */}
                <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }}>
                  ย้อนกลับ
                </Button>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  loading={loading}
                  startIcon={<PlusCircle size={20} />}
                >
                  {/* {!documentEdit ? "เพิ่มเอกสาร" : "แก้ไขเอกสาร"} */}
                  เพิ่มลงในรายการ
                </LoadingButton>
              </Grid2>
              {/* </Grid2> */}
            </Box>
          </Form>
        )}
      </Formik>
      <Box mt={2} />
      <ListPartTable />
      <Grid2 container justifyContent={"center"} mt={2}>
        <LoadingButton
          variant="contained"
          type="submit"
          color="primary"
          sx={{ mr: 1 }}
          loading={loading}
          startIcon={<CogIcon />}
          onClick={() => updatePart()}
        >
          {pathname.includes("new") ? "เพิ่มอะไหล่" : "แก้ไขอะไหล่"}
        </LoadingButton>
      </Grid2>
    </>
  );
};

export default AddPartsForm;
