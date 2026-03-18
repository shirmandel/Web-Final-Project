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
      default: "#F0FAF9",
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
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 14,
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
            borderRadius: 12,
            transition: "box-shadow 0.2s ease",
            "& fieldset": {
              borderColor: "#90D1CA",
            },
            "&:hover fieldset": {
              borderColor: "#129990",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#096B68",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(18, 153, 144, 0.12)",
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
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #129990 0%, #096B68 100%)",
          boxShadow: "0 4px 14px rgba(18, 153, 144, 0.35)",
          color: "#FFFFFF",
          "&:hover": {
            background: "linear-gradient(135deg, #0db8ad 0%, #129990 100%)",
            boxShadow: "0 6px 20px rgba(18, 153, 144, 0.45)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        containedSecondary: {
          background: "#096B68",
          boxShadow: "0 4px 14px rgba(9, 107, 104, 0.35)",
          color: "#FFFFFF",
          "&:hover": {
            background: "#064845",
            boxShadow: "0 6px 20px rgba(9, 107, 104, 0.45)",
            transform: "translateY(-1px)",
          },
        },
        outlinedPrimary: {
          borderColor: "#90D1CA",
          color: "#096B68",
          "&:hover": {
            borderColor: "#129990",
            backgroundColor: "rgba(18, 153, 144, 0.06)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#0D3533",
          boxShadow: "0 1px 0 rgba(18, 153, 144, 0.12), 0 4px 24px rgba(0,0,0,0.04)",
          borderBottom: "1px solid rgba(144, 209, 202, 0.3)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(200, 232, 229, 0.8)",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(13, 53, 51, 0.06)",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 32px rgba(13, 53, 51, 0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 12px rgba(13, 53, 51, 0.07)",
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
        standardSuccess: {
          backgroundColor: "#E6F7F5",
          color: "#096B68",
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
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
        colorPrimary: {
          backgroundColor: "rgba(18, 153, 144, 0.12)",
          color: "#096B68",
          border: "1px solid rgba(18, 153, 144, 0.2)",
        },
        outlinedPrimary: {
          borderColor: "#90D1CA",
          color: "#096B68",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #129990 0%, #096B68 100%)",
          fontWeight: 700,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s ease, transform 0.15s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: "0.75rem",
          backgroundColor: "#0D3533",
          padding: "5px 10px",
        },
      },
    },
  },
});

export default theme;
