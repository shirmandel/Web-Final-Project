import { Response } from 'express';
import Comment from '../models/comment.model';
import Post from '../models/post.model';
import { AuthRequest } from '../middleware/auth.middleware';


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

    post.commentsCount += 1;
    await post.save();

    const populatedComment = await savedComment.populate('owner', 'username profileImage');

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


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
