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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Edit Profile
      </Typography>

      <Paper
        sx={{
          p: 3,
          background: "rgba(18, 18, 26, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
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
          <Avatar
            src={getImageUrl()}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              border: "3px solid",
              borderColor: "primary.main",
              fontSize: 40,
            }}
          >
            {username?.charAt(0).toUpperCase()}
          </Avatar>

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{ mb: 3 }}
          >
            Change Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>

          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            label="Email"
            fullWidth
            value={user?.email || ""}
            margin="normal"
            disabled
            helperText="Email cannot be changed"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;
