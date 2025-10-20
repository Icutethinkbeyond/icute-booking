import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid2,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Head from "next/head";
import { Approval, Check, NextPlan, Print } from "@mui/icons-material";
import { DocumentCategory, DocumentStep } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDocumentContext } from "@/contexts/DocumentContext";
import { useLocale } from "next-intl";
import { AlertOctagon } from "lucide-react";

interface PendingApprovalProps {
  documentCategory: DocumentCategory;
  handleBack?: () => void;
  viewOnly?: boolean;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({
  viewOnly = false,
  handleBack,
  documentCategory,
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const localActive = useLocale();

  const { setNotify, notify } = useNotifyContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [documentStep, setDocumentStep] = useState<DocumentStep | null>(null);
  const [open, setOpen] = useState(false);

  // Open the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  const approveDocument = () => {
    setOpen(false);

    let documentId = params.get("documentId");
    let endpoint: string;

    if (!documentId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      return;
    }

    if (documentCategory === DocumentCategory.Rental) {
      endpoint = "/api/rental/approve";
    } else {
      endpoint = "/api/maintenance/approve";
    }

    setLoading(true);

    axios
      .post(endpoint, { documentId })
      .then(({ data }) => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });

        setLoading(false);

        if (documentCategory === DocumentCategory.Rental) {
          handleNextReturn(
            params.get("documentId"),
            params.get("documentIdNo")
          );
        } else {
          handleNext(
            params.get("documentId"),
            params.get("documentIdNo"),
            params.get("maintenanceId")
          );
        }
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
      .finally(() => {});
  };

  const getDataDocument = (documentId: string | undefined | null) => {
    if (!documentId) {
      return;
    }

    axios
      .get(`/api/document?documentId=${documentId}`)
      .then(({ data }) => {
        // console.log(data)
        setDocumentStep(data.data.documentStep);
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

  const handleNextReturn = (
    documentId: string | undefined | null,
    documentIdNo: string | undefined | null
  ) => {
    setLoading(true);

    if (!documentId || !documentIdNo) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      setTimeout(() => {
        router.push(`/${localActive}/protected/rental`);
      }, 1000);

      return;
    }

    setTimeout(() => {
      router.push(
        `/${localActive}/protected/rental/return?documentId=${documentId}&documentIdNo=${documentIdNo}`
      );
    }, 1000);
  };

  const handleNext = (
    documentId: string | undefined | null,
    documentIdNo: string | undefined | null,
    maintenanceId: string | undefined | null
  ) => {
    setLoading(true);

    if (!documentId || !documentIdNo || !maintenanceId) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

      setTimeout(() => {
        router.push(`/${localActive}/protected/maintenance`);
      }, 1000);

      return;
    }

    setTimeout(() => {
      router.push(
        `/${localActive}/protected/maintenance/progress/?documentId=${documentId}&documentIdNo=${documentIdNo}&maintenanceId=${maintenanceId}`
      );
    }, 1000);
  };

  useEffect(() => {
    if (params.get("documentId")) {
      getDataDocument(params.get("documentId"));
    }
    return () => {
      setDocumentStep(null);
    };
  }, []);

  return (
    <>
      <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle id="alert-dialog-title" variant="h3">
          <Grid2 container>
            <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
              <AlertOctagon size={16} />
            </Avatar>
            <Typography variant="h4" ml={1} mt={0.2}>
              แจ้งเตือนสำคัญ
            </Typography>
          </Grid2>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 100 }}>
          <DialogContentText id="alert-dialog-description">
            โปรดตรวจสอบเอกสารก่อนการอนุมัติ หากอนุมัติเเล้วจะไม่สามารถเเก้ไขได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            ยกเลิก
          </Button>
          <Button
            onClick={() => approveDocument()}
            autoFocus
            variant="contained"
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            textAlign: "center",
          }}
        >
          {documentStep === DocumentStep.Approve && (
            <>
              <Avatar sx={{ bgcolor: "success.main", mb: 3 }}>
                <Check />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                เอกสารได้รับการอนุมัติเเล้ว
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                โปรดคลิกที่ปุ่ม "ถัดไป" เพื่อดำเนินการต่อ
              </Typography>
            </>
          )}

          {documentStep === DocumentStep.WaitingApprove && (
            <>
              <CircularProgress size={60} sx={{ mb: 4 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                รอการอนุมัติ
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                เอกสารกำลังรอการอนุมัติจากผู้ดูแล
              </Typography>
            </>
          )}

          <Grid2>
            {documentStep === DocumentStep.WaitingApprove && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{ mt: 5, mr: 2 }}
                >
                  ย้อนกลับ
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 5, mr: 2 }}
                  startIcon={<Approval />}
                  onClick={() => handleClickOpen()}
                  disabled={loading}
                >
                  อนุมัติเอกสาร
                </Button>
              </>
            )}

            {documentCategory === DocumentCategory.Maintenance && (
              <Button
                variant="contained"
                color="info"
                sx={{ mt: 5, mr: 2 }}
                startIcon={<Print />}
                disabled
              >
                พิมพ์เอกสาร
              </Button>
            )}

            {documentStep === DocumentStep.Approve && (
              <Button
                variant="contained"
                color="info"
                sx={{ mt: 5, mr: 2 }}
                startIcon={<NextPlan />}
                onClick={() =>
                  handleNext(
                    params.get("documentId"),
                    params.get("documentIdNo"),
                    params.get("maintenanceId")
                  )
                }
              >
                ถัดไป
              </Button>
            )}
          </Grid2>
        </Box>
      </Container>
    </>
  );
};

export default PendingApproval;
