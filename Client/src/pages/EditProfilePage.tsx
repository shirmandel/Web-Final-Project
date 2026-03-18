import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Alert,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/user.service";
import { API_URL } from "../config";

const EditProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (!user?.profileImage) return "";
    if (user.profileImage.startsWith("http")) return user.profileImage;
    return `${API_URL}${user.profileImage}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      if (image) formData.append("image", image);

      const updatedUser = await userService.update(user._id, formData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate(`/profile/${user._id}`), 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={(theme) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          })}
        >
          Edit Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Update your profile information
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(200, 232, 229, 0.8)",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(13, 53, 51, 0.07)",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} textAlign="center">
          <Box
            sx={{
              display: "inline-flex",
              justifyContent: "center",
              mb: 0.5,
              borderRadius: "50%",
              p: "3px",
              background: "linear-gradient(135deg, #129990, #096B68)",
              boxShadow: "0 4px 18px rgba(18, 153, 144, 0.3)",
            }}
          >
            <Avatar
              src={getImageUrl()}
              sx={{
                width: 96,
                height: 96,
                border: "3px solid white",
                fontSize: "2.2rem",
              }}
            >
              {username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          <Box>
            <Button
              component="label"
              variant="text"
              startIcon={<UploadIcon />}
              size="small"
              sx={{
                mb: 2,
                mt: 1,
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.82rem",
              }}
            >
              Change Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
          </Box>

          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            sx={{ textAlign: "left" }}
          />

          <TextField
            label="Email"
            fullWidth
            value={user?.email || ""}
            margin="normal"
            disabled
            helperText="Email cannot be changed"
            sx={{ textAlign: "left" }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2, py: 1.4, borderRadius: "12px" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;
