import { createTheme } from "@mui/material/styles";

// Palette
// #FFFBDE – warm cream     → page background
// #90D1CA – soft teal      → primary light
// #129990 – medium teal    → primary main
// #096B68 – deep teal      → primary dark

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#129990",
      light: "#90D1CA",
      dark: "#096B68",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#096B68",
      light: "#129990",
      dark: "#064845",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#90D1CA",
      light: "#B8E5E1",
      dark: "#129990",
    },
    error: {
      main: "#D32F2F",
    },
    background: {
      default: "#FFFBDE",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0D3533",
      secondary: "#3A6B68",
    },
    divider: "#C8E8E5",
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
            backgroundColor: "#FFFFFF",
            borderRadius: 10,
            "& fieldset": {
              borderColor: "#90D1CA",
            },
            "&:hover fieldset": {
              borderColor: "#129990",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#096B68",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#3A6B68",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#096B68",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background:
            "linear-gradient(135deg, #129990 0%, #096B68 100%)",
          boxShadow: "0 4px 16px rgba(18, 153, 144, 0.35)",
          borderRadius: 10,
          color: "#FFFFFF",
          "&:hover": {
            background:
              "linear-gradient(135deg, #096B68 0%, #064845 100%)",
            boxShadow: "0 6px 24px rgba(18, 153, 144, 0.45)",
          },
        },
        containedSecondary: {
          background: "#096B68",
          boxShadow: "0 4px 16px rgba(9, 107, 104, 0.35)",
          borderRadius: 10,
          color: "#FFFFFF",
          "&:hover": {
            background: "#064845",
            boxShadow: "0 6px 24px rgba(9, 107, 104, 0.45)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #129990 0%, #096B68 100%)",
          color: "#FFFFFF",
          boxShadow: "0 2px 12px rgba(18, 153, 144, 0.3)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #C8E8E5",
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
          backgroundColor: "#FFE8E8",
          color: "#D32F2F",
          borderRadius: 10,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#C8E8E5",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: "#90D1CA",
        },
      },
    },
  },
});

export default theme;
