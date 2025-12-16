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
      main: "#172E4E", // Dark Navy Blue - Main brand color
      light: "#2A4A73", // Lighter navy
      dark: "#0D1A2D", // Darker navy
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#58769C", // Soft Blue - Secondary actions
      light: "#7B92B3", // Lighter soft blue
      dark: "#3F5775", // Darker soft blue
      contrastText: "#ffffff",
    },
    success: {
      main: "#58769C",
      light: "#EDF5F0",
      dark: "#3F5775",
      contrastText: "#ffffff",
    },
    info: {
      main: "#58769C",
      light: "#EBF2F9",
      dark: "#3F5775",
      contrastText: "#ffffff",
    },
    error: {
      main: "#C97064",
      light: "#FCF2F1",
      dark: "#A35A4F",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#D6B99B",
      light: "#FBF7F3",
      dark: "#B89A7E",
      contrastText: "#172E4E",
    },
    grey: {
      100: "#EDD5B9", // Warm Cream
      200: "#E5CFAF",
      300: "#D3C3B3", // Warm Gray
      400: "#C0B3A5",
      500: "#A89988",
      600: "#8A7D6F",
    },
    text: {
      primary: "#172E4E", // Dark navy for text
      secondary: "#58769C", // Soft blue for secondary text
    },
    action: {
      disabledBackground: "rgba(211, 195, 179, 0.12)",
      hoverOpacity: 0.08,
      hover: "#EDD5B9",
    },
    divider: "#D3C3B3",
    background: {
      // default: "#EDD5B9", // Warm Cream background
      default: "#fef6e9",
      // paper: "#fef6e9", // White for cards
      paper: "#ffffff", // White for cards
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
          boxShadow: "0px 4px 20px rgba(23, 46, 78, 0.08)",
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
          boxShadow: "0px 4px 20px rgba(23, 46, 78, 0.08)",
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
          borderBottom: "1px solid #D3C3B3",
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
          backgroundColor: "#EDF5F0",
          color: "#58769C",
        },
        standardError: {
          backgroundColor: "#FCF2F1",
          color: "#C97064",
        },
        standardWarning: {
          backgroundColor: "#FBF7F3",
          color: "#D6B99B",
        },
        standardInfo: {
          backgroundColor: "#EBF2F9",
          color: "#58769C",
        },
        outlinedSuccess: {
          borderColor: "#58769C",
          color: "#58769C",
        },
        outlinedWarning: {
          borderColor: "#D6B99B",
          color: "#D6B99B",
        },
        outlinedError: {
          borderColor: "#C97064",
          color: "#C97064",
        },
        outlinedInfo: {
          borderColor: "#58769C",
          color: "#58769C",
        },
      },
    },
  },
})

export { baselightTheme }
