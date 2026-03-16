import { Response } from 'express';
import Post from '../models/post.model';
import Comment from '../models/comment.model';
import Like from '../models/like.model';
import { AuthRequest } from '../middleware/auth.middleware';


export const getAllPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('owner', 'username profileImage')
      .populate('likesCount')
      .populate('commentsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('owner', 'username profileImage')
      .populate('likesCount')
      .populate('commentsCount');
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text content is required.' });
      return;
    }

    const post = new Post({
      text,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      owner: req.userId,
    });

    const savedPost = await post.save();
    const populatedPost = await savedPost
      .populate('owner', 'username profileImage');

    await populatedPost.populate('likesCount');
    await populatedPost.populate('commentsCount');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    if (post.owner.toString() !== req.userId) {
      res.status(403).json({ error: 'You can only update your own posts.' });
      return;
    }

    if (req.body.text) post.text = req.body.text;
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    const updatedPost = await post.save();
    const populatedPost = await updatedPost
      .populate('owner', 'username profileImage');

    await populatedPost.populate('likesCount');
    await populatedPost.populate('commentsCount');

    res.status(200).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    if (post.owner.toString() !== req.userId) {
      res.status(403).json({ error: 'You can only delete your own posts.' });
      return;
    }

    await Comment.deleteMany({ postId: post._id });
    await Like.deleteMany({ postId: post._id });
    await post.deleteOne();

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};


export const getPostsByUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ owner: req.params.userId })
      .populate('owner', 'username profileImage')
      .populate('likesCount')
      .populate('commentsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ owner: req.params.userId });

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};
