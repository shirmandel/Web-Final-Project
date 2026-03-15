import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import type { User } from "../services/auth.service";
import { Edit as EditIcon } from "@mui/icons-material";
import { userService } from "../services/user.service";
import { postService, type Post } from "../services/post.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const [profileData, postsData] = await Promise.all([
          userService.getById(id),
          postService.getByUser(id, 1, 50),
        ]);
        setProfile(profileData);
        setPosts(postsData.posts);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postService.delete(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography>User not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Paper
        sx={{
          p: 4,
          mb: 3,
          textAlign: "center",
          background: "rgba(243, 243, 249, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <Avatar
          src={getImageUrl(profile.profileImage)}
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
          {profile.username?.charAt(0).toUpperCase()}
        </Avatar>

        <Typography variant="h5" fontWeight={700}>
          {profile.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {profile.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {posts.length} posts
        </Typography>

        {isOwnProfile && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate("/edit-profile")}
            sx={{ mt: 2 }}
          >
            Edit Profile
          </Button>
        )}
      </Paper>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Posts
        </Typography>
      </Divider>

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDelete={handleDelete} />
      ))}

      {posts.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={2}>
          No posts yet.
        </Typography>
      )}
    </Container>
  );
};

export default ProfilePage;
