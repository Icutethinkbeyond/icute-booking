import { Box, Button, useTheme } from "@mui/material";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function NavigationButtons({
  activeStep,
  stepsLength,
  onBack,
  onNext,
  isValid,
}: {
  activeStep: number;
  stepsLength: number;
  onBack: () => void;
  onNext: () => void;
  isValid?: boolean;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: { xs: 3, md: 4 },
        pt: { xs: 2, md: 3 },
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 1.5,
      }}
    >
      <Button
        disabled={activeStep === 0}
        onClick={onBack}
        variant="outlined"
        size="medium"
        startIcon={<ArrowLeft size={16} />}
        sx={{
          fontSize: { xs: "0.875rem", md: "1rem" },
          px: { xs: 2, md: 2.75 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        ย้อนกลับ
      </Button>
      <Button
        onClick={onNext}
        // disabled={!isValid}
        variant="contained"
        size="medium"
        endIcon={<ArrowRight size={16} />}
        sx={{
          fontSize: { xs: "0.875rem", md: "1rem" },
          px: { xs: 2.5, md: 2.75 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        {activeStep === stepsLength - 1 ? (
          <>
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              ยืนยันการจอง
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              ยืนยัน
            </Box>
          </>
        ) : (
          "ต่อไป"
        )}
      </Button>
    </Box>
  );
}