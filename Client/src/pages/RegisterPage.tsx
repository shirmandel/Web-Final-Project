import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Divider,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !username || !password || !confirmPassword) {
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
      await register(email, username, password, profileImage ?? undefined);
      navigate("/");
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          maxWidth: 440,
          width: "100%",
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(200, 232, 229, 0.7)",
          borderRadius: "20px",
          boxShadow:
            "0 12px 48px rgba(13, 53, 51, 0.1), 0 2px 12px rgba(0,0,0,0.04)",
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
            fontSize: { xs: "1.75rem", sm: "2rem" },
            letterSpacing: "-0.03em",
          })}
        >
          Create account
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3.5, fontSize: "0.88rem" }}
        >
          Join InstaVibe and start sharing
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

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Box
              sx={{
                borderRadius: "50%",
                p: "3px",
                background: "linear-gradient(135deg, #129990, #096B68)",
                display: "inline-block",
                boxShadow: "0 4px 16px rgba(18, 153, 144, 0.3)",
              }}
            >
              <Avatar
                src={profilePreview ?? undefined}
                sx={{
                  width: 80,
                  height: 80,
                  border: "3px solid white",
                  fontSize: "1.8rem",
                }}
              >
                {!profilePreview && username ? username[0].toUpperCase() : null}
              </Avatar>
            </Box>
            <Tooltip title="Upload profile picture">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  width: 26,
                  height: 26,
                  border: "2px solid white",
                }}
              >
                <AddAPhotoIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            id="register-email"
          />
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            id="register-username"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            helperText="At least 6 characters"
            id="register-password"
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            id="register-confirm-password"
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
              borderRadius: "12px",
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

        <Divider sx={{ my: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              px: 1,
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            OR
          </Typography>
        </Divider>

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
              color: "primary.main",
              cursor: "pointer",
              fontWeight: 700,
              "&:hover": { textDecoration: "underline" },
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
