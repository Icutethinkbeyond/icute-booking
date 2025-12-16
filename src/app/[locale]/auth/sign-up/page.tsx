import { Box, Card, Typography } from "@mui/material";
import AuthRegisterForm from "@/components/forms/auth/AuthRegisterForm";
import Image from "next/image";

const AuthRegister = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "1200px",
          minHeight: "70vh",
          display: "flex",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: 4,
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            flexDirection: "column",
            padding: 6,
          }}
        >
          {/* <Image
            src="/images/logos/logo-white-png.png"
            alt="logo"
            height={70}
            width={80}
            priority
          />

          <Typography variant="h3" fontWeight="bold" mb={3}>
            EzyAccount
          </Typography>
          <Typography variant="h6" textAlign="center">
            โปรแกรมบัญชีใช้งานง่าย ที่เป็นเสมือนเพื่อนคู่คิดธุรกิจคุณ
          </Typography> */}
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            flex: 1,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* <Typography variant="h3" fontWeight="bold" textAlign="center" mb={4}>
            สมัครใช้งานระบบจัดการร้านเสริมสวย
          </Typography> */}
          <AuthRegisterForm />
        </Box>
      </Card>
    </Box>
  );
};

export default AuthRegister;
