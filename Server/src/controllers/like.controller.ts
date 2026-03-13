import { Response } from 'express';
import Like from '../models/like.model';
import Post from '../models/post.model';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @swagger
 * /api/likes/{postId}:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 *       404:
 *         description: Post not found
 */
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
      // Unlike
      await existingLike.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
      res.status(200).json({ liked: false, likesCount: post.likesCount });
    } else {
      // Like
      const like = new Like({ postId, userId: req.userId });
      await like.save();
      post.likesCount += 1;
      await post.save();
      res.status(200).json({ liked: true, likesCount: post.likesCount });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

/**
 * @swagger
 * /api/likes/{postId}/status:
 *   get:
 *     summary: Check if current user has liked a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status
 */
export const getLikeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const existingLike = await Like.findOne({ postId, userId: req.userId });
    res.status(200).json({ liked: !!existingLike });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};
