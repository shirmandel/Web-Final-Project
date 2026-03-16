import { Response } from 'express';
import Like from '../models/like.model';
import Post from '../models/post.model';
import { AuthRequest } from '../middleware/auth.middleware';


export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const existingLike = await Like.findOne({ postId, userId: req.userId });

    if (existingLike) {
      await existingLike.deleteOne();
      const count = await Like.countDocuments({ postId });
      res.status(200).json({ liked: false, likesCount: count });
    } else {
      const like = new Like({ postId, userId: req.userId });
      await like.save();
      const count = await Like.countDocuments({ postId });
      res.status(200).json({ liked: true, likesCount: count });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


export const getLikeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const existingLike = await Like.findOne({ postId, userId: req.userId });
    res.status(200).json({ liked: !!existingLike });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};
