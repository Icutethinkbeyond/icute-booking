import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
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
import StatusEmployee from "@/components/shared/used/Status";
import dayjs from "dayjs";
import { Bath, MonitorCog, Plus, Save } from "lucide-react";
import { AutoFixHigh, Category, Handyman, More } from "@mui/icons-material";
import { IconCurrencyBaht } from "@tabler/icons-react";
import { employeeService } from "@/utils/services/api-services/EmployeeAPI";
import { useEmployeeContext } from "@/contexts/EmployeeContext";
import { Employee, initialEmployee } from "@/interfaces/Store";
import { useSession } from "next-auth/react";

interface EmployeeProps {
  viewOnly?: boolean;
}

const EmployeeForm: FC<EmployeeProps> = ({ viewOnly = false }) => {
  const {
    setEmployeeForm,
    employeeEdit,
    setEmployeeEdit,
    setEmployees,
    employees,
    employeeForm,
  } = useEmployeeContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();
  const { data: session } = useSession();

  const validationSchema = Yup.object().shape({
    role: Yup.string().required("กรุณากรอกตำเเหน่ง"),
    name: Yup.string().required("กรุณากรอกชื่อพนักงาน"),
  });

  const handleFormSubmit = async (
    values: Employee,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<Employee> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // 2. เรียกใช้ API
    let result;

    if (!employeeEdit) {
      result = await employeeService.createEmployee(values);
    } else {
      result = await employeeService.updateEmployee(values);
    }

    // สำเร็จจะ redirect ไปที่ table
    if (result.success) {
      resetForm();

      setNotify({
        open: true,
        message: result.message,
        color: result.success ? "success" : "error",
      });

      setTimeout(() => {
        router.push(`/${localActive}/protected/employees`);
      }, 1000);
    } else {
      // // // 3. จัดการเมื่อสำเร็จ
      setNotify({
        open: true,
        message: result.message,
        color: "error",
      });
    }
  };

  const getEmployee = async () => {
    const employeeId = params.get("employeeId");

    if (employeeId) {
      let result = await employeeService.getEmployee(employeeId);

      if (result.success) {
        setEmployeeForm(result.data);
      } else {
        setNotify({
          open: true,
          message: result.message,
          color: result.success ? "success" : "error",
        });
      }
    } else {
      setNotify({
        open: true,
        message: "ไม่พบ Id",
        color: "error",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);

    if (pathname.includes("new")) {
      setEmployeeForm(initialEmployee);
      setEmployeeEdit(false);
      setDisabledForm(false);
    } else {
      getEmployee();
      setEmployeeEdit(true);
    }

    return () => {
      setEmployeeForm(initialEmployee);
      setEmployeeEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Formik<Employee>
        initialValues={employeeForm} // ใช้ state เป็น initialValues
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
              <Grid2 container spacing={3} size={{ xs: 12 }}>
                <Grid2 size={{ xs: 12 }}>
                  <Grid2 size={{ xs: 12 }} mb={2}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <Plus size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                         {employeeEdit ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Grid2>

                {/* Employee Name */}
                <Grid2 size={{ xs: 6 }}>
                  <Field name="name">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="name"
                        label="ชื่อช่าง (จำเป็น)"
                        value={values.name}
                        onChange={(e) => {
                          setFieldValue("name", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Field name="role">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        name="role"
                        label="ตำเเหน่ง (จำเป็น)"
                        // sx={{ textTransform: "uppercase" }}
                        value={values.role ? values.role : ""}
                        onChange={(e) => {
                          setFieldValue("role", e.target.value);
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: viewOnly ? true : false,
                          },
                        }}
                        placeholder=""
                        error={touched.role && Boolean(errors.role)}
                        helperText={touched.role && errors.role}
                        fullWidth
                        disabled={openBackdrop || isSubmitting || disabledForm}
                      />
                    )}
                  </Field>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  {/* <FormControl sx={{ m: 1, width: 300 }}>
                          <InputLabel id="demo-multiple-chip-label">Chip</InputLabel>
                          <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            multiple
                            value={personName}
                            onChange={handleChange}
                            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} />
                                ))}
                              </Box>
                            )}
                            MenuProps={MenuProps}
                          >
                            {names.map((name) => (
                              <MenuItem
                                key={name}
                                value={name}
                                style={getStyles(name, personName, theme)}
                              >
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl> */}
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
                  {employeeEdit ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}
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

export default EmployeeForm;
