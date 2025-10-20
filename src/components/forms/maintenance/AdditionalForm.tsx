import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  Button,
  Avatar,
} from "@mui/material";
import { Field, FieldProps, Form, Formik, useFormikContext } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRentalContext } from "@/contexts/RentalContext";
import { LoadingButton } from "@mui/lab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { DocumentCategory, EquipmentStatus, PartStatus } from "@prisma/client";
import {  PlusCircle } from "lucide-react";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import {
  Additional,
  initialAdditional,
} from "@/interfaces/Maintenance";
import AdditionalTable from "./tables/AdditionalTable";
import { PriceChange } from "@mui/icons-material";
import { uniqueId } from "lodash";

interface AdditionalFormProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const AdditionalForm: React.FC<AdditionalFormProps> = ({
  viewOnly = false,
  handleBack,
  handleNext,
  documentCategory,
}) => {
  const {
    setAdditionalForm,
    additionalForm,
    setAdditionalState,
    additionalState,
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
    additionalName: Yup.string().required("โปรดกำหนดชื่อบริการ"),
  });

  const handleFormSubmit = (
    value: Additional,
    { resetForm, validateForm }: any
  ) => {
    let maintenanceId = params.get("maintenanceId");
    if (!maintenanceId) {
      return;
    }

    value = {
      ...value,
      additionalTempId: uniqueId(),
    };
    // console.log(value);
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setAdditionalState((prevParts) => [...prevParts, value]);
    setAdditionalForm(initialAdditional);
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const updateAddtional = () => {
    let maintenanceId = params.get("maintenanceId");
    setLoading(true);
    setOpenBackdrop(true)
    axios
      .post(
        `/api/maintenance/additional?maintenanceId=${maintenanceId}`,
        additionalState
      )
      .then(({ data }) => {

        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        setLoading(false);

        handleNext && handleNext();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setNotify({
          ...notify,
          open: true,
          message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
          color: "error",
        });
      })
      .finally(() => {
        setOpenBackdrop(false)
      });
  };

  useEffect(() => {
    return () => {
      setAdditionalState([]);
    };
  }, []);

  return (
    <>
      <Formik<Additional>
        initialValues={additionalForm} // ใช้ state เป็น initialValues
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
                    <PriceChange />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    กำหนดบริการและค่าใช้จ่ายเพิ่มเติม
                  </Typography>
                </Grid2>
              </Grid2>
              <Grid2 size={6} container spacing={3} mt={5}>
                <Grid2 size={6}>
                  <Field name="additionalName">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="additionalName"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="ชื่อสินค้า/บริการ (จำเป็น)"
                        value={
                          values.additionalName ? values.additionalName : ""
                        }
                        onChange={(e) => {
                          setFieldValue("additionalName", e.target.value);
                        }}
                        error={
                          touched.additionalName &&
                          Boolean(errors.additionalName)
                        }
                        disabled={isSubmitting || loading}
                        helperText={
                          touched.additionalName && errors.additionalName
                        }
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="additionalPrice">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="additionalPrice"
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        label="ราคา (ถ้ามี)"
                        value={
                          values.additionalPrice ? values.additionalPrice : ""
                        }
                        type="number"
                        onChange={(e) => {
                          setFieldValue(
                            "additionalPrice",
                            parseFloat(e.target.value)
                          );
                        }}
                        error={
                          touched.additionalPrice &&
                          Boolean(errors.additionalPrice)
                        }
                        disabled={isSubmitting || loading}
                        helperText={
                          touched.additionalPrice && errors.additionalPrice
                        }
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="additionalDesc">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="additionalDesc"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        multiline
                        rows={2}
                        label="รายละเอียด (ถ้ามี)"
                        value={
                          values.additionalDesc ? values.additionalDesc : ""
                        }
                        onChange={(e) => {
                          setFieldValue("additionalDesc", e.target.value);
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
      <AdditionalTable />
      <Grid2 container justifyContent={"center"} mt={2}>
        <LoadingButton
          variant="contained"
          type="submit"
          color="primary"
          sx={{ mr: 1 }}
          loading={loading}
          startIcon={<PriceChange />}
          onClick={() => updateAddtional()}
        >
          เเก้ไขบริการและค่าใช้จ่ายเพิ่มเติม
        </LoadingButton>
      </Grid2>
    </>
  );
};

export default AdditionalForm;
