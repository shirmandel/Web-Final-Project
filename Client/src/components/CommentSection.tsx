import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { type Comment } from "../services/comment.service";
import CommentCard from "./CommentCard";

interface CommentSectionProps {
  comments: Comment[];
  currentUserId?: string;
  submitting: boolean;
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUserId,
  submitting,
  onAddComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    await onAddComment(newComment);
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(200,232,229,0.8)",
        borderRadius: "16px",
        p: 2.5,
        boxShadow: "0 4px 24px rgba(13,53,51,0.07)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Comments
        </Typography>
        <Chip
          label={comments.length}
          size="small"
          color="primary"
          sx={{ fontWeight: 700, height: 22, fontSize: "0.72rem" }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2.5,
          p: 1,
          background: "rgba(240,250,249,0.8)",
          borderRadius: "14px",
          border: "1px solid rgba(144,209,202,0.4)",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          id="comment-input"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              background: "white",
              fontSize: "0.88rem",
            },
          }}
        />
        <IconButton
          onClick={handleSubmit}
          disabled={submitting || !newComment.trim()}
          id="comment-submit"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "10px",
            width: 40,
            height: 40,
            alignSelf: "center",
            flexShrink: 0,
            "&:hover": { bgcolor: "primary.dark", transform: "scale(1.08)" },
            "&:disabled": { bgcolor: "rgba(0,0,0,0.1)" },
          }}
        >
          {submitting ? (
            <CircularProgress size={16} sx={{ color: "white" }} />
          ) : (
            <SendIcon sx={{ fontSize: "1rem" }} />
          )}
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ maxHeight: "65vh", overflowY: "auto", pr: 0.5 }}>
        {comments.map((comment) => (
          <CommentCard
            key={comment._id}
            comment={comment}
            currentUserId={currentUserId}
            onDelete={onDeleteComment}
          />
        ))}

        {comments.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h4" sx={{ fontSize: "1.8rem", mb: 1 }}>
              💬
            </Typography>
            <Typography color="text.secondary" fontSize="0.9rem">
              No comments yet. Be the first!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentSection;
