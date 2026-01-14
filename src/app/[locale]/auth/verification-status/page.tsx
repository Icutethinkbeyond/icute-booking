

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, CircularProgress, Button, Container, Alert, Paper } from "@mui/material";
import { useSession } from "next-auth/react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useLocale } from "next-intl";

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus, update } = useSession();

  const [isProcessing, setIsProcessing] = useState(true);
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const locaActive = useLocale();

  useEffect(() => {

    console.log(authStatus)
    console.log(status)

    
    const handleLogic = async () => {

          //       const data = await update(); // บังคับให้ session อัปเดตข้อมูลจาก DB ใหม่

          // console.log(data)
          
      // 1. ถ้าเป็น Success ให้ลอง Update Session เพื่อดึงค่า emailVerified ล่าสุด
      if (status === "success") {
        if (authStatus === "loading") return;

        if (authStatus === "authenticated") {
          const data = await update(); // บังคับให้ session อัปเดตข้อมูลจาก DB ใหม่

          console.log(data)

          setIsProcessing(false);
        } else if (authStatus === "unauthenticated") {
          // ถ้าสำเร็จแต่ไม่ได้ล็อกอิน ให้ไปหน้า sign-in
          router.push(`/${locaActive}/auth/sign-in`);
        }
      } else {
        // กรณี Error หรือสถานะอื่นๆ
        setIsProcessing(false);
      }
    };

    handleLogic();
  }, [status, authStatus, router, update]);

  if (isProcessing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>กำลังดำเนินการ...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        {status === "success" ? (
          <Box>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
              สำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message || "ยืนยันอีเมลของคุณเรียบร้อยแล้ว"}
            </Typography>
            <Button variant="contained" fullWidth onClick={() => router.push(`/${locaActive}/protected/admin/dashboard`)}>
              เข้าสู่ Dashboard
            </Button>
          </Box>
        ) : (
          <Box>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
              เกิดข้อผิดพลาด
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {message || "ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง"}
            </Alert>
            <Button variant="outlined" fullWidth onClick={() => router.push(`/${locaActive}`)}>
              กลับไปหน้าหลัก
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

// ต้องใช้ Suspense เพราะมีการใช้ useSearchParams
export default function VerificationStatusPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <VerificationContent />
    </Suspense>
  );
}