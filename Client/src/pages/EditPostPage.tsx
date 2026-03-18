import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { AddPhotoAlternate as PhotoIcon } from "@mui/icons-material";
import { postService } from "../services/post.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const post = await postService.getById(id);
        setText(post.text);
        if (post.image) {
          const url = post.image.startsWith("http")
            ? post.image
            : `${API_URL}${post.image}`;
          setImagePreview(url);
        }
      } catch {
        setError("Failed to load post.");
      } finally {
        setFetching(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");

    if (!text.trim()) {
      setError("Text content is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      await postService.update(id, formData);
      navigate("/");
    } catch {
      setError("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {/* Heading */}
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
          Edit Post
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Update your post below
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

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Post Text"
            fullWidth
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            margin="normal"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />

          {/* Drop zone style upload */}
          <Box
            component="label"
            htmlFor="edit-image-input"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
              mb: 2,
              py: 2.5,
              border: "2px dashed",
              borderColor: imagePreview ? "primary.main" : "rgba(144,209,202,0.7)",
              borderRadius: "14px",
              background: imagePreview
                ? "rgba(18,153,144,0.04)"
                : "rgba(240,250,249,0.5)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                background: "rgba(18,153,144,0.06)",
              },
            }}
          >
            <PhotoIcon sx={{ fontSize: "2rem", color: "primary.light", mb: 0.75 }} />
            <Typography variant="body2" fontWeight={600} color="primary.dark">
              {image ? `📎 ${image.name}` : "Click to change image"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
              PNG, JPG, WEBP supported
            </Typography>
            <input
              id="edit-image-input"
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Box>

          {imagePreview && (
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 280,
                  borderRadius: 12,
                  objectFit: "cover",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                }}
              />
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 1, py: 1.4, borderRadius: "12px" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditPostPage;
