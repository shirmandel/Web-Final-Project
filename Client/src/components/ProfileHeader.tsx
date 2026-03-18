import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import type { User } from "../services/auth.service";
import type { Post } from "../services/post.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ProfileHeaderProps {
  profile: User;
  posts: Post[];
  isOwnProfile: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  posts,
  isOwnProfile,
}) => {
  const navigate = useNavigate();

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(200, 232, 229, 0.8)",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(13, 53, 51, 0.08)",
      }}
    >
      <Box
        sx={{
          height: 110,
          background:
            "linear-gradient(135deg, #129990 0%, #096B68 60%, #064845 100%)",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)",
          }}
        />
      </Box>

      <Box sx={{ px: 3, pb: 3, textAlign: "center" }}>
        <Box sx={{ mt: "-50px", mb: 1.5, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              borderRadius: "50%",
              p: "3px",
              background: "linear-gradient(135deg, #129990, #096B68)",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(18, 153, 144, 0.35)",
            }}
          >
            <Avatar
              src={getImageUrl(profile.profileImage)}
              sx={{
                width: 88,
                height: 88,
                border: "3px solid white",
                fontSize: "2rem",
                background: "linear-gradient(135deg, #129990, #096B68)",
              }}
            >
              {profile.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Box>

        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.25 }}>
          {profile.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {profile.email}
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              {posts.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Posts
            </Typography>
          </Box>
        </Box>

        {isOwnProfile && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate("/edit-profile")}
            size="small"
            sx={{
              borderRadius: "20px",
              px: 2.5,
              borderColor: "primary.main",
              color: "primary.dark",
              fontWeight: 700,
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "rgba(18, 153, 144, 0.06)",
              },
            }}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileHeader;
