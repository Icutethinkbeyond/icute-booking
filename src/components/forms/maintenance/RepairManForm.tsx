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
import { Field, FieldProps, Form, Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { LoadingButton } from "@mui/lab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { DocumentCategory } from "@prisma/client";
import ListRepairManTable from "./tables/ListRepairManTable";
import { Engineering } from "@mui/icons-material";
import { initialRepairman, Repairman } from "@/interfaces/Maintenance";
import { useMaintenanceContext } from "@/contexts/MaintenanceContext";
import { EngineerSelect } from "@/interfaces/User";

interface RepairManProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const RepairManForm: React.FC<RepairManProps> = ({
  viewOnly = false,
  handleBack,
  handleNext,
  documentCategory,
}) => {

  const {
    repairmanState,
    setRepairmanState,
    setRepairmanStateSelect,
    repairmanStateSelect,
    setRepairmanForm,
    repairmanForm,
    addRepairMan,
  } = useMaintenanceContext();

  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

    const { setNotify, setOpenBackdrop, notify, openBackdrop } =
    useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    userId: Yup.string().required("โปรดเลือกผู้ซ่อมแซม"),
    manHours: Yup.number().required("โปรดกำหนดชั่วโมงการทำงาน")
  });

  const handleFormSubmit = (
    value: Repairman,
    { resetForm, validateForm }: any
  ) => {
    
    let maintenanceId = params.get("maintenanceId");

    if (!maintenanceId) {
      return;
    }

    value = { ...value, maintenanceId: maintenanceId };
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    addRepairMan(value);
    setRepairmanForm(initialRepairman);
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const getEngineer = () => {
    axios
      .get(`/api/user/engineer`)
      .then(({ data }) => {
        console.log(data);
        setRepairmanStateSelect(data.data);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {
        console.info("done");
      });
  };

  const recordEngineerInDocument = () => {
    let maintenanceId = params.get("maintenanceId");
    setLoading(true);
    setOpenBackdrop(true)
    axios
      .post(`/api/user/engineer?maintenanceId=${maintenanceId}`, repairmanState)
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
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
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
    getEngineer();
    return () => {
      setIsLoading(false);
      setRepairmanForm(initialRepairman);
      setRepairmanState([]);
    };
  }, []);

  return (
    <>
      <Formik<Repairman>
        initialValues={repairmanForm} // ใช้ state เป็น initialValues
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
                    <Engineering />
                  </Avatar>
                  <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                    กำหนดผู้ซ่อมแซม
                  </Typography>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2} mt={3}>
                <Grid2 size={6}>
                  <Field name="userId">
                    {({ field }: FieldProps) => (
                      <Autocomplete
                        id="userId"
                        options={repairmanStateSelect}
                        getOptionLabel={(option: EngineerSelect) =>
                          `${option.name}`
                        }
                        loading
                        value={
                          repairmanStateSelect.find(
                            (option) => option.userId === values.userId
                          ) || null
                        }
                        onChange={(event, value) => {
                          console.log(value)
                          setFieldValue(
                            "userId",
                            value !== null ? value.userId : ""
                          );
                          setFieldValue(
                            "user.name",
                            value !== null ? value.name : ""
                          );
                          setFieldValue(
                            "manHours",
                            value !== null ? value.manHour : ""
                          );
                          // getEquipment(value !== null ? value.repairmanId : "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="ผู้ซ่อมแซม (จำเป็น)"
                            name="userId"
                            error={touched.userId && Boolean(errors.userId)}
                            helperText={touched.userId && errors.userId}
                          />
                        )}
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="manHours">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="manHours"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        type="number"
                        error={touched.manHours && Boolean(errors.manHours)}
                        disabled={isSubmitting || loading}
                        helperText={touched.manHours && errors.manHours}
                        label="ค่าใช้จ่ายต่อชั่วโมง (จำเป็น)"
                        value={values.manHours ? values.manHours : ""}
                        onChange={(e) => {
                          setFieldValue("manHours", parseInt(e.target.value));
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="cost">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="cost"
                        type="number"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.cost && Boolean(errors.cost)}
                        disabled={isSubmitting || loading}
                        helperText={touched.cost && errors.cost}
                        label="เวลาทำงาน (ชั่วโมง)"
                        value={values.cost ? values.cost : ""}
                        onChange={(e) => {
                          setFieldValue("cost", parseInt(e.target.value));
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                                <Grid2 size={6}>
                  <Field name="cost">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="cost"
                        type="number"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.cost && Boolean(errors.cost)}
                        disabled={isSubmitting || loading}
                        helperText={touched.cost && errors.cost}
                        label="ค่าใช้จ่ายทั้งหมด"
                        value={values.cost ? values.cost : ""}
                        onChange={(e) => {
                          setFieldValue("cost", parseInt(e.target.value));
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                                <Grid2 size={6}>
                  <Field name="cost">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="cost"
                        type="number"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.cost && Boolean(errors.cost)}
                        disabled={isSubmitting || loading}
                        helperText={touched.cost && errors.cost}
                        label="ค่าใช้จ่ายเพิ่มเติม (ถ้ามี)"
                        value={values.cost ? values.cost : ""}
                        onChange={(e) => {
                          setFieldValue("cost", parseInt(e.target.value));
                        }}
                        fullWidth
                      />
                    )}
                  </Field>
                </Grid2>
                <Grid2 size={6}>
                  <Field name="activities">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="activities"
                        // disabled={disableRenting}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        multiline
                        rows={2}
                        label="หน้าที่ (ถ้ามี)"
                        value={values.activities ? values.activities : ""}
                        onChange={(e) => {
                          setFieldValue("activities", e.target.value);
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
                <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }}>
                  ย้อนกลับ
                </Button>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  loading={isLoading}
                  startIcon={<Engineering />}
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
      <ListRepairManTable />
      <Grid2 container justifyContent={"center"} mt={2}>
        <LoadingButton
          variant="contained"
          type="submit"
          color="primary"
          sx={{ mr: 1 }}
          loading={isLoading}
          startIcon={<Engineering />}
          onClick={() => recordEngineerInDocument()}
        >
          {pathname.includes("new") ? "เพิ่มผู้ซ่อมเเซม" : "แก้ไขผู้ซ่อมเเซม"}
        </LoadingButton>
      </Grid2>
    </>
  );
};

export default RepairManForm;
