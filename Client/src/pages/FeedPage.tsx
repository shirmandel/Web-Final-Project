import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Container,
} from "@mui/material";
import { postService, type Post } from "../services/post.service";
import PostCard from "../components/PostCard";
import SearchSidebar from "../components/SearchSidebar";

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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
          flexDirection: { xs: "column", md: "row-reverse" },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 370 },
            flexShrink: 0,
            display: { xs: "block", md: "block" },
            position: "sticky",
            top: 80,
          }}
        >
          <SearchSidebar
            searchQuery={searchQuery}
            activeSearch={activeSearch}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {posts.length === 0 && !loading && !searchLoading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                borderRadius: 3,
                background: "rgba(255,255,255,0.6)",
                border: "1.5px dashed rgba(144,209,202,0.5)",
              }}
            >
              <Typography variant="h4" sx={{ mb: 1, fontSize: "2.5rem" }}>
                {activeSearch ? "🔍" : "✨"}
              </Typography>
              <Typography color="text.secondary" fontWeight={500}>
                {activeSearch
                  ? "No posts found for your search."
                  : "No posts yet. Be the first to share something!"}
              </Typography>
            </Box>
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
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress
                size={32}
                thickness={4}
                sx={{ color: "primary.main" }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default FeedPage;
