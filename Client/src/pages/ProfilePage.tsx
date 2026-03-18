import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import PostCard from "../components/PostCard";
import ProfileHeader from "../components/ProfileHeader";
import { useAuth } from "../context/AuthContext";
import type { User } from "../services/auth.service";
import { userService } from "../services/user.service";
import { postService, type Post } from "../services/post.service";

const ProfilePage: React.FC = () => {
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
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
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
      <ProfileHeader
        profile={profile}
        posts={posts}
        isOwnProfile={isOwnProfile}
      />

      <Divider sx={{ mb: 3 }}>
        <Chip
          label="Posts"
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: "rgba(18,153,144,0.1)",
            color: "primary.dark",
            border: "1px solid rgba(18,153,144,0.2)",
          }}
        />
      </Divider>

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDelete={handleDelete} />
      ))}

      {posts.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.6)",
            border: "1.5px dashed rgba(144,209,202,0.5)",
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontSize: "2rem" }}>
            📝
          </Typography>
          <Typography color="text.secondary" fontWeight={500}>
            No posts yet.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage;
