import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  IconButton,
  Typography,
} from "@mui/material";
import { Cancel, Delete, RemoveCircle } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DocumentStatus } from "@prisma/client";
import { AlertOctagon, BookDown } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { Field, FieldProps, Form, Formik } from "formik";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import * as Yup from "yup";

interface ConfirmInputProps {
  massage?: string; // Name of the item to be deleted
  onDelete: (rentalId: string, documentId: string, data: Dayjs) => void; // Callback for deletion action
  rentalId: string;
  documentId: string;
  dialogTitle?: string;
  buttonName?: string;
  _erentionDatePlan: Dayjs;
  lastItem?: boolean;
}

interface DatePlan {
  erentionDatePlan: Dayjs;
  dismantlingDatePlan: Dayjs;
}

const ConfirmInput: React.FC<ConfirmInputProps> = ({
  massage,
  onDelete,
  rentalId,
  documentId,
  dialogTitle,
  buttonName,
  _erentionDatePlan,
  lastItem = false,
}) => {
  const [open, setOpen] = useState(false);
  const [dismantlingDatePlan, setDismantlingDatePlan] = useState<DatePlan>({
    erentionDatePlan: dayjs(new Date()),
    dismantlingDatePlan: dayjs(new Date()),
  });

  const validationSchema = Yup.object().shape({
    dismantlingDatePlan: Yup.date()
      .nullable()
      .test(
        "is-greater",
        "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น",
        function (value) {
          const { erentionDatePlan } = this.parent;
          if (!erentionDatePlan || !value) return true; // ถ้าวันเริ่มต้นหรือวันสิ้นสุดว่าง ไม่ต้องตรวจสอบ
          return value >= erentionDatePlan; // วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น
        }
      ),
  });

  // Open the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handle the deletion
  const handleDelete = (value: DatePlan) => {
    onDelete(rentalId, documentId, value.dismantlingDatePlan);
    handleClose();
  };

  useEffect(() => {
    setDismantlingDatePlan({
      ...dismantlingDatePlan,
      erentionDatePlan: dayjs(_erentionDatePlan),
    });
  }, [_erentionDatePlan]);

  useEffect(() => {
    return () => {
      setDismantlingDatePlan({
        erentionDatePlan: dayjs(new Date()),
        dismantlingDatePlan: dayjs(new Date()),
      });
    };
  }, []);

  return (
    <>
      <Avatar
        sx={{ bgcolor: "primary.main", width: 30, height: 30 }}
        onClick={handleClickOpen}
      >
        <BookDown size={16} />
      </Avatar>
      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle id="alert-dialog-title" variant="h3">
          <Grid2 container>
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <AlertOctagon size={16} />
            </Avatar>
            <Typography variant="h4" ml={1} mt={0.2}>
              {dialogTitle ? dialogTitle : "แจ้งเตือนสำคัญ"}
            </Typography>
          </Grid2>
        </DialogTitle>
        <Formik
          initialValues={dismantlingDatePlan} // ใช้ state เป็น initialValues
          validationSchema={validationSchema}
          onSubmit={handleDelete}
          enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form>
              <DialogContent sx={{ minHeight: 100 }}>
                <DialogContentText id="alert-dialog-description" mb={4}>
                  {massage}
                </DialogContentText>
                {lastItem && (
                  <Grid2 container justifyContent="center" mt={4} mb={4} pl={5} pr={5}>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 30, height: 30 }}
                    >
                      <AlertOctagon size={16} />
                    </Avatar>
                    <Typography variant="h5" textAlign={"center"} mt={1} >
                      รายการนี้เป็นรายการสุดท้ายของเอกสารนี้
                      เมื่อส่งอุปกรณ์คืนหมดเเล้ว
                      เอกสารจะถูกปิดไม่ให้เเก้ไขได้ทันที
                    </Typography>
                  </Grid2>
                )}
                <Field name="dismantlingDatePlan">
                  {({ field }: FieldProps) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="วันคืน หรือ วันที่รื้อถอน"
                        name="dismantlingDatePlan"
                        disablePast={true}
                        format="DD/MM/YYYY"
                        value={
                          values.dismantlingDatePlan !== undefined
                            ? values.dismantlingDatePlan
                            : null
                        }
                        onChange={(newValue) => {
                          setFieldValue("dismantlingDatePlan", newValue);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(
                              touched.dismantlingDatePlan &&
                                errors.dismantlingDatePlan
                            ),
                            helperText:
                              touched.dismantlingDatePlan &&
                              errors.dismantlingDatePlan
                                ? String(errors.dismantlingDatePlan)
                                : "",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                  ยกเลิก
                </Button>
                <Button type="submit" autoFocus variant="contained">
                  บันทึกการคืน
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default ConfirmInput;
