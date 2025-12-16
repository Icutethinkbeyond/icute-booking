import { Box, Card, Typography } from "@mui/material";
import ForgetPasswordForm from "@/components/forms/auth/ForgetPasswordForm";
import Image from "next/image";

const ForgetPassword = () => {
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
          minHeight: "70vh",
          maxWidth: "1200px",
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
          <Typography variant="h3" fontWeight="bold" textAlign="center" mb={4}>
          คุณลืมรหัสผ่านใช่หรือไม่ ?
          </Typography>
          {/* <AuthRegisterForm /> */}
          <ForgetPasswordForm/>
        </Box>
      </Card>
    </Box>
  );
};

export default ForgetPassword;
