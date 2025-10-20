import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid2,
} from "@mui/material";
import Head from "next/head";
import { BuildCircle, Print } from "@mui/icons-material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import axios from "axios";
import { DocumentCategory, DocumentStatus, DocumentStep } from "@prisma/client";
import { useNotifyContext } from "@/contexts/NotifyContext";
import ConfirmRemove from "@/components/shared/used/ConfirmRemove";

interface ComponentProps {
  documentCategory: DocumentCategory;
  handleNext?: () => void;
  setActiveStep?: (value: number) => void;
  viewOnly?: boolean;
}

const AwaitingWithdrawal: React.FC<ComponentProps> = ({
  documentCategory,
  handleNext,
  setActiveStep,
  viewOnly,
}) => {
  const router = useRouter();
  const localActive = useLocale();
  const params = useSearchParams();
  const pathname = usePathname();

  const { setNotify, notify } = useNotifyContext()

  const [loading, setLoading] = useState<boolean>(false);

  const getDataDocument = (documentId: string | undefined | null) => {
    
    if (!documentId) {
      return;
    }

    axios
      .get(`/api/document?documentId=${documentId}`)
      .then(({ data }) => {
        if (
          data.data.documentStatus === DocumentStatus.Close ||
          data.data.documentStatus === DocumentStatus.Cancel
        ) {
          if (viewOnly === false) {
            handleRedirect();
          }
        } else {
          // console.log(data.documentStep);
          // setDocumentForm(data);
          setLoading(false);
          checkStep(data.data.documentStep);
        }
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

  const handleRedirect = () => {
    if (documentCategory === DocumentCategory.Rental) {
      router.push(`/${localActive}/protected/rental`);
    } else {
      router.push(`/${localActive}/protected/maintenance`);
    }
  };

  const checkStep = (value: DocumentStep) => {
    switch (value) {
      case DocumentStep.WithdrawPart:
        setActiveStep && setActiveStep(1);
        // code block
        break;
      case DocumentStep.RepairStared:
        setActiveStep && setActiveStep(2);
        // code block
        break;
      case DocumentStep.RepairComplete:
        setActiveStep && setActiveStep(3);
        // code block
        break;
      default:
        setActiveStep && setActiveStep(0);
      // code block
    }
  };

  const handleWithdraw = async (maintenanceId: string) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `/api/maintenance/part/withdraw?maintenanceId=${maintenanceId}`
      );

      if (response.statusText === "OK") {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });


        setLoading(false);

        handleNext && handleNext();
      }
    } catch (error: any) {
      setNotify({
        ...notify,
        open: true,
        message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
        color: "error",
      });

    }
  };

  useEffect(() => {
    if (params.get("documentId")) {
      getDataDocument(params.get("documentId"));
    }

    return () => {};
  }, []);

  return (
    <>
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
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            กำลังรอการเบิกอะไหล่
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            อะไหล่ของคุณพร้อมสำหรับการเบิกเพื่อไปซ่อมแซมหรือไม่
          </Typography>
          <Grid2 container>
            <Button
              variant="contained"
              color="info"
              size="large"
              // onClick={}
              sx={{ mt: 2, mr: 2 }}
              startIcon={<Print />}
              disabled
            >
              พิมพ์ใบเบิกอะไหล่
            </Button>
            <ConfirmRemove
              itemId={params.get("maintenanceId")}
              buttonName="เบิกอะไหล่เเล้ว"
              onDelete={handleWithdraw}
              iconButton={<BuildCircle />}
              variantButton="contained"
              isLoading={loading}
              massage={`คุณได้ทำการเบิกอะไหล่เเล้ว ใช่หรือไม่ หากกด "เบิกอะไหล่เเล้ว" จะไม่สามารถย้อนกลับได้`}
            />
          </Grid2>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            คลิก "เบิกอะไหล่เเล้ว" เมื่อได้รับอะไหล่ครบเเล้ว
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default AwaitingWithdrawal;
