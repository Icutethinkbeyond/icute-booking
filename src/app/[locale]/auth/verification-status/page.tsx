"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, CircularProgress, Button, Container, Alert } from "@mui/material";
import { useSession } from "next-auth/react"; // สมมติว่าใช้ NextAuth หรือใช้ระบบตรวจสอบ Token ของคุณเอง
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useLocale } from "next-intl";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession(); // จัดการสถานะการ Login

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // 1. ดึง Parameters จาก URL
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const localActive = useLocale();

  useEffect(() => {
    const checkAuthAndStatus = async () => {
      // กรณีสถานะเป็น Error ให้แสดงข้อความแจ้งเตือน
      if (status === "error") {
        setErrorMessage(message || "เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง");
        setIsProcessing(false);
        return;
      }

      // กรณีสถานะเป็น Success
      if (status === "success") {
        // รอให้สถานะ Auth โหลดเสร็จก่อน (กรณีใช้ useSession)
        if (authStatus === "loading") return;

        if (authStatus === "authenticated") {
          // ถ้าล็อคอินอยู่แล้ว ให้หยุดโหลดและอยู่หน้านี้ (หรือแสดง UI สำเร็จ)
          setIsProcessing(false);
        } else if (authStatus === "unauthenticated") {
          // ถ้าไม่ได้ล็อคอิน ให้ส่งกลับไปหน้า Sign-in
          router.push(`/${localActive}/auth/sign-in`);
        }
      }
    };

    checkAuthAndStatus();
  }, [status, message, authStatus, router]);

  // UI ระหว่างกำลังตรวจสอบ
  if (isProcessing && !errorMessage) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress />
        <Typography>กำลังตรวจสอบสถานะการจองของคุณ...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        {/* กรณีมี Error ให้แสดง UI แจ้งเตือน */}
        {errorMessage ? (
          <Box>
            <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              เกิดข้อผิดพลาด
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
            <Button variant="contained" onClick={() => router.push("/")}>
              กลับหน้าหลัก
            </Button>
          </Box>
        ) : (
          /* กรณี Success และ Login อยู่ จะเห็นข้อความนี้ */
          <Box>
            <Typography variant="h4" color="primary" gutterBottom>
              ทำรายการสำเร็จ 🎉
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message || "ข้อมูลของคุณได้รับการยืนยันเรียบร้อยแล้ว"}
            </Typography>
            <Button variant="outlined" onClick={() => router.push(`/${localActive}/protected/admin/dashboard`)}>
              ไปยัง Dashboard ของฉัน
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}