"use client"

import { createTheme } from "@mui/material/styles"
import { Prompt } from "next/font/google"

export const dm = Prompt({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Prompt", "Arial", "sans-serif"],
})

const baselightTheme = createTheme({
  direction: "ltr",
  palette: {
    primary: {
      main: "#E7510C",
      light: "#FF7A3D", // Lighter shade of main
      dark: "#B33C00", // Darker shade of main
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#2D3748", // Neutral dark color that complements the orange
      light: "#4A5568",
      dark: "#1A202C",
      contrastText: "#ffffff",
    },
    success: {
      main: "#38A169", // Adjusted green for better harmony
      light: "#F0FFF4",
      dark: "#2F855A",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3182CE", // Adjusted blue for better harmony
      light: "#EBF8FF",
      dark: "#2C5282",
      contrastText: "#ffffff",
    },
    error: {
      main: "#E53E3E", // Adjusted red for better harmony
      light: "#FFF5F5",
      dark: "#C53030",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#D69E2E", // Adjusted yellow for better harmony
      light: "#FFFFF0",
      dark: "#B7791F",
      contrastText: "#ffffff",
    },
    grey: {
      100: "#F7FAFC",
      200: "#EDF2F7",
      300: "#E2E8F0",
      400: "#CBD5E0",
      500: "#A0AEC0",
      600: "#718096",
    },
    text: {
      primary: "#1A202C",
      secondary: "#4A5568",
    },
    action: {
      disabledBackground: "rgba(203, 213, 224, 0.12)",
      hoverOpacity: 0.04,
      hover: "#F7FAFC",
    },
    divider: "#E2E8F0",
    background: {
      default: "#F7FAFC",
      paper: "#FFFFFF",
    },
  },

  typography: {
    fontFamily: dm.style.fontFamily,
    h1: {
      fontWeight: 500,
      fontSize: "1.875rem",
      lineHeight: "1.5",
    },
    h2: {
      fontWeight: 500,
      fontSize: "1.5rem",
      lineHeight: "1.5",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.3125rem",
      lineHeight: "1.5",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.125rem",
      lineHeight: "1.5",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: "1.5",
    },
    h6: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    button: {
      textTransform: "none",
      fontWeight: "400",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: "400",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: "400",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ".MuiPaper-elevation9, .MuiPopover-root .MuiPaper-elevation": {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        },
        a: {
          textDecoration: "none",
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
        },
        title: {
          fontSize: "1.125rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "0",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E2E8F0",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledSuccess: {
          color: "white",
        },
        filledInfo: {
          color: "white",
        },
        filledError: {
          color: "white",
        },
        filledWarning: {
          color: "white",
        },
        standardSuccess: {
          backgroundColor: "#F0FFF4",
          color: "#38A169",
        },
        standardError: {
          backgroundColor: "#FFF5F5",
          color: "#E53E3E",
        },
        standardWarning: {
          backgroundColor: "#FFFFF0",
          color: "#D69E2E",
        },
        standardInfo: {
          backgroundColor: "#EBF8FF",
          color: "#3182CE",
        },
        outlinedSuccess: {
          borderColor: "#38A169",
          color: "#38A169",
        },
        outlinedWarning: {
          borderColor: "#D69E2E",
          color: "#D69E2E",
        },
        outlinedError: {
          borderColor: "#E53E3E",
          color: "#E53E3E",
        },
        outlinedInfo: {
          borderColor: "#3182CE",
          color: "#3182CE",
        },
      },
    },
  },
})

export { baselightTheme }

