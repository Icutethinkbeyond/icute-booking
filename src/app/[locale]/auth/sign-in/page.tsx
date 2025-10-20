"use client";

import {
  Grid2,
  Box,
  Container,
  Typography,
  Paper,
  Link,
} from "@mui/material";
import Image from "next/image";
import AuthForm from "@/components/forms/auth/AuthForm";
const LoginPage = () => {

  return (
    <>
      {/* <PageContainer title="เข้าสู่ระบบ"> */}
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage:
              'url("/images/backgrounds/about_us.jpg?height=1080&width=1920")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box
            component="header"
            sx={{
              bgcolor: "#013365",
              py: 2,
              boxShadow: 1,
            }}
          >
            <Grid2 container justifyContent={"center"}>
              <Typography variant="h1" color="white">
                Asset Management Software{" "}
              </Typography>
            </Grid2>
          </Box>

          <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "/images/backgrounds/about_us.jpg",
              }}
            >
              <Image
                src="/images/logos/image004.png"
                alt="logo"
                height={70}
                width={105}
                priority
              />
              <Box sx={{ mt: 5, width: "100%" }}>
                <AuthForm />
              </Box>
            </Paper>
          </Container>

          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: "auto",
              backgroundColor: "#003366",
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="body2" color="white" align="center">
                {"Copyright © "}
                <Link color="inherit" href="https://www.bouyguesthai.com/">
                  Bouygues Thai
                </Link>{" "}
                {new Date().getFullYear()}
                {"."}
              </Typography>
            </Container>
          </Box>
        </Box>
      {/* </PageContainer> */}
    </>
  );
};

export default LoginPage;
