import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import ProfileHeader from "../components/ProfileHeader";
import ProfileGridPost from "../components/ProfileGridPost";
import { useAuth } from "../context/AuthContext";
import type { User } from "../services/auth.service";
import { userService } from "../services/user.service";
import { postService, type Post } from "../services/post.service";

const LIMIT = 9;

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  const isOwnProfile = currentUser?._id === id;

  const fetchPosts = useCallback(async (userId: string, pageNum: number) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setPostsLoading(true);

    try {
      const postsData = await postService.getByUser(userId, pageNum, LIMIT);

      setPosts((prev) => {
        const incoming = postsData.posts ?? [];

        if (pageNum === 1) return incoming;

        const existingIds = new Set(prev.map((p) => p._id));
        const uniqueIncoming = incoming.filter((p) => !existingIds.has(p._id));
        return [...prev, ...uniqueIncoming];
      });

      setHasMore(pageNum < postsData.totalPages);
    } catch (err) {
      console.error("Failed to load user posts:", err);
    } finally {
      setPostsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setProfileLoading(true);
      setPosts([]);
      setPage(1);
      setHasMore(true);

      try {
        const profileData = await userService.getById(id);
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id || !profile) return;
    fetchPosts(id, page);
  }, [id, profile, page, fetchPosts]);

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
            !postsLoading &&
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
    [hasMore, postsLoading, posts.length],
  );

  if (profileLoading) {
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

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography>User not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ProfileHeader
        profile={profile}
        posts={posts}
        isOwnProfile={isOwnProfile}
      />

      <Box sx={{ width: "100%", mx: "auto" }}>
        <Divider sx={{ mb: 3 }}>
          <Chip
            label="Posts"
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: "rgba(18,153,144,0.1)",
              color: "primary.dark",
              border: "1px solid rgba(18,153,144,0.2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.65rem",
            }}
          />
        </Divider>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: { xs: 0.5, sm: 2 },
          }}
        >
          {posts.map((post) => (
            <ProfileGridPost
              key={post._id}
              post={post}
              onClick={() => navigate(`/post/${post._id}`)}
            />
          ))}
        </Box>

        {posts.length > 0 && <Box ref={bottomRef} sx={{ height: 1 }} />}

        {postsLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress
              size={32}
              thickness={4}
              sx={{ color: "primary.main" }}
            />
          </Box>
        )}

        {posts.length === 0 && !postsLoading && (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              borderRadius: 3,
              background: "rgba(255,255,255,0.6)",
              border: "1.5px dashed rgba(144,209,202,0.5)",
              mt: 2,
            }}
          >
            <Typography variant="h4" sx={{ mb: 1, fontSize: "2rem" }}>
              📝
            </Typography>
            <Typography color="text.secondary" fontWeight={500}>
              No posts yet.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;
