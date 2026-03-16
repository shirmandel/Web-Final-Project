import { Response } from 'express';
import Post from '../models/post.model';
import Comment from '../models/comment.model';
import Like from '../models/like.model';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseSearchQuery } from '../services/ai.service';


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


export const searchPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    const parsed = await parseSearchQuery(query);

    // Build a safe MongoDB filter from the parsed AI response
    const filter: Record<string, unknown> = {};

    if (parsed.textSearch) {
      // Escape regex special characters to prevent ReDoS
      const escaped = parsed.textSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.text = { $regex: escaped, $options: 'i' };
    }

    if (parsed.dateFrom || parsed.dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (parsed.dateFrom) {
        const from = new Date(parsed.dateFrom);
        if (!isNaN(from.getTime())) dateFilter.$gte = from;
      }
      if (parsed.dateTo) {
        const to = new Date(parsed.dateTo);
        if (!isNaN(to.getTime())) dateFilter.$lte = to;
      }
      if (Object.keys(dateFilter).length > 0) {
        filter.createdAt = dateFilter;
      }
    }

    if (parsed.username) {
      const escaped = parsed.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingUser = await User.findOne({
        username: { $regex: `^${escaped}$`, $options: 'i' },
      });
      if (matchingUser) {
        filter.owner = matchingUser._id;
      } else {
        res.status(200).json({
          posts: [],
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          parsedQuery: parsed,
        });
        return;
      }
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .populate('owner', 'username profileImage')
      .populate('likesCount')
      .populate('commentsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      parsedQuery: parsed,
    });
  } catch (err) {
    console.error('Search error:', err);
    const status = (err as { status?: number }).status;
    if (status === 429) {
      res.status(503).json({ error: 'AI service is temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
};
