import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Button, Paper } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import type { User } from "../services/auth.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ProfileHeaderProps {
  profile: User;
  postsCount: number;
  isOwnProfile: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  postsCount,
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
      sx={{
        p: 4,
        mb: 3,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Avatar
          src={getImageUrl(profile.profileImage)}
          sx={{
            width: 120,
            height: 120,
            flexShrink: 0,
            border: "3px solid",
            borderColor: "primary.main",
            fontSize: 48,
          }}
        >
          {profile.username?.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} mb={1}>
            {profile.username}
          </Typography>

          <Box sx={{ display: "flex", gap: 3, mb: 1 }}>
            <Typography variant="body1">
              <strong>{postsCount}</strong> posts
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>

        {isOwnProfile && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate("/edit-profile")}
            sx={{ flexShrink: 0, alignSelf: "flex-start" }}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileHeader;
