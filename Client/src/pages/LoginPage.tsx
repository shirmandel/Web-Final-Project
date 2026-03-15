import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #EDE9FE 0%, #F0F9FF 30%, #ECFDF5 60%, #FDF4FF 100%)",
        position: "relative",
        overflow: "hidden",
        p: 2,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-15%",
          left: "-8%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-12%",
          right: "-5%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "40%",
          right: "15%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, sm: 5 },
          maxWidth: 440,
          width: "100%",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(124, 58, 237, 0.08)",
          borderRadius: 3,
          boxShadow:
            "0 8px 40px rgba(124, 58, 237, 0.08), 0 2px 12px rgba(0,0,0,0.04)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={(theme) => ({
            mb: 0.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            letterSpacing: "-0.02em",
          })}
        >
          Sign In
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Welcome back! Sign in to continue.
        </Typography>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ mb: 2.5 }}
            id="login-error-alert"
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            id="login-email"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            id="login-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: "1rem",
              position: "relative",
            }}
            id="login-submit"
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1, fontSize: "0.7rem", letterSpacing: "0.05em" }}
          >
            OR
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleLogin}
          sx={{
            py: 1.3,
            mb: 3,
            borderColor: "#E2E8F0",
            color: "text.primary",
            borderRadius: "10px",
            fontSize: "0.9rem",
            backgroundColor: "#FFFFFF",
            "&:hover": {
              borderColor: "#A78BFA",
              backgroundColor: "#FAFAFF",
            },
          }}
          id="login-google"
        >
          <Box
            component="img"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            sx={{ width: 20, height: 20, mr: 1.5 }}
          />
          Continue with Google
        </Button>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ fontSize: "0.85rem" }}
        >
          Don't have an account?{" "}
          <Box
            component="span"
            onClick={() => navigate("/register")}
            sx={{
              color: "primary.main",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign Up
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
