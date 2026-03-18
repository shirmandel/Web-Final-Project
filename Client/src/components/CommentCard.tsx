import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  IconButton,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { type Comment } from "../services/comment.service";
import { API_URL } from "../config";

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUserId,
  onDelete,
}) => {
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const isOwner = currentUserId === comment.owner._id;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        background: "rgba(240,250,249,0.6)",
        border: "1px solid rgba(200,232,229,0.5)",
        borderRadius: "12px",
        boxShadow: "none",
        "&:hover": {
          background: "rgba(240,250,249,0.9)",
          transform: "none",
          boxShadow: "none",
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={getImageUrl(comment.owner.profileImage)}
            sx={{
              width: 30,
              height: 30,
              fontSize: "0.8rem",
              border: "1.5px solid",
              borderColor: "primary.light",
            }}
          >
            {comment.owner.username?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography variant="caption" fontWeight={700} color="text.primary">
            {comment.owner.username}
          </Typography>
        }
        subheader={
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.68rem" }}
          >
            {new Date(comment.createdAt).toLocaleDateString()}
          </Typography>
        }
        action={
          isOwner ? (
            <IconButton
              size="small"
              onClick={() => onDelete(comment._id)}
              sx={{
                color: "text.secondary",
                mt: 0.25,
                "&:hover": {
                  color: "error.main",
                  bgcolor: "rgba(211,47,47,0.08)",
                  transform: "scale(1.1)",
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: "0.95rem" }} />
            </IconButton>
          ) : null
        }
        sx={{ pb: 0.5, pt: 1.5, px: 1.5 }}
      />
      <CardContent sx={{ pt: 0, pb: "10px !important", px: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ fontSize: "0.85rem", lineHeight: 1.55 }}
        >
          {comment.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CommentCard;
