import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import ProfileHeader from "../components/ProfileHeader";
import ProfileGridPost from "../components/ProfileGridPost";
import { useAuth } from "../context/AuthContext";
import type { User } from "../services/auth.service";
import { userService } from "../services/user.service";
import { postService, type Post } from "../services/post.service";

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ProfileHeader
        profile={profile}
        posts={posts}
        isOwnProfile={isOwnProfile}
      />

      <Box sx={{ width: "100%", mx: "auto" }}>
        <Divider sx={{ mb: 3 }}>
          <Chip
            label="Posts grid"
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: "rgba(18,153,144,0.1)",
              color: "primary.dark",
              border: "1px solid rgba(18,153,144,0.2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.65rem",
            }}
          />
        </Divider>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: { xs: 0.5, sm: 2 },
          }}
        >
          {posts.map((post) => (
            <ProfileGridPost
              key={post._id}
              post={post}
              onClick={() => navigate(`/post/${post._id}`)}
            />
          ))}
        </Box>

        {posts.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              borderRadius: 3,
              background: "rgba(255,255,255,0.6)",
              border: "1.5px dashed rgba(144,209,202,0.5)",
              mt: 2,
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
      </Box>
    </Container>
  );
};

export default ProfilePage;
