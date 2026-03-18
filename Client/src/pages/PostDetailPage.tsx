import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { postService, type Post } from "../services/post.service";
import { commentService, type Comment } from "../services/comment.service";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import CommentSection from "../components/CommentSection";

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
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

  const handleAddComment = async (text: string) => {
    if (!text.trim() || !id) return;
    setSubmitting(true);
    try {
      const comment = await commentService.create(id, text);
      setComments((prev) => [comment, ...prev]);
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

  const handleDeletePost = async (postId: string) => {
    try {
      await postService.delete(postId);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress
          size={36}
          thickness={4}
          sx={{ color: "primary.main" }}
        />
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        size="small"
        sx={{
          mb: 2.5,
          color: "text.secondary",
          borderRadius: "20px",
          px: 1.5,
          "&:hover": {
            bgcolor: "rgba(18,153,144,0.07)",
            color: "primary.main",
          },
        }}
      >
        Back
      </Button>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <Box sx={{ flex: "0 0 auto", width: { xs: "100%", md: "50%" } }}>
          <PostCard post={post} onDelete={handleDeletePost} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CommentSection
            comments={comments}
            currentUserId={user?._id}
            submitting={submitting}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default PostDetailPage;
