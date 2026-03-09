import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7C3AED",
      light: "#A78BFA",
      dark: "#5B21B6",
    },
    secondary: {
      main: "#06B6D4",
      light: "#22D3EE",
      dark: "#0891B2",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    error: {
      main: "#EF4444",
    },
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h4: {
      fontWeight: 800,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#F8FAFC",
            borderRadius: 10,
            "& fieldset": {
              borderColor: "#E2E8F0",
            },
            "&:hover fieldset": {
              borderColor: "#A78BFA",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#7C3AED",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#94A3B8",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#7C3AED",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background:
            "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #06B6D4 100%)",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
          borderRadius: 10,
          color: "#FFFFFF",
          "&:hover": {
            background:
              "linear-gradient(135deg, #6D28D9 0%, #9333EA 50%, #0891B2 100%)",
            boxShadow: "0 6px 28px rgba(124, 58, 237, 0.45)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardError: {
          backgroundColor: "#FEF2F2",
          color: "#DC2626",
          borderRadius: 10,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E2E8F0",
        },
      },
    },
  },
});

export default theme;
