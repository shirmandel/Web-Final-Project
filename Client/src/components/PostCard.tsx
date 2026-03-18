import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { type Post } from "../services/post.service";
import { likeService } from "../services/like.service";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeAnim, setLikeAnim] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const status = await likeService.getStatus(post._id);
        setLiked(status.liked);
      } catch {
        throw new Error("error checking like status");
      }
    };
    checkLikeStatus();
  }, [post._id]);

  const handleLike = async () => {
    try {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 350);
      const result = await likeService.toggle(post._id);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch {
      throw new Error("error liking post");
    }
  };

  const isOwner = user?._id === post.owner._id;
  const timeAgo = getTimeAgo(post.createdAt);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <Card sx={{ mb: 2.5, overflow: "hidden" }}>
      <CardHeader
        avatar={
          <Avatar
            src={getImageUrl(post.owner.profileImage)}
            onClick={() => navigate(`/profile/${post.owner._id}`)}
            sx={{
              cursor: "pointer",
              width: 40,
              height: 40,
              border: "2px solid",
              borderColor: "primary.light",
              transition: "box-shadow 0.2s ease",
              "&:hover": { boxShadow: "0 0 0 3px rgba(18, 153, 144, 0.25)" },
            }}
          >
            {post.owner.username?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography
            variant="subtitle2"
            fontWeight={700}
            onClick={() => navigate(`/profile/${post.owner._id}`)}
            sx={{
              cursor: "pointer",
              color: "text.primary",
              "&:hover": { color: "primary.main" },
              transition: "color 0.15s ease",
            }}
          >
            {post.owner.username}
          </Typography>
        }
        subheader={
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.72rem" }}
          >
            {timeAgo}
          </Typography>
        }
        action={
          isOwner ? (
            <Box sx={{ display: "flex", gap: 0.25, pt: 0.5, pr: 0.5 }}>
              <IconButton
                onClick={() => navigate(`/edit/${post._id}`)}
                size="small"
                sx={{
                  color: "text.secondary",
                  borderRadius: "8px",
                  "&:hover": {
                    bgcolor: "rgba(18,153,144,0.08)",
                    color: "primary.main",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => setDeleteDialogOpen(true)}
                size="small"
                sx={{
                  color: "text.secondary",
                  borderRadius: "8px",
                  "&:hover": {
                    bgcolor: "rgba(211,47,47,0.08)",
                    color: "error.main",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null
        }
        sx={{ pb: 1 }}
      />

      {post.image && (
        <CardMedia
          component="img"
          image={getImageUrl(post.image)}
          alt={post.text}
          sx={{
            maxHeight: 480,
            objectFit: "cover",
          }}
        />
      )}

      <CardContent sx={{ pb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            color: "text.primary",
            lineHeight: 1.65,
            fontSize: "0.92rem",
          }}
        >
          {post.text}
        </Typography>
      </CardContent>

      <Box sx={{ mx: 2, borderTop: "1px solid", borderColor: "divider" }} />

      <CardActions sx={{ px: 1.5, py: 1, gap: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={handleLike}
            size="small"
            sx={{
              color: liked ? "#E53935" : "text.secondary",
              transform: likeAnim ? "scale(1.4)" : "scale(1)",
              transition:
                "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(229,57,53,0.08)",
                transform: "scale(1.15)",
              },
              borderRadius: "8px",
            }}
          >
            {liked ? (
              <FavoriteIcon sx={{ fontSize: "1.2rem" }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: "1.2rem" }} />
            )}
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              color: liked ? "#E53935" : "text.secondary",
              fontWeight: liked ? 700 : 400,
              fontSize: "0.85rem",
              minWidth: 18,
              transition: "color 0.2s ease",
            }}
          >
            {likesCount}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
          <IconButton
            onClick={() => navigate(`/post/${post._id}`)}
            size="small"
            sx={{
              color: "text.secondary",
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "rgba(18,153,144,0.08)",
                color: "primary.main",
              },
            }}
          >
            <CommentIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.85rem", minWidth: 18 }}
          >
            {post.commentsCount}
          </Typography>
        </Box>
      </CardActions>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          setDeleteDialogOpen(false);
          onDelete?.(post._id);
        }}
      />
    </Card>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default PostCard;
