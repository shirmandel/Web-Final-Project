import React from "react";
import { Box, Typography } from "@mui/material";
import { Favorite as HeartIcon, ModeComment as CommentIcon } from "@mui/icons-material";
import type { Post } from "../services/post.service";
import { API_URL } from "../config";

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath}`;
};

interface ProfileGridPostProps {
  post: Post;
  onClick: () => void;
}

const ProfileGridPost: React.FC<ProfileGridPostProps> = ({ post, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        aspectRatio: "1 / 1",
        cursor: "pointer",
        position: "relative",
        borderRadius: { xs: 0, sm: "12px" },
        overflow: "hidden",
        bgcolor: "rgba(18,153,144,0.06)",
        border: { sm: "1px solid rgba(144,209,202,0.3)" },
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: { sm: "translateY(-4px)" },
          boxShadow: { sm: "0 8px 24px rgba(18, 153, 144, 0.15)" },
        },
        "&:hover .hover-overlay": { opacity: 1 },
      }}
    >
      {post.image ? (
        <img
          src={getImageUrl(post.image)}
          alt="Post snippet"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            p: { xs: 1.5, sm: 3 },
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: { xs: 3, sm: 5 },
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "text.primary",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.95rem" },
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {post.text}
          </Typography>
        </Box>
      )}

      <Box
        className="hover-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.45)",
          opacity: 0,
          transition: "opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 2, sm: 3 },
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <HeartIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
          <Typography variant="body1" fontWeight={800} sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
            {post.likesCount || 0}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <CommentIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
          <Typography variant="body1" fontWeight={800} sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
            {post.commentsCount || 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileGridPost;
