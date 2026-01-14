// components/auth/EmailVerificationGuard.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

export default function EmailVerificationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log(session?.user.emailVerified);

  if (status === "loading")
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );

  // 1. ถ้าไม่ได้ล็อกอิน ให้ไปหน้า Sign-in (ตามที่คุณต้องการ)
  //   if (status === "unauthenticated") {
  //     router.push("/sign-in");
  //     return null;
  //   }

  // 2. ถ้าล็อกอินแล้ว แต่ emailVerified เป็น null (ยังไม่ได้ยืนยัน)
  if (session?.user && !Boolean(session.user.emailVerified)) {
    return (
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{ p: 4, mt: 8, textAlign: "center", borderRadius: 2 }}
        >
          <MarkEmailReadIcon
            sx={{ fontSize: 60, color: "warning.main", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            กรุณายืนยันอีเมลของคุณ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            เราได้ส่งลิงก์ยืนยันไปที่ <b>{session.user.email}</b> แล้ว
            กรุณาตรวจสอบกล่องจดหมาย (หรือ Junk mail) เพื่อเปิดใช้งานบัญชี
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="contained" fullWidth size="large">
              ส่งอีเมลยืนยันอีกครั้ง
            </Button>
            <Button variant="text" onClick={() => signOut()}>
              ออกจากระบบ
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // 3. ถ้าผ่านเงื่อนไขทั้งหมด ให้แสดงเนื้อหาปกติ
  return <>{children}</>;
}
