import { Box, Card, Typography } from "@mui/material";
import AuthRegisterForm from "@/components/forms/auth/AuthRegisterForm";
import Image from "next/image";
import LineLogin from "@/components/forms/auth/LineLogin";

const LineLoginPage = () => {
  return (
        <Box
          sx={{
            flex: 1,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <LineLogin />
        </Box>
  );
};

export default LineLoginPage;
