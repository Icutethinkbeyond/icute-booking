import React, { useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Grid2,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Cancel, Close } from "@mui/icons-material";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { AlertOctagon } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { DocumentStatus, DocumentStep } from "@prisma/client";

interface TypeToConfirmRemoveProps {
  massage?: string;
  onDelete: (
    documentId: string,
    documentIdNo: string,
    documentStatus: DocumentStatus,
    documentStep?: DocumentStep
  ) => void;
  documentIdNo: string;
  documentStatus: DocumentStatus;
  documentStep?: DocumentStep;
  documentId: string; // ID ที่ต้องตรงกัน
  dialogTitle?: string;
  buttonName?: string;
  iconButton?: JSX.Element | null;
  colorButton?: "success" | "error" | "info" | "primary" | "warning";
  variantButton?: "contained" | "outlined" | "text";
  isLoading?: boolean;
}

const TypeToConfirmRemove: React.FC<TypeToConfirmRemoveProps> = ({
  massage,
  onDelete,
  documentStatus,
  documentStep,
  documentId,
  dialogTitle,
  buttonName,
  documentIdNo,
  iconButton,
  colorButton,
  variantButton,
  isLoading,
}) => {
  const [open, setOpen] = useState(false);
  const { setNotify, notify } = useNotifyContext()

  // เปิด Dialog
  const handleClickOpen = () => {
    if (
      documentStatus === DocumentStatus.Close ||
      documentStatus === DocumentStatus.Cancel
    ) {
      onDelete(documentId, documentIdNo, documentStatus, documentStep);
    } else {
      setOpen(true);
    }
  };

  // ปิด Dialog
  const handleClose = () => {
    setOpen(false);
    formik.resetForm(); // รีเซ็ตฟอร์มเมื่อปิด Dialog
  };

  // Formik + Yup Validation Schema
  const formik = useFormik({
    initialValues: {
      inputDocumentId: "",
    },
    validationSchema: Yup.object({
      inputDocumentId: Yup.string()
        .required("กรุณากรอกหมายเลขเอกสาร")
        .oneOf([documentIdNo], "หมายเลขเอกสารไม่ถูกต้อง"),
    }),
    onSubmit: () => {
      if (!documentIdNo) {
        setNotify({
          ...notify,
          open: true,
          color: 'error',
          message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        })
        return;
      }
      onDelete(documentId, documentIdNo, documentStatus, documentStep);
      handleClose();
    },
  });

  return (
    <>
      <IconButton
        size="small"
        color="error"
        onClick={handleClickOpen}
        disabled={isLoading}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 30,
            height: 30,
          }}
        >
          <Close sx={{ fontSize: "18px" }} />
        </Avatar>
      </IconButton>
      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle id="alert-dialog-title" variant="h3">
          <Grid2 container alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <AlertOctagon size={16} />
            </Avatar>
            <Typography variant="h4" ml={1}>
              {dialogTitle || "แจ้งเตือนสำคัญ"}
            </Typography>
          </Grid2>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 150 }}>
          <DialogContentText>{massage}</DialogContentText>
          <DialogContentText mt={3} mb={2}>
            <Chip
              label={` โปรดกรอก "${documentIdNo}" ในช่องเพื่อยืนยันการลบ`}
            />
          </DialogContentText>
          {/* ฟอร์มตรวจสอบ Document ID */}
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="กรอกหมายเลขเอกสาร"
              variant="outlined"
              name="inputDocumentId"
              value={formik.values.inputDocumentId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.inputDocumentId &&
                Boolean(formik.errors.inputDocumentId)
              }
              helperText={
                formik.touched.inputDocumentId && formik.errors.inputDocumentId
              }
            />
            <DialogActions>
              <Button onClick={handleClose} variant="outlined">
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                disabled={!formik.isValid || formik.isSubmitting}
              >
                ยืนยัน
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TypeToConfirmRemove;
