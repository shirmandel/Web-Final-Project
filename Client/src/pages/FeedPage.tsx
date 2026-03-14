import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { postService, type Post } from '../services/post.service';
import PostCard from '../components/PostCard';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadPosts = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await postService.getAll(pageNum, 10);
      setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadPosts(1);
  }, []);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadPosts(nextPage);
            return nextPage;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadPosts]
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.delete(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #E040FB, #00E5FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Feed
      </Typography>

      {posts.length === 0 && !loading && (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No posts yet. Be the first to share something! ✨
        </Typography>
      )}

      {posts.map((post, index) => (
        <Box
          key={post._id}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
        >
          <PostCard post={post} onDelete={handleDelete} />
        </Box>
      ))}

      {loading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default FeedPage;
