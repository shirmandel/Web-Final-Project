import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import { postService } from "../services/post.service";

const CreatePostPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await postService.create(formData);
      navigate("/");
    } catch {
      setError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Create Post
      </Typography>

      <Paper
        sx={{
          p: 3,
          background: "background.paper",
          backdropFilter: "blur(20px)",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            id="post-title"
          />
          <TextField
            label="What's on your mind?"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
            id="post-content"
          />

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{ mt: 2, mb: 2 }}
            fullWidth
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>

          {imagePreview && (
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  borderRadius: 12,
                  objectFit: "cover",
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
            sx={{ mt: 1 }}
            id="post-submit"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePostPage;
