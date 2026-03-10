import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      console.log("Register submitted:", { name, email, password });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // TODO: replace with actual API call
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {};

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
      {/* Background blobs */}
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
          sx={{
            mb: 0.5,
            background: "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            letterSpacing: "-0.02em",
          }}
        >
          InstaVibe
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Create your account and get started.
        </Typography>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ mb: 2.5 }}
            id="register-error-alert"
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            id="register-name"
            autoComplete="name"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            id="register-email"
            autoComplete="email"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            id="register-password"
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "#94A3B8" }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            id="register-confirm-password"
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                      size="small"
                      sx={{ color: "#94A3B8" }}
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
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
            id="register-submit"
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Create Account"
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
          onClick={handleGoogleRegister}
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
          id="register-google"
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
          Already have an account?{" "}
          <Box
            component="span"
            onClick={() => navigate("/login")}
            sx={{
              color: "#7C3AED",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign In
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
