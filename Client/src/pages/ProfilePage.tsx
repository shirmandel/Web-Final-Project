import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Divider,
  ImageList,
  ImageListItem,
  Dialog,
} from "@mui/material";
import {
  GridView as GridViewIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as CommentIcon,
} from "@mui/icons-material";
import PostCard from "../components/PostCard";
import ProfileHeader from "../components/ProfileHeader";
import { useAuth } from "../context/AuthContext";
import type { User } from "../services/auth.service";
import { userService } from "../services/user.service";
import { postService, type Post } from "../services/post.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
    <Container maxWidth="md" sx={{ py: 3 }}>
      <ProfileHeader
        profile={profile}
        postsCount={posts.length}
        isOwnProfile={isOwnProfile}
      />

      <Divider sx={{ mb: 3 }}>
        <GridViewIcon sx={{ fontSize: 20, color: "text.secondary" }} />
      </Divider>

      {posts.length > 0 ? (
        <ImageList cols={3} gap={3} sx={{ m: 0 }}>
          {posts.map((post) => (
            <ImageListItem
              key={post._id}
              onClick={() => setSelectedPost(post)}
              sx={{
                cursor: "pointer",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                position: "relative",
                "&:hover .overlay": {
                  opacity: 1,
                },
              }}
            >
              <img
                src={getImageUrl(post.image)}
                alt={post.text || "post"}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0, 0, 0, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FavoriteIcon sx={{ color: "#fff", fontSize: 20 }} />
                  <Typography fontWeight={700} color="#fff" fontSize={14}>
                    {post.likesCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CommentIcon sx={{ color: "#fff", fontSize: 20 }} />
                  <Typography fontWeight={700} color="#fff" fontSize={14}>
                    {post.commentsCount}
                  </Typography>
                </Box>
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Typography color="text.secondary" textAlign="center" mt={2}>
          No posts yet.
        </Typography>
      )}

      <Dialog
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: "transparent", boxShadow: "none" } }}
      >
        {selectedPost && (
          <PostCard
            post={selectedPost}
            onDelete={(id) => {
              handleDelete(id);
              setSelectedPost(null);
            }}
          />
        )}
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
