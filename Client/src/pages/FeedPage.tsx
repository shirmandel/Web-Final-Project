import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { postService, type Post } from "../services/post.service";
import PostCard from "../components/PostCard";

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadPosts = useCallback(
    async (pageNum: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await postService.getAll(pageNum, 10);
        setPosts((prev) =>
          pageNum === 1 ? data.posts : [...prev, ...data.posts],
        );
        setHasMore(pageNum < data.totalPages);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  const searchPosts = useCallback(
    async (query: string, pageNum: number) => {
      if (searchLoading) return;
      setSearchLoading(true);
      try {
        const data = await postService.search(query, pageNum, 10);
        setPosts((prev) =>
          pageNum === 1 ? data.posts : [...prev, ...data.posts],
        );
        setHasMore(pageNum < data.totalPages);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchLoading],
  );

  useEffect(() => {
    loadPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      if (activeSearch) {
        setActiveSearch("");
        setPage(1);
        setPosts([]);
        loadPosts(1);
      }
      return;
    }
    setActiveSearch(trimmed);
    setPage(1);
    setPosts([]);
    searchPosts(trimmed, 1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
    setPosts([]);
    loadPosts(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || searchLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => {
            const nextPage = prev + 1;
            if (activeSearch) {
              searchPosts(activeSearch, nextPage);
            } else {
              loadPosts(nextPage);
            }
            return nextPage;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, searchLoading, hasMore, loadPosts, searchPosts, activeSearch],
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await postService.delete(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography
        variant="h5"
        fontWeight={700}
        sx={(theme) => ({
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        })}
      >
        Feed
      </Typography>

      <TextField
        fullWidth
        placeholder='Try "posts about food from last week"'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: 2,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch} edge="end" aria-label="search">
                <SearchIcon color="primary" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {activeSearch && (
        <Box mb={2}>
          <Chip
            label={`Search: "${activeSearch}"`}
            onDelete={handleClearSearch}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      {posts.length === 0 && !loading && !searchLoading && (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          {activeSearch
            ? "No posts found for your search."
            : "No posts yet. Be the first to share something! ✨"}
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

      {(loading || searchLoading) && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default FeedPage;
