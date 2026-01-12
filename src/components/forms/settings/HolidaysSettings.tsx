"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  useTheme,
  Grid2,
  Typography,
  Autocomplete,
  TablePagination,
} from "@mui/material";
import { useFormikContext } from "formik";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import { useStoreContext } from "@/contexts/StoreContext";
import { HolidayType } from "@prisma/client";
import { Holiday } from "@/interfaces/Store";
import LoadingButton from "@mui/lab/LoadingButton";
import { storeService } from "@/utils/services/api-services/StoreAPI";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { formatThaiDateTimeRange } from "@/utils/lib/utils";

const validationSchema = Yup.object({});

export default function HolidaysSettings() {
  const theme = useTheme();
  // const { submitForm, isSubmitting, isValid } = useFormikContext();
  const { setNotify, notify, setOpenBackdrop, openBackdrop } =
    useNotifyContext();
  const { holidays, setHolidays, setHolidaysList, holidaysList } =
    useStoreContext();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [metadata, setMetadata] = useState({ total: 0, page: 1, lastPage: 1 });

  useEffect(() => {
    getHolidays(metadata.page - 1, rowsPerPage);
  }, [rowsPerPage]);

  const handleChangePage = (event: any, newPage: number) => {
    getHolidays(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    getHolidays(0, newLimit); // กลับไปหน้าแรกเสมอเมื่อเปลี่ยนจำนวนต่อหน้า
  };

  useEffect(() => {
    console.log(holidays);
  }, [holidays]);

  const handleFormSubmit = async (
    values: Holiday,
    {
      setSubmitting,
      setErrors,
      resetForm,
      validateForm,
    }: FormikHelpers<Holiday> // ใช้ FormikHelpers เพื่อให้ Type ถูกต้อง
  ) => {
    console.log(values);

    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setSubmitting(true); // เริ่มสถานะ Loading/Submittings

    const result = await storeService.createHoliday(values);

    // // // // // // 3. จัดการเมื่อสำเร็จ
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });

    handleCloseDialog();
  };

  const handleOpenDialog = (holiday?: Holiday) => {
    // if (holiday) {
    //   setEditingHoliday(holiday)
    //   setFormData(holiday)
    // } else {
    //   setEditingHoliday(null)
    //   setFormData({
    //     date: new Date(),
    //     name: "",
    //     type: "annual",
    //     fullDay: true,
    //     startTime: "09:00",
    //     endTime: "18:00",
    //   })
    // }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHoliday(null);
  };

  const handleSave = () => {
    // if (!formData.name || !formData.date) {
    //   setSnackbar({ open: true, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    //   return;
    // }
    // if (editingHoliday) {
    //   setHolidays(
    //     holidays.map((h) =>
    //       h.id === editingHoliday.id
    //         ? ({ ...formData, id: h.id } as Holiday)
    //         : h
    //     )
    //   );
    //   setSnackbar({ open: true, message: "แก้ไขวันหยุดสำเร็จ" });
    // } else {
    //   const newHoliday: Holiday = {
    //     ...formData,
    //     id: Date.now().toString(),
    //   } as Holiday;
    //   setHolidays([...holidays, newHoliday]);
    //   setSnackbar({ open: true, message: "เพิ่มวันหยุดสำเร็จ" });
    // }
    // handleCloseDialog();
  };

  const getHolidays = async (page: number = 1, limit: number = 10) => {
    let result = await storeService.getHolidays(page, limit);
    console.log(result);

    if (result.success) {
      setHolidaysList(result.data);
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
    getHolidays();
    return () => {
      setHolidaysList([]);
    };
  }, []);

  return (
    <>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Box
              component="h2"
              sx={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: theme.palette.primary.main,
                mb: 0.5,
              }}
            >
              วันหยุดประจำปี / วันหยุดพิเศษ
            </Box>
            <Box
              component="p"
              sx={{
                fontSize: "0.875rem",
                color: theme.palette.text.secondary,
              }}
            >
              กำหนดวันหยุดของร้านเพื่อป้องกันการจองในวันดังกล่าว
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
              marginLeft: 5,
            }}
          >
            เพิ่มวันหยุด
          </Button>
        </Box>

        {holidaysList.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: theme.palette.grey[100],
              border: `2px dashed ${theme.palette.divider}`,
            }}
          >
            <CalendarIcon
              sx={{
                fontSize: 64,
                color: theme.palette.text.secondary,
                mb: 2,
              }}
            />
            <Box sx={{ color: theme.palette.text.secondary }}>
              ยังไม่มีวันหยุด คลิก &quot;เพิ่มวันหยุด&quot; เพื่อเริ่มต้น
            </Box>
          </Card>
        ) : (
          <Box>
            <Grid2 container spacing={2}>
              เปลี่ยนจาก holidaysList เป็น paginatedHolidays
              {holidaysList.map((holiday) => (
                <Grid2 size={{ xs: 12, md: 6 }} key={holiday.id}>
                  <Card
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              color: theme.palette.primary.main,
                              mb: 1,
                            }}
                          >
                            {holiday.holidayName}
                          </Box>
                          {/* ส่วนแสดงวันที่ (ถ้ามี) */}
                          <Box
                            sx={{
                              fontSize: "0.875rem",
                              color: theme.palette.text.secondary,
                              mb: 1,
                            }}
                          >
                            {dayjs(holiday.startTime).format("DD MMMM YYYY")}
                          </Box>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip
                              label={
                                holiday.holidayType === HolidayType.ANNUAL
                                  ? "วันหยุดประจำปี"
                                  : "วันหยุดพิเศษ"
                              }
                              size="small"
                              sx={{
                                bgcolor:
                                  holiday.holidayType === HolidayType.ANNUAL
                                    ? theme.palette.secondary.light
                                    : theme.palette.warning.light,
                              }}
                            />
                            {/* <Chip
                              label={
                                holiday.fullDay
                                  ? "ปิดทั้งวัน"
                                  : formatThaiDateTimeRange(
                                      holiday.startTime,
                                      holiday.endTime
                                    )
                              }
                              size="small"
                              sx={{ bgcolor: theme.palette.grey[200] }}
                            /> */}
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.secondary.main }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>

            {/* เพิ่มส่วน Pagination ด้านล่าง Grid */}
            <TablePagination
              component="div"
              // ใช้ค่า total จาก metadata
              count={metadata.total}
              // MUI ใช้ 0-based index ดังนั้นต้อง -1 จากค่าที่ API ส่งมา (1-1 = 0)
              page={metadata.page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="รายการต่อหน้า:"
              sx={{ mt: 2 }}
            />
          </Box>
        )}

        <Formik<Holiday>
          initialValues={holidays} // ใช้ state เป็น initialValues
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
            submitForm,
          }) => (
            <Form>
              <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle sx={{ bgcolor: theme.palette.grey[100] }}>
                  {editingHoliday ? "แก้ไขวันหยุด" : "เพิ่มวันหยุด"}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                    mt={3}
                  >
                    <Field name="date">
                      {({ field, form }: FieldProps) => (
                        <DatePicker
                          // disabled={
                          //   isSubmitting
                          //   values.MON_isOpen.toString() === "false"
                          // }
                          label="เลือกวันที่"
                          sx={{ minWidth: "100%" }}
                          // ✔ เวลา (dayjs) หรือ null
                          value={values.date ? dayjs(values.date) : null}
                          // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                          onChange={(newValue) => {
                            form.setFieldValue(
                              "date",
                              newValue ? newValue.toISOString() : null
                            );
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(touched.date && errors.date),
                              helperText:
                                touched.date && errors.date
                                  ? String(errors.date)
                                  : "",
                            },
                          }}
                        />
                      )}
                    </Field>

                    <Field name="holidayName">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          name="holidayName"
                          label="ชื่อวันหยุด"
                          placeholder="เช่น วันปีใหม่, ปิดซ่อมร้าน"
                          // sx={{ textTransform: "uppercase" }}
                          value={values.holidayName ? values.holidayName : ""}
                          onChange={(e) => {
                            setFieldValue("holidayName", e.target.value);
                          }}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          error={
                            touched.holidayName && Boolean(errors.holidayName)
                          }
                          helperText={touched.holidayName && errors.holidayName}
                          fullWidth
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>

                    <Field name="holidayType">
                      {({ field }: FieldProps) => (
                        <FormControl fullWidth>
                          <InputLabel>ประเภทวันหยุด</InputLabel>
                          <Select
                            value={values.holidayType}
                            label="ประเภทวันหยุด"
                            onChange={(e) =>
                              setFieldValue("holidayType", e.target.value)
                            }
                          >
                            <MenuItem value={HolidayType.ANNUAL}>
                              วันหยุดประจำปี
                            </MenuItem>
                            <MenuItem value={HolidayType.SPECIAL}>
                              วันหยุดพิเศษ
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Field>

                    {/* <FormControl fullWidth>
                      <InputLabel>ประเภทวันหยุด</InputLabel>
                      <Select
                        // value={formData.type}
                        label="ประเภทวันหยุด"
                        // onChange={(e) =>
                        //   setFormData({
                        //     ...formData,
                        //     type: e.target.value as "annual" | "special",
                        //   })
                        // }
                      >
                        <MenuItem value="annual">วันหยุดประจำปี</MenuItem>
                        <MenuItem value="special">วันหยุดพิเศษ</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={holidays.fullDay}
                          // onChange={(e) =>
                          //   setFormData({
                          //     ...formData,
                          //     fullDay: e.target.checked,
                          //   })
                          // }
                        />
                      }
                      label="ปิดทั้งวัน"
                    /> */}

                    <FormControl fullWidth disabled={isSubmitting}>
                      <Field name="fullDay">
                        {({ field, form }: any) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={Boolean(values.fullDay)}
                                onChange={(e) => {
                                  setFieldValue("fullDay", e.target.checked);
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
                                ปิดทั้งวัน
                              </Typography>
                            }
                          />
                        )}
                      </Field>
                    </FormControl>

                    {!values.fullDay && (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box>
                          <Field name="startTime">
                            {({ field, form }: FieldProps) => (
                              <TimePicker
                                disabled={
                                  isSubmitting ||
                                  values.startTime?.toString() === "false"
                                }
                                label="เวลาเริ่มต้น"
                                sx={{ minWidth: "100%" }}
                                // ✔ เวลา (dayjs) หรือ null
                                value={
                                  values.startTime
                                    ? dayjs(values.startTime)
                                    : null
                                }
                                // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                                onChange={(newValue) => {
                                  form.setFieldValue(
                                    "startTime",
                                    newValue ? newValue.toISOString() : null
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: Boolean(
                                      touched.startTime && errors.startTime
                                    ),
                                    helperText:
                                      touched.startTime && errors.startTime
                                        ? String(errors.startTime)
                                        : "",
                                  },
                                }}
                              />
                            )}
                          </Field>
                        </Box>
                        <Box>
                          <Field name="endTime">
                            {({ field, form }: FieldProps) => (
                              <TimePicker
                                disabled={
                                  isSubmitting ||
                                  values.endTime?.toString() === "false"
                                }
                                label="เวลาสิ้นสุด"
                                sx={{ minWidth: "100%" }}
                                // ✔ เวลา (dayjs) หรือ null
                                value={
                                  values.endTime ? dayjs(values.endTime) : null
                                }
                                // ✔ อัปเดตค่าเวลาใน Formik อย่างถูกต้อง
                                onChange={(newValue) => {
                                  form.setFieldValue(
                                    "endTime",
                                    newValue ? newValue.toISOString() : null
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: Boolean(
                                      touched.endTime && errors.endTime
                                    ),
                                    helperText:
                                      touched.endTime && errors.endTime
                                        ? String(errors.endTime)
                                        : "",
                                  },
                                }}
                              />
                            )}
                          </Field>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={handleCloseDialog}>ยกเลิก</Button>
                  <LoadingButton
                    variant="contained"
                    onClick={submitForm}
                    color="primary"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    บันทึก
                  </LoadingButton>
                </DialogActions>
              </Dialog>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}
