import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { type Post } from '../services/post.service';
import { likeService } from '../services/like.service';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const status = await likeService.getStatus(post._id);
        setLiked(status.liked);
      } catch (err) {
        throw new Error("error checking like status");
      }
    };
    checkLikeStatus();
  }, [post._id]);

  const handleLike = async () => {
    try {
      const result = await likeService.toggle(post._id);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (err) {
      throw new Error("error liking post");
    }
  };

  const isOwner = user?._id === post.owner._id;
  const timeAgo = getTimeAgo(post.createdAt);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <Card sx={{ mb: 3, overflow: 'hidden' }}>
      <CardHeader
        avatar={
          <Avatar
            src={getImageUrl(post.owner.profileImage)}
            onClick={() => navigate(`/profile/${post.owner._id}`)}
            sx={{ cursor: 'pointer', bgcolor: 'primary.dark' }}
          >
            {post.owner.username?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography
            variant="subtitle1"
            fontWeight={600}
            onClick={() => navigate(`/profile/${post.owner._id}`)}
            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
          >
            {post.owner.username}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {timeAgo}
          </Typography>
        }
        action={
          isOwner ? (
            <Box>
              <IconButton onClick={() => navigate(`/edit/${post._id}`)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => onDelete?.(post._id)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null
        }
      />

      {post.image && (
        <CardMedia
          component="img"
          image={getImageUrl(post.image)}
          alt={post.title}
          sx={{
            maxHeight: 500,
            objectFit: 'cover',
          }}
        />
      )}

      <CardContent>
        <Typography variant="h6" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {post.content}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <IconButton
          onClick={handleLike}
          sx={{
            color: liked ? '#FF1744' : 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'scale(1.2)' },
          }}
        >
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {likesCount}
        </Typography>

        <IconButton
          onClick={() => navigate(`/post/${post._id}`)}
          sx={{ color: 'text.secondary' }}
        >
          <CommentIcon />
        </IconButton>
        <Chip
          label={post.commentsCount}
          size="small"
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
        />
      </CardActions>
    </Card>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default PostCard;
