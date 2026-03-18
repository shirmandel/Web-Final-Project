import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, CircularProgress, Typography, Container } from "@mui/material";
import { postService, type Post } from "../services/post.service";
import PostCard from "../components/PostCard";
import SearchSidebar from "../components/SearchSidebar";

const FeedPage: React.FC = () => {
  const LIMIT = 10;
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const observer = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (pageNum: number, search: string) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const data = search
        ? await postService.search(search, pageNum, LIMIT)
        : await postService.getAll(pageNum, LIMIT);

      setPosts((prev) => {
        if (pageNum === 1) return data.posts;

        const existingIds = new Set(prev.map((p) => p._id));
        const uniquePosts = data.posts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...uniquePosts];
      });

      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts(page, activeSearch);
  }, [page, activeSearch, fetchPosts]);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setActiveSearch(trimmed);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setActiveSearch("");
  };

  const bottomRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!node) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (
            entry.isIntersecting &&
            hasMore &&
            !loading &&
            !isFetchingRef.current &&
            posts.length > 0
          ) {
            setPage((prev) => prev + 1);
          }
        },
        {
          threshold: 1,
        },
      );

      observer.current.observe(node);
    },
    [hasMore, loading, posts.length],
  );

  const handleDelete = async (id: string) => {
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
          {posts.length === 0 && !loading && (
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

          {posts.map((post) => (
            <Box key={post._id}>
              <PostCard post={post} onDelete={handleDelete} />
            </Box>
          ))}

          {posts.length > 0 && <Box ref={bottomRef} sx={{ height: 1 }} />}

          {loading && (
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
