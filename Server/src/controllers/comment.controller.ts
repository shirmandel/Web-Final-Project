import { Response } from 'express';
import Comment from '../models/comment.model';
import Post from '../models/post.model';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
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
 *         description: List of comments
 */
export const getCommentsByPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('owner', 'username profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - postId
 *             properties:
 *               content:
 *                 type: string
 *               postId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Post not found
 */
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, postId } = req.body;

    if (!content || !postId) {
      res.status(400).json({ error: 'Content and postId are required.' });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const comment = new Comment({
      content,
      postId,
      owner: req.userId,
    });

    const savedComment = await comment.save();

    // Update comments count on the post
    post.commentsCount += 1;
    await post.save();

    const populatedComment = await savedComment.populate('owner', 'username profileImage');

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment (owner only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found.' });
      return;
    }

    if (comment.owner.toString() !== req.userId) {
      res.status(403).json({ error: 'You can only delete your own comments.' });
      return;
    }

    // Update comments count on the post
    const post = await Post.findById(comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    await comment.deleteOne();

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};
