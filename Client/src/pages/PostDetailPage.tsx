import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { postService, type Post } from "../services/post.service";
import { commentService, type Comment } from "../services/comment.service";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [postData, commentsData] = await Promise.all([
          postService.getById(id),
          commentService.getByPost(id),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    setSubmitting(true);
    try {
      const comment = await commentService.create(id, newComment);
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (post) {
        setPost({
          ...post,
          commentsCount: Math.max(0, post.commentsCount - 1),
        });
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography>Post not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        Back
      </Button>

      <PostCard post={post} />

      <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
        Comments ({comments.length})
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          id="comment-input"
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={submitting || !newComment.trim()}
          id="comment-submit"
        >
          Post
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {comments.map((comment) => (
        <Card
          key={comment._id}
          sx={{ mb: 1.5, background: "background.default" }}
        >
          <CardHeader
            avatar={
              <Avatar
                src={getImageUrl(comment.owner.profileImage)}
                sx={{ width: 32, height: 32 }}
              >
                {comment.owner.username?.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={
              <Typography variant="subtitle2" fontWeight={600}>
                {comment.owner.username}
              </Typography>
            }
            subheader={
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.createdAt).toLocaleDateString()}
              </Typography>
            }
            action={
              user?._id === comment.owner._id ? (
                <IconButton
                  size="small"
                  onClick={() => handleDeleteComment(comment._id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ) : null
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="body2">{comment.content}</Typography>
          </CardContent>
        </Card>
      ))}

      {comments.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={2}>
          No comments yet. Be the first! 💬
        </Typography>
      )}
    </Container>
  );
};

export default PostDetailPage;
