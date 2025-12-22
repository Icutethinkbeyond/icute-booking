import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
  Button,
  InputAdornment,
  Paper,
  FormControlLabel,
  Switch,
  OutlinedInput,
  Select,
  InputLabel,
  FormControl,
  Chip,
  MenuItem,
  Theme,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import { uniqueId } from "lodash";

import { LoadingButton } from "@mui/lab";
import ConfirmDelete from "@/components/shared/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";
import { useNotifyContext } from "@/contexts/NotifyContext";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import { Bath, MonitorCog, Plus, Save } from "lucide-react";
import { serviceService } from "@/utils/services/api-services/ServiceAPI";
import { useServiceContext } from "@/contexts/ServiceContext";
import { Service, initialService } from "@/interfaces/Store";
import { useSession } from "next-auth/react";
import { useTheme } from "@emotion/react";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import DragDropImage from "@/components/shared/DragDropImage";
import ColorPickerCustom from "@/components/shared/ColorPicker";
import { ColorPicker, useColor } from "react-color-palette";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const names = [
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder",
];

interface ServiceProps {
  viewOnly?: boolean;
}

const ServiceForm: FC<ServiceProps> = ({ viewOnly = false }) => {
  const {
    setServiceForm,
    serviceForm,
    serviceEdit,
    setServiceEdit,
    setServices,
    services,
  } = useServiceContext();
  const theme = baselightTheme;
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const [color, setColor] = useColor("cyan");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const validationSchema = Yup.object().shape({
    // name: Yup.string().required("กรุณากรอกรหัสอุปกรณ์"),
    // durationMinutes: Yup.number().required("กรุณาใส่เวลาของคอร์ส"),
    // price: Yup.number().required("กรุณาใส่ราคาของคอร์ส"),
  });

  const [personName, setPersonName] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleFormSubmit = async (
    values: Service,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<Service> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submitting

    // 2. เรียกใช้ API
    let result;

    if (!serviceEdit) {
      result = await serviceService.createService(values);
    } else {
      result = await serviceService.updateService(values);
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
        router.push(`/${localActive}/protected/admin/services`);
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

  const getService = async () => {
    const serviceId = params.get("serviceId");

    if (serviceId) {
      let result = await serviceService.getService(serviceId);

      if (result.success) {
        setServiceForm(result.data);
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
      setServiceForm(initialService);
      setServiceEdit(false);
      setDisabledForm(false);
    } else {
      getService();
      setServiceEdit(true);
    }

    return () => {
      setServiceForm(initialService);
      setServiceEdit(false);
      setDisabledForm(false);
    };
  }, []);

  return (
    <>
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
          }}
        >
          <Formik<Service>
            initialValues={serviceForm} // ใช้ state เป็น initialValues
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
                <Box>
                  <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <Plus size={20} />
                          </Avatar>
                          <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                            {serviceEdit ? "แก้ไขบริการ" : "เพิ่มบริการ"}
                          </Typography>
                        </Box>
                        <Box>
                          <FormControl
                            fullWidth
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                          >
                            <Field name="active">
                              {({ field, form }: any) => (
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={Boolean(field.value)}
                                      onChange={(e) => {
                                        form.setFieldValue(
                                          field.name,
                                          e.target.checked
                                        );
                                      }}
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Typography
                                      sx={{
                                        color: theme.palette.text.secondary,
                                      }}
                                    >
                                      เปิดใช้งาน
                                    </Typography>
                                  }
                                />
                              )}
                            </Field>
                          </FormControl>
                        </Box>
                      </Box>
                    </Grid2>

                    {/* Service Name */}
                    <Grid2 size={{ xs: 6 }}>
                      <Field name="name">
                        {({ field }: FieldProps) => (
                          <TextField
                            {...field}
                            name="name"
                            label="ชื่อบริการ (จำเป็น)"
                            value={values.name}
                            onChange={(e) => {
                              setFieldValue("name", e.target.value);
                            }}
                            placeholder=""
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                readOnly: viewOnly ? true : false,
                              },
                            }}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                            fullWidth
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                          />
                        )}
                      </Field>
                    </Grid2>

                    <Grid2 size={{ xs: 6 }}>
                      <Field name="durationMinutes">
                        {({ field }: FieldProps) => (
                          <TextField
                            {...field}
                            name="durationMinutes"
                            label="เวลา (จำเป็น)"
                            // sx={{ textTransform: "uppercase" }}
                            value={
                              values.durationMinutes
                                ? values.durationMinutes
                                : ""
                            }
                            onChange={(e) => {
                              setFieldValue("durationMinutes", e.target.value);
                            }}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                readOnly: viewOnly ? true : false,
                                endAdornment: (
                                  <InputAdornment position="start">
                                    นาที
                                  </InputAdornment>
                                ),
                              },
                            }}
                            placeholder=""
                            error={
                              touched.durationMinutes &&
                              Boolean(errors.durationMinutes)
                            }
                            helperText={
                              touched.durationMinutes && errors.durationMinutes
                            }
                            fullWidth
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                          />
                        )}
                      </Field>
                    </Grid2>

                    <Grid2 size={{ xs: 6 }}>
                      <Field name="price">
                        {({ field }: any) => (
                          <TextField
                            {...field}
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                            name="price"
                            label="ราคาโปรโมชั่น (ถ้ามี)"
                            value={values.price ?? ""}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                readOnly: viewOnly ? true : false,
                                endAdornment: (
                                  <InputAdornment position="start">
                                    บาท
                                  </InputAdornment>
                                ),
                              },
                            }}
                            type="number"
                            onChange={(e) => {
                              const newValue = e.target.value.replace(
                                /\D/g,
                                ""
                              ); // กรองเฉพาะตัวเลข
                              setFieldValue("price", newValue || ""); // ป้องกัน NaN
                            }}
                            error={touched.price && Boolean(errors.price)}
                            helperText={touched.price && errors.price}
                            fullWidth
                          />
                        )}
                      </Field>
                    </Grid2>

                    {/* Cost discount */}
                    <Grid2 size={{ xs: 6 }}>
                      <Field name="discount">
                        {({ field }: any) => (
                          <TextField
                            {...field}
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                            name="discount"
                            label="ราคาปกติ (จำเป็น)"
                            value={values.discount ?? ""}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                readOnly: viewOnly ? true : false,
                                endAdornment: (
                                  <InputAdornment position="start">
                                    บาท
                                  </InputAdornment>
                                ),
                              },
                            }}
                            type="number"
                            onChange={(e) => {
                              const newValue = e.target.value.replace(
                                /\D/g,
                                ""
                              ); // กรองเฉพาะตัวเลข
                              setFieldValue("discount", newValue || ""); // ป้องกัน NaN
                            }}
                            error={touched.discount && Boolean(errors.discount)}
                            helperText={touched.discount && errors.discount}
                            fullWidth
                          />
                        )}
                      </Field>
                    </Grid2>

                    {/* Buffer Time */}
                    <Grid2 size={{ xs: 6 }}>
                      <Field name="bufferTime">
                        {({ field }: FieldProps) => (
                          <TextField
                            {...field}
                            name="bufferTime"
                            label="เวลาเตรียมอุปกรณ์ (ถ้ามี)"
                            value={values.bufferTime}
                            onChange={(e) => {
                              setFieldValue("bufferTime", e.target.value);
                            }}
                            placeholder=""
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                readOnly: viewOnly ? true : false,
                              },
                            }}
                            error={
                              touched.bufferTime && Boolean(errors.bufferTime)
                            }
                            helperText={touched.bufferTime && errors.bufferTime}
                            fullWidth
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                          />
                        )}
                      </Field>
                    </Grid2>

                    {/* Detail */}
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
                            disabled={
                              openBackdrop || isSubmitting || disabledForm
                            }
                          />
                        )}
                      </Field>
                    </Grid2>

                    <Grid2 size={{ xs: 6 }}>
                      <FormControl>
                        <InputLabel id="demo-multiple-chip-label">
                          Chip
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-chip-label"
                          id="demo-multiple-chip"
                          multiple
                          value={personName}
                          onChange={handleChange}
                          input={
                            <OutlinedInput
                              id="select-multiple-chip"
                              label="Chip"
                            />
                          }
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
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
                      </FormControl>
                    </Grid2>

                    {/* Display Number */}
                    {/* <Grid2 size={{ xs: 12 }}>
                        <Field name="name">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              name="name"
                              label="ลำดับการแสดงผล (ถ้ามี)"
                              value={values.name}
                              onChange={(e) => {
                                setFieldValue("name", e.target.value);
                              }}
                              placeholder=""
                              slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                  readOnly: viewOnly ? true : false,
                                },
                              }}
                              error={touched.name && Boolean(errors.name)}
                              helperText={touched.name && errors.name}
                              fullWidth
                              disabled={
                                openBackdrop || isSubmitting || disabledForm
                              }
                            />
                          )}
                        </Field>
                      </Grid2> */}

                    <Grid2 size={{ xs: 6 }}>
                      <Field
                        name="color"
                        component={ColorPickerCustom}
                        setFieldValue={setFieldValue}
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 6 }}>
                      <Field
                        name="productImage"
                        component={DragDropImage}
                        setFieldValue={setFieldValue}
                      />
                    </Grid2>
                  </Grid2>

                  <Grid2
                    sx={{
                      mt: 5,
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
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
                      {serviceEdit ? "แก้ไขบริการ" : "เพิ่มบริการ"}
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
        </Paper>
      </Box>
    </>
  );
};

export default ServiceForm;
