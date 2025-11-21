"use client";

import {
  Grid2,
  Box,
  Container,
  Typography,
  Paper,
  Link,
  Card,
} from "@mui/material";
import Image from "next/image";
import AuthForm from "@/components/forms/auth/AuthForm";
const LoginPage = () => {

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 4,
      }}
    >
      <Card
        sx={{
          minHeight: "70vh",
          width: "100%",
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
            // backgroundColor: "#3f51b5",
            background:
              "linear-gradient(90deg, rgba(42, 72, 160, 1) 0%, rgba(69, 189, 187, 1) 100%)",

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
          <Typography variant="h3" fontWeight="bold" textAlign="center" mb={4}>
            เข้าสู่ระบบ
          </Typography>
          <AuthForm />
        </Box>
      </Card>
    </Box>
  );
};

export default LoginPage;
