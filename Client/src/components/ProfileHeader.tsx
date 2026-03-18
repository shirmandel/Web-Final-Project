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
import { API_URL } from "../config";

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
        mb: 4,
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(200, 232, 229, 0.8)",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(13, 53, 51, 0.08)",
        p: { xs: 3, sm: 4 },
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(135deg, #129990, #096B68)",
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: { xs: 2.5, sm: 4 },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            borderRadius: "50%",
            p: "4px",
            background: "linear-gradient(135deg, #129990, #096B68)",
            boxShadow: "0 4px 24px rgba(18, 153, 144, 0.25)",
          }}
        >
          <Avatar
            src={getImageUrl(profile.profileImage)}
            sx={{
              width: 100,
              height: 100,
              border: "4px solid white",
              fontSize: "2.5rem",
              background: "linear-gradient(135deg, #129990, #096B68)",
            }}
          >
            {profile.username?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.25 }}>
            {profile.username}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
            {profile.email}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" }, mt: 1 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(18,153,144,0.06)",
                border: "1px solid rgba(18,153,144,0.15)",
                px: 2,
                py: 0.75,
                borderRadius: "12px",
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
                {posts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ lineHeight: 1 }}>
                POSTS
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}>
          {isOwnProfile && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate("/edit-profile")}
              size="small"
              sx={{
                borderRadius: "20px",
                px: 3,
                py: 0.8,
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
      </Box>
    </Paper>
  );
};

export default ProfileHeader;
