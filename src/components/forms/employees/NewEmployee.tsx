import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Grid2, TextField, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
import { useCategoryContext } from "@/contexts/CategoryContext";
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

interface EmployeeProps {
  viewOnly?: boolean;
}

const EmployeeForm: FC<EmployeeProps> = ({ viewOnly = false }) => {
  const { setEmployeeForm, employeeEdit, setEmployeeEdit, setEmployees, employees } =
    useEmployeeContext();
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
    EmployeeName: Yup.string().required("กรุณากรอกชื่ออุปกรณ์"),
    aboutEmployee: Yup.object().shape({
      rentalPriceCurrent: Yup.number()
        .required("กรุณากรอกราคาค่าเช่า")
        .min(1, "กรุณากรอกค่าที่มากกว่า 0"),
      stockStatus: Yup.string().required("กรุณาเลือกสถานะอุปกรณ์"),
      QTY: Yup.number().required("กรุณาใส่จำนวน"),
    }),
  });

  const handleFormSubmit = (
    value: Employee,
    { resetForm, validateForm }: any
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    console.log(value);
    if (employeeEdit) {
      handleUpdateEmployee(value);
    } else {
      handleCreateEmployee(value);
    }
    resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const handleUpdateEmployee = async (Employee: Employee) => {
    setOpenBackdrop(true);
    const result = await employeeService.updateEmployee(Employee);
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

  const handleCreateEmployee = async (Employee: Employee) => {
    setOpenBackdrop(true);
    const result = await employeeService.createEmployee(Employee);
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
    // const result = await categoryService.getSelectCategory();
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

  const getDataEmployee = () => {
    const EmployeeId = params.get("EmployeeId");
    axios
      .get(`/api/Employee?EmployeeId=${EmployeeId}`)
      .then(({ data }) => {
        // const modifiedData: Employee = {
        //   ...data,
        //   aboutEmployee: {
        //     ...data.aboutEmployee,
        //     purchaseDate: dayjs(data.aboutEmployee.purchaseDate),
        //   },
        // };

        // setEmployees(modifiedData);
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
  //     .get(`/api/Employee/type?getbycharacter=true`)
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
  //     Employee.aboutEmployee?.stockStatus ===
  //       EmployeeStatus.CurrentlyRenting ||
  //     Employee.aboutEmployee?.stockStatus === EmployeeStatus.InActive ||
  //     Employee.aboutEmployee?.stockStatus === EmployeeStatus.Damaged
  //   ) {
  //     setDisabledForm(true);
  //   }
  // }, [Employee]);

  useEffect(() => {
    setIsLoading(true);

    if (pathname.includes("new")) {
      setEmployeeForm(initialEmployee);
      setEmployeeEdit(false);
      setDisabledForm(false);
    } else {
      setEmployeeEdit(true);
      getDataEmployee();
    }

    // getTypeData();
    handleGetSelectCategory();

    return () => {
      setEmployeeForm(initialEmployee);
      setEmployeeEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Formik<Employee>
        initialValues={initialEmployee} // ใช้ state เป็น initialValues
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
                        <Plus size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        เพิ่มพนักงาน
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
                        error={
                          touched.name && Boolean(errors.name)
                        }
                        helperText={
                          touched.name && errors.name
                        }
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
                          setFieldValue(
                            "role",
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
                  เพิ่มพนักงาน
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
